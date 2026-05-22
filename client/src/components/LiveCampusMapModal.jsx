import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

export default function LiveCampusMapModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [liveEvents, setLiveEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [activeEventIndex, setActiveEventIndex] = useState(0);

  // Fetch live events on load or modal open
  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    api.get('/events/live')
      .then(res => {
        const events = res.data.events || [];
        setLiveEvents(events);
        
        // Auto-select the first building with live events if any exist
        if (events.length > 0) {
          const firstInPerson = events.find(e => e.mode === 'in-person' && e.coordinates);
          if (firstInPerson) {
            setSelectedBuilding(firstInPerson.buildingName);
          } else {
            setSelectedBuilding(events[0].buildingName || 'Virtual');
          }
        } else {
          setSelectedBuilding(null);
        }
        setActiveEventIndex(0);
      })
      .catch(err => console.error('Error fetching live events:', err))
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter events by the selected building
  const eventsInSelected = liveEvents.filter(e => {
    if (selectedBuilding === 'Virtual') return e.mode === 'virtual';
    return e.buildingName === selectedBuilding;
  });

  // Unique list of buildings where in-person events are happening
  const activeBuildings = Array.from(new Set(
    liveEvents
      .filter(e => e.mode === 'in-person' && e.coordinates)
      .map(e => JSON.stringify({ name: e.buildingName, x: e.coordinates.x, y: e.coordinates.y }))
  )).map(s => JSON.parse(s));

  // Count virtual events
  const virtualEvents = liveEvents.filter(e => e.mode === 'virtual');

  const getCategoryEmoji = (cat) => {
    switch (cat) {
      case 'tech': return '💻';
      case 'music': return '🎵';
      case 'sports': return '🏆';
      case 'arts': return '🎨';
      case 'academic': return '📚';
      default: return '✦';
    }
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'tech': return 'text-accent border-accent/20 bg-accent/5';
      case 'music': return 'text-hot border-hot/20 bg-hot/5';
      case 'sports': return 'text-electric border-electric/20 bg-electric/5';
      case 'arts': return 'text-pink-400 border-pink-400/20 bg-pink-400/5';
      case 'academic': return 'text-yellow-400 border-yellow-400/20 bg-yellow-400/5';
      default: return 'text-ink border-white/10 bg-white/5';
    }
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 md:p-10 bg-bg/85 backdrop-blur-md transition-opacity duration-300 animate-fadeIn"
    >
      {/* Modal Card container */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl h-[90vh] md:h-[80vh] flex flex-col md:flex-row rounded-3xl bg-surface/90 border border-white/10 shadow-2xl overflow-hidden"
      >
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 flex items-center justify-center h-10 w-10 rounded-full border border-white/10 bg-surface hover:bg-white/10 text-ink active:scale-95 transition-all"
        >
          ✕
        </button>

        {/* LEFT COLUMN: Mini Campus Map Area */}
        <div className="relative flex-1 h-[45%] md:h-full bg-bg/40 flex flex-col border-b md:border-b-0 md:border-r border-white/5">
          <div className="p-4 md:p-6 pb-2">
            <h2 className="text-xl md:text-2xl font-bold font-display flex items-center gap-2">
              <span className="flex h-3.5 w-3.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-accent"></span>
              </span>
              Live Campus Map
            </h2>
            <p className="text-xs md:text-sm text-muted">Tap glowing radars to browse live events in buildings right now.</p>
          </div>

          {/* Interactive Map Visual Area */}
          <div className="flex-1 relative p-4 flex items-center justify-center overflow-hidden">
            {loading ? (
              <div className="text-muted flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-accent border-r-transparent border-b-transparent border-l-transparent" />
                <span>Scanning coordinates…</span>
              </div>
            ) : liveEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="relative h-20 w-20 flex items-center justify-center rounded-full border border-white/10 bg-white/5 overflow-hidden">
                  <div className="absolute inset-0 border-r border-accent/20 animate-[spin_4s_linear_infinite]" />
                  <span className="text-3xl text-accent animate-pulse">🛰️</span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-ink">Campus is quiet</h3>
                  <p className="text-xs text-muted max-w-xs mt-1">There are no approved events live at this hour. Check back when an event starts!</p>
                </div>
              </div>
            ) : (
              <div className="relative w-full max-w-[640px] aspect-[4/3] bg-bg/60 rounded-2xl border border-white/5 overflow-hidden shadow-inner">
                {/* SVG Blueprint Background */}
                <svg viewBox="0 0 800 600" className="w-full h-full text-white/5 stroke-current fill-none">
                  {/* Grid Lines */}
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />

                  {/* Paths representing campus streets/pathways */}
                  <path d="M 100 300 Q 400 320 700 300" stroke="rgba(124,92,255,0.05)" strokeWidth="16" strokeLinecap="round" />
                  <path d="M 400 100 L 400 500" stroke="rgba(124,92,255,0.05)" strokeWidth="12" strokeLinecap="round" />
                  <path d="M 200 150 Q 500 450 650 480" stroke="rgba(124,92,255,0.03)" strokeWidth="8" strokeLinecap="round" />

                  {/* 1. Engineering Block */}
                  <rect x="200" y="170" width="160" height="110" rx="12" fill="rgba(21,21,31,0.6)" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
                  <text x="280" y="230" textAnchor="middle" fill="rgba(245,245,247,0.3)" fontSize="12" fontFamily="Space Grotesk" stroke="none">Engineering Block</text>

                  {/* 2. Campus Amphitheater */}
                  <path d="M 540 80 A 60 60 0 0 1 540 200" stroke="rgba(255,255,255,0.06)" strokeWidth="6" fill="rgba(21,21,31,0.4)" />
                  <path d="M 540 100 A 40 40 0 0 1 540 180" stroke="rgba(255,255,255,0.04)" strokeWidth="4" />
                  <text x="500" y="145" textAnchor="middle" fill="rgba(245,245,247,0.3)" fontSize="12" fontFamily="Space Grotesk" stroke="none">Amphitheater</text>

                  {/* 3. Student Center */}
                  <path d="M 350 380 L 400 340 L 450 380 L 450 430 L 400 470 L 350 430 Z" fill="rgba(21,21,31,0.6)" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
                  <text x="400" y="410" textAnchor="middle" fill="rgba(245,245,247,0.3)" fontSize="12" fontFamily="Space Grotesk" stroke="none">Student Center</text>

                  {/* 4. Sports Arena */}
                  <rect x="580" y="210" width="140" height="110" rx="40" fill="rgba(21,21,31,0.6)" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
                  <text x="650" y="270" textAnchor="middle" fill="rgba(245,245,247,0.3)" fontSize="12" fontFamily="Space Grotesk" stroke="none">Sports Arena</text>

                  {/* 5. Seminar Hall */}
                  <rect x="100" y="380" width="130" height="85" rx="8" fill="rgba(21,21,31,0.6)" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
                  <text x="165" y="427" textAnchor="middle" fill="rgba(245,245,247,0.3)" fontSize="12" fontFamily="Space Grotesk" stroke="none">Seminar Hall</text>

                  {/* 6. Central Library */}
                  <rect x="330" y="110" width="110" height="80" rx="6" fill="rgba(21,21,31,0.6)" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
                  <text x="385" y="155" textAnchor="middle" fill="rgba(245,245,247,0.3)" fontSize="11" fontFamily="Space Grotesk" stroke="none">Library</text>
                </svg>

                {/* Glowing Pulsing Pins mapped absolutely */}
                {activeBuildings.map((b, idx) => {
                  const isActive = selectedBuilding === b.name;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedBuilding(b.name);
                        setActiveEventIndex(0);
                      }}
                      style={{ left: `${b.x}%`, top: `${b.y}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 group flex items-center justify-center p-2 rounded-full focus:outline-none z-10 transition-transform active:scale-90"
                    >
                      {/* Pulse waves */}
                      <span className={`absolute inline-flex h-9 w-9 rounded-full bg-accent opacity-30 animate-ping duration-1000 ${isActive ? 'scale-150' : 'group-hover:scale-125'}`} />
                      <span className={`absolute inline-flex h-6 w-6 rounded-full bg-accent opacity-40 animate-pulse duration-700 ${isActive ? 'scale-110' : ''}`} />
                      
                      {/* Pin Center */}
                      <div className={`relative h-4.5 w-4.5 rounded-full border-2 border-bg shadow-lg flex items-center justify-center transition-all duration-300 ${
                        isActive ? 'bg-accent scale-125 shadow-[0_0_20px_#c4ff3d]' : 'bg-white group-hover:bg-accent group-hover:scale-110'
                      }`}>
                        <div className="h-1.5 w-1.5 bg-bg rounded-full" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Slide-up Details Panel */}
        <div className="w-full md:w-[360px] h-[55%] md:h-full bg-surface flex flex-col overflow-hidden">
          <div className="p-4 md:p-6 pb-2 border-b border-white/5 flex items-center justify-between">
            <span className="text-xs font-bold text-muted tracking-wider uppercase">Live Activity Panel</span>
            {liveEvents.length > 0 && (
              <span className="chip bg-white/5 border border-white/10 text-muted font-display text-[10px]">
                {liveEvents.length} active
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {/* Quick Virtual Toggle if virtual events exist */}
            {virtualEvents.length > 0 && (
              <button 
                onClick={() => {
                  setSelectedBuilding('Virtual');
                  setActiveEventIndex(0);
                }}
                className={`w-full py-2.5 px-4 rounded-xl border transition-all text-left flex items-center justify-between text-xs font-semibold ${
                  selectedBuilding === 'Virtual'
                    ? 'bg-accent/10 border-accent/20 text-accent shadow-sm'
                    : 'bg-white/5 border-white/5 text-muted hover:border-white/10'
                }`}
              >
                <span className="flex items-center gap-1.5">🌐 Virtual Live Events</span>
                <span className="chip bg-white/10 px-2 py-0.5 text-[10px]">{virtualEvents.length} online</span>
              </button>
            )}

            {loading ? (
              <div className="py-20 text-center text-muted/60 text-sm">Scanning campus channels…</div>
            ) : eventsInSelected.length === 0 ? (
              <div className="py-20 text-center text-muted/60 text-sm">
                Select a glowing pin on the map to inspect live updates.
              </div>
            ) : (
              <div className="space-y-4">
                {/* Header for the Building venue */}
                <div className="pb-2">
                  <h3 className="text-sm font-semibold text-muted">VENUE</h3>
                  <h4 className="text-lg font-bold font-display text-ink flex items-center gap-1">
                    {selectedBuilding === 'Virtual' ? '🌐 Internet Space' : `📍 ${selectedBuilding}`}
                  </h4>
                  {eventsInSelected.length > 1 && (
                    <p className="text-xs text-muted/80 mt-1">
                      There are {eventsInSelected.length} events happening live at this venue.
                    </p>
                  )}
                </div>

                {/* Overlapping Event Paging Dots */}
                {eventsInSelected.length > 1 && (
                  <div className="flex items-center gap-1.5 py-1">
                    {eventsInSelected.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveEventIndex(i)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          activeEventIndex === i ? 'w-6 bg-accent' : 'w-2 bg-white/10 hover:bg-white/20'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Animated Event Details Card */}
                {(() => {
                  const ev = eventsInSelected[activeEventIndex];
                  if (!ev) return null;
                  return (
                    <div className="card bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col space-y-4 shadow-xl transition-all duration-300 hover:border-white/10 animate-scaleIn">
                      {/* Category Badge & Live Tag */}
                      <div className="flex items-center justify-between">
                        <span className={`chip border px-2.5 py-1 text-[11px] font-bold ${getCategoryColor(ev.category)}`}>
                          {getCategoryEmoji(ev.category)} #{ev.category}
                        </span>
                        <span className="flex items-center gap-1 text-hot text-[11px] font-bold uppercase tracking-wider animate-pulse">
                          ● Live
                        </span>
                      </div>

                      {/* Title & Organizer */}
                      <div>
                        <h4 className="text-lg font-bold font-display text-ink leading-tight">{ev.title}</h4>
                        <p className="text-xs text-muted/85 mt-1 font-semibold">
                          Club: {ev.organizer?.name || 'Campus Club'}
                        </p>
                      </div>

                      {/* Time Details */}
                      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2.5 text-xs text-muted space-y-1">
                        <div className="flex items-center justify-between">
                          <span>Starts:</span>
                          <span className="font-semibold text-ink">
                            {new Date(ev.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Ends:</span>
                          <span className="font-semibold text-ink">
                            {new Date(ev.endTime || new Date(new Date(ev.date).getTime() + 2 * 60 * 60 * 1000)).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-t border-white/5 pt-1 mt-1 text-[11px]">
                          <span>Mode:</span>
                          <span className="font-bold text-accent uppercase tracking-wider">{ev.mode}</span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-muted/90 line-clamp-4 leading-relaxed bg-white/[0.01] p-2.5 rounded-xl border border-white/[0.03]">
                        {ev.description || 'No description provided.'}
                      </p>

                      {/* Action CTA View Details */}
                      <button
                        onClick={() => {
                          onClose();
                          navigate(`/events/${ev._id}`);
                        }}
                        className="btn-primary w-full py-2.5 text-bg font-bold shadow-glow hover:scale-[1.01] transition-transform text-xs"
                      >
                        View Full Details ✦
                      </button>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
