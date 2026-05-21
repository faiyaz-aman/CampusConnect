import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function EventDetail() {
  const { id } = useParams();
  const { user, logout, updateInterests } = useAuth(); // We can trigger follow updates too
  const nav = useNavigate();
  const [event, setEvent] = useState(null);
  const [userRegistration, setUserRegistration] = useState(null);
  const [msg, setMsg] = useState('');
  const [saved, setSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  
  // Feedback / reviews states
  const [feedbacks, setFeedbacks] = useState([]);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [fbError, setFbError] = useState('');
  const [fbSuccess, setFbSuccess] = useState(false);

  const fetchDetail = () => {
    api.get(`/events/${id}`)
      .then(r => {
        setEvent(r.data.event);
        setUserRegistration(r.data.userRegistration || null);
        if (user && r.data.event?.organizer) {
          setIsFollowing((user.followedClubs || []).includes(String(r.data.event.organizer._id)));
        }
      })
      .catch(err => console.error(err));

    api.get(`/events/${id}/feedback`)
      .then(r => setFeedbacks(r.data.feedbacks || []))
      .catch(err => console.error(err));

    if (user && user.role === 'student') {
      api.get(`/events/${id}/save`)
        .then(r => setSaved(r.data.saved))
        .catch(err => console.error(err));
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id, user]);

  const register = async () => {
    try { 
      const { data } = await api.post(`/events/${id}/register`); 
      if (data.registration?.status === 'waitlisted') {
        setMsg("⏳ Event is full! You have joined the Waitlist. If someone cancels, you'll be promoted automatically.");
      } else {
        setMsg("✦ You're in! Check 'My Activity' or your Gmail for your confirmed entry ticket."); 
      }
      fetchDetail();
    } catch (e) { 
      setMsg(e.response?.data?.message || 'Could not register'); 
    }
  };

  const cancelRSVP = async () => {
    if (!confirm('Cancel your registration for this event?')) return;
    try {
      await api.post(`/events/${id}/cancel`);
      setMsg("✕ RSVP cancelled successfully. We hope to see you at another experience!");
      fetchDetail();
    } catch (e) {
      setMsg(e.response?.data?.message || 'Could not cancel RSVP');
    }
  };

  const toggleSave = async () => {
    try {
      const { data } = await api.post(`/events/${id}/save`);
      setSaved(data.saved);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleFollow = async () => {
    try {
      const { data } = await api.post('/auth/follow', { clubId: event.organizer._id });
      // Update local storage and auth context user followed clubs list
      const updatedUser = { ...user, followedClubs: data.user.followedClubs };
      // Note: AuthContext handles this, but since we are modifying, let's update local follow state
      setIsFollowing(data.user.followedClubs.includes(String(event.organizer._id)));
    } catch (e) {
      console.error(e);
    }
  };

  const submitFeedback = async (e) => {
    e.preventDefault();
    setFbError('');
    setFbSuccess(false);
    try {
      await api.post(`/events/${id}/feedback`, { rating, review });
      setFbSuccess(true);
      setReview('');
      fetchDetail();
    } catch (err) {
      setFbError(err.response?.data?.message || 'Could not submit feedback');
    }
  };

  const remove = async () => {
    if (!confirm('Delete this event?')) return;
    await api.delete(`/events/${id}`); 
    nav(user.role === 'admin' ? '/admin' : '/dashboard');
  };

  if (!event) return <p className="text-muted">Scanning coordinates...</p>;
  
  const isOwner = user?.role === 'organizer' && event.organizer?._id === user.id;
  const isFeatured = event.isFeatured;

  return (
    <article className="max-w-3xl mx-auto space-y-8">
      {/* Event Header Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-white/5 bg-surface/30 p-6 sm:p-8">
        {event.posterUrl && (
          <div className="absolute inset-0 bg-cover bg-center opacity-10 blur-xl pointer-events-none" style={{ backgroundImage: `url(${event.posterUrl})` }} />
        )}
        <div className="absolute top-0 right-0 h-32 w-32 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative space-y-4">
          <div className="flex items-center gap-2">
            <span className="chip bg-accent/20 text-accent font-bold capitalize">{event.category}</span>
            {event.mode === 'virtual' && (
              <span className="chip bg-electric/25 text-electric font-semibold">Virtual</span>
            )}
            {isFeatured && (
              <span className="chip bg-hot/20 text-hot font-bold">Featured ✦</span>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold font-display tracking-tight leading-tight">
            {event.title}
          </h1>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs sm:text-sm text-muted pt-2 border-t border-white/5 items-center">
            <span className="flex items-center gap-1">📍 {event.location}</span>
            <span className="flex items-center gap-1">📅 {new Date(event.date).toLocaleString()}</span>
            <span className="flex items-center gap-1">👥 Capacity: {event.capacity} seats</span>
            <span className="flex items-center gap-1">🎟️ Booked: {event.seatsBooked || 0}</span>
            <span className="flex items-center gap-1 font-bold text-accent">
              🟢 Available: {event.seatsAvailable !== undefined ? event.seatsAvailable : event.capacity}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Split Grid */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* Event description and reviews */}
        <div className="md:col-span-2 space-y-8">
          <div className="card space-y-4">
            <h2 className="text-xl font-bold font-display text-accent">About the Event</h2>
            <p className="text-ink/90 text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {event.description || 'No description provided by organizers.'}
            </p>
            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-4">
                {event.tags.map(t => (
                  <span key={t} className="text-xs bg-white/5 border border-white/5 rounded-full px-3 py-1 text-muted">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-4">
            {user?.role === 'student' && !userRegistration && (
              <div className="flex gap-3">
                <button 
                  onClick={register} 
                  className={`btn-primary flex-1 py-3 ${event.seatsAvailable === 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30' : ''}`}
                >
                  {event.seatsAvailable === 0 ? 'Join Waitlist ✦' : 'RSVP ✦ Join Now'}
                </button>
                <button 
                  onClick={toggleSave} 
                  className={`btn-ghost px-5 py-3 ${saved ? 'border-hot/50 text-hot bg-hot/5' : 'border-white/10 text-muted'}`}
                >
                  {saved ? '★ Bookmarked' : '☆ Bookmark'}
                </button>
              </div>
            )}

            {!user && (
              <div className="card border border-accent/20 bg-accent/5 p-6 rounded-3xl text-center space-y-3">
                <h3 className="text-lg font-bold font-display text-accent">Ready to join this event? 🎟️</h3>
                <p className="text-sm text-muted">Log in or create a student account to RSVP, bookmark events, and leave reviews!</p>
                <div className="flex gap-3 justify-center pt-2">
                  <Link to="/login" className="btn-primary px-6 py-2 text-sm font-semibold">Log In</Link>
                  <Link to="/register" className="btn-ghost px-6 py-2 text-sm font-semibold border-white/10 text-muted hover:border-white/20 hover:text-ink">Sign Up</Link>
                </div>
              </div>
            )}

            {user && user.role !== 'student' && (
              <div className="card border border-amber-500/20 bg-amber-500/5 p-6 rounded-3xl text-center space-y-3">
                <div className="inline-block p-2 rounded-full bg-amber-500/10 text-amber-400 text-2xl">
                  ⚠️
                </div>
                <h3 className="text-lg font-bold font-display text-amber-400">Student-Only RSVP</h3>
                <p className="text-sm text-muted max-w-md mx-auto">
                  You are currently logged in as an <strong className="text-amber-300 capitalize">{user.role}</strong>. 
                  Only students can RSVP or register for campus events to ensure capacity and registration logs remain accurate.
                </p>
                <p className="text-xs text-muted/80 pt-2 border-t border-white/5">
                  To RSVP, please <button onClick={logout} className="text-accent underline font-semibold hover:text-accent-hover">Logout</button> and log in with a student account (e.g., <code className="bg-white/5 px-1.5 py-0.5 rounded text-accent font-mono text-[10px]">alex@college.edu</code> or your registered student account).
                </p>
              </div>
            )}

            {user?.role === 'student' && userRegistration && userRegistration.status !== 'cancelled' && (
              <div className="space-y-4">
                <div className="card border border-white/10 bg-surface/30 p-6 rounded-3xl text-center relative overflow-hidden shadow-glow">
                  <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent pointer-events-none" />
                  {userRegistration.status === 'waitlisted' ? (
                    <div className="space-y-3 relative z-10">
                      <div className="inline-block p-3 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-3xl">
                        ⏳
                      </div>
                      <div>
                        <h3 className="text-xl font-bold font-display text-amber-400">Waitlist Active</h3>
                        <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
                          You are on the Waitlist. You will be automatically promoted to registered if a seat opens up.
                        </p>
                      </div>
                      <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 py-1.5 rounded-xl text-xs font-bold font-mono">
                        STATUS: QUEUED PASS
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 relative z-10">
                      <div>
                        <span className="chip bg-accent/20 text-accent font-bold text-[10px] uppercase tracking-widest">
                          Entry Ticket Pass
                        </span>
                        <h3 className="text-xl font-bold font-display mt-2">You're Registered! 🎟️</h3>
                        <p className="text-xs text-muted">Show this QR code at the door to check in.</p>
                      </div>

                      <div className="bg-white p-3 rounded-2xl mx-auto inline-block border-2 border-accent shadow-glow">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${userRegistration.qrCodeString}`}
                          alt="Entry Ticket QR"
                          className="w-40 h-40 display-block"
                        />
                        <div className="font-mono text-xs text-zinc-900 font-bold mt-2 tracking-widest">
                          {userRegistration.qrCodeString}
                        </div>
                      </div>

                      {userRegistration.status === 'attended' ? (
                        <div className="bg-green-500/10 border border-green-500/25 text-green-400 py-2 rounded-xl text-xs font-bold font-display">
                          ✓ Checked In at the Gate
                        </div>
                      ) : (
                        <div className="bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 py-1.5 rounded-xl text-xs font-mono">
                          AWAITING GATE SCAN...
                        </div>
                      )}
                    </div>
                  )}

                  <button 
                    onClick={cancelRSVP} 
                    className="text-xs text-hot/80 hover:text-hot hover:underline mt-4 block mx-auto font-semibold"
                  >
                    Cancel Registration / Leave Waitlist
                  </button>
                </div>
                
                <button 
                  onClick={toggleSave} 
                  className={`btn-ghost w-full py-3 ${saved ? 'border-hot/50 text-hot bg-hot/5' : 'border-white/10 text-muted'}`}
                >
                  {saved ? '★ Bookmarked' : '☆ Bookmark'}
                </button>
              </div>
            )}

            {(isOwner || user?.role === 'admin') && (
              <button onClick={remove} className="btn-ghost text-hot border-hot/30 hover:bg-hot/5 font-bold w-full py-3">
                Delete Event
              </button>
            )}
          </div>
          {msg && <div className="p-4 bg-accent/10 border border-accent/20 text-accent rounded-2xl text-center text-sm font-semibold">{msg}</div>}

          {/* Leave a review loop */}
          {user?.role === 'student' && (
            <div className="card space-y-4">
              <h2 className="text-xl font-bold font-display">vibe check this event</h2>
              <p className="text-xs text-muted">Did you attend? Leave a review to improve campus recommendations.</p>
              
              <form onSubmit={submitFeedback} className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <span className="label mb-0">Rating:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button 
                        type="button" 
                        key={star} 
                        onClick={() => setRating(star)}
                        className={`text-xl transition ${rating >= star ? 'text-accent' : 'text-muted/40'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <textarea 
                    className="input min-h-[80px] text-sm" 
                    placeholder="Tell us what you liked or how to make it better..."
                    value={review}
                    onChange={e => setReview(e.target.value)}
                  />
                </div>
                {fbError && <p className="text-hot text-xs">{fbError}</p>}
                {fbSuccess && <p className="text-accent text-xs">Feedback submitted successfully ✓</p>}
                <button type="submit" className="btn-primary py-2 px-4 text-xs font-bold">
                  Submit Vibe Check
                </button>
              </form>
            </div>
          )}

          {/* Feedback list */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold font-display">Campus Feedbacks ({feedbacks.length})</h2>
            {feedbacks.length === 0 ? (
              <p className="text-xs text-muted italic">No feedback left for this event yet.</p>
            ) : (
              <div className="space-y-3">
                {feedbacks.map(fb => (
                  <div key={fb._id} className="bg-white/5 border border-white/5 p-4 rounded-2xl space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-ink">{fb.user?.name || 'Anonymous student'}</span>
                      <span className="text-accent">{'★'.repeat(fb.rating)}</span>
                    </div>
                    {fb.review && <p className="text-sm text-muted/90">{fb.review}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Organizer side card */}
        <div className="space-y-6">
          <div className="card text-center space-y-4 border border-white/5">
            <div className="h-14 w-14 bg-electric/25 rounded-full flex items-center justify-center mx-auto text-electric text-xl font-bold font-display">
              {event.organizer?.name?.charAt(0).toUpperCase() || 'C'}
            </div>
            <div>
              <h3 className="font-bold font-display text-lg flex items-center justify-center gap-1">
                {event.organizer?.name || 'College Club'}
                {event.organizer?.verifiedStatus && (
                  <span className="text-[10px] bg-accent/20 text-accent rounded px-1.5 font-extrabold uppercase">
                    ✓ Verified
                  </span>
                )}
              </h3>
              <p className="text-xs text-muted mt-0.5">{event.organizer?.email}</p>
            </div>

            {user && user.role === 'student' && event.organizer && (
              <button 
                onClick={toggleFollow}
                className={`btn-ghost w-full py-2 text-xs font-bold ${isFollowing ? 'border-accent/40 text-accent bg-accent/5' : 'border-white/10 text-muted'}`}
              >
                {isFollowing ? '✦ Following' : '+ Follow Club'}
              </button>
            )}
          </div>

          <div className="card space-y-3">
            <h3 className="font-bold font-display text-sm text-muted uppercase tracking-wider">Campus Details</h3>
            <div className="text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted">Target audience:</span>
                <span className="text-ink font-semibold capitalize">Everyone</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Mode:</span>
                <span className="text-ink font-semibold capitalize">{event.mode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Approval status:</span>
                <span className="text-ink font-semibold capitalize">{event.status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
