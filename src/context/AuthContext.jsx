import { useState, useCallback } from 'react';
import api from '../api/client.js';
import { AuthContext } from './authContext.js';

export function AuthProvider({ children }) {
  // Read any saved session on first load, so a page refresh
  // doesn't log the user out.
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (identifier, password) => {
    setLoading(true);
    try {
      // Backend wraps the real payload inside "data"
      const res = await api.post('/users/login', { identifier, password });
      const { accessToken, refreshToken, user } = res.data.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);

      return user;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const value = { user, login, logout, loading, isAuthenticated: !!user };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

