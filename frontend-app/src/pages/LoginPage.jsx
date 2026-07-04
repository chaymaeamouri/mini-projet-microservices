import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      const isAdmin = user.roles?.includes('ROLE_ADMIN');
      navigate(isAdmin ? '/dashboard' : '/profile', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Email ou mot de passe incorrect.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-center">
      <div className="auth-card card">
        {/* Logo */}
        <div className="logo">
          <div className="logo-icon">🎓</div>
          <div>
            <div className="logo-text">Algolus</div>
            <div className="logo-tagline">Portail de gestion</div>
          </div>
        </div>

        <h1 className="page-title">Connexion</h1>
        <p className="page-subtitle">Accédez à votre espace de gestion</p>

        {error && (
          <div className="alert alert-error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Adresse Email</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="vous@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="form-group" style={{ marginBottom: 28 }}>
            <label htmlFor="password" className="form-label">Mot de passe</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading
              ? <><span className="spinner"></span> Connexion en cours…</>
              : '🔐 Se connecter'}
          </button>
        </form>

        <div className="divider" style={{ margin: '24px 0 16px' }} />

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <span>🔒</span> Portail sécurisé — Accès réservé au personnel autorisé
        </p>
      </div>
    </div>
  );
}
