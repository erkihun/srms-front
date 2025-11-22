import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from '../lib/axiosClient.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('srms_token'));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('srms_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      if (!token) {
        setInitializing(false);
        return;
      }
      try {
        const res = await axios.get('/auth/me');
        setUser(res.data);
        localStorage.setItem('srms_user', JSON.stringify(res.data));
      } catch (err) {
        console.error('Failed to restore session', err);
        // Keep the cached user/token to avoid forced logout on transient or 401 errors.
      } finally {
        setInitializing(false);
      }
    };
    restoreSession();
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await axios.post('/auth/login', { email, password });
      const { token: jwt, user: loggedUser } = res.data;
      localStorage.setItem('srms_token', jwt);
      localStorage.setItem('srms_user', JSON.stringify(loggedUser));
      setToken(jwt);
      setUser(loggedUser);
      return { ok: true, user: loggedUser };
    } catch (err) {
      console.error(err);
      return {
        ok: false,
        message: err.response?.data?.message || 'Login failed',
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('srms_token');
    localStorage.removeItem('srms_user');
    setToken(null);
    setUser(null);
    const redirectTarget =
      import.meta.env.VITE_FRONTEND_URL || '/login';
    window.location.href = redirectTarget;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, initializing, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
