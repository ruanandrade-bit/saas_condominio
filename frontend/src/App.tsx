import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AppLayout from './components/layout/AppLayout';
import { AdminRoute, PublicOnlyRoute, ResidentRoute } from './components/layout/RouteGuards';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import CondominiumPage from './pages/admin/CondominiumPage';
import UnitsPage from './pages/admin/UnitsPage';
import ResidentsPage from './pages/admin/ResidentsPage';
import ChargesPage from './pages/admin/ChargesPage';
import AnnouncementsPage from './pages/admin/AnnouncementsPage';
import IssuesPage from './pages/admin/IssuesPage';
import ReservationsPage from './pages/admin/ReservationsPage';

// Resident pages
import ResidentDashboard from './pages/resident/ResidentDashboard';
import MyCharges from './pages/resident/MyCharges';
import ResidentAnnouncements from './pages/resident/ResidentAnnouncements';
import MyIssues from './pages/resident/MyIssues';
import MyReservations from './pages/resident/MyReservations';

const HomeRedirect: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner text="Carregando..." />;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/dashboard' : '/morador'} replace />;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{
          duration: 3000,
          style: { background: '#1E293B', color: '#F8FAFC', fontSize: '14px', borderRadius: '10px' },
        }} />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/cadastro" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />

          {/* Admin routes */}
          <Route element={<AdminRoute><AppLayout /></AdminRoute>}>
            <Route path="/dashboard" element={<AdminDashboard />} />
            <Route path="/condominio" element={<CondominiumPage />} />
            <Route path="/unidades" element={<UnitsPage />} />
            <Route path="/moradores" element={<ResidentsPage />} />
            <Route path="/cobrancas" element={<ChargesPage />} />
            <Route path="/comunicados" element={<AnnouncementsPage />} />
            <Route path="/ocorrencias" element={<IssuesPage />} />
            <Route path="/reservas" element={<ReservationsPage />} />
          </Route>

          {/* Resident routes */}
          <Route element={<ResidentRoute><AppLayout /></ResidentRoute>}>
            <Route path="/morador" element={<ResidentDashboard />} />
            <Route path="/morador/cobrancas" element={<MyCharges />} />
            <Route path="/morador/comunicados" element={<ResidentAnnouncements />} />
            <Route path="/morador/ocorrencias" element={<MyIssues />} />
            <Route path="/morador/reservas" element={<MyReservations />} />
          </Route>

          {/* Default */}
          <Route path="/" element={<HomeRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
