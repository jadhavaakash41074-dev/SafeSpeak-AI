import { useState, useEffect } from 'react';
import { Send, Trash2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { getPostComments, addComment, deleteComment } from '../api/posts';
import { moderateComment } from '../api/moderation';
import useAuthStore from '../store/authStore';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { MEDIA_BASE } from '../api/axios';
import './CommentSection.css';

const mediaUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${MEDIA_BASE}${url}`;
};

export default function CommentSection({ postId }) {
  const { user } = useAuthStore();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [moderationResult, setModerationResult] = useState(null);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await getPostComments(postId);
      setComments(res.data?.comments || res.data || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setSubmitting(true);
    setModerationResult(null);

    try {
      // Step 1: Check with AI moderation
      const modRes = await moderateComment(text.trim());
      const result = modRes.data;

      if (result.is_toxic) {
        setModerationResult(result);
        setSubmitting(false);
        return; // Block the comment
      }

      // Step 2: Post comment if clean
      const res = await addComment(postId, text.trim());
      setComments((prev) => [res.data, ...prev]);
      setText('');
      toast.success('Comment posted');
    } catch (err) {
      // If moderation API is down, still allow posting (graceful degradation)
      if (err.response?.status === 404 || err.code === 'ERR_NETWORK') {
        try {
          const res = await addComment(postId, text.trim());
          setComments((prev) => [res.data, ...prev]);
          setText('');
        } catch {
          toast.error('Failed to post comment');
        }
      } else {
        toast.error('Failed to post comment');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await deleteComment(postId, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch {
      toast.error('Could not delete comment');
    }
  };

  return (
    <div className="comment-section">
      {/* Moderation Warning */}
      {moderationResult && (
        <div className="moderation-warning">
          <ShieldAlert size={18} />
          <div>
            <p className="mod-title">Comment blocked by SafeSpeak AI</p>
            <p className="mod-labels">
              Detected: {moderationResult.labels?.join(', ') || 'harmful content'}
            </p>
            <p className="mod-hint">Please keep the conversation respectful.</p>
          </div>
          <button className="mod-close" onClick={() => setModerationResult(null)}>✕</button>
        </div>
      )}

      {/* Comment Input */}
      <form className="comment-form" onSubmit={handleSubmit}>
        <div className="comment-input-wrap">
          <div className="comment-avatar">
            {user?.avatar ? (
              <img src={mediaUrl(user.avatar)} alt="" />
            ) : (
              <span>{user?.username?.[0]?.toUpperCase()}</span>
            )}
          </div>
          <input
            type="text"
            placeholder="Add a comment..."
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (moderationResult) setModerationResult(null);
            }}
            className="comment-input"
            maxLength={500}
          />
          <button
            type="submit"
            className="comment-submit"
            disabled={!text.trim() || submitting}
          >
            {submitting ? <span className="spinner-sm" /> : <Send size={16} />}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="comments-list">
        {loading ? (
          <p className="comments-empty">Loading...</p>
        ) : comments.length === 0 ? (
          <p className="comments-empty">No comments yet. Be the first!</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className={`comment-item ${c.is_hidden ? 'hidden-comment' : ''}`}>
              {c.is_hidden ? (
                <div className="hidden-comment-msg">
                  <AlertTriangle size={14} />
                  <span>This comment was hidden by SafeSpeak AI</span>
                </div>
              ) : (
                <>
                  <div className="comment-avatar sm">
                    {c.user?.avatar ? (
                      <img src={mediaUrl(c.user.avatar)} alt="" />
                    ) : (
                      <span>{c.user?.username?.[0]?.toUpperCase()}</span>
                    )}
                  </div>
                  <div className="comment-body">
                    <span className="comment-author">{c.user?.username}</span>
                    <span className="comment-text">{c.text}</span>
                    <span className="comment-time">
                      {c.created_at
                        ? formatDistanceToNow(new Date(c.created_at), { addSuffix: true })
                        : ''}
                    </span>
                  </div>
                  {user?.id === c.user?.id && (
                    <button
                      className="comment-delete"
                      onClick={() => handleDelete(c.id)}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
