import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { user } = useAuth();
  return (
    <section className="py-16 sm:py-24">
      <p className="chip bg-white/10 text-accent mb-6">✦ campus events, but make it 2026</p>
      <h1 className="text-5xl sm:text-7xl font-bold leading-[1.05] max-w-3xl">
        Stop missing the <span className="text-accent">main character</span> events on campus.
      </h1>
      <p className="mt-6 max-w-xl text-muted text-lg">
        One feed. Tailored to your vibe. Built for clubs that actually want people to show up.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to={user ? '/feed' : '/register'} className="btn-primary">Get the feed →</Link>
        <Link to="/register" className="btn-ghost">I run a club</Link>
      </div>
      <div className="mt-20 grid sm:grid-cols-3 gap-4">
        {[
          { t: '🎯 Personalized', d: 'Events ranked by what you actually care about.' },
          { t: '⚡ One tap RSVP', d: 'No more sketchy WhatsApp links.' },
          { t: '📊 Org analytics', d: 'Clubs see real turnout, real fast.' },
        ].map(f => (
          <div key={f.t} className="card">
            <div className="font-display text-lg">{f.t}</div>
            <p className="text-sm text-muted mt-1">{f.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
