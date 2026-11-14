import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, PlusSquare, Heart, User } from 'lucide-react';
import useAuthStore from '../store/authStore';
import './BottomNav.css';

export default function BottomNav() {
  const location = useLocation();
  const { user } = useAuthStore();
  const is = (p) => location.pathname === p;

  return (
    <nav className="bottom-nav">
      <Link to="/" className={`bnav-btn ${is('/') ? 'active' : ''}`}>
        <Home size={26} fill={is('/') ? '#262626' : 'none'} />
      </Link>

      <Link to="/explore" className={`bnav-btn ${is('/explore') ? 'active' : ''}`}>
        <Search size={26} />
      </Link>

      <Link to="/upload" className="bnav-btn">
        <PlusSquare size={26} />
      </Link>

      <Link to="/activity" className={`bnav-btn ${is('/activity') ? 'active' : ''}`}>
        <Heart size={26} fill={is('/activity') ? '#262626' : 'none'} />
      </Link>

      <Link
        to={`/profile/${user?.id}`}
        className={`bnav-btn ${location.pathname.startsWith('/profile') ? 'active' : ''}`}
      >
        {user?.avatar ? (
          <img src={user.avatar} alt="" className="bnav-avatar" />
        ) : (
          <User size={26} />
        )}
      </Link>
    </nav>
  );
}
