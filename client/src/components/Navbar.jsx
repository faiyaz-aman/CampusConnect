import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [logoFailed, setLogoFailed] = useState(false);
  const link = ({ isActive }) =>
    `px-3 py-1.5 rounded-full text-sm ${isActive ? 'bg-white/10 text-ink' : 'text-muted hover:text-ink'}`;
  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-bg/70 border-b border-white/5">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          {!logoFailed ? (
            <img 
              src="/assets/logo.png" 
              alt="CampusConnect Logo" 
              className="h-7 w-auto max-h-7 object-contain rounded-md" 
              onError={() => setLogoFailed(true)} 
            />
          ) : (
            <span className="h-7 w-7 rounded-lg bg-accent shadow-glow" />
          )}
          <span className="font-display text-lg font-bold">CampusConnect</span>
        </Link>
        <nav className="flex items-center gap-1 flex-wrap">
          {user && <NavLink to="/feed" className={link}>Feed</NavLink>}
          {user?.role === 'student' && (
            <>
              <NavLink to="/explore" className={link}>Explore</NavLink>
              <NavLink to="/my-activity" className={link}>My Activity</NavLink>
              <NavLink to="/interests" className={link}>My Vibes</NavLink>
            </>
          )}
          {user?.role === 'organizer' && <NavLink to="/dashboard" className={link}>Dashboard</NavLink>}
          {user?.role === 'admin' && <NavLink to="/admin" className={link}>Admin Console</NavLink>}
          {!user && <NavLink to="/login" className={link}>Login</NavLink>}
          {!user && <Link to="/register" className="btn-primary text-sm ml-2">Join</Link>}
          {user && (
            <button onClick={logout} className="btn-ghost text-sm ml-2">Logout</button>
          )}
        </nav>
      </div>
    </header>
  );
}
