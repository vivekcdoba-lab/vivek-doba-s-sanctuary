import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole: 'admin' | 'seeker' | 'coach';
}

const AuthGuard = ({ children, requiredRole }: AuthGuardProps) => {
  const { isAuthenticated, profile, loading, sessionId } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !profile) {
    return <Navigate to="/login" replace />;
  }

  if (!sessionId) {
    return <Navigate to="/login" replace />;
  }

  // Admin can access everything
  if (profile.role === 'admin') {
    return <>{children}</>;
  }

  // Coach can access coach routes
  if (profile.role === 'coach' && requiredRole === 'coach') {
    return <>{children}</>;
  }

  // Seeker can access seeker routes
  if (profile.role === 'seeker' && requiredRole === 'seeker') {
    return <>{children}</>;
  }

  // Redirect mismatched roles to their home
  if (profile.role === 'coach') {
    return <Navigate to="/coaching" replace />;
  }
  return <Navigate to="/seeker/home" replace />;
};

export default AuthGuard;
