import axios from 'axios';

// En développement Vite fait le proxy lui-même (voir vite.config.js)
// La base URL pointe vers /api/auth
const API = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Injecte automatiquement le token JWT si présent
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Gère les 401 automatiquement (token expiré)
API.interceptors.response.use(
  (res) => res,
  (err) => {
    // Si c'est une 401 et qu'on N'EST PAS en train d'essayer de se connecter
    if (err.response?.status === 401 && !err.config.url.endsWith('/auth/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default API;
