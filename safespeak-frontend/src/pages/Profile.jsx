import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Camera, Edit2, Check, X, Grid } from 'lucide-react';
import { getUserProfile, updateProfile, followUser, unfollowUser } from '../api/users';
import { getUserPosts, deletePost } from '../api/posts';
import useAuthStore from '../store/authStore';
import PostCard from '../components/PostCard';
import toast from 'react-hot-toast';
import { MEDIA_BASE } from '../api/axios';
import './Profile.css';

const mediaUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${MEDIA_BASE}${url}`;
};

export default function Profile() {
  const { userId } = useParams();
  const { user: me, updateUser } = useAuthStore();
  const isOwner = me?.id === userId || me?.id === parseInt(userId);

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState('grid'); // 'grid' | 'list'
  const [selectedPost, setSelectedPost] = useState(null);
  const avatarRef = useRef();

  useEffect(() => {
    loadProfile();
    loadPosts();
  }, [userId]);

  const loadProfile = async () => {
    try {
      const res = await getUserProfile(userId);
      setProfile(res.data);
      setBio(res.data.bio || '');
    } catch {
      toast.error('Could not load profile');
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async () => {
    try {
      const res = await getUserPosts(userId);
      setPosts(res.data?.posts || res.data || []);
    } catch {
      // silently fail
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('avatar', file);
    try {
      const res = await updateProfile(fd);
      setProfile((p) => ({ ...p, avatar: res.data.avatar }));
      updateUser({ avatar: res.data.avatar });
      toast.success('Avatar updated');
    } catch {
      toast.error('Failed to update avatar');
    }
  };

  const handleSaveBio = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('bio', bio);
      await updateProfile(fd);
      setProfile((p) => ({ ...p, bio }));
      setEditing(false);
      toast.success('Bio updated');
    } catch {
      toast.error('Failed to update bio');
    } finally {
      setSaving(false);
    }
  };

  const handleFollow = async () => {
    try {
      if (profile.is_following) {
        await unfollowUser(userId);
        setProfile((p) => ({
          ...p,
          is_following: false,
          followers_count: p.followers_count - 1,
        }));
      } else {
        await followUser(userId);
        setProfile((p) => ({
          ...p,
          is_following: true,
          followers_count: p.followers_count + 1,
        }));
      }
    } catch {
      toast.error('Action failed');
    }
  };

  const handleDeletePost = (id) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setSelectedPost(null);
  };

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner" style={{ borderTopColor: 'var(--primary)', borderColor: 'rgba(108,99,255,0.2)', width: 36, height: 36, borderWidth: 3 }} />
      </div>
    );
  }

  if (!profile) return <div className="profile-error">User not found</div>;

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Header */}
        <div className="profile-header">
          <div className="profile-cover">
            <div className="profile-cover-overlay" />
            <div className="profile-avatar-wrap">
              <div className="profile-avatar">
                {profile.avatar ? (
                  <img src={mediaUrl(profile.avatar)} alt={profile.username} />
                ) : (
                  <span>{profile.username?.[0]?.toUpperCase()}</span>
                )}
              </div>
              {isOwner && (
                <>
                  <button
                    className="avatar-edit-btn"
                    onClick={() => avatarRef.current.click()}
                  >
                    <Camera size={12} />
                  </button>
                  <input
                    ref={avatarRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    hidden
                  />
                </>
              )}
            </div>
          </div>

          <div className="profile-info">
            <div className="profile-name-row">
              <h2>{profile.username}</h2>
              {!isOwner && (
                <button
                  className={`btn btn-sm ${profile.is_following ? 'btn-outline' : 'btn-primary'}`}
                  onClick={handleFollow}
                >
                  {profile.is_following ? 'Unfollow' : 'Follow'}
                </button>
              )}
            </div>

            <div className="profile-stats">
              <div className="stat">
                <strong>{posts.length}</strong>
                <span>Posts</span>
              </div>
              <div className="stat">
                <strong>{profile.followers_count || 0}</strong>
                <span>Followers</span>
              </div>
              <div className="stat">
                <strong>{profile.following_count || 0}</strong>
                <span>Following</span>
              </div>
            </div>

            {/* Bio */}
            <div className="profile-bio">
              {editing ? (
                <div className="bio-edit">
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Write something about yourself..."
                    rows={2}
                    maxLength={150}
                  />
                  <div className="bio-actions">
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={handleSaveBio}
                      disabled={saving}
                    >
                      <Check size={14} /> Save
                    </button>
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => setEditing(false)}
                    >
                      <X size={14} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bio-display">
                  <p>{profile.bio || (isOwner ? 'Add a bio...' : '')}</p>
                  {isOwner && (
                    <button className="bio-edit-btn" onClick={() => setEditing(true)}>
                      <Edit2 size={13} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="profile-posts-section">
          <div className="posts-tab-bar">
            <button
              className={`tab-btn ${view === 'grid' ? 'active' : ''}`}
              onClick={() => setView('grid')}
            >
              <Grid size={16} /> Posts
            </button>
          </div>

          {posts.length === 0 ? (
            <div className="no-posts">
              {isOwner ? 'Share your first photo!' : 'No posts yet.'}
            </div>
          ) : view === 'grid' ? (
            <div className="posts-grid">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="grid-item"
                  onClick={() => setSelectedPost(post)}
                >
                  <img src={mediaUrl(post.image_url)} alt="" />
                  <div className="grid-overlay">
                    <span>❤️ {post.likes_count || 0}</span>
                    <span>💬 {post.comments_count || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* Post Modal */}
      {selectedPost && (
        <div className="post-modal-overlay" onClick={() => setSelectedPost(null)}>
          <div className="post-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedPost(null)}>
              <X size={20} />
            </button>
            <PostCard post={selectedPost} onDelete={handleDeletePost} />
          </div>
        </div>
      )}
    </div>
  );
}
