import { useEffect, useState } from 'react';
import api from '../lib/api';
import EventCard from '../components/EventCard';

const CATEGORIES = ['tech', 'music', 'sports', 'arts', 'academic'];

export default function Explore() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedMode, setSelectedMode] = useState('');
  const [sort, setSort] = useState('soon');

  const fetchEvents = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (selectedCat) params.append('category', selectedCat);
    if (selectedMode) params.append('mode', selectedMode);
    if (sort) params.append('sort', sort);

    api.get(`/events?${params.toString()}`)
      .then(r => setEvents(r.data.events || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  // Debounced/Triggered search on input changes & button presses
  useEffect(() => {
    fetchEvents();
  }, [selectedCat, selectedMode, sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold font-display">explore events ✦</h1>
        <p className="text-muted mt-1">Search, filter, and discover what is happening across the campus.</p>
      </div>

      <div className="card space-y-4">
        {/* Search form */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input 
            type="text" 
            className="input flex-1" 
            placeholder="Search by title, club, description..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button type="submit" className="btn-primary px-6 py-2.5">
            Search
          </button>
        </form>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          {/* Category Chips */}
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setSelectedCat('')}
              className={`chip px-3 py-1.5 font-medium border border-transparent ${selectedCat === '' ? 'bg-accent text-bg' : 'bg-white/5 text-muted hover:border-white/10'}`}
            >
              All Category
            </button>
            {CATEGORIES.map(c => (
              <button 
                key={c}
                onClick={() => setSelectedCat(c)}
                className={`chip px-3 py-1.5 font-medium border border-transparent ${selectedCat === c ? 'bg-accent text-bg' : 'bg-white/5 text-muted hover:border-white/10'}`}
              >
                #{c}
              </button>
            ))}
          </div>

          {/* Mode & Sort Dropdowns */}
          <div className="flex items-center gap-3">
            <div>
              <select 
                className="input py-1.5 text-sm"
                value={selectedMode}
                onChange={e => setSelectedMode(e.target.value)}
              >
                <option value="" className="bg-surface">All Modes</option>
                <option value="in-person" className="bg-surface">In Person</option>
                <option value="virtual" className="bg-surface">Virtual</option>
              </select>
            </div>
            <div>
              <select 
                className="input py-1.5 text-sm"
                value={sort}
                onChange={e => setSort(e.target.value)}
              >
                <option value="soon" className="bg-surface">Soonest Date</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Results */}
      {loading ? (
        <div className="text-center py-10 text-muted">Scanning the campus vibe…</div>
      ) : events.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-lg font-display text-muted">No campus events match your filters.</p>
          <p className="text-xs text-muted/60 mt-1">Try broadening your search criteria or resetting filters.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => (
            <EventCard key={event._id} event={event} matched={false} />
          ))}
        </div>
      )}
    </section>
  );
}
