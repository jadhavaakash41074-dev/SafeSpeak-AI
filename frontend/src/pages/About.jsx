import React from "react";

function About() {
  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        
        {/* 1. HEADER SECTION */}
        <div style={styles.headerSection}>
          <h1 style={styles.mainTitle}>About SafeSpeak AI</h1>
          <p style={styles.subtitle}>
            Building a safer digital world with the power of Artificial Intelligence.
          </p>
        </div>

        {/* 2. MISSION CARD */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Our Mission</h2>
          <p style={styles.cardText}>
            SafeSpeak AI is a full-stack social media content moderation platform designed to create safer, more responsible online communities. We believe that everyone should be able to express themselves freely without the fear of toxicity, hate speech, or harassment.
          </p>
        </div>

        {/* 3. HOW IT WORKS (AI FEATURES) */}
        <div style={styles.gridContainer}>
          
          <div style={styles.featureCard}>
            <div style={styles.icon}>🧠</div>
            <h3 style={styles.featureTitle}>AI Moderation Engine</h3>
            <p style={styles.featureText}>
              Using a fine-tuned <strong>DistilBERT</strong> model, our system automatically detects 10+ harmful categories including toxic, insult, hate, harassment, spam, threat, self-harm, profanity, sexual, and sarcasm.
            </p>
          </div>

          <div style={styles.featureCard}>
            <div style={styles.icon}>⚡</div>
            <h3 style={styles.featureTitle}>Strike-Based Enforcement</h3>
            <p style={styles.featureText}>
              The backend policy engine ensures a safe environment by automatically applying warnings, temporary 24-hour blocks, and permanent bans for repeated or severe violations.
            </p>
          </div>

          <div style={styles.featureCard}>
            <div style={styles.icon}>🛡️</div>
            <h3 style={styles.featureTitle}>Secure & Scalable</h3>
            <p style={styles.featureText}>
              Built with a modern and robust tech stack, featuring JWT authentication, secure image storage via <strong>Cloudinary</strong>, and a fast <strong>MongoDB</strong> database.
            </p>
          </div>

        </div>

        {/* 4. TECH STACK SECTION */}
        <div style={styles.techSection}>
          <h2 style={styles.techTitle}>Powered By Modern Tech</h2>
          <div style={styles.badgeContainer}>
            <span style={styles.badge}>React.js</span>
            <span style={styles.badge}>Node.js & Express</span>
            <span style={styles.badge}>MongoDB</span>
            <span style={styles.badge}>FastAPI (Python)</span>
            <span style={styles.badge}>DistilBERT (NLP)</span>
            <span style={styles.badge}>Cloudinary</span>
          </div>
        </div>

      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    backgroundColor: "#0f172a", // Dark theme background
    minHeight: "100vh",
    fontFamily: "'Inter', sans-serif",
    paddingBottom: "50px",
  },
  container: {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "40px 20px",
  },
  headerSection: {
    textAlign: "center",
    marginBottom: "50px",
  },
  mainTitle: {
    fontSize: "3rem",
    color: "#f8fafc",
    fontWeight: "800",
    marginBottom: "15px",
    background: "-webkit-linear-gradient(#38bdf8, #818cf8)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: "1.2rem",
    maxWidth: "600px",
    margin: "0 auto",
    lineHeight: "1.6",
  },
  card: {
    backgroundColor: "#1e293b",
    padding: "30px",
    borderRadius: "16px",
    border: "1px solid #334155",
    marginBottom: "40px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },
  cardTitle: {
    color: "#38bdf8",
    fontSize: "1.5rem",
    marginBottom: "15px",
  },
  cardText: {
    color: "#cbd5e1",
    fontSize: "1.1rem",
    lineHeight: "1.7",
    margin: 0,
  },
  gridContainer: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
    marginBottom: "40px",
  },
  featureCard: {
    flex: "1 1 300px", // Flexbox for responsive cards
    backgroundColor: "#1e293b",
    padding: "25px",
    borderRadius: "16px",
    border: "1px solid #334155",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  icon: {
    fontSize: "2rem",
  },
  featureTitle: {
    color: "#f8fafc",
    fontSize: "1.3rem",
    margin: 0,
  },
  featureText: {
    color: "#94a3b8",
    fontSize: "1rem",
    lineHeight: "1.6",
    margin: 0,
  },
  techSection: {
    textAlign: "center",
    backgroundColor: "#1e293b",
    padding: "40px 20px",
    borderRadius: "16px",
    border: "1px solid #334155",
  },
  techTitle: {
    color: "#f8fafc",
    fontSize: "1.8rem",
    marginBottom: "25px",
  },
  badgeContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "15px",
    flexWrap: "wrap",
  },
  badge: {
    backgroundColor: "#0f172a",
    color: "#38bdf8",
    padding: "10px 20px",
    borderRadius: "20px",
    fontSize: "0.95rem",
    fontWeight: "600",
    border: "1px solid #334155",
  },
};

export default About;