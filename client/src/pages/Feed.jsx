import { useEffect, useState } from 'react';
import api from '../lib/api';
import EventCard from '../components/EventCard';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Feed() {
  const { user } = useAuth();
  const [tab, setTab] = useState(user?.role === 'student' ? 'for-you' : 'all');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState({ registrations: [], saves: [] });

  useEffect(() => {
    setLoading(true);
    const url = tab === 'for-you' ? '/events/recommended' : '/events';
    api.get(url).then(r => {
      const events = r.data.events || [];
      setItems(tab === 'for-you' ? events : events.map(e => ({ event: e, matched: false, reasons: e.isFeatured ? ['Featured ✦'] : [] })));
    })
    .catch(err => console.error(err))
    .finally(() => setLoading(false));
  }, [tab]);

  useEffect(() => {
    if (user?.role === 'student') {
      api.get('/events/my/activity')
        .then(r => setActivity(r.data))
        .catch(err => console.error(err));
    }
  }, [user]);

  return (
    <section className="space-y-6">
      {/* Dashboard Greeting Header */}
      <div className="card bg-surface/50 border border-white/5 p-6 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 bg-electric/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-20 h-40 w-40 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold font-display">
              hey {user?.name?.split(' ')[0]} ✦
            </h1>
            <p className="text-muted text-sm mt-1.5">
              {tab === 'for-you' ? "Your personalized college lineup." : "Discover what is happening on campus."}
            </p>
            {user?.role === 'student' && user.interests?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {user.interests.map(interest => (
                  <span key={interest} className="text-[10px] bg-white/5 text-muted px-2 py-0.5 rounded-full border border-white/5">
                    #{interest}
                  </span>
                ))}
                <Link to="/interests" className="text-[10px] text-accent font-bold hover:underline self-center ml-1">
                  Edit Vibes →
                </Link>
              </div>
            )}
          </div>

          {user?.role === 'student' && (
            <div className="flex gap-4">
              <div className="bg-white/5 border border-white/5 px-4 py-2.5 rounded-2xl text-center min-w-[80px]">
                <div className="text-xl font-bold font-display text-accent">{activity.registrations?.length || 0}</div>
                <div className="text-[9px] uppercase tracking-wider text-muted mt-0.5">RSVPs</div>
              </div>
              <div className="bg-white/5 border border-white/5 px-4 py-2.5 rounded-2xl text-center min-w-[80px]">
                <div className="text-xl font-bold font-display text-hot">{activity.saves?.length || 0}</div>
                <div className="text-[9px] uppercase tracking-wider text-muted mt-0.5">Bookmarks</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="text-xl font-bold font-display flex items-center gap-2">
          {tab === 'for-you' ? '✦ Handpicked For You' : '📅 All Campus Happenings'}
        </h2>
        <div className="flex gap-1.5 bg-white/5 border border-white/10 rounded-full p-1">
          {user?.role === 'student' && (
            <button onClick={() => setTab('for-you')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${tab === 'for-you' ? 'bg-accent text-bg shadow-sm' : 'text-muted hover:text-ink'}`}>
              ✦ For You
            </button>
          )}
          <button onClick={() => setTab('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${tab === 'all' ? 'bg-accent text-bg shadow-sm' : 'text-muted hover:text-ink'}`}>
            All Events
          </button>
        </div>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="text-muted/70 text-sm italic animate-pulse">Syncing events to your vibe…</div>
      ) : items.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-muted font-display text-lg">No campus events here yet.</p>
          {user?.role === 'organizer' && (
            <Link to="/dashboard/new" className="btn-primary mt-4">
              Create the first event →
            </Link>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => {
            const ev = item.event || item;
            const reasons = item.reasons || [];
            const matched = item.matched || false;
            return (
              <EventCard 
                key={ev._id} 
                event={ev} 
                matched={matched} 
                reasons={reasons} 
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
