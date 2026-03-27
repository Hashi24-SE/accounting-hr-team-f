import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import EmployeeDirectory from '../pages/employees/EmployeeDirectory';
import EmployeeProfile from '../pages/employees/EmployeeProfile';
import EmployeeRegistrationForm from '../pages/employees/EmployeeRegistrationForm';
import OrganizationSettings from '../pages/settings/OrganizationSettings';
import { isAuthenticated } from '../services/authService';

function ProtectedRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

function PublicOnlyRoute({ children }) {
  return isAuthenticated() ? <Navigate to="/employees" replace /> : children;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <OrganizationSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employees"
          element={
            <ProtectedRoute>
              <EmployeeDirectory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employees/new"
          element={
            <ProtectedRoute>
              <EmployeeRegistrationForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employees/:id"
          element={
            <ProtectedRoute>
              <EmployeeProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/"
          element={<Navigate to={isAuthenticated() ? '/employees' : '/login'} replace />}
        />
        <Route
          path="*"
          element={<Navigate to={isAuthenticated() ? '/employees' : '/login'} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
