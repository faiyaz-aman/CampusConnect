import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Html5Qrcode } from 'html5-qrcode';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrants, setRegistrants] = useState([]);
  const [checkinCode, setCheckinCode] = useState('');
  const [scanMsg, setScanMsg] = useState({ text: '', isError: false });

  // Search and Filter states for participants
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Camera scanner states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [scannerInstance, setScannerInstance] = useState(null);

  const fetchDashboard = () => {
    setLoading(true);
    api.get('/analytics/overview')
      .then(r => setData(r.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Cleanup camera scanner on unmount or when modal is closed
  useEffect(() => {
    return () => {
      if (scannerInstance) {
        scannerInstance.stop().catch(err => console.error('Unmount camera cleanup error:', err));
      }
    };
  }, [scannerInstance]);

  const openCheckinModal = async (ev) => {
    setSelectedEvent(ev);
    setCheckinCode('');
    setSearchQuery('');
    setStatusFilter('all');
    setScanMsg({ text: '', isError: false });
    setIsCameraActive(false);
    setScannerInstance(null);
    try {
      const res = await api.get(`/events/${ev.id}/registrations`);
      setRegistrants(res.data.registrations || []);
    } catch (err) {
      console.error(err);
    }
  };

  const closeCheckinModal = async () => {
    await stopCamera();
    setSelectedEvent(null);
  };

  const startCamera = async () => {
    setIsCameraActive(true);
    setScanMsg({ text: '', isError: false });
    
    // Defer slight duration to let DOM render the container element
    setTimeout(async () => {
      try {
        const html5QrCode = new Html5Qrcode("camera-scanner-view");
        setScannerInstance(html5QrCode);
        
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          async (decodedText) => {
            // Stop scanner instantly upon verification to prevent multiple triggers
            try {
              await html5QrCode.stop();
            } catch (err) {
              console.error(err);
            }
            setIsCameraActive(false);
            setScannerInstance(null);
            
            // Trigger verification
            await simulateCameraScan(decodedText);
          },
          (errorMessage) => {
            // Frame error, silent
          }
        );
      } catch (err) {
        console.error('Camera startup error:', err);
        setScanMsg({ text: `Failed to access camera: ${err.message || err}`, isError: true });
        setIsCameraActive(false);
        setScannerInstance(null);
      }
    }, 300);
  };

  const stopCamera = async () => {
    if (scannerInstance) {
      try {
        await scannerInstance.stop();
      } catch (err) {
        console.error('Camera stop error:', err);
      }
      setScannerInstance(null);
    }
    setIsCameraActive(false);
  };

  const handleCheckInSubmit = async (e) => {
    if (e) e.preventDefault();
    setScanMsg({ text: '', isError: false });
    if (!checkinCode) return;

    try {
      const res = await api.post(`/events/${selectedEvent.id}/checkin`, { code: checkinCode.trim() });
      setScanMsg({ text: `✓ Verified! Checked in ${res.data.user?.name} (${res.data.user?.department})`, isError: false });
      setCheckinCode('');
      
      // Refresh registrations inside modal
      const regRes = await api.get(`/events/${selectedEvent.id}/registrations`);
      setRegistrants(regRes.data.registrations || []);
      
      // Refresh dashboard background stats
      api.get('/analytics/overview').then(r => setData(r.data));
    } catch (err) {
      const errDetail = err.response?.data;
      setScanMsg({ 
        text: errDetail?.message || 'Check-in failed. Invalid QR code.', 
        isError: true 
      });
    }
  };

  const simulateCameraScan = async (code) => {
    setScanMsg({ text: '', isError: false });
    try {
      const res = await api.post(`/events/${selectedEvent.id}/checkin`, { code: code.trim() });
      setScanMsg({ text: `✓ Scan Success! Checked in ${res.data.user?.name} (${res.data.user?.department})`, isError: false });
      setCheckinCode('');
      
      // Refresh modal list
      const regRes = await api.get(`/events/${selectedEvent.id}/registrations`);
      setRegistrants(regRes.data.registrations || []);
      
      // Refresh dashboard background stats
      api.get('/analytics/overview').then(r => setData(r.data));
    } catch (err) {
      const errDetail = err.response?.data;
      setScanMsg({ 
        text: errDetail?.message || 'Check-in scan failed.', 
        isError: true 
      });
    }
  };

  // Filter and Search Logic
  const filteredRegistrants = registrants.filter(reg => {
    // 1. Status Filter
    if (statusFilter !== 'all' && reg.status !== statusFilter) return false;

    // 2. Search Query Matching
    if (searchQuery.trim() === '') return true;
    const query = searchQuery.toLowerCase();
    const name = (reg.user?.name || '').toLowerCase();
    const email = (reg.user?.email || '').toLowerCase();
    const dept = (reg.user?.department || '').toLowerCase();
    const code = (reg.qrCodeString || '').toLowerCase();

    return name.includes(query) || email.includes(query) || dept.includes(query) || code.includes(query);
  });

  if (loading) return <p className="text-muted italic text-sm">Gathering event performance reports…</p>;
  if (!data) return <p className="text-muted">Error loading organizer HQ.</p>;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-4xl font-bold font-display">organizer hq ✦</h1>
          <p className="text-muted mt-1">Track conversions, saves, click-through rates, and check-in turnouts.</p>
        </div>
        <Link to="/dashboard/new" className="btn-primary">+ New event</Link>
      </div>

      {/* Organizer Summary Stats */}
      <div className="grid sm:grid-cols-4 gap-4">
        <StatCard label="Total Events" value={data.totalEvents} desc="All drafted / approved" />
        <StatCard label="Total RSVPs" value={data.totalRegistrations} desc="Committed students" />
        <StatCard label="Follower Bookmarks" value={data.totalSaves} desc="Events saved to vibes" />
        <StatCard label="Avg Turnout Rate" value={`${data.avgTurnout}%`} desc="Check-in conversion" />
      </div>

      {/* Detailed events performance */}
      <div className="card space-y-4">
        <h2 className="font-display text-xl font-bold text-accent">Your Live Events Portfolios</h2>
        
        {data.perEvent.length === 0 ? (
          <p className="text-muted italic py-6">You haven't dropped any events yet. Create one to begin tracking!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] uppercase text-muted tracking-wider">
                  <th className="py-3 px-2">Event Title</th>
                  <th className="py-3 px-2">Moderation</th>
                  <th className="py-3 px-2 text-center">Impressions</th>
                  <th className="py-3 px-2 text-center">Saves</th>
                  <th className="py-3 px-2 text-center">RSVPs</th>
                  <th className="py-3 px-2 text-center">Turnout</th>
                  <th className="py-3 px-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {data.perEvent.map(e => (
                  <tr key={e.id} className="hover:bg-white/5 transition">
                    <td className="py-4 px-2">
                      <Link to={`/events/${e.id}`} className="font-semibold text-ink hover:text-accent font-display">
                        {e.title}
                      </Link>
                      <div className="text-[10px] text-muted flex gap-2 mt-0.5">
                        <span>{e.category}</span> · 
                        <span>{new Date(e.date).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <span className={`chip text-[9px] uppercase px-1.5 py-0.2 font-bold ${e.status === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-center font-mono font-bold text-muted/90">{e.impressions}</td>
                    <td className="py-4 px-2 text-center font-mono font-bold text-hot">{e.saves}</td>
                    <td className="py-4 px-2 text-center font-mono font-bold text-accent">{e.registrations}</td>
                    <td className="py-4 px-2 text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-mono text-xs font-bold text-emerald-400">{e.turnoutRate}%</span>
                        <span className="text-[9px] text-muted">{e.attended}/{e.registrations} checked-in</span>
                      </div>
                    </td>
                    <td className="py-4 px-2 text-center">
                      <button 
                        onClick={() => openCheckinModal(e)}
                        className="btn-ghost text-xs border-white/10 px-3 py-1 bg-white/5 text-ink"
                      >
                        ⚙️ Check-In Gate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QR Code and Code Scan Checkin Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card max-w-xl w-full border border-white/10 bg-bg p-6 space-y-6 relative rounded-3xl animate-scaleUp max-h-[85vh] overflow-y-auto">
            <button 
              onClick={closeCheckinModal}
              className="absolute top-4 right-4 text-muted hover:text-ink text-xl font-bold"
            >
              ✕
            </button>

            <div>
              <span className="chip bg-accent/25 text-accent font-bold text-[9px] uppercase tracking-wider">
                Gate Manager
              </span>
              <h3 className="text-xl font-bold font-display mt-2">Check-in for: {selectedEvent.title}</h3>
              <p className="text-xs text-muted">Scan student QR tickets using camera, or enter codes manually.</p>
            </div>

            {/* Camera Viewfinder Scanner Panel */}
            <div className="space-y-3">
              {!isCameraActive ? (
                <button
                  type="button"
                  onClick={startCamera}
                  className="w-full btn-ghost py-3 border-accent/20 text-accent bg-accent/5 hover:bg-accent/10 flex items-center justify-center gap-2 text-xs font-bold rounded-2xl"
                >
                  📷 Open Live Camera QR Scanner
                </button>
              ) : (
                <div className="space-y-3 border border-white/5 p-4 rounded-2xl bg-white/[0.02]">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-green-400 animate-pulse" /> Scanner active - Align QR code
                    </span>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="text-hot hover:underline font-bold text-xs"
                    >
                      Stop Camera ✕
                    </button>
                  </div>
                  <div 
                    id="camera-scanner-view" 
                    className="w-full max-w-xs mx-auto h-[220px] bg-black/40 border border-white/10 rounded-2xl overflow-hidden relative shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                  />
                </div>
              )}
            </div>

            {/* Check-In Entry Manual Form */}
            <form onSubmit={handleCheckInSubmit} className="flex gap-2">
              <input 
                type="text" 
                className="input py-2 flex-1 text-xs" 
                placeholder="Or enter ticket code manually (e.g. QR-AB12CD)..." 
                value={checkinCode}
                onChange={e => setCheckinCode(e.target.value)}
              />
              <button type="submit" className="btn-primary py-2 px-5 text-xs font-bold whitespace-nowrap">
                Verify Entry Code
              </button>
            </form>

            {scanMsg.text && (
              <div className={`p-3 rounded-xl text-xs font-bold text-center border ${scanMsg.isError ? 'bg-hot/10 border-hot/20 text-hot' : 'bg-green-500/10 border-green-500/20 text-green-400'}`}>
                {scanMsg.text}
              </div>
            )}

            {/* Registrant / Sim Scanner */}
            <div className="space-y-3">
              <div className="border-b border-white/5 pb-2 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-muted uppercase tracking-widest">
                    Participants List
                  </span>
                  <span className="text-[9px] text-accent/80 font-semibold italic">
                    ⚡ Click a row to simulate a QR scan
                  </span>
                </div>

                {/* Search input inside modal */}
                <div className="relative">
                  <input
                    type="text"
                    className="input py-2 text-xs pl-8"
                    placeholder="Search name, email, department, or QR code..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                  <span className="absolute left-3 top-2 text-muted text-xs">🔍</span>
                </div>

                {/* Filter chips inside modal */}
                <div className="flex flex-wrap gap-1">
                  {['all', 'registered', 'attended', 'waitlisted', 'cancelled'].map(status => {
                    const count = registrants.filter(r => status === 'all' || r.status === status).length;
                    let displayLabel = status === 'registered' ? 'RSVP' : status;
                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setStatusFilter(status)}
                        className={`chip text-[9px] px-2 py-0.5 capitalize transition ${
                          statusFilter === status 
                            ? 'bg-accent text-bg font-bold' 
                            : 'bg-white/5 text-muted hover:text-ink'
                        }`}
                      >
                        {displayLabel} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {filteredRegistrants.length === 0 ? (
                <p className="text-xs text-muted italic text-center py-4">No matching records found.</p>
              ) : (
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {filteredRegistrants.map(reg => {
                    const isAttended = reg.status === 'attended';
                    const isCancelled = reg.status === 'cancelled';
                    const isWaitlisted = reg.status === 'waitlisted';
                    
                    let statusBadgeColor = 'bg-white/10 text-muted';
                    if (isAttended) statusBadgeColor = 'bg-green-500/10 text-green-400 border border-green-500/20';
                    if (isWaitlisted) statusBadgeColor = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
                    if (isCancelled) statusBadgeColor = 'bg-hot/10 text-hot border border-hot/20';

                    return (
                      <div 
                        key={reg._id}
                        onClick={() => !isAttended && !isCancelled && !isWaitlisted && simulateCameraScan(reg.qrCodeString)}
                        className={`p-3 border rounded-xl flex items-center justify-between transition text-xs ${
                          isAttended || isCancelled || isWaitlisted 
                            ? 'bg-white/[0.01] border-white/5 cursor-not-allowed opacity-75' 
                            : 'bg-white/5 border-white/5 hover:border-accent/40 cursor-pointer'
                        }`}
                      >
                        <div>
                          <p className="font-bold text-ink">{reg.user?.name}</p>
                          <p className="text-[10px] text-muted">
                            Dept: {reg.user?.department || 'CS'} · Year {reg.user?.year || '1'} · {reg.user?.email}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-[10px] bg-white/10 text-white rounded px-2 py-0.5 border border-white/10 font-bold block">
                            {reg.qrCodeString || 'NO CODE'}
                          </span>
                          <span className={`chip text-[8px] uppercase px-1.5 py-0.1 font-bold mt-1 inline-block ${statusBadgeColor}`}>
                            {reg.status === 'registered' ? 'RSVP Confirmed' : reg.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function StatCard({ label, value, desc }) {
  return (
    <div className="card p-5 bg-surface/50 border border-white/5 flex flex-col justify-between">
      <div className="text-xs text-muted font-bold uppercase tracking-wider">{label}</div>
      <div className="text-3xl sm:text-4xl font-bold font-display text-ink mt-2 mb-1">{value}</div>
      <div className="text-[10px] text-muted">{desc}</div>
    </div>
  );
}

