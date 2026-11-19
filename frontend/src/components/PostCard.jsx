import React, { useState } from "react";
import CommentSection from "./CommentSection";

function PostCard({ post }) {
  const initial = post?.user?.name ? post.user.name.charAt(0).toUpperCase() : "U";
  
  // States for Buttons
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(true); // Default me comments khule hain

  const toggleLike = () => setIsLiked(!isLiked);
  const toggleComments = () => setShowComments(!showComments);

  return (
    <div style={styles.card}>
      {/* Header: Avatar + Name + Date */}
      <div style={styles.header}>
        <div style={styles.avatarContainer}>
          <div style={styles.avatar}>{initial}</div>
          <div>
            <h3 style={styles.userName}>{post?.user?.name || "Unknown User"}</h3>
            <p style={styles.date}>
              {new Date(post.createdAt).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Image Section */}
      {post.imageUrl && (
        <div style={styles.imageContainer}>
          <div
            style={{
              ...styles.imageBlur,
              backgroundImage: `url(${post.imageUrl})`,
            }}
          ></div>
          <img src={post.imageUrl} alt="post" style={styles.imageFront} />
        </div>
      )}

      {/* Caption */}
      <div style={styles.content}>
        <p style={styles.caption}>{post.caption}</p>
      </div>

      {/* Action Buttons */}
      <div style={styles.actionButtons}>
        {/* LIKE BUTTON */}
        <button 
          style={{ ...styles.actionBtn, color: isLiked ? "#ef4444" : "#94a3b8" }} 
          onClick={toggleLike}
        >
          {isLiked ? "❤️ Liked" : "🤍 Like"}
        </button>
        
        {/* COMMENT BUTTON */}
        <button 
          style={{ ...styles.actionBtn, color: showComments ? "#38bdf8" : "#94a3b8" }} 
          onClick={toggleComments}
        >
          💬 Comment
        </button>
        
        {/* SHARE BUTTON */}
        <button style={styles.actionBtn}>
          🔗 Share
        </button>
      </div>

      {/* COMMENTS SECTION (Sirf tab dikhega jab showComments true hoga) */}
      {showComments && (
        <div style={styles.commentWrapper}>
          <CommentSection postId={post._id} />
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    width: "100%",
    maxWidth: "700px",
    margin: "20px auto",
    borderRadius: "16px",
    overflow: "hidden",
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
    fontFamily: "'Inter', sans-serif",
  },
  header: {
    padding: "16px 24px",
    borderBottom: "1px solid #334155",
    backgroundColor: "#1e293b",
  },
  avatarContainer: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  avatar: {
    width: "45px",
    height: "45px",
    borderRadius: "50%",
    backgroundColor: "#38bdf8",
    color: "#0f172a",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "1.3rem",
    fontWeight: "bold",
  },
  userName: {
    margin: 0,
    fontSize: "1.1rem",
    color: "#f8fafc",
    fontWeight: "600",
  },
  date: {
    margin: 0,
    fontSize: "0.85rem",
    color: "#94a3b8",
  },
  imageContainer: {
    width: "100%",
    height: "400px",
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#0f172a", 
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  imageBlur: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundSize: "cover",
    backgroundPosition: "center",
    filter: "blur(20px) brightness(0.3)",
    zIndex: 1,
  },
  imageFront: {
    position: "relative",
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "cover",
    zIndex: 2,
  },
  content: {
    padding: "16px 24px",
    backgroundColor: "#1e293b",
  },
  caption: {
    margin: 0,
    color: "#f8fafc",
    fontSize: "1.1rem",
    lineHeight: "1.6",
  },
  actionButtons: {
    display: "flex",
    justifyContent: "space-around",
    padding: "12px 20px",
    borderTop: "1px solid #334155",
    borderBottom: "1px solid #334155",
    backgroundColor: "#1e293b",
  },
  actionBtn: {
    background: "none",
    border: "none",
    fontSize: "0.95rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontWeight: "500",
    transition: "color 0.2s",
  },
  commentWrapper: {
    backgroundColor: "#0f172a",
  },
};

export default PostCard;