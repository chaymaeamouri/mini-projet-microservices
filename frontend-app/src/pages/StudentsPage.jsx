import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import API from '../api';
import { useAuth } from '../context/AuthContext';

function StudentModal({ student, onClose, onSaved }) {
  const [form, setForm] = useState({
    nom: student?.nom || '',
    prenom: student?.prenom || '',
    email: student?.email || '',
    filiere: student?.filiere || '',
    date_naissance: student?.date_naissance || '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (student?.id) {
        await API.put(`/students/${student.id}`, form);
      } else {
        await API.post('/students', form);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la sauvegarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">
          {student?.id ? '✏️ Modifier l\'étudiant' : '🎓 Ajouter un étudiant'}
        </div>
        {error && <div className="alert alert-error"><span>⚠️</span><span>{error}</span></div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Prénom</label>
              <input className="form-input" placeholder="Ex: Marie" value={form.prenom}
                onChange={(e) => setForm({ ...form, prenom: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Nom</label>
              <input className="form-input" placeholder="Ex: Dupont" value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" placeholder="etudiant@ecole.fr" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Filière / Classe</label>
            <select className="form-select" value={form.filiere}
              onChange={(e) => setForm({ ...form, filiere: e.target.value })} required>
              <option value="" disabled>— Sélectionnez une filière —</option>
              <option value="Génie informatique">Génie informatique</option>
              <option value="Génie industriel">Génie industriel</option>
              <option value="Informatique et gestion">Informatique et gestion</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Date de naissance</label>
            <input type="date" className="form-input" min="1980-01-01" max="2009-12-31"
              value={form.date_naissance}
              onChange={(e) => setForm({ ...form, date_naissance: e.target.value })} />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner"></span> Sauvegarde…</> : '✅ Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function StudentsPage() {
  const [students, setStudents]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [editingStudent, setEditingStudent] = useState(null);
  const [showModal, setShowModal]     = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');

  const [securityMessage, setSecurityMessage] = useState('');

  const fetchStudents = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await API.get('/students');
      setStudents(res.data);
    } catch (err) {
      setError("Impossible de charger les étudiants.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const handleDelete = async (student) => {
    try {
      await API.delete(`/students/${student.id}`);
      fetchStudents();
      setSecurityMessage('');
    } catch (err) {
      if (err.response?.status === 403 || !user?.roles?.includes('ROLE_ADMIN')) {
        setSecurityMessage(
          "L'employé et l'administrateur peuvent tous les deux gérer les étudiants. Cependant, par mesure de sécurité, seul l'Administrateur a le droit de supprimer définitivement un étudiant. L'employé peut seulement le modifier."
        );
      } else {
        alert("Erreur lors de la suppression.");
      }
    }
  };

  const openAddModal = () => {
    setEditingStudent(null);
    setShowModal(true);
    setSecurityMessage('');
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setShowModal(true);
    setSecurityMessage('');
  };

  return (
    <div className="app-layout">
      {showModal && (
        <StudentModal
          student={editingStudent}
          onClose={() => setShowModal(false)}
          onSaved={fetchStudents}
        />
      )}
      <Sidebar activePage="students" />

      <main className="main-content">
        {/* Header */}
        <div className="page-header">
          <div className="page-header-left">
            <h1 className="page-title">Étudiants</h1>
            <p className="page-subtitle">Gestion des dossiers étudiants</p>
          </div>
          <button
            className="btn btn-primary"
            style={{ width: 'auto' }}
            onClick={openAddModal}
          >
            🎓 Ajouter un étudiant
          </button>
        </div>

        {/* Security alert */}
        {securityMessage && (
          <div className="alert alert-error" style={{ marginBottom: 24, alignItems: 'flex-start' }}>
            <span style={{ flexShrink: 0 }}>🔒</span>
            <div>
              <strong>Mesure de sécurité :</strong> {securityMessage}
            </div>
          </div>
        )}

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 24 }}>
            <span>⚠️</span><span>{error}</span>
          </div>
        )}

        {/* Table card */}
        <div className="table-card">
          <div className="table-card-header">
            <h2>Liste des étudiants</h2>
            {!loading && (
              <span className="table-count">
                {students.length} étudiant{students.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '56px 24px', gap: 16, color: 'var(--text-muted)' }}>
              <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }}></div>
              <span style={{ fontSize: 14 }}>Chargement des étudiants…</span>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Matricule</th>
                    <th>Nom Complet</th>
                    <th>Email</th>
                    <th>Filière</th>
                    <th>Date de naissance</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="empty-state">
                          <div className="empty-state-icon">🎓</div>
                          <div className="empty-state-text">Aucun étudiant trouvé</div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    students.map((s) => (
                      <tr key={s.id}>
                        <td>
                          <span className="badge badge-user" style={{ fontFamily: 'monospace', fontSize: 11 }}>
                            {s.matricule}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                          {s.nom} {s.prenom}
                        </td>
                        <td>{s.email}</td>
                        <td>
                          <span style={{ color: 'var(--accent)', fontSize: 13 }}>{s.filiere}</span>
                        </td>
                        <td style={{ fontSize: 13 }}>{s.date_naissance || '—'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => openEditModal(s)}
                              title="Modifier"
                            >
                              ✏️ Modifier
                            </button>
                            {isAdmin && (
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDelete(s)}
                                title="Supprimer"
                              >
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
