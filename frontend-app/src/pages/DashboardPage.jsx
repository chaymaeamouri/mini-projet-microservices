import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import API from '../api';

const ROLE_OPTIONS = [
  { value: 'ROLE_EMPLOYE',  label: '💼 Employé' },
  { value: 'ROLE_ADMIN',    label: '👑 Administrateur' },
];

function getRoleBadge(roles) {
  if (!roles) return null;
  if (roles.includes('ROLE_ADMIN'))   return <span className="badge badge-admin">👑 Admin</span>;
  if (roles.includes('ROLE_EMPLOYE')) return <span className="badge badge-employe">💼 Employé</span>;
  return <span className="badge badge-user">👤 User</span>;
}

function CreateModal({ onClose, onCreated }) {
  const [form, setForm]       = useState({ email: '', password: '', nom: '', prenom: '', roles: ['ROLE_EMPLOYE'] });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      await API.post('/auth/register', form);
      setSuccess(`Compte créé pour ${form.email} !`);
      setTimeout(() => { onCreated(); onClose(); }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la création.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">➕ Créer un compte</div>

        {error   && <div className="alert alert-error"><span>⚠️</span><span>{error}</span></div>}
        {success && <div className="alert alert-success"><span>✅</span><span>{success}</span></div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Prénom</label>
              <input id="modal-prenom" className="form-input" placeholder="Ex: Jean" value={form.prenom}
                onChange={(e) => setForm({ ...form, prenom: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Nom</label>
              <input id="modal-nom" className="form-input" placeholder="Ex: Dupont" value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input id="modal-email" type="email" className="form-input" placeholder="jean.dupont@exemple.fr" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <input id="modal-password" type="password" className="form-input" placeholder="Minimum 6 caractères" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
          </div>
          <div className="form-group">
            <label className="form-label">Rôle</label>
            <select id="modal-role" className="form-select" value={form.roles[0]}
              onChange={(e) => setForm({ ...form, roles: [e.target.value] })}>
              {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose} id="modal-cancel">Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={loading} id="modal-submit">
              {loading ? <><span className="spinner"></span> Création…</> : '✅ Créer le compte'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError]         = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await API.get('/auth/users');
      setUsers(res.data);
    } catch (err) {
      setError("Impossible de charger la liste des comptes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const adminCount   = users.filter(u => u.roles?.includes('ROLE_ADMIN')).length;
  const employeCount = users.filter(u => !u.roles?.includes('ROLE_ADMIN')).length;

  return (
    <div className="app-layout">
      {showModal && <CreateModal onClose={() => setShowModal(false)} onCreated={fetchUsers} />}
      <Sidebar activePage="dashboard" />

      <main className="main-content">
        {/* Header */}
        <div className="page-header">
          <div className="page-header-left">
            <h1 className="page-title">Tableau de Bord</h1>
            <p className="page-subtitle">Gestion des comptes du personnel</p>
          </div>
          <button
            className="btn btn-primary"
            style={{ width: 'auto' }}
            onClick={() => setShowModal(true)}
            id="btn-create-user"
          >
            ➕ Nouveau compte
          </button>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card stat-card-purple">
            <div className="stat-icon stat-icon-purple">👥</div>
            <div>
              <div className="stat-value">{users.length}</div>
              <div className="stat-label">Total comptes</div>
            </div>
          </div>
          <div className="stat-card stat-card-cyan">
            <div className="stat-icon stat-icon-cyan">👑</div>
            <div>
              <div className="stat-value">{adminCount}</div>
              <div className="stat-label">Administrateurs</div>
            </div>
          </div>
          <div className="stat-card stat-card-green">
            <div className="stat-icon stat-icon-green">💼</div>
            <div>
              <div className="stat-value">{employeCount}</div>
              <div className="stat-label">Employés</div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="table-card">
          <div className="table-card-header">
            <h2>Liste des comptes</h2>
            {!loading && <span className="table-count">{users.length} compte{users.length !== 1 ? 's' : ''}</span>}
          </div>

          {error && (
            <div style={{ padding: '16px 24px' }}>
              <div className="alert alert-error" style={{ margin: 0 }}><span>⚠️</span><span>{error}</span></div>
            </div>
          )}

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '56px 24px', gap: 16, color: 'var(--text-muted)' }}>
              <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }}></div>
              <span style={{ fontSize: 14 }}>Chargement des comptes…</span>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>#ID</th>
                    <th>Nom complet</th>
                    <th>Email</th>
                    <th>Rôle</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={4}>
                        <div className="empty-state">
                          <div className="empty-state-icon">👥</div>
                          <div className="empty-state-text">Aucun compte trouvé</div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <span style={{ fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: 13 }}>
                            #{u.id}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{u.prenom} {u.nom}</td>
                        <td>{u.email}</td>
                        <td>{getRoleBadge(u.roles)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
