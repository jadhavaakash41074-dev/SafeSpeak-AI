import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
    window.location.reload();
  };

  // User ke naam ka pehla letter nikalne ke liye
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <nav style={styles.nav}>
      {/* Logo */}
      <Link to="/" style={styles.logoLink}>
        <h2 style={styles.logo}>SafeSpeak AI</h2>
      </Link>

      {/* Right Side: Search, Links, Profile */}
      <div style={styles.links}>
        
        {/* Search Bar */}
        <div style={styles.searchContainer}>
          <span style={styles.searchIcon}>🔍</span>
          <input 
            type="text" 
            placeholder="Search..." 
            style={styles.searchInput} 
          />
        </div>

        <Link to="/" style={styles.link}>Home</Link>
        <Link to="/about" style={styles.link}>About</Link>
        <Link to="/contact" style={styles.link}>Contact Us</Link>

        {token && (
          <>
            <Link to="/create" style={styles.link}>Create Post</Link>
            
            {/* Notification Bell */}
            <div style={styles.iconBtn}>🔔</div>

            {/* User Avatar Dropdown */}
            <div style={styles.profileSection}>
              <div style={styles.avatar}>{initial}</div>
              <span style={styles.userName}>{user?.name || "User"}</span>
              <button onClick={handleLogout} style={styles.logoutBtn}>
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 40px",
    backgroundColor: "#1e293b", // Dark theme matching
    borderBottom: "1px solid #334155",
    flexWrap: "wrap",
    fontFamily: "'Inter', sans-serif",
  },
  logoLink: {
    textDecoration: "none",
  },
  logo: {
    margin: 0,
    fontSize: "1.5rem",
    color: "#38bdf8", // Blue logo
    fontWeight: "800",
    letterSpacing: "0.5px",
  },
  links: {
    display: "flex",
    gap: "20px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  searchContainer: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#0f172a", // Dark input bg
    borderRadius: "20px",
    padding: "8px 16px",
    border: "1px solid #334155",
  },
  searchIcon: {
    marginRight: "8px",
    fontSize: "0.9rem",
    color: "#94a3b8",
  },
  searchInput: {
    background: "none",
    border: "none",
    color: "#f8fafc",
    outline: "none",
    width: "150px",
    fontSize: "0.9rem",
  },
  link: {
    color: "#cbd5e1",
    textDecoration: "none",
    fontWeight: "500",
    fontSize: "0.95rem",
    transition: "color 0.2s",
  },
  iconBtn: {
    fontSize: "1.2rem",
    cursor: "pointer",
    color: "#94a3b8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  profileSection: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    backgroundColor: "#0f172a",
    padding: "6px 12px",
    borderRadius: "30px",
    border: "1px solid #334155",
  },
  avatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "#38bdf8",
    color: "#0f172a",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "bold",
    fontSize: "0.9rem",
  },
  userName: {
    fontSize: "0.9rem",
    color: "#f8fafc",
    fontWeight: "600",
  },
  logoutBtn: {
    background: "none",
    border: "none",
    color: "#ef4444",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "0.85rem",
    marginLeft: "5px",
  },
};

export default Navbar;