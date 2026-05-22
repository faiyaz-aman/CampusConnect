import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import LiveCampusMapModal from './LiveCampusMapModal';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [logoFailed, setLogoFailed] = useState(false);
  const [hasLiveEvents, setHasLiveEvents] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setHasLiveEvents(false);
      return;
    }

    const checkLiveEvents = () => {
      api.get('/events/live')
        .then(res => {
          const events = res.data.events || [];
          setHasLiveEvents(events.length > 0);
        })
        .catch(err => console.error('Error checking live events:', err));
    };

    checkLiveEvents();
    const interval = setInterval(checkLiveEvents, 60000); // Check every 60s
    return () => clearInterval(interval);
  }, [user]);

  const link = ({ isActive }) =>
    `px-3 py-1.5 rounded-full text-sm ${isActive ? 'bg-white/10 text-ink' : 'text-muted hover:text-ink'}`;

  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-bg/70 border-b border-white/5">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          {!logoFailed ? (
            <img 
              src="/logo.jpg" 
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
          {user && (
            <>
              {hasLiveEvents && (
                <button
                  onClick={() => setIsMapOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-accent bg-accent/10 border border-accent/20 shadow-[0_0_15px_rgba(196,255,61,0.2)] animate-pulse hover:scale-105 active:scale-95 transition-all mr-2"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                  </span>
                  Live on Campus 📡
                </button>
              )}
              <NavLink to="/feed" className={link}>Feed</NavLink>
            </>
          )}
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
      <LiveCampusMapModal isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} />
    </header>
  );
}
