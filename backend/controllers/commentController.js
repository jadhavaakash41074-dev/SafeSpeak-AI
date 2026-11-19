const mongoose = require("mongoose");
const axios = require("axios");
const Comment = require("../models/Comment");
const Post = require("../models/Post");
const User = require("../models/User");

const ML_TIMEOUT_MS = parseInt(process.env.ML_TIMEOUT_MS, 10) || 3500;
const TEMP_BLOCK_DURATION_HOURS = 24;
const MAX_STRIKES_FOR_BAN = 3;

const mlClient = axios.create({
  baseURL: process.env.ML_API_URL,
  timeout: ML_TIMEOUT_MS,
  headers: { "Content-Type": "application/json" },
});

async function classifyContent(text) {
  try {
    const { data } = await mlClient.post("/predict", { text });
    return {
      detectedLabels: Array.isArray(data?.detected_labels) ? data.detected_labels : [],
      scores: data?.scores && typeof data.scores === "object" ? data.scores : {},
      fallbackApplied: false,
    };
  } catch (err) {
    console.error("[Moderation ML Service Error]:", err.message);
    return {
      detectedLabels: ["safe"],
      scores: {},
      fallbackApplied: true,
    };
  }
}

function resolveModerationPolicy(harmfulLabels, currentStrikes) {
  const severeLabels = new Set(["threat", "spam"]);
  const hasSevereViolation = harmfulLabels.some((label) => severeLabels.has(label));

  if (hasSevereViolation) {
    return {
      action: "permanent_ban",
      isBanned: true,
      isBlocked: false,
      blockedUntil: null,
      message: "Severe harmful content detected. You have been permanently banned.",
    };
  }

  const newStrikes = currentStrikes + 1;

  if (newStrikes === 1) {
    return {
      action: "warning",
      isBanned: false,
      isBlocked: false,
      blockedUntil: null,
      message: "Harmful comment detected. This is your first warning.",
    };
  }

  if (newStrikes === 2) {
    const blockedUntil = new Date(Date.now() + TEMP_BLOCK_DURATION_HOURS * 60 * 60 * 1000);
    return {
      action: "temp_block",
      isBanned: false,
      isBlocked: true,
      blockedUntil,
      message: `Harmful comment detected. You are blocked for 24 hours until ${blockedUntil.toISOString()}.`,
    };
  }

  return {
    action: "permanent_ban",
    isBanned: true,
    isBlocked: false,
    blockedUntil: null,
    message: `You have reached ${MAX_STRIKES_FOR_BAN} strikes and are permanently banned.`,
  };
}

const addComment = async (req, res) => {
  const { text } = req.body;
  const { postId } = req.params;
  const userId = req.user?._id;

  if (!text || typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ error: "VALIDATION_ERROR", message: "Comment text is required." });
  }

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ error: "INVALID_ID", message: "Invalid postId format." });
  }

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(401).json({ error: "UNAUTHORIZED", message: "Invalid user context." });
  }

  const trimmedText = text.trim();

  const [post, user] = await Promise.all([
    Post.findById(postId).select("_id isDeleted").lean(),
    User.findById(userId),
  ]);

  if (!post || post.isDeleted) {
    return res.status(404).json({ error: "NOT_FOUND", message: "Post not found." });
  }

  if (!user) {
    return res.status(404).json({ error: "NOT_FOUND", message: "User not found." });
  }

  if (user.isBanned) {
    return res.status(403).json({ error: "FORBIDDEN", message: "You are permanently banned from commenting." });
  }

  if (user.isBlocked && user.blockedUntil && new Date(user.blockedUntil) > new Date()) {
    return res.status(403).json({
      error: "ACCOUNT_SUSPENDED",
      message: `You are temporarily blocked until ${user.blockedUntil.toISOString()}`,
      blockedUntil: user.blockedUntil,
    });
  }

  const { detectedLabels, scores, fallbackApplied } = await classifyContent(trimmedText);
  
  let harmfulLabels = detectedLabels.filter((label) => label !== "safe" && label !== "ml_service_unreachable");

  // --- SMART OVERRIDE ---
  const lowerText = trimmedText.toLowerCase();
  
  // 1. Mild words (Warning ke liye)
  const mildBadWords = ["stupid", "idiot", "dumb", "hate", "fake", "fraud", "ugly", "trash"];
  const hasMildBadWord = mildBadWords.some(word => lowerText.includes(word));

  // 2. Severe words (Direct Ban ke liye)
  const severeBadWords = ["kill", "die", "murder", "fuck", "shit", "bitch", "bastard", "threat", "spam", "attack"];
  const hasSevereBadWord = severeBadWords.some(word => lowerText.includes(word));

  if (hasSevereBadWord) {
    harmfulLabels = ["threat"]; // Turant Permanent Ban
  } else if (hasMildBadWord) {
    harmfulLabels = ["toxic"];  // Sirf Warning / Temp Block
  } else {
    harmfulLabels = []; // Safe
  }

  const isHarmful = harmfulLabels.length > 0;

  let moderationAction = "allowed";
  let isHidden = false;
  let userMessage = "Comment posted successfully";

  if (isHarmful) {
    isHidden = true;
    const policy = resolveModerationPolicy(harmfulLabels, user.strikes || 0);
    moderationAction = policy.action;
    userMessage = policy.message;
    user.strikes = (user.strikes || 0) + 1;
    user.isBanned = policy.isBanned;
    user.isBlocked = policy.isBlocked;
    user.blockedUntil = policy.blockedUntil;
  }

  const session = await mongoose.startSession();
  let createdComment;

  try {
    await session.withTransaction(async () => {
            if (isHarmful) {
        await User.findByIdAndUpdate(
          userId,
          { 
            strikes: user.strikes, 
            isBanned: user.isBanned, 
            isBlocked: user.isBlocked, 
            blockedUntil: user.blockedUntil 
          },
          { session }
        );
      }

      const [newDoc] = await Comment.create(
        [
          {
            post: postId,
            user: userId,
            text: trimmedText,
            moderationLabels: harmfulLabels,
            moderationScores: scores,
            moderationAction,
            isHidden,
            isFlaggedForReview: fallbackApplied,
          },
        ],
        { session }
      );

      createdComment = newDoc;
    });
  } catch (txnError) {
    console.error("[Transaction Aborted]:", txnError);
    return res.status(500).json({ error: "TRANSACTION_FAILURE", message: "Failed to save comment." });
  } finally {
    await session.endSession();
  }

  const populatedComment = await Comment.findById(createdComment._id)
    .populate("user", "name email profilePic")
    .populate("post", "_id caption imageUrl")
    .lean();

  return res.status(201).json({
    message: userMessage,
    comment: populatedComment,
    moderation: {
      isHarmful,
      detectedLabels: harmfulLabels.length > 0 ? harmfulLabels : ["safe"],
      action: moderationAction,
      isHidden,
      strikes: user.strikes || 0,
      isBlocked: Boolean(user.isBlocked),
      blockedUntil: user.blockedUntil,
      isBanned: Boolean(user.isBanned),
    },
  });
};

const getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ error: "INVALID_ID", message: "Invalid postId format." });
    }

    // Hidden (fake/harmful) comments ko screen par nahi dikhayenge
    const filter = {
      post: postId,
      isDeleted: false,
      isHidden: false,
    };

    const [comments, totalCount] = await Promise.all([
      Comment.find(filter)
        .populate("user", "name email profilePic")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Comment.countDocuments(filter),
    ]);

    return res.status(200).json(comments);
    
  } catch (error) {
    console.error("[Get Comments Error]:", error);
    return res.status(500).json({ error: "SERVER_ERROR", message: "Internal server error occurred." });
  }
};

module.exports = {
  addComment,
  getCommentsByPost,
};