import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import EventCard from '../components/EventCard';

const CATEGORY_META = [
  { id: 'tech', label: 'Tech & Devs', emoji: '💻', desc: 'Hackathons, coding challenges, AI and developer workshops.' },
  { id: 'music', label: 'Music & Beats', emoji: '🎵', desc: 'Concerts, open mics, DJ nights, and jam sessions.' },
  { id: 'sports', label: 'Sports & Fitness', emoji: '🏆', desc: 'Tournaments, fitness meets, athletics, and esports.' },
  { id: 'arts', label: 'Art & Design', emoji: '🎨', desc: 'Exhibitions, drama, photography, and creative meets.' },
  { id: 'academic', label: 'Academic & Career', emoji: '📚', desc: 'Industry talks, networking, career fairs, and research.' },
];

export default function Interests() {
  const { user, updateInterests } = useAuth();
  const [picked, setPicked] = useState([]);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);
  const [saved, setSaved] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  
  // Recommendations state
  const [recEvents, setRecEvents] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  // Fix: Async state sync when user auth context finishes loading
  useEffect(() => {
    if (user) {
      if (user.interests) {
        setPicked(user.interests);
      }
      setEmailNotificationsEnabled(user.emailNotificationsEnabled !== false);
    }
  }, [user]);

  // Fetch recommendations matching user's vibes
  const fetchRecommendations = async () => {
    if (!user) return;
    setLoadingRecs(true);
    try {
      const { data } = await api.get('/events/recommended');
      // The backend returnsscored events. We only want events that matched or are featured
      setRecEvents(data.events || []);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoadingRecs(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [user]);

  const toggle = (id) => {
    setPicked(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSave = async () => {
    setLoadingSave(true);
    try {
      await updateInterests(picked, emailNotificationsEnabled);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      // Re-fetch recommendations matching new vibes
      await fetchRecommendations();
    } catch (err) {
      console.error('Failed to save interests:', err);
    } finally {
      setLoadingSave(false);
    }
  };

  const matchingEvents = recEvents.filter(item => {
    const evCat = (item.event?.category || '').toLowerCase();
    return picked.includes(evCat);
  });

  return (
    <section className="space-y-10">
      {/* Header Panel */}
      <div className="card bg-surface/50 border border-white/5 p-6 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <span className="chip bg-accent/20 text-accent font-bold text-[10px] uppercase tracking-wider mb-2">
            Vibe Tuning
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold font-display">tune your feed ✦</h1>
          <p className="text-muted text-sm mt-1">
            Choose what you are interested in. We will use these to rank, filter, and alert you of the hottest events on campus.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 items-start">
        {/* Vibe Selection Panel */}
        <div className="md:col-span-2 space-y-6">
          <div className="card space-y-5">
            <h2 className="text-xl font-bold font-display text-accent flex items-center gap-2">
              🎯 Select Interests
            </h2>

            <div className="grid gap-3">
              {CATEGORY_META.map(cat => {
                const isSelected = picked.includes(cat.id);
                return (
                  <div
                    key={cat.id}
                    onClick={() => toggle(cat.id)}
                    className={`card p-4 border transition cursor-pointer flex items-center justify-between group rounded-2xl ${
                      isSelected 
                        ? 'border-accent/40 bg-accent/5 shadow-[0_0_15px_rgba(196,255,61,0.05)]' 
                        : 'border-white/5 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{cat.emoji}</span>
                      <div className="text-left">
                        <h3 className={`font-bold transition text-sm sm:text-base ${isSelected ? 'text-accent' : 'text-ink group-hover:text-accent'}`}>
                          #{cat.id}
                        </h3>
                        <p className="text-xs text-muted/90 mt-0.5 line-clamp-1">{cat.desc}</p>
                      </div>
                    </div>
                    
                    <div className={`h-5 w-5 rounded-full border flex items-center justify-center transition-all ${
                      isSelected 
                        ? 'border-accent bg-accent text-bg' 
                        : 'border-white/20 text-transparent'
                    }`}>
                      {isSelected && <span className="text-[10px] font-bold">✓</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button 
                onClick={handleSave} 
                disabled={loadingSave}
                className="btn-primary py-2.5 px-6 text-sm font-bold flex items-center gap-2"
              >
                {loadingSave ? 'Syncing...' : 'Save Vibe Setup ✦'}
              </button>
              
              {saved && (
                <span className="text-accent text-sm font-semibold animate-pulse">
                  Vibes synced successfully! ✓
                </span>
              )}
            </div>
          </div>

          {/* Email Alert Preferences Card */}
          <div className="card bg-surface/50 border border-white/5 p-6 rounded-3xl relative overflow-hidden space-y-4">
            <div className="absolute top-0 right-0 h-40 w-40 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-start justify-between gap-4 relative">
              <div className="space-y-1">
                <h2 className="text-lg sm:text-xl font-bold font-display text-accent flex items-center gap-2">
                  📧 Email Alert Settings
                </h2>
                <p className="text-xs text-muted">
                  Get notified instantly when organizers publish hot events matching your vibe.
                </p>
              </div>

              {/* Glassmorphic Switch */}
              <button
                type="button"
                onClick={() => setEmailNotificationsEnabled(!emailNotificationsEnabled)}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 relative shrink-0 ${
                  emailNotificationsEnabled ? 'bg-accent/80 hover:bg-accent' : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-bg shadow-md transition-transform duration-300 transform ${
                    emailNotificationsEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-2xl relative">
              <span className="text-xl">🔔</span>
              <p className="text-[10px] text-muted/80 leading-relaxed">
                {emailNotificationsEnabled 
                  ? "Auto-alerts are ACTIVE. You will receive dynamic email summaries with event schedules and venues."
                  : "Auto-alerts are MUTED. You can still check matching event listings manually in the dashboard."
                }
              </p>
            </div>
          </div>

        </div>

        {/* Live Matching Feed Widget */}
        <div className="space-y-6">
          <div className="card space-y-4">
            <h2 className="text-lg font-bold font-display text-accent flex items-center gap-2">
              ✨ Live Matches
            </h2>
            <p className="text-xs text-muted">
              Here is a sneak peek of upcoming campus events matching your current selected vibes:
            </p>

            {loadingRecs ? (
              <div className="text-muted/70 text-xs italic py-6 animate-pulse text-center">
                Syncing matching lineups...
              </div>
            ) : matchingEvents.length === 0 ? (
              <div className="border border-dashed border-white/10 rounded-2xl p-6 text-center text-muted">
                <span className="text-2xl block mb-2">🎈</span>
                <p className="text-xs font-semibold">No direct matches found</p>
                <p className="text-[10px] text-muted/70 mt-1">
                  Try checking other categories or check back later for new event drops!
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {matchingEvents.map(item => (
                  <EventCardMini 
                    key={item.event?._id || item._id} 
                    event={item.event} 
                    reasons={item.reasons}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// Compact mini card specifically designed for Interests recommendations sidebar
function EventCardMini({ event, reasons }) {
  return (
    <div className="p-3 bg-white/5 border border-white/5 rounded-xl hover:border-accent/30 transition flex flex-col justify-between gap-2">
      <div>
        <div className="flex items-center justify-between text-[9px] uppercase tracking-wider mb-1">
          <span className="text-accent font-semibold">#{event.category}</span>
          {reasons && reasons.length > 0 && (
            <span className="text-hot font-bold">{reasons[0]}</span>
          )}
        </div>
        <h4 className="font-bold text-xs text-ink line-clamp-1">{event.title}</h4>
        <p className="text-[10px] text-muted mt-0.5 flex items-center gap-1">
          📅 {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · 📍 {event.location}
        </p>
      </div>

      <a 
        href={`/events/${event._id}`}
        className="w-full text-center bg-white/10 border border-white/10 hover:bg-accent hover:text-bg hover:border-accent transition text-[10px] font-bold py-1.5 rounded-lg"
      >
        View Vibe Details →
      </a>
    </div>
  );
}

