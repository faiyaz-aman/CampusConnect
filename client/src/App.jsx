import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ChatDrawer from './components/ChatDrawer';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import EventDetail from './pages/EventDetail';
import Dashboard from './pages/Dashboard';
import CreateEvent from './pages/CreateEvent';
import Interests from './pages/Interests';
import Explore from './pages/Explore';
import MyEvents from './pages/MyEvents';
import AdminConsole from './pages/AdminConsole';
import { useAuth } from './context/AuthContext';

function Protected({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-10 text-muted">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/feed" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/feed" element={<Protected><Feed /></Protected>} />
          <Route path="/events/:id" element={<Protected><EventDetail /></Protected>} />
          <Route path="/interests" element={<Protected><Interests /></Protected>} />
          <Route path="/explore" element={<Protected><Explore /></Protected>} />
          <Route path="/my-activity" element={<Protected role="student"><MyEvents /></Protected>} />
          <Route path="/dashboard" element={<Protected role="organizer"><Dashboard /></Protected>} />
          <Route path="/dashboard/new" element={<Protected role="organizer"><CreateEvent /></Protected>} />
          <Route path="/admin" element={<Protected role="admin"><AdminConsole /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <ChatDrawer />
    </>
  );
}

