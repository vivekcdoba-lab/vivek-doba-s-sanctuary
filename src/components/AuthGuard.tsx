import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole: 'admin' | 'seeker';
}

const AuthGuard = ({ children, requiredRole }: AuthGuardProps) => {
  const { isAuthenticated, profile, loading, sessionId, logout } = useAuthStore();

  useEffect(() => {
    // If Supabase token is valid but no tracked session exists, force logout
    if (!loading && isAuthenticated && !sessionId) {
      logout();
    }
  }, [loading, isAuthenticated, sessionId, logout]);

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

  // Also redirect if no sessionId (will be caught by useEffect above)
  if (!sessionId) {
    return <Navigate to="/login" replace />;
  }

  if (profile.role !== requiredRole && profile.role !== 'admin') {
    return <Navigate to="/seeker/home" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
