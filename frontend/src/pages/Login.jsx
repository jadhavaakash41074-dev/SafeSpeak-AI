import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", formData);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setMessage("Login successful!");
      navigate("/");
      window.location.reload();
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div style={styles.container}>
      
      {/* LEFT SIDE: Attractive Branding Section (Chat App Feel) */}
      <div style={styles.leftPanel}>
        <div style={styles.brandingContent}>
          <h1 style={styles.brandTitle}>SafeSpeak AI</h1>
          <p style={styles.brandSubtitle}>
            The next generation of social interaction. Real-time moderation, hate speech detection, and a community that actually feels safe.
          </p>
          
          {/* Fake Chat Bubbles for UI Feel */}
          <div style={styles.chatMockup}>
            <div style={styles.messageBubble1}>Hey! Welcome to the community 👋</div>
            <div style={styles.messageBubble2}>SafeSpeak automatically filters out toxicity so we can just chat!</div>
            <div style={styles.messageBubble3}>That's awesome! 🚀</div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Login Form */}
      <div style={styles.rightPanel}>
        <form style={styles.form} onSubmit={handleSubmit}>
          <h2 style={styles.title}>Welcome Back</h2>
          <p style={styles.subtitle}>Login to continue to your feed</p>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <button type="submit" style={styles.button}>
            Sign In
          </button>

          {message && (
            <p style={{ ...styles.message, color: message.includes("successful") ? "#10b981" : "#ef4444" }}>
              {message}
            </p>
          )}

          <p style={styles.footerText}>
            Don&apos;t have an account? <Link to="/register" style={styles.link}>Create one</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#0f172a", // Dark Background
    fontFamily: "'Inter', sans-serif",
  },
  leftPanel: {
    flex: 1,
    background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)", // Deep Purple/Blue Gradient
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "50px",
    color: "#fff",
    display: "flex",
  },
  brandingContent: {
    maxWidth: "400px",
  },
  brandTitle: {
    fontSize: "3rem",
    fontWeight: "800",
    marginBottom: "15px",
    background: "-webkit-linear-gradient(#38bdf8, #818cf8)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  brandSubtitle: {
    fontSize: "1.1rem",
    color: "#cbd5e1",
    lineHeight: "1.6",
    marginBottom: "40px",
  },
  chatMockup: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  messageBubble1: {
    backgroundColor: "#334155",
    padding: "12px 18px",
    borderRadius: "16px 16px 16px 0px",
    alignSelf: "flex-start",
    maxWidth: "80%",
    fontSize: "0.9rem",
  },
  messageBubble2: {
    backgroundColor: "#6366f1",
    padding: "12px 18px",
    borderRadius: "16px 16px 0px 16px",
    alignSelf: "flex-end",
    maxWidth: "80%",
    fontSize: "0.9rem",
  },
  messageBubble3: {
    backgroundColor: "#334155",
    padding: "12px 18px",
    borderRadius: "16px 16px 16px 0px",
    alignSelf: "flex-start",
    maxWidth: "80%",
    fontSize: "0.9rem",
  },
  rightPanel: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a",
    padding: "40px",
  },
  form: {
    width: "100%",
    maxWidth: "400px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  title: {
    fontSize: "2rem",
    color: "#f8fafc",
    marginBottom: "5px",
  },
  subtitle: {
    color: "#94a3b8",
    marginBottom: "20px",
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
  input: {
    padding: "14px 16px",
    fontSize: "1rem",
    borderRadius: "8px",
    border: "1px solid #334155",
    backgroundColor: "#1e293b",
    color: "#f8fafc",
    outline: "none",
    transition: "border 0.3s",
  },
  button: {
    padding: "16px",
    background: "linear-gradient(90deg, #38bdf8, #6366f1)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "1rem",
    marginTop: "10px",
    transition: "opacity 0.3s",
  },
  message: {
    textAlign: "center",
    fontSize: "0.9rem",
    fontWeight: "500",
    marginTop: "10px",
  },
  footerText: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "0.9rem",
    marginTop: "20px",
  },
  link: {
    color: "#38bdf8",
    textDecoration: "none",
    fontWeight: "bold",
  }
};

export default Login;