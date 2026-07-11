import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import API from '../api';
import { useAuth } from '../context/AuthContext';

/* ─── Helpers ─── */
const toInputDatetime = (dateStr) => {
  if (!dateStr) return '';
  // "2026-09-01 08:00:00" → "2026-09-01T08:00"
  return dateStr.replace(' ', 'T').slice(0, 16);
};

const toDisplayDatetime = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr.replace(' ', 'T'));
  return d.toLocaleString('fr-FR', {
    weekday: 'short', day: '2-digit', month: 'short',
    year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

const getDuration = (debut, fin) => {
  if (!debut || !fin) return '';
  const ms = new Date(fin.replace(' ', 'T')) - new Date(debut.replace(' ', 'T'));
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h}h${m > 0 ? m + 'min' : ''}` : `${m}min`;
};

/* ─── Modal Ajout / Modification ─── */
function EmploiModal({ seance, onClose, onSaved }) {
  const [form, setForm] = useState({
    titre:       seance?.titre       || '',
    description: seance?.description || '',
    debut:       seance ? toInputDatetime(seance.debut) : '',
    fin:         seance ? toInputDatetime(seance.fin)   : '',
    salle:       seance?.salle       || '',
  });
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    // Validation côté frontend
    if (new Date(form.fin) <= new Date(form.debut)) {
      setError('La date de fin doit être après la date de début.');
      return;
    }

    // Convertir au format attendu par le backend (YYYY-MM-DD HH:MM:SS)
    const payload = {
      ...form,
      debut: form.debut.replace('T', ' ') + ':00',
      fin:   form.fin.replace('T', ' ')   + ':00',
    };

    setLoading(true);
    try {
      if (seance?.id) {
        await API.put(`/emploi/${seance.id}`, payload);
        setSuccess('Séance modifiée avec succès !');
      } else {
        await API.post('/emploi', payload);
        setSuccess('Séance créée avec succès !');
      }
      onSaved();
      setTimeout(onClose, 900);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la sauvegarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 540 }}>
        <div className="modal-title">
          {seance?.id ? '✏️ Modifier la séance' : '📅 Ajouter une séance'}
        </div>

        {error   && <div className="alert alert-error"  ><span>⚠️</span> {error}</div>}
        {success && <div className="alert alert-success"><span>✅</span> {success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Titre / Matière *</label>
            <input className="form-input" placeholder="Ex: Algorithmique avancée"
              value={form.titre}
              onChange={(e) => setForm({ ...form, titre: e.target.value })} required />
          </div>

          <div className="form-group">
            <label className="form-label">Description (optionnel)</label>
            <textarea className="form-input" rows={2}
              placeholder="Informations complémentaires…"
              style={{ resize: 'vertical' }}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Début *</label>
              <input type="datetime-local" className="form-input"
                value={form.debut}
                onChange={(e) => setForm({ ...form, debut: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Fin *</label>
              <input type="datetime-local" className="form-input"
                value={form.fin}
                onChange={(e) => setForm({ ...form, fin: e.target.value })} required />
            </div>
          </div>

          {form.debut && form.fin && new Date(form.fin) > new Date(form.debut) && (
            <div style={{ fontSize: 13, color: 'var(--accent)', marginTop: -10, marginBottom: 16 }}>
              ⏱️ Durée : {getDuration(
                form.debut.replace('T', ' ') + ':00',
                form.fin.replace('T', ' ')   + ':00'
              )}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Salle *</label>
            <input className="form-input" placeholder="Ex: Salle A101, Amphi B…"
              value={form.salle}
              onChange={(e) => setForm({ ...form, salle: e.target.value })} required />
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
export default function EmploiPage() {
  const [seances,       setSeances]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [search,        setSearch]        = useState('');
  const [editingSeance, setEditingSeance] = useState(null);
  const [showModal,     setShowModal]     = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [viewMode,      setViewMode]      = useState('table'); // 'table' | 'cards'
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');

  const fetchSeances = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await API.get('/emploi');
      // Tri par date de début (la plus proche d'abord)
      const sorted = res.data.sort((a, b) => new Date(a.debut) - new Date(b.debut));
      setSeances(sorted);
    } catch {
      setError('Impossible de charger l\'emploi du temps. Vérifiez que le service est démarré (port 8003).');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSeances(); }, [fetchSeances]);

  const handleDelete = async (id) => {
    try {
      await API.delete(`/emploi/${id}`);
      setDeleteConfirm(null);
      fetchSeances();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la suppression.');
      setDeleteConfirm(null);
    }
  };

  const filtered = seances.filter(s =>
    `${s.titre} ${s.description || ''} ${s.salle}`
      .toLowerCase().includes(search.toLowerCase())
  );

  // Grouper par date pour la vue "cartes"
  const grouped = filtered.reduce((acc, s) => {
    const day = s.debut.slice(0, 10);
    if (!acc[day]) acc[day] = [];
    acc[day].push(s);
    return acc;
  }, {});

  return (
    <div className="app-layout">
      {showModal && (
        <EmploiModal
          seance={editingSeance}
          onClose={() => { setShowModal(false); setEditingSeance(null); }}
          onSaved={fetchSeances}
        />
      )}

      {deleteConfirm !== null && (
        <div className="modal-backdrop" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" style={{ maxWidth: 400, textAlign: 'center' }}
               onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🗑️</div>
            <div className="modal-title" style={{ justifyContent: 'center' }}>
              Confirmer la suppression
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
              Cette séance sera définitivement supprimée de l'emploi du temps.
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

      <Sidebar activePage="emploi" />

      <main className="main-content">
        {/* En-tête */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
          <div>
            <h1 className="page-title">📅 Emploi du temps</h1>
            <p className="page-subtitle">
              Gestion du planning — {seances.length} séance(s) programmée(s)
            </p>
          </div>
          <button className="btn btn-primary" style={{ width: 'auto' }}
                  onClick={() => { setEditingSeance(null); setShowModal(true); }}>
            ➕ Ajouter une séance
          </button>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 24 }}>
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Barre outils */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            className="form-input"
            style={{ maxWidth: 320 }}
            placeholder="🔍 Rechercher par titre, salle…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {/* Toggle vue */}
          <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
            <button
              className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ width: 'auto' }}
              onClick={() => setViewMode('table')}
            >☰ Tableau</button>
            <button
              className={`btn btn-sm ${viewMode === 'cards' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ width: 'auto' }}
              onClick={() => setViewMode('cards')}
            >▦ Cartes</button>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
            <div className="spinner" style={{ width: 32, height: 32 }} />
          </div>
        ) : viewMode === 'table' ? (
          /* ── Vue Tableau ── */
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="section-title" style={{ margin: 0 }}>Toutes les séances</h2>
              <span className="badge badge-user">{filtered.length} résultat(s)</span>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Titre / Matière</th>
                    <th>Début</th>
                    <th>Fin</th>
                    <th>Durée</th>
                    <th>Salle</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                        {search ? 'Aucun résultat pour cette recherche.' : 'Aucune séance enregistrée.'}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((s) => (
                      <tr key={s.id}>
                        <td><span className="badge badge-user">{s.id}</span></td>
                        <td style={{ fontWeight: 600 }}>
                          <div>{s.titre}</div>
                          {s.description && (
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                              {s.description.slice(0, 60)}{s.description.length > 60 ? '…' : ''}
                            </div>
                          )}
                        </td>
                        <td style={{ fontSize: 13 }}>{toDisplayDatetime(s.debut)}</td>
                        <td style={{ fontSize: 13 }}>{toDisplayDatetime(s.fin)}</td>
                        <td>
                          <span className="badge badge-admin">
                            ⏱ {getDuration(s.debut, s.fin)}
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-employe">🏫 {s.salle}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn btn-ghost btn-sm"
                                    onClick={() => { setEditingSeance(s); setShowModal(true); }}>
                              ✏️ Modifier
                            </button>
                            {isAdmin && (
                              <button className="btn btn-ghost btn-sm"
                                      style={{ color: 'var(--danger)' }}
                                      onClick={() => setDeleteConfirm(s.id)}>
                                🗑️
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
          </div>
        ) : (
          /* ── Vue Cartes (groupées par jour) ── */
          filtered.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 48 }}>
              {search ? 'Aucun résultat pour cette recherche.' : 'Aucune séance enregistrée.'}
            </div>
          ) : (
            Object.entries(grouped).map(([day, items]) => (
              <div key={day} style={{ marginBottom: 32 }}>
                <div style={{
                  fontSize: 13, fontWeight: 700, color: 'var(--text-muted)',
                  textTransform: 'uppercase', letterSpacing: 1,
                  marginBottom: 12, paddingLeft: 4,
                }}>
                  📆 {new Date(day + 'T00:00:00').toLocaleDateString('fr-FR', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                  {items.map(s => (
                    <div key={s.id} className="card card-sm" style={{ padding: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                          {s.titre}
                        </h3>
                        <span className="badge badge-admin">⏱ {getDuration(s.debut, s.fin)}</span>
                      </div>
                      {s.description && (
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                          {s.description}
                        </p>
                      )}
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                        <span className="badge badge-user">
                          🕐 {s.debut.slice(11, 16)} → {s.fin.slice(11, 16)}
                        </span>
                        <span className="badge badge-employe">🏫 {s.salle}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                        <button className="btn btn-ghost btn-sm"
                                onClick={() => { setEditingSeance(s); setShowModal(true); }}>
                          ✏️ Modifier
                        </button>
                        {isAdmin && (
                          <button className="btn btn-ghost btn-sm"
                                  style={{ color: 'var(--danger)' }}
                                  onClick={() => setDeleteConfirm(s.id)}>
                            🗑️ Supprimer
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )
        )}
      </main>
    </div>
  );
}
