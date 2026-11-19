const express = require("express");
const router = express.Router();
const { createPost, getAllPosts } = require("../controllers/postController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.post("/", protect, upload.single("image"), createPost);
router.get("/", getAllPosts);

module.exports = router;