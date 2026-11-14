const router = require('express').Router();
const { v4: uuid } = require('uuid');
const authMiddleware = require('../middleware/auth');

// Toxic word list (replace with real DistilBERT API call when ready)
const TOXIC = [
  'hate','kill','stupid','idiot','ugly','die','loser','dumb',
  'trash','worthless','shut up','moron','freak','abuse','threat',
];

// POST /api/moderation/check
router.post('/check', authMiddleware, (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ message: 'Text required' });

  const lower   = text.toLowerCase();
  const matched = TOXIC.filter((w) => lower.includes(w));
  const is_toxic = matched.length > 0;

  res.json({
    is_toxic,
    labels:     is_toxic ? ['toxic', matched.length > 1 ? 'hate' : 'insult'] : [],
    confidence: is_toxic ? 0.93 : 0.04,
    token:      `tok_${uuid()}`,
  });
});

module.exports = router;
