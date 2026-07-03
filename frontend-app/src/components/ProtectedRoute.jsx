import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Redirige vers /login si pas connecté
export function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-center"><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// Redirige vers /dashboard si déjà connecté
export function RequireGuest({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-center"><div className="spinner"></div></div>;
  if (user) {
    const isAdmin = user.roles?.includes('ROLE_ADMIN');
    return <Navigate to={isAdmin ? '/dashboard' : '/profile'} replace />;
  }
  return children;
}

// Redirige si pas Admin
export function RequireAdmin({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-center"><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.roles?.includes('ROLE_ADMIN')) return <Navigate to="/profile" replace />;
  return children;
}
