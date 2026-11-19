const express = require("express");
const router = express.Router();
const { addComment, getCommentsByPost } = require("../controllers/commentController");
const { protect } = require("../middleware/authMiddleware");

router.post("/:postId", protect, addComment);
router.get("/:postId", getCommentsByPost);

module.exports = router;