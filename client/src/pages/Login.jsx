import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try { await login(form.email, form.password); nav('/feed'); }
    catch (e) { setErr(e.response?.data?.message || 'Login failed'); }
  };
  return (
    <div className="max-w-md mx-auto card mt-10">
      <h2 className="text-2xl font-bold">welcome back ✦</h2>
      <p className="text-muted text-sm mt-1">log in to catch up on the feed.</p>
      <form className="mt-6 space-y-4" onSubmit={submit}>
        <div><label className="label">Email</label>
          <input className="input" type="email" value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
        <div><label className="label">Password</label>
          <input className="input" type="password" value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })} required /></div>
        {err && <p className="text-hot text-sm">{err}</p>}
        <button className="btn-primary w-full">Log in</button>
      </form>
      <p className="mt-4 text-sm text-muted">New here? <Link to="/register" className="text-accent">Make an account</Link></p>
    </div>
  );
}
