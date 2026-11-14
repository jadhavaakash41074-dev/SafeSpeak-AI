import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import './Stories.css';

// Generates a gradient ring color per user
const ringColors = [
  'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)',
  'linear-gradient(45deg,#405de6,#5851db,#833ab4,#c13584,#e1306c)',
  'linear-gradient(45deg,#fcb045,#fd1d1d,#833ab4)',
  'linear-gradient(45deg,#4facfe,#00f2fe)',
  'linear-gradient(45deg,#43e97b,#38f9d7)',
];

export default function Stories({ users = [] }) {
  const { user: me } = useAuthStore();

  // Build story list: current user first (as "Your story"), then others
  const storyUsers = [
    { ...me, isMe: true },
    ...users.filter((u) => u.id !== me?.id).slice(0, 12),
  ];

  return (
    <div className="stories-wrap">
      <div className="stories-scroll">
        {storyUsers.map((u, i) => (
          <Link
            key={u.id || i}
            to={u.isMe ? `/profile/${u.id}` : `/profile/${u.id}`}
            className="story-item"
          >
            <div
              className="story-ring"
              style={{ background: u.isMe ? '#dbdbdb' : ringColors[i % ringColors.length] }}
            >
              <div className="story-avatar">
                {u.avatar ? (
                  <img src={u.avatar} alt={u.username} />
                ) : (
                  <span>{u.username?.[0]?.toUpperCase()}</span>
                )}
                {u.isMe && (
                  <div className="story-add">+</div>
                )}
              </div>
            </div>
            <p className="story-name">
              {u.isMe ? 'Your story' : u.username}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
