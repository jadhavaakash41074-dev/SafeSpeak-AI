import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function CreatePost() {
  const navigate = useNavigate();

  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      setMessage("Please select an image");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const formData = new FormData();
      formData.append("caption", caption);
      formData.append("image", image);

      await API.post("/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage("Post created successfully!");
      setCaption("");
      setImage(null);

      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleSubmit}>
        <h2 style={styles.title}>Create a New Post</h2>
        <p style={styles.subtitle}>Share your thoughts safely with the community.</p>

        {/* Caption Input */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Caption</label>
          <textarea
            placeholder="What's on your mind?"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            style={styles.textarea}
          />
        </div>

        {/* Image Upload Input */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Upload Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            style={styles.fileInput}
            required
          />
        </div>

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Uploading..." : "Create Post"}
        </button>

        {message && (
          <p style={{ ...styles.message, color: message.includes("success") ? "#10b981" : "#ef4444" }}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "90vh",
    backgroundColor: "#0f172a", // Dark background
    fontFamily: "'Inter', sans-serif",
    padding: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    maxWidth: "500px",
    gap: "20px",
    padding: "40px",
    borderRadius: "16px",
    backgroundColor: "#1e293b", // Dark card
    boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
    border: "1px solid #334155",
  },
  title: {
    margin: 0,
    color: "#f8fafc",
    fontSize: "1.8rem",
    textAlign: "center",
  },
  subtitle: {
    margin: "0 0 10px 0",
    color: "#94a3b8",
    fontSize: "0.95rem",
    textAlign: "center",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    color: "#cbd5e1",
    fontSize: "0.9rem",
    fontWeight: "500",
  },
  textarea: {
    minHeight: "120px",
    padding: "14px",
    fontSize: "1rem",
    backgroundColor: "#0f172a", // Dark input
    border: "1px solid #334155",
    borderRadius: "8px",
    color: "#f8fafc",
    outline: "none",
    resize: "vertical",
  },
  fileInput: {
    padding: "12px",
    backgroundColor: "#0f172a",
    border: "1px dashed #38bdf8", // Dashed border for upload
    borderRadius: "8px",
    color: "#94a3b8",
    cursor: "pointer",
  },
  button: {
    padding: "16px",
    background: "linear-gradient(90deg, #38bdf8, #3b82f6)", // Gradient Button
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "1.1rem",
    marginTop: "10px",
  },
  message: {
    textAlign: "center",
    fontSize: "0.95rem",
    fontWeight: "500",
  },
};

export default CreatePost;