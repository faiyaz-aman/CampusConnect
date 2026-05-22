import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="space-y-28 py-6">
      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-surface/40 via-[#0d0d18]/70 to-[#1b0e38]/40 backdrop-blur-2xl p-8 sm:p-16 shadow-[0_0_80px_-20px_rgba(124,92,255,0.18)] transition-all duration-500 hover:border-white/15 animate-slow-glowup">
        {/* Animated Background Layers */}
        <div className="absolute inset-0 z-0 opacity-80 pointer-events-none overflow-hidden rounded-3xl">
          {/* Infinite scrolling grid with a smooth radial mask */}
          <div 
            className="absolute inset-0 animate-grid-scroll opacity-50" 
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)
              `,
              backgroundSize: '56px 56px',
              height: '200%',
              maskImage: 'radial-gradient(circle at center, black 30%, transparent 95%)',
              WebkitMaskImage: 'radial-gradient(circle at center, black 30%, transparent 95%)',
            }}
          />
          
          {/* Orbiting glowing blobs & center pulse glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-electric/15 to-hot/5 blur-[145px] animate-pulse-glow pointer-events-none" />
          <div className="absolute -top-40 -left-40 w-[400px] h-[400px] rounded-full bg-electric/25 blur-[110px] animate-orbit" />
          <div className="absolute top-20 -right-48 w-[480px] h-[480px] rounded-full bg-hot/20 blur-[130px] animate-orbit-reverse" />
          <div className="absolute bottom-10 left-1/3 w-[380px] h-[380px] rounded-full bg-accent/12 blur-[110px] animate-orbit" />
        </div>

        {/* Main content layer */}
        <div className="relative z-10 max-w-4xl">
          <p 
            className="chip bg-white/10 text-accent mb-6 backdrop-blur-md border border-white/5 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide animate-fade-in-up opacity-0"
            style={{ animationDelay: '150ms' }}
          >
            ✦ campus events, but make it 2026
          </p>
          <h1 
            className="text-5xl sm:text-7xl font-bold leading-[1.05] tracking-tight text-ink font-display animate-fade-in-up opacity-0"
            style={{ animationDelay: '300ms' }}
          >
            Stop missing the <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-[#d5ff6b] drop-shadow-[0_0_15px_rgba(196,255,61,0.2)] animate-glowup">main character</span> events on campus.
          </h1>
          <p 
            className="mt-6 max-w-2xl text-muted text-lg leading-relaxed animate-fade-in-up opacity-0"
            style={{ animationDelay: '450ms' }}
          >
            One beautiful feed. Tailored perfectly to your vibe. Engineered for clubs that actually want people to show up.
          </p>
          <div 
            className="mt-8 flex flex-wrap gap-4 animate-fade-in-up opacity-0"
            style={{ animationDelay: '600ms' }}
          >
            <Link to={user ? '/feed' : '/register'} className="btn-primary px-7 py-3.5 shadow-glow hover:scale-105 active:scale-95 transition-all text-base">
              Get the feed →
            </Link>
            {!user && (
              <Link to="/register" className="btn-ghost px-7 py-3.5 hover:bg-white/10 hover:scale-105 active:scale-95 transition-all text-base">
                Register
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ================= SECTION 1 — FEATURES SECTION ================= */}
      <section className="space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="chip bg-electric/10 text-electric border border-electric/20 uppercase tracking-widest text-[10px] px-3.5 py-1">
            Why CampusConnect
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-ink font-display">
            Built for modern student clubs
          </h2>
          <p className="text-muted text-base leading-relaxed">
            No more messy chat links, spammy flyers, or missed notifications. Get everything you need in one powerful event ecosystem.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Card 1: Personalized Discovery */}
          <div className="card group relative overflow-hidden p-6 border border-white/5 bg-surface/40 hover:border-white/15 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(124,92,255,0.08)] flex flex-col justify-between min-h-[340px]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-electric/10 rounded-bl-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div>
              <div className="w-12 h-12 rounded-xl bg-electric/15 border border-electric/25 flex items-center justify-center mb-5 text-electric text-2xl group-hover:scale-110 transition-transform">
                🎯
              </div>
              <h3 className="font-display text-xl font-bold text-ink mb-2">Personalized Discovery</h3>
              <p className="text-muted text-sm leading-relaxed">
                Find exactly the events and communities that match your specific vibe. Our feed ranks events based on what you actually care about—zero noise.
              </p>
            </div>
            
            {/* Visual Indicator Mockup */}
            <div className="mt-6 pt-4 border-t border-white/5 flex flex-wrap gap-1.5 opacity-80 group-hover:opacity-100 transition-all">
              <span className="chip bg-accent/15 text-accent border border-accent/20 text-[10px] py-0.5 px-2">#tech</span>
              <span className="chip bg-hot/15 text-hot border border-hot/20 text-[10px] py-0.5 px-2">#music</span>
              <span className="chip bg-electric/15 text-electric border border-electric/20 text-[10px] py-0.5 px-2">#sports</span>
              <span className="chip bg-white/5 text-muted border border-white/5 text-[10px] py-0.5 px-2">+3 more</span>
            </div>
          </div>

          {/* Card 2: One-tap RSVP */}
          <div className="card group relative overflow-hidden p-6 border border-white/5 bg-surface/40 hover:border-white/15 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(255,61,138,0.08)] flex flex-col justify-between min-h-[340px]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-hot/10 rounded-bl-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div>
              <div className="w-12 h-12 rounded-xl bg-hot/15 border border-hot/25 flex items-center justify-center mb-5 text-hot text-2xl group-hover:scale-110 transition-transform">
                ⚡
              </div>
              <h3 className="font-display text-xl font-bold text-ink mb-2">One-Tap RSVP</h3>
              <p className="text-muted text-sm leading-relaxed">
                Never search for sketchy spreadsheets or external links again. RSVP instantly with a single tap, download glassmorphic digital gate-passes, and sync them directly to your calendar.
              </p>
            </div>

            {/* Visual Indicator Mockup */}
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-[11px] text-muted font-semibold tracking-wider uppercase">Vibe RSVP Pass</span>
              <span className="chip bg-accent/20 text-accent font-bold text-[10px] px-2.5 py-0.5 border border-accent/30 shadow-glow-sm">
                ✦ CONFIRMED
              </span>
            </div>
          </div>

          {/* Card 3: Org Analytics */}
          <div className="card group relative overflow-hidden p-6 border border-white/5 bg-surface/40 hover:border-white/15 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(196,255,61,0.08)] flex flex-col justify-between min-h-[340px]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-bl-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div>
              <div className="w-12 h-12 rounded-xl bg-accent/15 border border-accent/25 flex items-center justify-center mb-5 text-accent text-2xl group-hover:scale-110 transition-transform">
                📊
              </div>
              <h3 className="font-display text-xl font-bold text-ink mb-2">Club & Event Analytics</h3>
              <p className="text-muted text-sm leading-relaxed">
                Empower your organization with detailed turnout heatmaps and conversion metrics. Track user RSVP-to-attendee rates and access smooth digital check-in tools.
              </p>
            </div>

            {/* Visual Indicator Mockup */}
            <div className="mt-6 pt-4 border-t border-white/5 flex items-end gap-1.5 h-7">
              <div className="bg-white/5 h-2 w-full rounded-t" />
              <div className="bg-white/10 h-3 w-full rounded-t" />
              <div className="bg-electric/40 h-5 w-full rounded-t" />
              <div className="bg-accent/80 h-7 w-full rounded-t shadow-[0_0_10px_rgba(196,255,61,0.3)] animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 2 — HOW IT WORKS ================= */}
      <section className="space-y-16 relative">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="chip bg-accent/10 text-accent border border-accent/20 uppercase tracking-widest text-[10px] px-3.5 py-1">
            Three Steps
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-ink font-display">
            How it works
          </h2>
          <p className="text-muted text-base leading-relaxed">
            Get plugged into your campus pulse in less than two minutes.
          </p>
        </div>

        {/* Steps Grid with Connecting Line effect */}
        <div className="relative">
          {/* Connecting Line Vector (hidden on mobile) */}
          <div className="hidden md:block absolute top-[68px] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-electric/20 via-hot/20 to-accent/20 z-0" />
          
          <div className="grid md:grid-cols-3 gap-10 relative z-10">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-14 h-14 rounded-full bg-surface border-2 border-electric/30 flex items-center justify-center font-display text-lg font-bold text-ink group-hover:border-electric transition-colors shadow-lg z-10 bg-gradient-to-b from-[#1c1c2b] to-[#0a0a0f] relative">
                <span className="absolute inset-0 rounded-full bg-electric/10 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                1
              </div>
              <div className="mt-6">
                <div className="text-2xl mb-3">🏷️</div>
                <h3 className="font-display text-lg font-bold text-ink mb-2">Choose your interests</h3>
                <p className="text-muted text-sm max-w-xs leading-relaxed">
                  Select the specific tags, clubs, and vibes you are passionate about upon joining the app.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-14 h-14 rounded-full bg-surface border-2 border-hot/30 flex items-center justify-center font-display text-lg font-bold text-ink group-hover:border-hot transition-colors shadow-lg z-10 bg-gradient-to-b from-[#1c1c2b] to-[#0a0a0f] relative">
                <span className="absolute inset-0 rounded-full bg-hot/10 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                2
              </div>
              <div className="mt-6">
                <div className="text-2xl mb-3">📰</div>
                <h3 className="font-display text-lg font-bold text-ink mb-2">Get a personalized feed</h3>
                <p className="text-muted text-sm max-w-xs leading-relaxed">
                  Instantly browse a beautiful feed ranking active events based on your chosen tastes.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-14 h-14 rounded-full bg-surface border-2 border-accent/30 flex items-center justify-center font-display text-lg font-bold text-ink group-hover:border-accent transition-colors shadow-lg z-10 bg-gradient-to-b from-[#1c1c2b] to-[#0a0a0f] relative">
                <span className="absolute inset-0 rounded-full bg-accent/10 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                3
              </div>
              <div className="mt-6">
                <div className="text-2xl mb-3">⚡</div>
                <h3 className="font-display text-lg font-bold text-ink mb-2">RSVP instantly</h3>
                <p className="text-muted text-sm max-w-xs leading-relaxed">
                  Book your spot with a single tap, scan tickets directly from your activity tab, and go!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 3 — SOCIAL PROOF / TESTIMONIALS ================= */}
      <section className="space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="chip bg-hot/10 text-hot border border-hot/20 uppercase tracking-widest text-[10px] px-3.5 py-1">
            Community Approved
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-ink font-display">
            Loved by campus leaders & students
          </h2>
          <p className="text-muted text-base leading-relaxed">
            See how CampusConnect is transforming social activity and engagement levels.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-6 border border-white/5 bg-surface/30 backdrop-blur-sm text-center space-y-1.5 hover:border-white/10 transition-colors">
            <div className="text-4xl md:text-5xl font-bold text-accent font-display drop-shadow-[0_0_15px_rgba(196,255,61,0.25)]">
              50+
            </div>
            <div className="text-muted text-xs font-semibold uppercase tracking-wider">
              Clubs Onboarded
            </div>
          </div>
          
          <div className="card p-6 border border-white/5 bg-surface/30 backdrop-blur-sm text-center space-y-1.5 hover:border-white/10 transition-colors">
            <div className="text-4xl md:text-5xl font-bold text-electric font-display drop-shadow-[0_0_15px_rgba(124,92,255,0.25)]">
              2.4k+
            </div>
            <div className="text-muted text-xs font-semibold uppercase tracking-wider">
              Events Discovered
            </div>
          </div>

          <div className="card p-6 border border-white/5 bg-surface/30 backdrop-blur-sm text-center space-y-1.5 hover:border-white/10 transition-colors">
            <div className="text-4xl md:text-5xl font-bold text-hot font-display drop-shadow-[0_0_15px_rgba(255,61,138,0.25)]">
              94%
            </div>
            <div className="text-muted text-xs font-semibold uppercase tracking-wider">
              RSVP Turnout Rate
            </div>
          </div>

          <div className="card p-6 border border-white/5 bg-surface/30 backdrop-blur-sm text-center space-y-1.5 hover:border-white/10 transition-colors">
            <div className="text-4xl md:text-5xl font-bold text-ink font-display">
              10k+
            </div>
            <div className="text-muted text-xs font-semibold uppercase tracking-wider">
              Student Connections
            </div>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Testimonial 1 */}
          <div className="card p-6 border border-white/5 bg-surface/40 relative hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between hover:border-white/10">
            <span className="absolute top-4 right-4 text-white/5 text-5xl font-serif select-none">“</span>
            <p className="text-ink/90 text-sm leading-relaxed italic z-10 mb-6">
              "I used to find out about hackathons and coding tournaments a day after they ended. Now my feed automatically ranks tech events first. I've joined three new projects already!"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-electric flex items-center justify-center font-display font-bold text-ink text-sm">
                SC
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-ink">Sarah Chen</h4>
                <p className="text-muted text-[11px]">Computer Science Student • Sophomore</p>
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="card p-6 border border-white/5 bg-surface/40 relative hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between hover:border-white/10">
            <span className="absolute top-4 right-4 text-white/5 text-5xl font-serif select-none">“</span>
            <p className="text-ink/90 text-sm leading-relaxed italic z-10 mb-6">
              "We increased our first-meeting turnout by over 75% using CampusConnect. Setting custom building coordinates for our amphitheater concerts made them super easy to find!"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center font-display font-bold text-bg text-sm">
                MV
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-ink">Marcus Vance</h4>
                <p className="text-muted text-[11px]">Music Club Organizer • Junior</p>
              </div>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="card p-6 border border-white/5 bg-surface/40 relative hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between hover:border-white/10">
            <span className="absolute top-4 right-4 text-white/5 text-5xl font-serif select-none">“</span>
            <p className="text-ink/90 text-sm leading-relaxed italic z-10 mb-6">
              "The digital check-in scanning feature is a life-saver. No spreadsheets, no typing errors. Students just scan their ticket QR codes at the door, and the RSVP roster syncs instantly."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-hot flex items-center justify-center font-display font-bold text-ink text-sm">
                LL
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-ink">Leah Lin</h4>
                <p className="text-muted text-[11px]">Fine Arts Event Coordinator • Senior</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
