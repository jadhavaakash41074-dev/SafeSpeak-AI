import { Link, useNavigate } from 'react-router-dom';
import { Shield, Send, PlusSquare } from 'lucide-react';
import useAuthStore from '../store/authStore';
import './Navbar.css';

export default function Navbar() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <Link to="/" className="navbar-brand">
          <Shield size={20} />
          <span>SafeSpeak</span>
        </Link>

        {/* Right icons */}
        <div className="navbar-right">
          <Link to="/upload" className="nav-icon-btn" title="New Post">
            <PlusSquare size={24} />
          </Link>
          <Link to="/messages" className="nav-icon-btn" title="Messages">
            <Send size={22} />
          </Link>
        </div>
      </div>
    </nav>
  );
}
