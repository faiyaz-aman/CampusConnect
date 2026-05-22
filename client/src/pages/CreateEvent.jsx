import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

const CATEGORIES = ['tech', 'music', 'sports', 'arts', 'academic'];

const BUILDINGS = [
  { name: 'Engineering Block', x: 35, y: 38, isVirtual: false },
  { name: 'Campus Amphitheater', x: 68, y: 24, isVirtual: false },
  { name: 'Student Center', x: 50, y: 62, isVirtual: false },
  { name: 'Sports Arena', x: 82, y: 45, isVirtual: false },
  { name: 'Seminar Hall', x: 22, y: 70, isVirtual: false },
  { name: 'Central Library', x: 48, y: 28, isVirtual: false },
  { name: 'Virtual / Zoom / Online', x: null, y: null, isVirtual: true },
  { name: 'Other (Custom Location)', x: null, y: null, isCustom: true }
];

export default function CreateEvent() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', category: 'tech', date: '', location: 'Engineering Block',
  });
  const [buildingIdx, setBuildingIdx] = useState(0); // Engineering Block default
  const [durationHours, setDurationHours] = useState('2');
  const [err, setErr] = useState('');

  const handleBuildingChange = (idx) => {
    setBuildingIdx(idx);
    const b = BUILDINGS[idx];
    if (!b.isCustom && !b.isVirtual) {
      setForm(prev => ({ ...prev, location: b.name }));
    } else if (b.isVirtual) {
      setForm(prev => ({ ...prev, location: 'Virtual / Zoom link' }));
    } else {
      setForm(prev => ({ ...prev, location: '' }));
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      const b = BUILDINGS[buildingIdx];
      const start = new Date(form.date);
      const end = new Date(start.getTime() + Number(durationHours) * 60 * 60 * 1000);

      const payload = {
        ...form,
        endTime: end.toISOString(),
        mode: b.isVirtual ? 'virtual' : 'in-person',
        buildingName: b.isCustom || b.isVirtual ? '' : b.name,
        coordinates: b.isCustom || b.isVirtual ? undefined : { x: b.x, y: b.y }
      };

      await api.post('/events', payload);
      nav('/dashboard');
    } catch (e) { 
      setErr(e.response?.data?.message || 'Could not create event'); 
    }
  };

  return (
    <div className="max-w-xl mx-auto card bg-surface/80 backdrop-blur border border-white/5 shadow-xl">
      <h1 className="text-2xl font-bold font-display text-ink">drop a new event ✦</h1>
      <form className="mt-6 space-y-4" onSubmit={submit}>
        <div>
          <label className="label">Title</label>
          <input className="input" value={form.title} required placeholder="Enter a catchy title..."
            onChange={e => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input min-h-[100px]" value={form.description} placeholder="Describe your event highlights..."
            onChange={e => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map(c => <option key={c} value={c} className="bg-surface">{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Date & start time</label>
            <input className="input" type="datetime-local" required value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })} />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Campus Venue</label>
            <select className="input" value={buildingIdx}
              onChange={e => handleBuildingChange(Number(e.target.value))}>
              {BUILDINGS.map((b, idx) => (
                <option key={idx} value={idx} className="bg-surface">{b.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Duration (Hours)</label>
            <input className="input" type="number" min="1" max="72" required value={durationHours}
              onChange={e => setDurationHours(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label">Location Details / Room Number</label>
          <input className="input" required value={form.location} placeholder="e.g. Hall B, Zoom Link, Room 302..."
            onChange={e => setForm({ ...form, location: e.target.value })} />
        </div>
        {err && <p className="text-hot text-sm">{err}</p>}
        <button className="btn-primary w-full py-3 mt-4 text-bg font-bold shadow-glow hover:scale-[1.01] transition-transform">
          Publish ✦
        </button>
      </form>
    </div>
  );
}
