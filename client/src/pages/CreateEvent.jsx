import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

const CATEGORIES = ['tech', 'music', 'sports', 'arts', 'academic'];

export default function CreateEvent() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', category: 'tech', date: '', location: '',
  });
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await api.post('/events', form);
      nav('/dashboard');
    } catch (e) { setErr(e.response?.data?.message || 'Could not create event'); }
  };

  return (
    <div className="max-w-xl mx-auto card">
      <h1 className="text-2xl font-bold">drop a new event ✦</h1>
      <form className="mt-6 space-y-4" onSubmit={submit}>
        <div><label className="label">Title</label>
          <input className="input" value={form.title} required
            onChange={e => setForm({ ...form, title: e.target.value })} /></div>
        <div><label className="label">Description</label>
          <textarea className="input min-h-[100px]" value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })} /></div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="label">Category</label>
            <select className="input" value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select></div>
          <div><label className="label">Date & time</label>
            <input className="input" type="datetime-local" required value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })} /></div>
        </div>
        <div><label className="label">Location</label>
          <input className="input" required value={form.location}
            onChange={e => setForm({ ...form, location: e.target.value })} /></div>
        {err && <p className="text-hot text-sm">{err}</p>}
        <button className="btn-primary w-full">Publish ✦</button>
      </form>
    </div>
  );
}
