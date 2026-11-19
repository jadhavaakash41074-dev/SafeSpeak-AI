import React, { useEffect, useState } from "react";
import API from "../services/api";

function CommentSection({ postId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const fetchComments = async () => {
    try {
      const res = await API.get(`/comments/${postId}`);
      if (Array.isArray(res.data)) {
        setComments(res.data);
      } else if (res.data && Array.isArray(res.data.comments)) {
        setComments(res.data.comments);
      } else {
        setComments([]);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to load comments");
      setComments([]);
    }
  };

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId]);

    const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setMessage("Please login first to comment");
      return;
    }

    if (!text.trim()) {
      setMessage("Comment cannot be empty");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const res = await API.post(`/comments/${postId}`, { text });
      
      setText(""); // Input clear karo

      if (res.data?.comment?.isHidden) {
        setMessage(
          res.data?.message ||
            "Your comment was flagged by moderation and is hidden."
        );
      } else {
        setMessage(res.data?.message || "Comment added successfully");
        // Naya comment seedha list me add karo bina reload ke
        setComments((prevComments) => [res.data.comment, ...prevComments]);
      }

      // Backup ke liye dubara fetch karo (optional)
      fetchComments();
      
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to add comment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <h4 style={styles.title}>Comments</h4>

      <form onSubmit={handleCommentSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="Write a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Posting..." : "Post"}
        </button>
      </form>

      {message && <p style={styles.message}>{message}</p>}

      <div style={styles.commentList}>
        {Array.isArray(comments) && comments.length === 0 ? (
          <p style={styles.emptyText}>No visible comments yet</p>
        ) : (
          Array.isArray(comments) &&
          comments.map((comment) => (
            <div key={comment._id} style={styles.commentItem}>
              <strong>{comment?.user?.name || "User"}:</strong> {comment.text}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    padding: "20px",
    borderTop: "1px solid #334155",
    backgroundColor: "#0f172a",
  },
  title: {
    margin: "0 0 15px 0",
    color: "#f8fafc",
    fontSize: "1.1rem",
  },
  form: {
    display: "flex",
    gap: "10px",
    marginBottom: "15px",
  },
  input: {
    flex: 1,
    padding: "12px 16px",
    fontSize: "0.95rem",
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "8px",
    color: "#f8fafc",
    outline: "none",
  },
  button: {
    padding: "12px 20px",
    backgroundColor: "#38bdf8",
    color: "#0f172a",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  message: {
    fontSize: "0.9rem",
    color: "#38bdf8",
    marginBottom: "15px",
  },
  commentList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  commentItem: {
    backgroundColor: "#1e293b",
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid #334155",
    color: "#f8fafc",
    fontSize: "0.95rem",
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: "0.9rem",
    fontStyle: "italic",
  },
};

export default CommentSection;