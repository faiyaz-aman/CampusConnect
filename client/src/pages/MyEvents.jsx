import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

export default function MyEvents() {
  const [registrations, setRegistrations] = useState([]);
  const [saves, setSaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchData = () => {
    setLoading(true);
    api.get('/events/my/activity')
      .then(r => {
        setRegistrations(r.data.registrations || []);
        setSaves(r.data.saves || []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const cancelRSVP = async (eventId) => {
    if (!confirm('Cancel your RSVP for this event?')) return;
    try {
      await api.post(`/events/${eventId}/cancel`);
      alert('RSVP cancelled successfully!');
      fetchData();
    } catch (e) {
      alert(e.response?.data?.message || 'Could not cancel RSVP');
    }
  };

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold font-display">my activity ✦</h1>
        <p className="text-muted mt-1">Manage your registered tickets and bookmarked campus experiences.</p>
      </div>

      {loading ? (
        <div className="text-muted italic">Gathering your college calendar…</div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8 animate-fadeIn">
          {/* Registered Tickets (Left/Center Column) */}
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold font-display flex items-center gap-2">
              🎟️ Active Entry Tickets ({registrations.length})
            </h2>

            {registrations.length === 0 ? (
              <div className="card text-center py-10">
                <p className="text-muted">You haven't RSVP'd to any events yet.</p>
                <Link to="/explore" className="text-accent hover:underline font-bold text-xs mt-2 block">
                  Find events to attend →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {registrations.map(reg => {
                  const ev = reg.event;
                  if (!ev) return null;
                  const isAttended = reg.status === 'attended';
                  const isWaitlisted = reg.status === 'waitlisted';
                  const isCancelled = reg.status === 'cancelled';

                  if (isCancelled) return null;

                  return (
                    <div key={reg._id} className="card border border-white/5 bg-surface/40 hover:border-white/10 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="chip bg-accent/10 text-accent capitalize text-[10px]">{ev.category}</span>
                          {isAttended ? (
                            <span className="chip bg-green-500/20 text-green-400 text-[10px] border border-green-500/20">Checked In ✓</span>
                          ) : isWaitlisted ? (
                            <span className="chip bg-amber-500/20 text-amber-300 text-[10px] border border-amber-500/20">Waitlisted ⏳</span>
                          ) : (
                            <span className="chip bg-electric/15 text-electric text-[10px] border border-electric/10">Active Ticket</span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold font-display mt-1">{ev.title}</h3>
                        <div className="text-xs text-muted flex flex-wrap gap-x-4 gap-y-1">
                          <span>📍 {ev.location}</span>
                          <span>📅 {new Date(ev.date).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                        {reg.status !== 'attended' && (
                          <button 
                            onClick={() => cancelRSVP(ev._id)}
                            className="btn-ghost text-xs text-hot/80 hover:text-hot border-hot/10 px-3 py-2"
                          >
                            Cancel RSVP ✕
                          </button>
                        )}
                        <button 
                          onClick={() => setSelectedTicket(reg)}
                          className="btn-primary text-xs py-2 px-4 shadow-sm"
                        >
                          View Ticket 🎫
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bookmarks Column (Right Column) */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold font-display flex items-center gap-2">
              ⭐ Saved Vibe List ({saves.length})
            </h2>

            {saves.length === 0 ? (
              <div className="card text-center py-10">
                <p className="text-muted">No saved bookmarks yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {saves.map(ev => (
                  <div key={ev._id} className="card p-4 border border-white/5 hover:border-accent/30 transition block">
                    <span className="text-[10px] uppercase text-muted tracking-widest">{ev.category}</span>
                    <h3 className="font-bold font-display mt-0.5 truncate">{ev.title}</h3>
                    <p className="text-xs text-muted/80 line-clamp-1 mt-1">📍 {ev.location}</p>
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/5">
                      <span className="text-[10px] text-accent font-bold">
                        {new Date(ev.date).toLocaleDateString()}
                      </span>
                      <Link to={`/events/${ev._id}`} className="text-[10px] hover:underline text-muted hover:text-ink font-bold">
                        Details →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ticket QR Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card max-w-sm w-full border border-white/10 bg-bg p-6 text-center space-y-6 relative rounded-3xl animate-scaleUp">
            <button 
              onClick={() => setSelectedTicket(null)}
              className="absolute top-4 right-4 text-muted hover:text-ink text-xl font-bold"
            >
              ✕
            </button>

            <div>
              <span className="chip bg-accent/20 text-accent font-bold text-[10px] uppercase tracking-widest">
                {selectedTicket.status === 'waitlisted' ? 'Waitlist Entry' : 'Entry Pass'}
              </span>
              <h3 className="text-xl font-bold font-display mt-2">{selectedTicket.event?.title}</h3>
              <p className="text-xs text-muted mt-1">
                📅 {new Date(selectedTicket.event?.date).toLocaleString()}
              </p>
              <p className="text-xs text-muted">📍 {selectedTicket.event?.location}</p>
            </div>

            {/* QR code box */}
            {selectedTicket.status === 'waitlisted' ? (
              <div className="inline-block p-5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-3xl mx-auto space-y-2">
                <span className="text-3xl">⏳</span>
                <p className="text-xs font-semibold">You are Waitlisted for this event.</p>
                <p className="text-[10px] text-muted max-w-[200px]">We'll promote you to a registered slot as soon as a seat becomes available.</p>
              </div>
            ) : (
              <div className="bg-white p-3 rounded-2xl mx-auto inline-block border-4 border-accent shadow-glow">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${selectedTicket.qrCodeString}`}
                  alt="QR Pass"
                  className="w-40 h-40 display-block"
                />
                <div className="font-mono text-xs text-zinc-950 font-bold mt-2 tracking-widest">
                  {selectedTicket.qrCodeString}
                </div>
              </div>
            )}

            <div className="space-y-1">
              <p className="text-sm font-semibold text-ink">
                {selectedTicket.status === 'waitlisted' ? 'Awaiting slot opening' : 'Show this QR code at the door'}
              </p>
              <p className="text-xs text-muted">
                The organizing club ({selectedTicket.event?.organizer?.name || 'Club'}) will scan this to record your attendance.
              </p>
            </div>

            {selectedTicket.status === 'waitlisted' ? (
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 py-2 rounded-xl text-xs font-bold uppercase tracking-wider">
                Waitlist Active
              </div>
            ) : selectedTicket.status === 'attended' ? (
              <div className="bg-green-500/10 border border-green-500/25 text-green-400 py-2 rounded-xl text-xs font-bold">
                ✓ Check-in verified on {new Date(selectedTicket.checkedInAt).toLocaleTimeString()}
              </div>
            ) : (
              <div className="bg-white/5 border border-white/5 text-muted py-2 rounded-xl text-xs">
                Awaiting organizer scan...
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
