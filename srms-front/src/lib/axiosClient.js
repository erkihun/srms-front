import axios from 'axios';

const baseURL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:4000/api'
    : 'https://srms-ewt8.onrender.com/api');

const api = axios.create({ baseURL });


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('srms_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
