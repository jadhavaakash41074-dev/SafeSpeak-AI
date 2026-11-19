import React from "react";
import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <div style={{ backgroundColor: "#0f172a", minHeight: "100vh", color: "#f8fafc", fontFamily: "sans-serif" }}>
      {/* Navbar */}
      <nav style={{ display: "flex", justifyContent: "space-between", padding: "20px 50px", borderBottom: "1px solid #1e293b" }}>
        <h2 style={{ margin: 0, color: "#38bdf8" }}>SafeSpeak AI</h2>
        <div style={{ display: "flex", gap: "20px" }}>
          <Link to="/login" style={{ color: "#f8fafc", textDecoration: "none", padding: "8px 16px" }}>Login</Link>
          <Link to="/register" style={{ backgroundColor: "#38bdf8", color: "#0f172a", padding: "8px 16px", borderRadius: "6px", textDecoration: "none", fontWeight: "bold" }}>Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "100px 20px" }}>
        <h1 style={{ fontSize: "3.5rem", marginBottom: "20px", maxWidth: "800px" }}>
          Build Safer Communities with <span style={{ color: "#38bdf8" }}>Real-Time AI Moderation</span>
        </h1>
        <p style={{ fontSize: "1.2rem", color: "#94a3b8", maxWidth: "600px", marginBottom: "40px" }}>
          Detect toxic comments, hate speech, and threats instantly. Our DistilBERT-powered engine automatically enforces warnings, temporary blocks, and bans.
        </p>
        <div style={{ display: "flex", gap: "20px" }}>
          <Link to="/register" style={{ backgroundColor: "#38bdf8", color: "#0f172a", padding: "15px 30px", borderRadius: "8px", textDecoration: "none", fontWeight: "bold", fontSize: "1.1rem" }}>Create Free Account</Link>
          <Link to="/login" style={{ border: "1px solid #38bdf8", color: "#38bdf8", padding: "15px 30px", borderRadius: "8px", textDecoration: "none", fontWeight: "bold", fontSize: "1.1rem" }}>Login to Platform</Link>
        </div>
      </div>

      {/* Features Section */}
      <div style={{ display: "flex", justifyContent: "center", gap: "30px", padding: "50px", flexWrap: "wrap" }}>
        <div style={{ backgroundColor: "#1e293b", padding: "30px", borderRadius: "12px", width: "300px" }}>
          <h3 style={{ color: "#38bdf8" }}>🧠 AI-Powered Detection</h3>
          <p style={{ color: "#94a3b8" }}>Multi-label classification detects 10+ harmful categories including threats and self-harm.</p>
        </div>
        <div style={{ backgroundColor: "#1e293b", padding: "30px", borderRadius: "12px", width: "300px" }}>
          <h3 style={{ color: "#38bdf8" }}>⚡ Real-time Action</h3>
          <p style={{ color: "#94a3b8" }}>Instantly hide harmful comments and apply strike-based temporary blocks or permanent bans.</p>
        </div>
        <div style={{ backgroundColor: "#1e293b", padding: "30px", borderRadius: "12px", width: "300px" }}>
          <h3 style={{ color: "#38bdf8" }}>🔒 Secure Platform</h3>
          <p style={{ color: "#94a3b8" }}>JWT authentication and secure image storage via Cloudinary ensure user data safety.</p>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;