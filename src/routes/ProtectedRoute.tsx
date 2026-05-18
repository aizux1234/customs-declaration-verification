// src/routes/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canAccess, type ModuleKey } from '../utils/permissions';

export function ProtectedRoute({ module }: { module: ModuleKey }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!canAccess(user.role, module)) return <Navigate to="/login" replace />;
  return <Outlet />;
}
