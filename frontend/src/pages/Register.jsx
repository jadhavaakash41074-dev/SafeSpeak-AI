import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage("");
      
      const res = await API.post("/auth/register", formData);
      
      setMessage("Registration successful! Redirecting to login...");
      
      setTimeout(() => {
        navigate("/login");
      }, 1500);
      
    } catch (error) {
      setMessage(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Left Side: Attractive Branding Section */}
      <div style={styles.leftPanel}>
        <div style={styles.brandingContent}>
          <h1 style={styles.brandTitle}>Join SafeSpeak AI</h1>
          <p style={styles.brandSubtitle}>
            Create an account to experience a social platform where AI protects you from toxicity and hate speech.
          </p>
          
          {/* Fake Chat Bubbles for UI Feel */}
          <div style={styles.chatMockup}>
            <div style={styles.messageBubble1}>Welcome to the community! 👋</div>
            <div style={styles.messageBubble2}>Create your account to start posting and chatting safely.</div>
            <div style={styles.messageBubble3}>It only takes a minute! 🚀</div>
          </div>
        </div>
      </div>

      {/* Right Side: Register Form */}
      <div style={styles.rightPanel}>
        <form style={styles.form} onSubmit={handleSubmit}>
          <h2 style={styles.title}>Create Account</h2>
          <p style={styles.subtitle}>Get started with SafeSpeak AI</p>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

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
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Creating Account..." : "Register"}
          </button>

          {message && (
            <p style={{ ...styles.message, color: message.includes("successful") ? "#10b981" : "#ef4444" }}>
              {message}
            </p>
          )}

          <p style={styles.footerText}>
            Already have an account? <Link to="/login" style={styles.link}>Login here</Link>
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
    backgroundColor: "#0f172a", 
    fontFamily: "'Inter', sans-serif",
  },
  leftPanel: {
    flex: 1,
    background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)", 
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "50px",
    color: "#fff",
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
  },
};

export default Register;