const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { v4: uuid } = require('uuid');
const { read, write } = require('../db');
const auth = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../uploads/posts'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// GET /api/posts/feed
router.get('/feed', auth, (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const posts = read('posts');
    const users = read('users');
    const comments = read('comments');

    const enriched = posts
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice((page - 1) * limit, page * limit)
      .map(post => {
        const user = users.find(u => u.id === post.userId);
        const { password, ...safeUser } = user || {};
        return {
          id: post.id,
          user: safeUser,
          image_url: post.image,
          caption: post.caption,
          created_at: post.createdAt,
          likes_count: post.likes.length,
          comments_count: comments.filter(c => c.postId === post.id).length,
          is_liked: post.likes.includes(req.user.id),
        };
      });

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/posts/user/:userId
router.get('/user/:userId', auth, (req, res) => {
  try {
    const posts = read('posts');
    const users = read('users');
    const comments = read('comments');

    const userPosts = posts
      .filter(p => p.userId === req.params.userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(post => {
        const user = users.find(u => u.id === post.userId);
        const { password, ...safeUser } = user || {};
        return {
          id: post.id,
          user: safeUser,
          image_url: post.image,
          caption: post.caption,
          created_at: post.createdAt,
          likes_count: post.likes.length,
          comments_count: comments.filter(c => c.postId === post.id).length,
          is_liked: post.likes.includes(req.user.id),
        };
      });

    res.json(userPosts);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/posts
router.post('/', auth, upload.single('image'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Image required' });

    const post = {
      id: uuid(),
      userId: req.user.id,
      image: `/uploads/posts/${req.file.filename}`,
      caption: req.body.caption || '',
      likes: [],
      createdAt: new Date().toISOString(),
    };

    write('posts', [post, ...read('posts')]);

    const { password, ...safeUser } = req.user;
    res.status(201).json({
      id: post.id,
      user: safeUser,
      image_url: post.image,
      caption: post.caption,
      created_at: post.createdAt,
      likes_count: 0,
      comments_count: 0,
      is_liked: false,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/posts/:id
router.delete('/:id', auth, (req, res) => {
  try {
    const posts = read('posts');
    const post = posts.find(p => p.id === req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.userId !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

    write('posts', posts.filter(p => p.id !== req.params.id));
    write('comments', read('comments').filter(c => c.postId !== req.params.id));

    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/posts/:id/like
router.post('/:id/like', auth, (req, res) => {
  try {
    const posts = read('posts');
    const post = posts.find(p => p.id === req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (!post.likes.includes(req.user.id)) {
      post.likes.push(req.user.id);
      write('posts', posts);
    }

    res.json({ message: 'Liked' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/posts/:id/like
router.delete('/:id/like', auth, (req, res) => {
  try {
    const posts = read('posts');
    const post = posts.find(p => p.id === req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.likes = post.likes.filter(id => id !== req.user.id);
    write('posts', posts);

    res.json({ message: 'Unliked' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/posts/:id/comments
router.get('/:id/comments', auth, (req, res) => {
  try {
    const comments = read('comments').filter(c => c.postId === req.params.id);
    const users = read('users');

    const enriched = comments
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(c => {
        const user = users.find(u => u.id === c.userId);
        const { password, ...safeUser } = user || {};
        return {
          id: c.id,
          user: safeUser,
          text: c.text,
          is_hidden: c.isHidden,
          created_at: c.createdAt,
        };
      });

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/posts/:id/comments
router.post('/:id/comments', auth, (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'Text required' });

    // TODO: Replace with your DistilBERT model API call
    const toxicWords = ['hate', 'kill', 'stupid', 'idiot', 'ugly', 'die'];
    const isToxic = toxicWords.some(w => text.toLowerCase().includes(w));

    const comment = {
      id: uuid(),
      postId: req.params.id,
      userId: req.user.id,
      text: text.trim(),
      isHidden: isToxic,
      createdAt: new Date().toISOString(),
    };

    write('comments', [...read('comments'), comment]);

    const { password, ...safeUser } = req.user;
    res.status(201).json({
      id: comment.id,
      user: safeUser,
      text: comment.text,
      is_hidden: comment.isHidden,
      created_at: comment.createdAt,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/posts/:postId/comments/:commentId
router.delete('/:postId/comments/:commentId', auth, (req, res) => {
  try {
    const comments = read('comments');
    const comment = comments.find(c => c.id === req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.userId !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

    write('comments', comments.filter(c => c.id !== req.params.commentId));
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
