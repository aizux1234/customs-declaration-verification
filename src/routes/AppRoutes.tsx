// src/routes/AppRoutes.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { landingRoute } from '../utils/permissions';
import { ProtectedRoute } from './ProtectedRoute';
import { AuthLayout } from '../layouts/AuthLayout';
import { AppLayout } from '../layouts/AppLayout';
import { LoginPage } from '../pages/login/LoginPage';
import { VerifyPage } from '../pages/verify/VerifyPage';
import { SearchHistoryPage } from '../pages/reports/SearchHistoryPage';
import { UsersPage } from '../pages/users/UsersPage';
import { BorrowersPage } from '../pages/borrowers/BorrowersPage';
import { BorrowerDetailPage } from '../pages/borrowers/BorrowerDetailPage';
import { DeclarationsPage } from '../pages/declarations/DeclarationsPage';
import { ActivityLogPage } from '../pages/activity-log/ActivityLogPage';

export function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>
      <Route element={<AppLayout />}>
        <Route element={<ProtectedRoute module="verify" />}>
          <Route path="/verify" element={<VerifyPage />} />
        </Route>
        <Route element={<ProtectedRoute module="history" />}>
          <Route path="/reports/search-history" element={<SearchHistoryPage />} />
        </Route>
        <Route element={<ProtectedRoute module="users" />}>
          <Route path="/users" element={<UsersPage />} />
        </Route>
        <Route element={<ProtectedRoute module="borrowers" />}>
          <Route path="/borrowers" element={<BorrowersPage />} />
          <Route path="/borrowers/:id" element={<BorrowerDetailPage />} />
        </Route>
        <Route element={<ProtectedRoute module="declarations" />}>
          <Route path="/declarations" element={<DeclarationsPage />} />
        </Route>
        <Route element={<ProtectedRoute module="activityLog" />}>
          <Route path="/activity-log" element={<ActivityLogPage />} />
        </Route>
      </Route>
      <Route path="*" element={
        <Navigate to={user ? landingRoute(user.role) : '/login'} replace />
      } />
    </Routes>
  );
}
