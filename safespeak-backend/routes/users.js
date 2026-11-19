const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { read, write } = require('../db');
const auth = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../uploads/avatars'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// GET /api/users/:id
router.get('/:id', auth, (req, res) => {
  try {
    const users = read('users');
    const user = users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { password, ...safeUser } = user;
    res.json({
      ...safeUser,
      followers_count: user.followers.length,
      following_count: user.following.length,
      is_following: user.followers.includes(req.user.id),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/users/me
router.put('/me', auth, upload.single('avatar'), (req, res) => {
  try {
    const users = read('users');
    const idx = users.findIndex(u => u.id === req.user.id);
    if (idx === -1) return res.status(404).json({ message: 'User not found' });

    if (req.body.bio !== undefined) users[idx].bio = req.body.bio;
    if (req.file) users[idx].avatar = `/uploads/avatars/${req.file.filename}`;

    write('users', users);
    const { password, ...safeUser } = users[idx];
    res.json(safeUser);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/users/:id/follow
router.post('/:id/follow', auth, (req, res) => {
  try {
    const users = read('users');
    const targetIdx = users.findIndex(u => u.id === req.params.id);
    const meIdx = users.findIndex(u => u.id === req.user.id);

    if (targetIdx === -1) return res.status(404).json({ message: 'User not found' });

    if (!users[targetIdx].followers.includes(req.user.id)) {
      users[targetIdx].followers.push(req.user.id);
      users[meIdx].following.push(req.params.id);
      write('users', users);
    }

    res.json({ message: 'Followed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/users/:id/follow
router.delete('/:id/follow', auth, (req, res) => {
  try {
    const users = read('users');
    const targetIdx = users.findIndex(u => u.id === req.params.id);
    const meIdx = users.findIndex(u => u.id === req.user.id);

    if (targetIdx === -1) return res.status(404).json({ message: 'User not found' });

    users[targetIdx].followers = users[targetIdx].followers.filter(id => id !== req.user.id);
    users[meIdx].following = users[meIdx].following.filter(id => id !== req.params.id);
    write('users', users);

    res.json({ message: 'Unfollowed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
