import { useEffect, useState } from 'react';
import api from '../lib/api';

export default function AdminConsole() {
  const [activeTab, setActiveTab] = useState('events');
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eventsRes, clubsRes, statsRes] = await Promise.all([
        api.get('/admin/events'),
        api.get('/admin/clubs'),
        api.get('/admin/analytics')
      ]);
      setEvents(eventsRes.data.events || []);
      setClubs(clubsRes.data.clubs || []);
      setStats(statsRes.data || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (eventId, status) => {
    setActionMsg('');
    try {
      await api.put(`/admin/events/${eventId}/approve`, { status });
      setActionMsg(`Event ${status === 'approved' ? 'approved' : 'rejected'} successfully!`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFeature = async (eventId, isFeatured) => {
    setActionMsg('');
    try {
      await api.put(`/admin/events/${eventId}/feature`, { isFeatured });
      setActionMsg(`Event feature status updated!`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerifyClub = async (clubId, verifiedStatus) => {
    setActionMsg('');
    try {
      await api.put(`/admin/clubs/${clubId}/verify`, { verifiedStatus });
      setActionMsg(`Club verification status updated!`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold font-display">admin console ✦</h1>
        <p className="text-muted mt-1">Manage event moderation, club verification, and review campus performance.</p>
      </div>

      {actionMsg && (
        <div className="p-3 bg-accent/15 border border-accent/30 text-accent text-xs font-bold rounded-xl animate-fadeIn">
          {actionMsg}
        </div>
      )}

      {/* Tabs list */}
      <div className="flex border-b border-white/5 gap-4">
        {[
          { id: 'events', label: 'Moderation Queue ⚖️' },
          { id: 'clubs', label: 'Verify Clubs 🛡️' },
          { id: 'analytics', label: 'Campus Analytics 📊' }
        ].map(t => (
          <button 
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`pb-3 text-sm font-bold border-b-2 transition ${activeTab === t.id ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-ink'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-muted italic text-sm">Gathering college records...</div>
      ) : (
        <div className="animate-fadeIn">
          {/* Moderation Queue Tab */}
          {activeTab === 'events' && (
            <div className="card space-y-4">
              <h2 className="text-xl font-bold font-display">Pending Event Approvals</h2>
              {events.filter(e => e.status === 'pending').length === 0 ? (
                <p className="text-sm text-muted italic">All clean! No pending events in queue.</p>
              ) : (
                <div className="divide-y divide-white/5">
                  {events.filter(e => e.status === 'pending').map(ev => (
                    <div key={ev._id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="chip bg-white/5 border border-white/5 text-[9px] uppercase">{ev.category}</span>
                          <span className="text-[10px] text-muted">by {ev.organizer?.name}</span>
                        </div>
                        <h3 className="font-bold font-display text-lg mt-1">{ev.title}</h3>
                        <p className="text-xs text-muted">📍 {ev.location} · 📅 {new Date(ev.date).toLocaleString()}</p>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button 
                          onClick={() => handleApprove(ev._id, 'approved')}
                          className="btn-primary text-xs py-1.5 px-4"
                        >
                          Approve ✓
                        </button>
                        <button 
                          onClick={() => handleApprove(ev._id, 'rejected')}
                          className="btn-ghost text-xs text-hot border-hot/30 py-1.5 px-4"
                        >
                          Reject ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <h2 className="text-xl font-bold font-display pt-6 border-t border-white/5">All Active Events</h2>
              <div className="divide-y divide-white/5">
                {events.filter(e => e.status !== 'pending').map(ev => (
                  <div key={ev._id} className="py-4 flex justify-between items-center flex-wrap gap-4">
                    <div>
                      <h3 className="font-semibold text-ink flex items-center gap-2">
                        {ev.title}
                        {ev.isFeatured && <span className="text-[9px] bg-hot/20 text-hot font-bold rounded px-1.5 py-0.2">Featured</span>}
                        <span className={`text-[9px] rounded px-1.5 py-0.2 uppercase ${ev.status === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {ev.status}
                        </span>
                      </h3>
                      <p className="text-xs text-muted mt-0.5">Club: {ev.organizer?.name || 'Unknown'}</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleFeature(ev._id, !ev.isFeatured)}
                        className={`btn-ghost text-xs py-1 px-3 ${ev.isFeatured ? 'border-accent text-accent' : 'border-white/10'}`}
                      >
                        {ev.isFeatured ? 'Unfeature ✦' : 'Feature ✦'}
                      </button>
                      {ev.status === 'approved' && (
                        <button 
                          onClick={() => handleApprove(ev._id, 'rejected')}
                          className="btn-ghost text-xs text-hot border-hot/20 py-1 px-3"
                        >
                          Revoke Approval
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verify Clubs Tab */}
          {activeTab === 'clubs' && (
            <div className="card space-y-4">
              <h2 className="text-xl font-bold font-display">Campus Organizing Clubs</h2>
              <div className="divide-y divide-white/5">
                {clubs.map(club => (
                  <div key={club._id} className="py-4 flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h3 className="font-bold text-ink flex items-center gap-1.5">
                        {club.name}
                        {club.verifiedStatus && (
                          <span className="bg-accent/15 text-accent text-[9px] font-bold rounded px-1.5">
                            ✓ VERIFIED
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-muted">{club.email} · Dept: {club.department || 'General'}</p>
                    </div>
                    <div>
                      <button 
                        onClick={() => handleVerifyClub(club._id, !club.verifiedStatus)}
                        className={`btn-primary text-xs py-1.5 px-4 ${club.verifiedStatus ? 'bg-white/5 border border-white/10 text-muted' : ''}`}
                      >
                        {club.verifiedStatus ? 'Revoke Verification' : 'Verify Club 🛡️'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analytics/Metrics Tab */}
          {activeTab === 'analytics' && stats && (
            <div className="space-y-6">
              {/* Quick stats grid */}
              <div className="grid sm:grid-cols-4 gap-4">
                <StatCard title="Approved Events" value={stats.summary?.approvedEvents} detail={`${stats.summary?.pendingEvents} pending in queue`} />
                <StatCard title="Active Clubs" value={stats.summary?.totalClubs} detail={`${stats.summary?.verifiedClubs} verified badges`} />
                <StatCard title="Total Registrations" value={stats.summary?.totalRegistrations} detail="RSVP conversions" />
                <StatCard title="Registered Students" value={stats.summary?.totalStudents} detail="Enrolled on app" />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Department Heatmap */}
                <div className="card space-y-4">
                  <h3 className="font-bold font-display text-lg text-accent">Engagement by Student Department</h3>
                  {stats.departments?.length === 0 ? (
                    <p className="text-xs text-muted">No student RSVPs yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {stats.departments.map(d => (
                        <div key={d.department} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span>{d.department}</span>
                            <span className="text-accent">{d.registrations} registrations</span>
                          </div>
                          {/* CSS Bar Chart */}
                          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-accent" 
                              style={{ width: `${(d.registrations / Math.max(1, ...stats.departments.map(x => x.registrations))) * 100}%` }} 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Categories Heatmap */}
                <div className="card space-y-4">
                  <h3 className="font-bold font-display text-lg text-hot">Popular Event Categories</h3>
                  {stats.categories?.length === 0 ? (
                    <p className="text-xs text-muted">No RSVPs registered yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {stats.categories.map(c => (
                        <div key={c.category} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="capitalize">#{c.category}</span>
                            <span className="text-hot">{c.registrations} registrations</span>
                          </div>
                          {/* CSS Bar Chart */}
                          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-hot" 
                              style={{ width: `${(c.registrations / Math.max(1, ...stats.categories.map(x => x.registrations))) * 100}%` }} 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function StatCard({ title, value, detail }) {
  return (
    <div className="card p-5 flex flex-col justify-between">
      <div className="text-xs uppercase tracking-wider text-muted font-bold">{title}</div>
      <div className="text-4xl font-bold font-display text-ink mt-2 mb-1">{value}</div>
      <div className="text-[10px] text-muted">{detail}</div>
    </div>
  );
}
