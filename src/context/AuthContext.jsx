import { useState, useCallback, useEffect } from 'react';
import api from '../api/client.js';
import { AuthContext } from './authContext.js';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    api.get('/users/session')
      .then((res) => { if (active) setUser(res.data.data); })
      .catch(() => { if (active) setUser(null); })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, []);

  const login = useCallback(async (identifier, password) => {
    setLoading(true);
    try {
      // Backend wraps the real payload inside "data"
      const res = await api.post('/users/login', { identifier, password });
      const { user } = res.data.data;
      setUser(user);

      return user;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.delete('/users/logout');
    } catch {
      // Clear the UI even if the expired access cookie cannot be revoked.
    } finally {
      setUser(null);
    }
  }, []);

  const value = { user, login, logout, loading, isAuthenticated: !!user };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

