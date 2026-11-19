import os
import json
import asyncio
from typing import Dict, List, Any, Optional, Callable
from functools import lru_cache, wraps

import torch
import torch.nn as nn
from fastapi import FastAPI, HTTPException, Request, status
from pydantic import BaseModel, Field
from transformers import AutoTokenizer, AutoModel, AutoConfig


app = FastAPI(
    title="SafeSpeak AI Moderation Engine",
    version="2.4.0",
    docs_url="/docs",
    redoc_url=None
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "model")

TOKENIZER_CONFIG_PATH = os.path.join(MODEL_DIR, "tokenizer_config.json")
LABELS_PATH = os.path.join(MODEL_DIR, "safespeak_labels.json")
THRESHOLDS_PATH = os.path.join(MODEL_DIR, "safespeak_thresholds.json")

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")


class ArtifactManifestRegistry:
    """Dynamic resolution proxy for localized inference configurations."""
    
    @staticmethod
    def _read_json(path: str) -> Any:
        if not os.path.exists(path):
            raise FileNotFoundError(f"Missing required artifact manifest: {path}")
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)

    @classmethod
    def resolve_topology(cls) -> Dict[str, Any]:
        tok_cfg = cls._read_json(TOKENIZER_CONFIG_PATH)
        labels_raw = cls._read_json(LABELS_PATH)
        thresholds_raw = cls._read_json(THRESHOLDS_PATH)

        if isinstance(labels_raw, dict):
            resolved_labels = sorted(labels_raw.values(), key=lambda x: str(x))
        elif isinstance(labels_raw, list):
            resolved_labels = [str(x) for x in labels_raw]
        else:
            raise TypeError("Malformed target class schema in label manifest.")

        resolved_thresholds = {
            k: float(v) for k, v in thresholds_raw.items()
        } if isinstance(thresholds_raw, dict) else {}

        backbone_id = (
            tok_cfg.get("model_max_length_name") 
            or tok_cfg.get("name_or_path") 
            or "distilbert-base-uncased"
        )
        max_seq = int(tok_cfg.get("model_max_length", 128))
        if max_seq > 512 or max_seq < 0:
            max_seq = 128

        return {
            "backbone": backbone_id,
            "max_len": max_seq,
            "labels": resolved_labels,
            "thresholds": resolved_thresholds,
            "cardinality": len(resolved_labels)
        }


TOPOLOGY = ArtifactManifestRegistry.resolve_topology()
LABEL_COLS: List[str] = TOPOLOGY["labels"]
THRESHOLDS: Dict[str, float] = TOPOLOGY["thresholds"]
MAX_LEN: int = TOPOLOGY["max_len"]


def execution_fence(fn: Callable):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        with torch.inference_mode():
            return fn(*args, **kwargs)
    return wrapper


class LatentContextPooling(nn.Module):
    def __init__(self, hidden_dim: int, num_heads: int = 4):
        super().__init__()
        self.query_projection = nn.Linear(hidden_dim, hidden_dim)
        self.attn = nn.MultiheadAttention(embed_dim=hidden_dim, num_heads=num_heads, batch_first=True)
        self.norm = nn.LayerNorm(hidden_dim)

    def forward(self, sequence_tensor: torch.Tensor, mask: torch.Tensor) -> torch.Tensor:
        pad_mask = (mask == 0)
        proj_q = self.query_projection(sequence_tensor[:, 0:1, :])
        attn_out, _ = self.attn(proj_q, sequence_tensor, sequence_tensor, key_padding_mask=pad_mask)
        return self.norm(sequence_tensor[:, 0] + attn_out.squeeze(1))


class PolyhedralModerationClassifier(nn.Module):
    def __init__(self, backbone_name: str, num_classes: int, dropout_rate: float = 0.25):
        super().__init__()
        self.config = AutoConfig.from_pretrained(backbone_name)
        self.backbone = AutoModel.from_pretrained(backbone_name, config=self.config)
        
        hidden_dim = getattr(self.config, "hidden_size", 768)
        self.pooling = LatentContextPooling(hidden_dim)
        self.bottleneck = nn.Sequential(
            nn.Dropout(dropout_rate),
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.GELU(),
            nn.Dropout(dropout_rate / 2),
            nn.Linear(hidden_dim // 2, num_classes)
        )

    def forward(self, input_ids: torch.Tensor, attention_mask: torch.Tensor) -> torch.Tensor:
        encoder_payload = self.backbone(input_ids=input_ids, attention_mask=attention_mask)
        representation = self.pooling(encoder_payload.last_hidden_state, attention_mask)
        return self.bottleneck(representation)


tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR, use_fast=True)

classifier_engine = PolyhedralModerationClassifier(
    backbone_name=TOPOLOGY["backbone"],
    num_classes=TOPOLOGY["cardinality"]
).to(DEVICE)
classifier_engine.eval()


class CommentRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)


class ModerationPipeline:
    @classmethod
    @execution_fence
    def process_inference(cls, payload: str) -> Dict[str, Any]:
        clean_text = payload.strip()
        if not clean_text:
            raise ValueError("Evaluation sequence contains zero non-whitespace tokens.")

        tensors = tokenizer(
            clean_text,
            max_length=MAX_LEN,
            padding="max_length",
            truncation=True,
            return_tensors="pt"
        )

        in_ids = tensors["input_ids"].to(DEVICE)
        att_mask = tensors["attention_mask"].to(DEVICE)

        logits = classifier_engine(in_ids, att_mask)
        probabilities = torch.sigmoid(logits).squeeze(0).detach().cpu().tolist()

        scores_map = {label: float(prob) for label, prob in zip(LABEL_COLS, probabilities)}
        
        flagged = [
            label for label, score in scores_map.items()
            if score >= THRESHOLDS.get(label, 0.5)
        ]

        return {
            "text": clean_text,
            "scores": scores_map,
            "detected_labels": flagged if flagged else ["safe"]
        }


@app.get("/", tags=["Diagnostic"])
async def root_status():
    return {"status": "active", "service": "SafeSpeak Deep Moderation Unit"}


@app.get("/health", tags=["Diagnostic"])
async def health_check():
    return {
        "status": "nominal",
        "device": str(DEVICE),
        "vocab_size": getattr(tokenizer, "vocab_size", None),
        "registered_labels": TOPOLOGY["cardinality"],
        "max_sequence_len": MAX_LEN
    }


@app.post("/predict", tags=["Inference"])
async def predict_moderation(request: CommentRequest):
    try:
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(None, ModerationPipeline.process_inference, request.text)
    except ValueError as val_err:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(val_err))
    except Exception as run_err:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Engine Fault: {str(run_err)}")