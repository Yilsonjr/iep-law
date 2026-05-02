import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireDashboard?: boolean;
}

export function ProtectedRoute({ children, requireDashboard }: ProtectedRouteProps) {
  const { user, canViewDashboard } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (requireDashboard && !canViewDashboard) return <Navigate to="/" replace />;

  return <>{children}</>;
}
