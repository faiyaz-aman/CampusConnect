import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['tech', 'music', 'sports', 'arts', 'academic'];
const DEPARTMENTS = [
  'Computer Science', 
  'Fine Arts', 
  'Mechanical Engineering', 
  'Humanities', 
  'Business Administration'
];

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    role: 'student',
    department: 'Computer Science',
    year: '1'
  });
  const [interests, setInterests] = useState([]);
  const [err, setErr] = useState('');

  const toggle = (c) =>
    setInterests(i => i.includes(c) ? i.filter(x => x !== c) : [...i, c]);

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await register({ ...form, interests, year: Number(form.year) });
      if (form.role === 'admin') {
        nav('/admin');
      } else if (form.role === 'organizer') {
        nav('/dashboard');
      } else {
        nav('/feed');
      }
    } catch (e) { setErr(e.response?.data?.message || 'Sign up failed'); }
  };

  return (
    <div className="max-w-md mx-auto card mt-6">
      <h2 className="text-2xl font-bold">join the campus ✦</h2>
      <p className="text-muted text-xs mt-1">vibe-checked campus events await you.</p>

      <form className="mt-6 space-y-4" onSubmit={submit}>
        <div>
          <label className="label">Name</label>
          <input className="input" value={form.name} placeholder="e.g. Alex Johnson"
            onChange={e => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" value={form.email} placeholder="alex@college.edu"
            onChange={e => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" minLength={6} value={form.password} placeholder="••••••••"
            onChange={e => setForm({ ...form, password: e.target.value })} required />
        </div>
        
        <div>
          <label className="label">I am a…</label>
          <div className="flex gap-2">
            {['student', 'organizer', 'admin'].map(r => (
              <button type="button" key={r}
                onClick={() => setForm({ ...form, role: r })}
                className={`chip px-4 py-2 capitalize font-semibold ${form.role === r ? 'bg-accent text-bg' : 'bg-white/5 text-muted hover:text-ink'}`}>
                {r}
              </button>
            ))}
          </div>
        </div>

        {form.role === 'student' && (
          <>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Department</label>
                <select className="input" value={form.department}
                  onChange={e => setForm({ ...form, department: e.target.value })}>
                  {DEPARTMENTS.map(d => <option key={d} value={d} className="bg-surface">{d}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Year</label>
                <select className="input" value={form.year}
                  onChange={e => setForm({ ...form, year: e.target.value })}>
                  <option value="1" className="bg-surface">1st Year</option>
                  <option value="2" className="bg-surface">2nd Year</option>
                  <option value="3" className="bg-surface">3rd Year</option>
                  <option value="4" className="bg-surface">4th Year</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">Your vibes (pick a few for recommendations)</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {CATEGORIES.map(c => (
                  <button type="button" key={c} onClick={() => toggle(c)}
                    className={`chip px-3 py-1.5 font-medium border border-transparent ${interests.includes(c) ? 'bg-accent text-bg' : 'bg-white/5 text-muted hover:border-white/10'}`}>
                    #{c}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {err && <p className="text-hot text-sm mt-2">{err}</p>}
        <button className="btn-primary w-full mt-4 py-3">Create account</button>
      </form>
      <p className="mt-4 text-sm text-muted text-center">Have one? <Link to="/login" className="text-accent">Log in</Link></p>
    </div>
  );
}
