import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Charge le profil au démarrage si un token est présent
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem('user');
      if (token) {
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            localStorage.removeItem('user');
          }
        }
        
        // Valide le token et rafraîchit les infos
        try {
          const res = await API.get('/auth/me');
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        } catch (err) {
          // Si 401, l'intercepteur API va gérer la déconnexion
          console.error("Session invalide", err);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();
    const res = await API.post('/auth/login', { email: cleanEmail, password: cleanPassword });
    const { token: jwt } = res.data;
    localStorage.setItem('token', jwt);
    setToken(jwt);

    // Récupère le profil complet
    const meRes = await API.get('/auth/me', {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    localStorage.setItem('user', JSON.stringify(meRes.data));
    setUser(meRes.data);
    return meRes.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    const res = await API.get('/auth/me');
    localStorage.setItem('user', JSON.stringify(res.data));
    setUser(res.data);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
