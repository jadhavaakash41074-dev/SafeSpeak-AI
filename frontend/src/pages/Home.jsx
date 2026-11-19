import React, { useEffect, useState } from "react";
import API from "../services/api";
import PostCard from "../components/PostCard";
import { Link } from "react-router-dom";

function Home() {
  const token = localStorage.getItem("token");
  const [posts, setPosts] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      const fetchPosts = async () => {
        try {
          setLoading(true);
          const res = await API.get("/posts");
          setPosts(res.data);
        } catch (error) {
          setMessage(error.response?.data?.message || "Failed to load posts");
        } finally {
          setLoading(false);
        }
      };
      fetchPosts();
    }
  }, [token]);

  // 🔹 Agar user login nahi hai -> Hero Page
  if (!token) {
    return (
      <div style={styles.welcomeContainer}>
        <div style={styles.glow}></div>
        <div style={styles.contentWrapper}>
          <h1 style={styles.title}>
            Welcome to <br />
            <span style={styles.highlightText}>SafeSpeak AI</span>
          </h1>
          <p style={styles.subtitle}>
            Experience a social platform where AI protects you. Register now to post, interact, and chat safely without the fear of toxicity.
          </p>
          <div style={styles.buttonGroup}>
            <Link to="/register" style={styles.buttonPrimary}>Create Free Account</Link>
            <Link to="/login" style={styles.buttonOutline}>Login</Link>
          </div>
        </div>
      </div>
    );
  }

  // 🔹 Agar user login hai -> 3-Column Feed Layout
  return (
    <div style={styles.layoutWrapper}>
      
      {/* LEFT SIDEBAR */}
      <div style={styles.leftSidebar}>
        <div style={styles.profileCard}>
          <div style={styles.avatar}>A</div>
          <div>
            <h3 style={styles.userName}>Aakash</h3>
            <p style={styles.userHandle}>@aakash</p>
          </div>
        </div>
        <nav style={styles.navMenu}>
          <div style={styles.navItem}>🏠 Home</div>
          <div style={styles.navItem}>🔍 Explore</div>
          <div style={styles.navItem}>🔖 Bookmarks</div>
          <div style={styles.navItem}>⚙️ Settings</div>
        </nav>
      </div>

      {/* CENTER FEED */}
      <div style={styles.centerFeed}>
        <div style={styles.feedHeader}>
          <h1 style={styles.feedTitle}>My Feed</h1>
          <p style={styles.feedSubtitle}>See what the community is sharing</p>
        </div>

        {loading && <p style={styles.statusText}>Loading posts...</p>}
        {message && <p style={{ ...styles.statusText, color: "#ef4444" }}>{message}</p>}
        
        {!loading && posts.length === 0 && (
          <div style={styles.emptyState}>
            <p>No posts yet. Be the first one to share something!</p>
            <Link to="/create" style={styles.buttonPrimary}>Create Post</Link>
          </div>
        )}

        <div style={styles.postsWrapper}>
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      </div>

      {/* RIGHT SIDEBAR */}
      <div style={styles.rightSidebar}>
        <div style={styles.trendingCard}>
          <h3 style={styles.sidebarTitle}>Trending Topics</h3>
          <div style={styles.trendItem}>#SafeSpeakAI</div>
          <div style={styles.trendItem}>#CyberSafety</div>
          <div style={styles.trendItem}>#AIforGood</div>
          <div style={styles.trendItem}>#ContentModeration</div>
        </div>

        <div style={styles.followCard}>
          <h3 style={styles.sidebarTitle}>Who to Follow</h3>
          <div style={styles.followItem}>
            <span style={styles.smallAvatar}>S</span>
            <div>
              <p style={styles.followName}>Sujal Bagade</p>
              <p style={styles.followHandle}>@sujal</p>
            </div>
          </div>
          <div style={styles.followItem}>
            <span style={styles.smallAvatar}>J</span>
            <div>
              <p style={styles.followName}>Jaydeep Kale</p>
              <p style={styles.followHandle}>@jaydeep</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

const styles = {
  // --- Welcome Page Styles ---
  welcomeContainer: {
    minHeight: "90vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    backgroundColor: "#0f172a",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Inter', sans-serif",
    padding: "20px",
  },
  glow: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "600px",
    height: "600px",
    background: "radial-gradient(circle, rgba(56,189,248,0.15) 0%, rgba(15,23,42,0) 70%)",
    zIndex: 0,
  },
  contentWrapper: { zIndex: 1, maxWidth: "800px" },
  title: { fontSize: "4rem", fontWeight: "800", color: "#f8fafc", lineHeight: "1.2", marginBottom: "20px" },
  highlightText: {
    background: "-webkit-linear-gradient(#38bdf8, #818cf8)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: { fontSize: "1.2rem", color: "#94a3b8", marginBottom: "40px", lineHeight: "1.6" },
  buttonGroup: { display: "flex", gap: "20px", justifyContent: "center" },
  buttonPrimary: {
    padding: "15px 30px", backgroundColor: "#38bdf8", color: "#0f172a", textDecoration: "none",
    borderRadius: "8px", fontWeight: "bold", fontSize: "1.1rem",
  },
  buttonOutline: {
    padding: "15px 30px", border: "1px solid #38bdf8", color: "#38bdf8", textDecoration: "none",
    borderRadius: "8px", fontWeight: "bold", fontSize: "1.1rem",
  },

  // --- Main Layout (3 Columns) ---
  layoutWrapper: {
    display: "flex",
    justifyContent: "center",
    gap: "30px",
    padding: "30px 20px",
    backgroundColor: "#0f172a",
    minHeight: "100vh",
    fontFamily: "'Inter', sans-serif",
  },
  
  // Left Sidebar
    leftSidebar: {
    width: "250px",
    display: "flex", // <--- Yahan "none" hata kar "flex" karo
    flexDirection: "column",
    gap: "20px",
  },
  profileCard: {
    display: "flex", alignItems: "center", gap: "15px",
    backgroundColor: "#1e293b", padding: "20px", borderRadius: "16px",
    border: "1px solid #334155",
  },
  avatar: {
    width: "50px", height: "50px", borderRadius: "50%",
    backgroundColor: "#38bdf8", color: "#0f172a",
    display: "flex", justifyContent: "center", alignItems: "center",
    fontSize: "1.5rem", fontWeight: "bold",
  },
  userName: { margin: 0, color: "#f8fafc", fontSize: "1rem" },
  userHandle: { margin: 0, color: "#94a3b8", fontSize: "0.8rem" },
  navMenu: {
    backgroundColor: "#1e293b", borderRadius: "16px", padding: "15px",
    display: "flex", flexDirection: "column", gap: "10px",
    border: "1px solid #334155",
  },
  navItem: { padding: "12px", color: "#cbd5e1", borderRadius: "8px", cursor: "pointer", fontWeight: "500" },

  // Center Feed
  centerFeed: { width: "100%", maxWidth: "650px" },
  feedHeader: { textAlign: "center", marginBottom: "30px" },
  feedTitle: { fontSize: "2.5rem", color: "#f8fafc", margin: "0 0 10px 0", fontWeight: "800" },
  feedSubtitle: { color: "#94a3b8", fontSize: "1.1rem", margin: 0 },
  statusText: { textAlign: "center", color: "#94a3b8", fontSize: "1.1rem" },
  emptyState: {
    textAlign: "center", backgroundColor: "#1e293b", padding: "40px",
    borderRadius: "16px", border: "1px solid #334155", color: "#94a3b8",
  },
  postsWrapper: { display: "flex", flexDirection: "column", gap: "20px" },

  // Right Sidebar
  rightSidebar: { width: "250px", display: "flex", flexDirection: "column", gap: "20px" },
  trendingCard: { backgroundColor: "#1e293b", padding: "20px", borderRadius: "16px", border: "1px solid #334155" },
  sidebarTitle: { color: "#f8fafc", fontSize: "1.1rem", marginBottom: "15px" },
  trendItem: { padding: "10px 0", color: "#38bdf8", borderBottom: "1px solid #334155", cursor: "pointer" },
  followCard: { backgroundColor: "#1e293b", padding: "20px", borderRadius: "16px", border: "1px solid #334155" },
  followItem: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px" },
  smallAvatar: {
    width: "35px", height: "35px", borderRadius: "50%", backgroundColor: "#818cf8",
    color: "#fff", display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "bold",
  },
  followName: { margin: 0, color: "#f8fafc", fontSize: "0.9rem" },
  followHandle: { margin: 0, color: "#94a3b8", fontSize: "0.8rem" },
};

export default Home;