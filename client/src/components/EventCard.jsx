import { Link } from 'react-router-dom';

const palette = {
  tech: 'bg-electric/20 text-electric border border-electric/10',
  music: 'bg-hot/20 text-hot border border-hot/10',
  sports: 'bg-accent/20 text-accent border border-accent/10',
  arts: 'bg-pink-400/20 text-pink-300 border border-pink-400/10',
  academic: 'bg-blue-400/20 text-blue-300 border border-blue-400/10',
};

export default function EventCard({ event, matched, reasons }) {
  const cat = (event.category || '').toLowerCase();
  
  return (
    <Link to={`/events/${event._id}`} className="card hover:border-accent/40 hover:-translate-y-0.5 transition duration-300 group block relative overflow-hidden">
      {event.isFeatured && (
        <div className="absolute top-0 right-0 h-16 w-16 pointer-events-none overflow-hidden">
          <div className="absolute top-3 -right-6 bg-hot text-bg text-[9px] font-bold uppercase tracking-widest text-center py-0.5 w-24 rotate-45">
            Star ✦
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <span className={`chip capitalize ${palette[cat] || 'bg-white/10 text-muted'}`}>{event.category}</span>
        {reasons && reasons.length > 0 ? (
          <span className="chip bg-accent/15 text-accent text-[10px] font-bold border border-accent/20">
            {reasons[0]}
          </span>
        ) : matched ? (
          <span className="chip bg-accent text-bg text-[10px] font-bold">✦ For You</span>
        ) : null}
      </div>

      <h3 className="text-xl font-bold group-hover:text-accent transition font-display truncate">{event.title}</h3>
      <p className="text-sm text-muted mt-1.5 line-clamp-2 min-h-[40px]">{event.description || 'No description yet.'}</p>
      
      {event.tags && event.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {event.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-[10px] bg-white/5 border border-white/5 rounded px-1.5 text-muted/80">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-muted flex-wrap gap-2">
        <span className="flex items-center gap-1">
          👤 {event.organizer?.name || 'Club'}
          {event.organizer?.verifiedStatus && (
            <span className="bg-accent/10 border border-accent/20 rounded px-1 text-[8px] font-black text-accent tracking-tighter" title="Verified Organizer">
              ✓ VERIFIED
            </span>
          )}
        </span>
        <span>📍 {event.location}</span>
      </div>

      {/* Seat Capacity indicators & progress bar */}
      <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
        <span className="text-muted">Available slots:</span>
        {event.seatsAvailable === 0 ? (
          <span className="text-hot font-bold text-[10px] bg-hot/10 px-2 py-0.5 rounded border border-hot/15 flex items-center gap-1">🚫 Waitlist Active</span>
        ) : (
          <span className="text-green-400 font-semibold bg-green-500/10 px-2 py-0.5 rounded border border-green-500/10">{event.seatsAvailable} / {event.capacity} left</span>
        )}
      </div>

      {event.capacity > 0 && (
        <div className="mt-2 w-full bg-white/5 rounded-full h-1 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${event.seatsAvailable === 0 ? 'bg-hot shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-accent shadow-[0_0_8px_rgba(99,102,241,0.5)]'}`}
            style={{ width: `${Math.min(100, ((event.seatsBooked || 0) / event.capacity) * 100)}%` }}
          />
        </div>
      )}

      <div className="mt-2 pt-1 text-[11px] text-accent/80 flex items-center justify-between">
        <span>📅 {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
        {event.mode === 'virtual' && <span className="text-[10px] bg-electric/10 text-electric border border-electric/25 px-1.5 py-0.2 rounded">Virtual</span>}
      </div>
    </Link>
  );
}
