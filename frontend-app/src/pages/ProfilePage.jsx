import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

function getRoleBadge(roles) {
  if (!roles) return null;
  if (roles.includes('ROLE_ADMIN'))    return <span className="badge badge-admin">👑 Administrateur</span>;
  if (roles.includes('ROLE_EMPLOYE'))  return <span className="badge badge-employe">💼 Employé</span>;
  return <span className="badge badge-user">👤 Utilisateur</span>;
}

export default function ProfilePage() {
  const { user } = useAuth();

  const initials = `${user?.prenom?.[0] || ''}${user?.nom?.[0] || ''}`.toUpperCase();

  return (
    <div className="app-layout">
      <Sidebar activePage="profile" />
      <main className="main-content">
        <h1 className="page-title">Mon Profil</h1>
        <p className="page-subtitle">Vos informations personnelles</p>

        <div className="card">
          {/* En-tête profil */}
          <div className="profile-header">
            <div className="avatar">{initials || '?'}</div>
            <div className="profile-info">
              <h2>{user?.prenom} {user?.nom}</h2>
              <p>{user?.email}</p>
              <div style={{ marginTop: 12 }}>
                {getRoleBadge(user?.roles)}
              </div>
            </div>
          </div>

          {/* Grille d'informations */}
          <div className="info-grid">
            <div className="info-item">
              <div className="info-item-label">Prénom</div>
              <div className="info-item-value">{user?.prenom || '—'}</div>
            </div>
            <div className="info-item">
              <div className="info-item-label">Nom</div>
              <div className="info-item-value">{user?.nom || '—'}</div>
            </div>
            <div className="info-item">
              <div className="info-item-label">Email</div>
              <div className="info-item-value" style={{ wordBreak: 'break-all' }}>{user?.email || '—'}</div>
            </div>
            <div className="info-item">
              <div className="info-item-label">Identifiant</div>
              <div className="info-item-value" style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                #{user?.id || '—'}
              </div>
            </div>
            <div className="info-item" style={{ gridColumn: '1 / -1' }}>
              <div className="info-item-label">Rôles système</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                {user?.roles?.map((role) => (
                  <span key={role} className="badge badge-user" style={{ fontFamily: 'monospace', fontSize: 11 }}>
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
