import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../services/authService';
import AppLayout from '../components/layout/AppLayout';

// Pages
import LoginPage from '../pages/auth/LoginPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import VerifyOTPPage from '../pages/auth/VerifyOTPPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import OrganizationSettings from '../pages/settings/OrganizationSettings';
import EmployeeDirectory from '../pages/employees/EmployeeDirectory';
import EmployeeRegistrationForm from '../pages/employees/EmployeeRegistrationForm';
import EmployeeProfile from '../pages/employees/EmployeeProfile';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/verify-otp" element={<VerifyOTPPage />} />

      {/* Protected Routes inside AppLayout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/employees" replace />} />
        <Route path="employees" element={<EmployeeDirectory />} />
        <Route path="employees/new" element={<EmployeeRegistrationForm />} />
        <Route path="employees/:id" element={<EmployeeProfile />} />
        <Route path="settings" element={<OrganizationSettings />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route path="*" element={<Navigate to="/employees" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
