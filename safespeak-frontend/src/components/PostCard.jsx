import { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { likePost, unlikePost, deletePost } from '../api/posts';
import useAuthStore from '../store/authStore';
import CommentSection from './CommentSection';
import toast from 'react-hot-toast';
import { MEDIA_BASE } from '../api/axios';
import './PostCard.css';

const mediaUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${MEDIA_BASE}${url}`;
};

export default function PostCard({ post, onDelete }) {
  const { user } = useAuthStore();
  const [liked, setLiked] = useState(post.is_liked || false);
  const [likeCount, setLikeCount] = useState(post.likes_count || 0);
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [saved, setSaved] = useState(false);
  const [heartAnim, setHeartAnim] = useState(false);

  const isOwner = user?.id === post.user?.id;

  const handleLike = async () => {
    try {
      if (liked) {
        await unlikePost(post.id);
        setLikeCount((c) => c - 1);
      } else {
        await likePost(post.id);
        setLikeCount((c) => c + 1);
        setHeartAnim(true);
        setTimeout(() => setHeartAnim(false), 800);
      }
      setLiked(!liked);
    } catch {
      toast.error('Could not update like');
    }
  };

  // Double-tap to like
  const handleDoubleTap = () => {
    if (!liked) handleLike();
  };

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;
    try {
      await deletePost(post.id);
      toast.success('Post deleted');
      onDelete?.(post.id);
    } catch {
      toast.error('Could not delete post');
    }
    setShowMenu(false);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
    toast.success('Link copied!');
  };

  const timeAgo = post.created_at
    ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true })
    : '';

  return (
    <article className="post-card">

      {/* ── Header ── */}
      <div className="pc-header">
        <Link to={`/profile/${post.user?.id}`} className="pc-user">
          <div className="pc-avatar">
            {post.user?.avatar
              ? <img src={mediaUrl(post.user.avatar)} alt={post.user.username} />
              : <span>{post.user?.username?.[0]?.toUpperCase()}</span>}
          </div>
          <div className="pc-user-info">
            <span className="pc-username">{post.user?.username}</span>
            {post.location && <span className="pc-location">{post.location}</span>}
          </div>
        </Link>

        <div className="pc-menu-wrap">
          <button className="pc-more" onClick={() => setShowMenu(!showMenu)}>
            <MoreHorizontal size={20} />
          </button>
          {showMenu && (
            <div className="pc-menu">
              {isOwner && (
                <button className="pc-menu-item red" onClick={handleDelete}>
                  <Trash2 size={14} /> Delete
                </button>
              )}
              <button className="pc-menu-item" onClick={() => { handleShare(); setShowMenu(false); }}>
                Share link
              </button>
              <button className="pc-menu-item" onClick={() => setShowMenu(false)}>
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Image ── */}
      {post.image_url && (
        <div className="pc-image-wrap" onDoubleClick={handleDoubleTap}>
          <img src={mediaUrl(post.image_url)} alt="post" className="pc-image" />
          {heartAnim && (
            <div className="pc-heart-pop">
              <Heart size={80} fill="white" color="white" />
            </div>
          )}
        </div>
      )}

      {/* ── Action Bar ── */}
      <div className="pc-actions">
        <div className="pc-actions-left">
          <button
            className={`pc-action-btn ${liked ? 'liked' : ''}`}
            onClick={handleLike}
          >
            <Heart size={26} fill={liked ? '#ed4956' : 'none'} color={liked ? '#ed4956' : '#262626'} />
          </button>
          <button
            className="pc-action-btn"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle size={26} color="#262626" />
          </button>
          <button className="pc-action-btn" onClick={handleShare}>
            <Send size={24} color="#262626" />
          </button>
        </div>
        <button
          className={`pc-action-btn pc-save ${saved ? 'saved' : ''}`}
          onClick={() => setSaved(!saved)}
        >
          <Bookmark size={26} fill={saved ? '#262626' : 'none'} color="#262626" />
        </button>
      </div>

      {/* ── Like Count ── */}
      <div className="pc-likes">
        {likeCount > 0
          ? <span><strong>{likeCount.toLocaleString()} {likeCount === 1 ? 'like' : 'likes'}</strong></span>
          : <span>Be the first to like this</span>}
      </div>

      {/* ── Caption ── */}
      {post.caption && (
        <div className="pc-caption">
          <Link to={`/profile/${post.user?.id}`} className="pc-cap-user">
            {post.user?.username}
          </Link>
          <span className="pc-cap-text"> {post.caption}</span>
        </div>
      )}

      {/* ── View Comments ── */}
      {(post.comments_count > 0 || showComments) && (
        <button
          className="pc-view-comments"
          onClick={() => setShowComments(!showComments)}
        >
          {showComments
            ? 'Hide comments'
            : `View all ${post.comments_count || ''} comments`}
        </button>
      )}

      {showComments && <CommentSection postId={post.id} />}

      {/* ── Timestamp ── */}
      <p className="pc-time">{timeAgo}</p>
    </article>
  );
}
