const jwt = require('jsonwebtoken');
const { read } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'safespeak_secret_2024';

module.exports = (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer '))
      return res.status(401).json({ message: 'No token provided' });

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const users = read('users');
    const user = users.find(u => u.id === decoded.id);
    if (!user) return res.status(401).json({ message: 'User not found' });

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
