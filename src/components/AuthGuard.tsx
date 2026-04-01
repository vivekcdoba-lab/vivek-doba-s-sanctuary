import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@/types';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole: UserRole;
}

const AuthGuard = ({ children, requiredRole }: AuthGuardProps) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== requiredRole && user.role !== 'admin') {
    return <Navigate to="/seeker/home" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
