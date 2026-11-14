import { useState, useEffect, useCallback } from 'react';
import { getFeed } from '../api/posts';
import useAuthStore from '../store/authStore';
import PostCard from '../components/PostCard';
import { Loader2, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Feed.css';

export default function Feed() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const loadPosts = useCallback(async (pageNum) => {
    setLoading(true);
    try {
      const res = await getFeed(pageNum);
      const newPosts = res.data || [];
      if (pageNum === 1) setPosts(newPosts);
      else setPosts((prev) => [...prev, ...newPosts]);
      setHasMore(newPosts.length >= 10);
    } catch (err) {
      console.error('Feed error:', err);
      setPosts([]);
      setHasMore(false);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, []);

  useEffect(() => {
    loadPosts(1);
  }, [loadPosts]);

  const handleDelete = (id) => setPosts((prev) => prev.filter((p) => p.id !== id));

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    loadPosts(next);
  };

  if (initialLoad) {
    return (
      <div className="feed-loading">
        <Loader2 size={36} className="spin" />
      </div>
    );
  }

  return (
    <div className="feed-page">
      {/* Welcome banner */}
      <div className="feed-welcome">
        <div className="feed-welcome-inner">
          <span>👋</span>
          <p>Welcome, <strong>{user?.username}</strong>!</p>
          <Link to="/upload" className="feed-upload-btn">
            <Camera size={15} /> Post
          </Link>
        </div>
      </div>

      <div className="feed-posts">
        {posts.length === 0 ? (
          <div className="feed-empty">
            <div className="feed-empty-icon">📷</div>
            <h3>No posts yet</h3>
            <p>Be the first to share something!</p>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onDelete={handleDelete} />
            ))}
            {hasMore && (
              <button className="load-more-btn" onClick={loadMore} disabled={loading}>
                {loading ? <Loader2 size={16} className="spin" /> : 'Load more'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
