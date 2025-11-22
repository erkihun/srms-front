import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from '../lib/axiosClient.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('srms_token'));
  const [user, setUser] = useState(null);
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
      } catch (err) {
        console.error('Failed to restore session', err);
        // Only clear token if the backend says unauthorized; otherwise keep it
        // so transient network/API issues don't auto-logout the user.
        if (err?.response?.status === 401) {
          localStorage.removeItem('srms_token');
          setToken(null);
          setUser(null);
        }
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
