import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ChangePassword from './pages/ChangePassword';
import LawyerDashboard from './pages/LawyerDashboard';
import ClientDashboard from './pages/ClientDashboard';
import Appointments from './pages/Appointments';
import Cases from './pages/Cases';
import CaseDetails from './pages/CaseDetails';
import Documents from './pages/Documents';
import Settings from './pages/Settings';
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

function AppRoutes() {
  const { user, isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected Routes */}
      <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route
          path="dashboard"
          element={user?.role === 'lawyer' ? <LawyerDashboard /> : <ClientDashboard />}
        />
        <Route path="appointments" element={<Appointments />} />
        <Route path="cases" element={<Cases />} />
        <Route path="cases/:id" element={<CaseDetails />} />
        <Route path="documents" element={<Documents />} />
        <Route path="settings" element={<Settings />} />
        <Route path="change-password" element={<ChangePassword />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1b2a4a',
              color: '#fff',
              borderRadius: '0.75rem',
              fontSize: '0.875rem',
            },
            success: { iconTheme: { primary: '#c5a572', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
