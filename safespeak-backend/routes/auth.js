const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuid } = require('uuid');
const { read, write } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'safespeak_secret_2024';

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ message: 'All fields required' });

    const users = read('users');
    if (users.find(u => u.username === username))
      return res.status(400).json({ message: 'Username taken' });
    if (users.find(u => u.email === email))
      return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      id: uuid(),
      username,
      email,
      password: hashedPassword,
      avatar: null,
      bio: '',
      followers: [],
      following: [],
      createdAt: new Date().toISOString(),
    };

    write('users', [...users, user]);

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '30d' });
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({ user: userWithoutPassword, token });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const users = read('users');
    const user = users.find(u => u.username === username);

    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '30d' });
    const { password: _, ...userWithoutPassword } = user;

    res.json({ user: userWithoutPassword, token });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/auth/me
router.get('/me', require('../middleware/auth'), (req, res) => {
  const { password, ...user } = req.user;
  res.json(user);
});

module.exports = router;
