import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RequireAuth, RequireGuest, RequireAdmin } from './components/ProtectedRoute';
import LoginPage    from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage  from './pages/ProfilePage';
import StudentsPage from './pages/StudentsPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={
            <RequireGuest><LoginPage /></RequireGuest>
          } />

          <Route path="/dashboard" element={
            <RequireAdmin><DashboardPage /></RequireAdmin>
          } />

          <Route path="/students" element={
            <RequireAuth><StudentsPage /></RequireAuth>
          } />

          <Route path="/profile" element={
            <RequireAuth><ProfilePage /></RequireAuth>
          } />

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
