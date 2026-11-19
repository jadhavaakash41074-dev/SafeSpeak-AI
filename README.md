# SafeSpeak AI — Real-Time Bullying & Hate Detection System

Instagram-style social media with AI-powered comment moderation.

## Features

✅ User authentication (register/login with JWT)  
✅ Upload photos with captions  
✅ Like & comment on posts  
✅ Follow/unfollow users  
✅ Profile pages with photo grid  
✅ Real-time feed from all users  
✅ AI comment moderation (DistilBERT integration ready)  
✅ MongoDB database  
✅ Beautiful Instagram-inspired UI  

---

## Setup Instructions

### 1. Install MongoDB

Download and install MongoDB from: https://www.mongodb.com/try/download/community

Start MongoDB:
```bash
mongod
```

### 2. Backend Setup

```bash
cd safespeak-backend
npm install
npm start
```

Backend runs at: `http://localhost:5000`

### 3. Frontend Setup

```bash
cd safespeak-frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## Usage

1. Open `http://localhost:5173`
2. Click **Sign up** → Create account
3. Login → Upload photos → Like/comment on posts
4. Click usernames to view profiles
5. Follow/unfollow users

---

## AI Model Integration (Later)

To integrate your DistilBERT model:

1. Open `safespeak-backend/routes/posts.js`
2. Find the `POST /api/posts/:id/comments` route
3. Replace the `TODO` comment with your model API call:

```javascript
// Replace this:
const toxicWords = ['hate', 'kill', 'stupid', 'idiot'];
const isToxic = toxicWords.some(w => text.toLowerCase().includes(w));

// With your DistilBERT API:
const modResult = await fetch('YOUR_MODEL_API_URL', {
  method: 'POST',
  body: JSON.stringify({ text }),
  headers: { 'Content-Type': 'application/json' }
});
const { is_toxic, labels } = await modResult.json();
```

---

## Tech Stack

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- Multer (file uploads)

**Frontend:**
- React + Vite
- React Router
- Zustand (state)
- Axios
- Lucide icons
- Google Fonts (Nunito + Pacifico)

---

## Project Structure

```
safespeak-backend/
├── models/          # MongoDB schemas
├── routes/          # API endpoints
├── middleware/      # Auth middleware
├── uploads/         # User images
└── server.js        # Entry point

safespeak-frontend/
├── src/
│   ├── api/         # API calls
│   ├── components/  # React components
│   ├── pages/       # Page components
│   ├── store/       # Zustand store
│   └── App.jsx      # Main app
└── index.html
```

---

## API Endpoints

### Auth
- `POST /api/auth/register` — Create account
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get current user

### Users
- `GET /api/users/:id` — Get user profile
- `PUT /api/users/me` — Update profile
- `POST /api/users/:id/follow` — Follow user
- `DELETE /api/users/:id/follow` — Unfollow

### Posts
- `GET /api/posts/feed` — Get all posts
- `GET /api/posts/user/:userId` — Get user's posts
- `POST /api/posts` — Create post
- `DELETE /api/posts/:id` — Delete post
- `POST /api/posts/:id/like` — Like post
- `DELETE /api/posts/:id/like` — Unlike post

### Comments
- `GET /api/posts/:id/comments` — Get comments
- `POST /api/posts/:id/comments` — Add comment (AI moderation)
- `DELETE /api/posts/:postId/comments/:commentId` — Delete comment

---

Made with ❤️ for final year project
