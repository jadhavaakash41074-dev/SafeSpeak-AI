require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// Create upload folders
['uploads/avatars', 'uploads/posts'].forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
});

// Middleware
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'], credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/posts', require('./routes/posts'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', app: 'SafeSpeak API' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 SafeSpeak Backend running at http://localhost:${PORT}`);
  console.log(`📡 API ready at http://localhost:${PORT}/api`);
  console.log(`💾 Using JSON file storage (no MongoDB needed)\n`);
});
