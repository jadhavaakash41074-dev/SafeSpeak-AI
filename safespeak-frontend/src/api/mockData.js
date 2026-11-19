// ── Mock Database (localStorage + IndexedDB for images) ──────────────────────

const USERS_KEY    = 'ss_users';
const POSTS_KEY    = 'ss_posts';
const LIKES_KEY    = 'ss_likes';
const COMMENTS_KEY = 'ss_comments';
const FOLLOWS_KEY  = 'ss_follows';

// ── helpers ───────────────────────────────────────────────────────────────────
export const load = (key, def = []) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? def; } catch { return def; }
};
const save  = (key, val) => localStorage.setItem(key, JSON.stringify(val));
const uid   = () => Math.random().toString(36).slice(2, 10);
const now   = () => new Date().toISOString();
const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

// ── IndexedDB for images (no 5MB limit) ──────────────────────────────────────
const openDB = () =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open('safespeak_images', 1);
    req.onupgradeneeded = (e) => e.target.result.createObjectStore('images');
    req.onsuccess  = (e) => resolve(e.target.result);
    req.onerror    = () => reject(req.error);
  });

const saveImage = async (key, file) => {
  const db    = await openDB();
  const tx    = db.transaction('images', 'readwrite');
  tx.objectStore('images').put(file, key);
  return new Promise((res, rej) => {
    tx.oncomplete = () => res();
    tx.onerror    = () => rej(tx.error);
  });
};

const getImage = async (key) => {
  const db   = await openDB();
  const tx   = db.transaction('images', 'readonly');
  const req  = tx.objectStore('images').get(key);
  return new Promise((res, rej) => {
    req.onsuccess = () => {
      if (req.result) {
        res(URL.createObjectURL(req.result));
      } else {
        res(null);
      }
    };
    req.onerror = () => rej(req.error);
  });
};

// ── USERS ─────────────────────────────────────────────────────────────────────
export const mockRegister = async ({ username, email, password }) => {
  await delay();
  const users = load(USERS_KEY);
  if (users.find((u) => u.username === username))
    throw { response: { data: { message: 'Username already taken' } } };
  if (users.find((u) => u.email === email))
    throw { response: { data: { message: 'Email already registered' } } };

  const user = {
    id: uid(), username, email,
    avatar: null, bio: '',
    created_at: now(),
    _password: password,
  };
  save(USERS_KEY, [...users, user]);
  const token = `jwt_mock_${uid()}`;
  return { user: sanitize(user), token };
};

export const mockLogin = async ({ username, password }) => {
  await delay();
  const users = load(USERS_KEY);
  const user  = users.find((u) => u.username === username);
  if (!user || user._password !== password)
    throw { response: { data: { message: 'Invalid username or password' } } };
  const token = `jwt_mock_${uid()}`;
  return { user: sanitize(user), token };
};

export const mockGetUser = async (userId) => {
  await delay(150);
  const users   = load(USERS_KEY);
  const user    = users.find((u) => u.id === userId);
  if (!user) throw { response: { status: 404 } };
  const follows = load(FOLLOWS_KEY);
  const me      = getCurrentUserId();
  return {
    ...sanitize(user),
    followers_count: follows.filter((f) => f.to   === userId).length,
    following_count: follows.filter((f) => f.from === userId).length,
    is_following:    follows.some((f) => f.from === me && f.to === userId),
  };
};

export const mockUpdateProfile = async (formData) => {
  await delay();
  const users = load(USERS_KEY);
  const me    = getCurrentUserId();
  const idx   = users.findIndex((u) => u.id === me);
  if (idx === -1) throw new Error('Not found');

  const bio        = formData.get('bio');
  const avatarFile = formData.get('avatar');

  if (bio !== null && bio !== undefined) users[idx].bio = bio;

  if (avatarFile && avatarFile.size > 0) {
    const avatarKey = `avatar_${me}`;
    await saveImage(avatarKey, avatarFile);
    users[idx].avatar = `idb://${avatarKey}`;
  }

  save(USERS_KEY, users);
  return sanitize(users[idx]);
};

export const mockFollow = async (userId) => {
  await delay(150);
  const follows = load(FOLLOWS_KEY);
  const from    = getCurrentUserId();
  if (!follows.some((f) => f.from === from && f.to === userId))
    save(FOLLOWS_KEY, [...follows, { from, to: userId }]);
};

export const mockUnfollow = async (userId) => {
  await delay(150);
  const from = getCurrentUserId();
  save(FOLLOWS_KEY, load(FOLLOWS_KEY).filter(
    (f) => !(f.from === from && f.to === userId)
  ));
};

// ── POSTS ─────────────────────────────────────────────────────────────────────
export const mockCreatePost = async (formData) => {
  await delay(300);

  const imageFile = formData.get('image');
  const caption   = formData.get('caption') || '';
  const users     = load(USERS_KEY);
  const me        = getCurrentUserId();
  const user      = sanitize(users.find((u) => u.id === me));

  if (!imageFile || imageFile.size === 0) {
    const err = new Error('Please select an image');
    err.response = { data: { message: 'Please select an image' } };
    throw err;
  }

  // Save image to IndexedDB (no size limit)
  const imageKey = `post_img_${uid()}`;
  try {
    await saveImage(imageKey, imageFile);
  } catch (e) {
    console.error('IndexedDB save failed:', e);
    const err = new Error('Failed to save image');
    err.response = { data: { message: 'Failed to save image. Try a smaller file.' } };
    throw err;
  }

  const post = {
    id:             uid(),
    user,
    caption,
    image_url:      `idb://${imageKey}`,
    created_at:     now(),
    likes_count:    0,
    comments_count: 0,
    is_liked:       false,
  };

  save(POSTS_KEY, [post, ...load(POSTS_KEY)]);
  return post;
};

// Resolve idb:// URLs to real object URLs
export const resolveImageUrl = async (url) => {
  if (!url) return null;
  if (url.startsWith('idb://')) {
    const key = url.replace('idb://', '');
    return await getImage(key);
  }
  return url;
};

export const mockGetFeed = async (page = 1) => {
  await delay(200);
  const posts    = load(POSTS_KEY);
  const likes    = load(LIKES_KEY);
  const comments = load(COMMENTS_KEY);
  const me       = getCurrentUserId();
  const perPage  = 10;
  const start    = (page - 1) * perPage;

  return posts.slice(start, start + perPage).map((p) => ({
    ...p,
    likes_count:    likes.filter((l) => l.postId === p.id).length,
    comments_count: comments.filter((c) => c.postId === p.id).length,
    is_liked:       likes.some((l) => l.postId === p.id && l.userId === me),
  }));
};

export const mockGetUserPosts = async (userId) => {
  await delay(200);
  const posts    = load(POSTS_KEY);
  const likes    = load(LIKES_KEY);
  const comments = load(COMMENTS_KEY);
  const me       = getCurrentUserId();

  return posts
    .filter((p) => p.user?.id === userId)
    .map((p) => ({
      ...p,
      likes_count:    likes.filter((l) => l.postId === p.id).length,
      comments_count: comments.filter((c) => c.postId === p.id).length,
      is_liked:       likes.some((l) => l.postId === p.id && l.userId === me),
    }));
};

export const mockDeletePost = async (postId) => {
  await delay(150);
  save(POSTS_KEY, load(POSTS_KEY).filter((p) => p.id !== postId));
};

export const mockLikePost = async (postId) => {
  await delay(100);
  const likes  = load(LIKES_KEY);
  const userId = getCurrentUserId();
  if (!likes.some((l) => l.postId === postId && l.userId === userId))
    save(LIKES_KEY, [...likes, { postId, userId }]);
};

export const mockUnlikePost = async (postId) => {
  await delay(100);
  const userId = getCurrentUserId();
  save(LIKES_KEY, load(LIKES_KEY).filter(
    (l) => !(l.postId === postId && l.userId === userId)
  ));
};

// ── COMMENTS ──────────────────────────────────────────────────────────────────
export const mockGetComments = async (postId) => {
  await delay(150);
  const users = load(USERS_KEY);
  return load(COMMENTS_KEY)
    .filter((c) => c.postId === postId)
    .map((c) => ({ ...c, user: sanitize(users.find((u) => u.id === c.userId)) }));
};

export const mockAddComment = async (postId, text) => {
  await delay(200);
  const users  = load(USERS_KEY);
  const userId = getCurrentUserId();
  const comment = {
    id: uid(), postId, userId, text,
    created_at: now(), is_hidden: false,
  };
  save(COMMENTS_KEY, [...load(COMMENTS_KEY), comment]);
  return { ...comment, user: sanitize(users.find((u) => u.id === userId)) };
};

export const mockDeleteComment = async (postId, commentId) => {
  await delay(100);
  save(COMMENTS_KEY, load(COMMENTS_KEY).filter((c) => c.id !== commentId));
};

// ── MODERATION ────────────────────────────────────────────────────────────────
const TOXIC_WORDS = [
  'hate','kill','stupid','idiot','ugly','die','loser',
  'dumb','trash','worthless','shut up','moron','freak',
];

export const mockModerate = async (text) => {
  await delay(250);
  const lower   = text.toLowerCase();
  const matched = TOXIC_WORDS.filter((w) => lower.includes(w));
  const is_toxic = matched.length > 0;
  return {
    is_toxic,
    labels:     is_toxic ? ['toxic', matched.length > 1 ? 'hate' : 'insult'] : [],
    confidence: is_toxic ? 0.91 : 0.05,
    token:      `tok_${uid()}`,
  };
};

// ── utils ─────────────────────────────────────────────────────────────────────
const sanitize = (u) => {
  if (!u) return null;
  const { _password, ...safe } = u;
  return safe;
};

const getCurrentUserId = () => {
  try {
    return JSON.parse(localStorage.getItem('safespeak-auth'))?.state?.user?.id;
  } catch { return null; }
};
