import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Composant de la barre latérale partagée
function Sidebar({ activePage }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin  = user?.roles?.includes('ROLE_ADMIN');

  const initials = `${user?.prenom?.[0] || ''}${user?.nom?.[0] || ''}`.toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo">
          <span className="logo-text" style={{ fontSize: 18 }}>Algolus</span>
        </div>
      </div>

      <div>
        <p className="nav-section-title">Navigation</p>
        {isAdmin && (
          <button
            className={`nav-item ${activePage === 'dashboard' ? 'active' : ''}`}
            onClick={() => navigate('/dashboard')}
            id="nav-dashboard"
          >
            <span className="nav-icon">📊</span> Tableau de bord
          </button>
        )}
        <button
          className={`nav-item ${activePage === 'students' ? 'active' : ''}`}
          onClick={() => navigate('/students')}
          id="nav-students"
        >
          <span className="nav-icon">🎓</span> Étudiants
        </button>
        <button
          className={`nav-item ${activePage === 'profile' ? 'active' : ''}`}
          onClick={() => navigate('/profile')}
          id="nav-profile"
        >
          <span className="nav-icon">👤</span> Mon profil
        </button>
      </div>

      <div className="sidebar-bottom">
        <div className="user-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0
            }}>{initials || '?'}</div>
            <div>
              <div className="user-name">{user?.prenom} {user?.nom}</div>
              <div className="user-email-small">{user?.email}</div>
            </div>
          </div>
          <span className={`badge ${isAdmin ? 'badge-admin' : 'badge-employe'}`}>
            {isAdmin ? '👑 Admin' : '💼 Employé'}
          </span>
        </div>
        <button className="btn btn-ghost btn-sm" style={{ width: '100%' }} onClick={handleLogout} id="btn-logout">
          🚪 Se déconnecter
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
