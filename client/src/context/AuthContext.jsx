import { createContext, useContext, useEffect, useState } from 'react';
import api from '../lib/api';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('cc_token');
    if (!token) { setLoading(false); return; }
    api.get('/auth/me')
      .then(r => setUser(r.data.user))
      .catch(() => localStorage.removeItem('cc_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('cc_token', data.token);
    setUser(data.user);
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    localStorage.setItem('cc_token', data.token);
    setUser(data.user);
  };

  const logout = () => { localStorage.removeItem('cc_token'); setUser(null); };

  const updateInterests = async (interests) => {
    const { data } = await api.put('/auth/interests', { interests });
    setUser(data.user);
  };

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, logout, updateInterests }}>
      {children}
    </AuthCtx.Provider>
  );
}
