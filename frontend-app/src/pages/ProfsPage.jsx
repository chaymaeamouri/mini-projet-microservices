import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import API from '../api';
import { useAuth } from '../context/AuthContext';

/* ─── Modal Ajout / Modification ─── */
function ProfModal({ prof, onClose, onSaved }) {
  const [form, setForm] = useState({
    nom:            prof?.nom            || '',
    prenom:         prof?.prenom         || '',
    email:          prof?.email          || '',
    departement:    prof?.departement    || '',
    date_naissance: prof?.date_naissance || '',
  });
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      if (prof?.id) {
        await API.put(`/profs/${prof.id}`, form);
        setSuccess('Professeur modifié avec succès !');
      } else {
        await API.post('/profs', form);
        setSuccess('Professeur ajouté avec succès !');
      }
      onSaved();
      setTimeout(onClose, 900);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la sauvegarde.');
    } finally {
      setLoading(false);
    }
  };

  const departements = [
    'Informatique', 'Mathématiques', 'Physique', 'Chimie',
    'Génie Civil', 'Génie Électrique', 'Langues', 'Sciences Humaines',
  ];

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 520 }}>
        <div className="modal-title">
          {prof?.id ? '✏️ Modifier le professeur' : '🧑‍🏫 Ajouter un professeur'}
        </div>

        {error   && <div className="alert alert-error"  ><span>⚠️</span> {error}</div>}
        {success && <div className="alert alert-success"><span>✅</span> {success}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Prénom *</label>
              <input className="form-input" value={form.prenom}
                onChange={(e) => setForm({ ...form, prenom: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Nom *</label>
              <input className="form-input" value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email *</label>
            <input type="email" className="form-input" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>

          <div className="form-group">
            <label className="form-label">Département *</label>
            <select className="form-select" value={form.departement}
              onChange={(e) => setForm({ ...form, departement: e.target.value })} required>
              <option value="" disabled>-- Sélectionnez un département --</option>
              {departements.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Date de naissance</label>
            <input type="date" className="form-input" min="1950-01-01" max="2000-12-31"
              value={form.date_naissance}
              onChange={(e) => setForm({ ...form, date_naissance: e.target.value })} />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner" /> Sauvegarde…</> : '✅ Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Page principale ─── */
export default function ProfsPage() {
  const [profs,        setProfs]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [search,       setSearch]       = useState('');
  const [editingProf,  setEditingProf]  = useState(null);
  const [showModal,    setShowModal]    = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // id à supprimer
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');

  const fetchProfs = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await API.get('/profs');
      setProfs(res.data);
    } catch {
      setError('Impossible de charger les professeurs. Vérifiez que le service est démarré (port 8004).');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfs(); }, [fetchProfs]);

  const handleDelete = async (id) => {
    try {
      await API.delete(`/profs/${id}`);
      setDeleteConfirm(null);
      fetchProfs();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la suppression.');
      setDeleteConfirm(null);
    }
  };

  const filtered = profs.filter(p =>
    `${p.nom} ${p.prenom} ${p.email} ${p.departement}`
      .toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app-layout">
      {showModal && (
        <ProfModal
          prof={editingProf}
          onClose={() => { setShowModal(false); setEditingProf(null); }}
          onSaved={fetchProfs}
        />
      )}

      {/* Modale de confirmation de suppression */}
      {deleteConfirm !== null && (
        <div className="modal-backdrop" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" style={{ maxWidth: 400, textAlign: 'center' }}
               onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🗑️</div>
            <div className="modal-title" style={{ justifyContent: 'center' }}>
              Confirmer la suppression
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
              Cette action est irréversible. Le professeur sera définitivement supprimé.
            </p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Annuler</button>
              <button className="btn btn-danger" style={{ width: 'auto' }}
                      onClick={() => handleDelete(deleteConfirm)}>
                🗑️ Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      <Sidebar activePage="profs" />

      <main className="main-content">
        {/* En-tête */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
          <div>
            <h1 className="page-title">👨‍🏫 Professeurs</h1>
            <p className="page-subtitle">Gestion du corps enseignant — {profs.length} professeur(s) enregistré(s)</p>
          </div>
          <button className="btn btn-primary" style={{ width: 'auto' }}
                  onClick={() => { setEditingProf(null); setShowModal(true); }}>
            ➕ Ajouter un professeur
          </button>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 24 }}>
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Barre de recherche */}
        <div style={{ marginBottom: 20 }}>
          <input
            className="form-input"
            style={{ maxWidth: 360 }}
            placeholder="🔍 Rechercher par nom, email, département…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Tableau */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="section-title" style={{ margin: 0 }}>Liste des professeurs</h2>
            <span className="badge badge-user">{filtered.length} résultat(s)</span>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
              <div className="spinner" style={{ width: 32, height: 32 }} />
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nom Complet</th>
                    <th>Email</th>
                    <th>Département</th>
                    <th>Date de naissance</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                        {search ? 'Aucun résultat pour cette recherche.' : 'Aucun professeur enregistré.'}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((p) => (
                      <tr key={p.id}>
                        <td><span className="badge badge-user">{p.id}</span></td>
                        <td style={{ fontWeight: 600 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 34, height: 34, borderRadius: '50%',
                              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0
                            }}>
                              {p.prenom?.[0]}{p.nom?.[0]}
                            </div>
                            {p.prenom} {p.nom}
                          </div>
                        </td>
                        <td>{p.email}</td>
                        <td>
                          <span className="badge badge-employe">{p.departement}</span>
                        </td>
                        <td>{p.date_naissance || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn btn-ghost btn-sm"
                                    onClick={() => { setEditingProf(p); setShowModal(true); }}>
                              ✏️ Modifier
                            </button>
                            {isAdmin && (
                              <button className="btn btn-ghost btn-sm"
                                      style={{ color: 'var(--danger)' }}
                                      onClick={() => setDeleteConfirm(p.id)}>
                                🗑️ Supprimer
                              </button>
                            )}
                          </div>
                        </td>
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
