import React from "react";

function Contact() {
  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        
        {/* Header Section */}
        <div style={styles.headerSection}>
          <h1 style={styles.mainTitle}>Contact Us</h1>
          <p style={styles.subtitle}>
            If you have any questions, feedback, or suggestions regarding SafeSpeak AI, feel free to reach out.
          </p>
        </div>

        {/* Contact Info Card */}
        <div style={styles.card}>
          
          <div style={styles.contactItem}>
            <span style={styles.icon}>👤</span>
            <div>
              <h3 style={styles.contactLabel}>Name</h3>
              <p style={styles.contactValue}>Akash Jadhav</p> {/* Apna naam yahan likho */}
            </div>
          </div>

          <div style={styles.divider}></div>

          <div style={styles.contactItem}>
            <span style={styles.icon}>✉️</span>
            <div>
              <h3 style={styles.contactLabel}>Email</h3>
              <a href="mailto:jadhavaakash41074@gmail.com" style={styles.link}>
                jadhavaakash41074@gmail.com
              </a>
            </div>
          </div>

        </div>

        <p style={styles.footerText}>We will get back to you as soon as possible.</p>

      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    backgroundColor: "#0f172a",
    minHeight: "100vh",
    fontFamily: "'Inter', sans-serif",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  },
  container: {
    width: "100%",
    maxWidth: "600px",
  },
  headerSection: {
    textAlign: "center",
    marginBottom: "40px",
  },
  mainTitle: {
    fontSize: "2.5rem",
    color: "#f8fafc",
    fontWeight: "800",
    marginBottom: "15px",
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: "1.1rem",
    lineHeight: "1.6",
  },
  card: {
    backgroundColor: "#1e293b",
    padding: "40px",
    borderRadius: "16px",
    border: "1px solid #334155",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
    display: "flex",
    flexDirection: "column",
    gap: "25px",
  },
  contactItem: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  icon: {
    fontSize: "1.8rem",
    backgroundColor: "#0f172a",
    padding: "15px",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  contactLabel: {
    margin: "0 0 5px 0",
    color: "#94a3b8",
    fontSize: "0.9rem",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  contactValue: {
    margin: 0,
    color: "#f8fafc",
    fontSize: "1.2rem",
    fontWeight: "600",
  },
  link: {
    color: "#38bdf8",
    fontSize: "1.2rem",
    textDecoration: "none",
    fontWeight: "500",
  },
  divider: {
    height: "1px",
    backgroundColor: "#334155",
    width: "100%",
  },
  footerText: {
    textAlign: "center",
    color: "#64748b",
    marginTop: "40px",
    fontSize: "0.95rem",
  },
};

export default Contact;