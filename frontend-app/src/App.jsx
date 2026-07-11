import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RequireAuth, RequireGuest, RequireAdmin } from './components/ProtectedRoute';
import LoginPage    from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage  from './pages/ProfilePage';
import StudentsPage from './pages/StudentsPage';
import ProfsPage    from './pages/ProfsPage';
import EmploiPage   from './pages/EmploiPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Page publique - redirige si déjà connecté */}
          <Route path="/login" element={
            <RequireGuest><LoginPage /></RequireGuest>
          } />

          {/* Dashboard - Admin seulement */}
          <Route path="/dashboard" element={
            <RequireAdmin><DashboardPage /></RequireAdmin>
          } />

          {/* Etudiants - tout utilisateur connecté */}
          <Route path="/students" element={
            <RequireAuth><StudentsPage /></RequireAuth>
          } />

          {/* Professeurs - tout utilisateur connecté */}
          <Route path="/profs" element={
            <RequireAuth><ProfsPage /></RequireAuth>
          } />

          {/* Emploi du temps - tout utilisateur connecté */}
          <Route path="/emploi" element={
            <RequireAuth><EmploiPage /></RequireAuth>
          } />

          {/* Profil - tout utilisateur connecté */}
          <Route path="/profile" element={
            <RequireAuth><ProfilePage /></RequireAuth>
          } />

          {/* Redirection par défaut */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
