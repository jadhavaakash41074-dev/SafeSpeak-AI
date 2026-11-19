// Simple JSON file database (no MongoDB needed)
const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR);

const files = {
  users:    path.join(DB_DIR, 'users.json'),
  posts:    path.join(DB_DIR, 'posts.json'),
  comments: path.join(DB_DIR, 'comments.json'),
};

// Initialize empty files
Object.values(files).forEach(f => {
  if (!fs.existsSync(f)) fs.writeFileSync(f, '[]');
});

const read  = (collection) => JSON.parse(fs.readFileSync(files[collection], 'utf8'));
const write = (collection, data) => fs.writeFileSync(files[collection], JSON.stringify(data, null, 2));

module.exports = { read, write };
