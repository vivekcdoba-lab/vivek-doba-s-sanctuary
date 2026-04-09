import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole: 'admin' | 'seeker' | 'coach';
}

const AuthGuard = ({ children, requiredRole }: AuthGuardProps) => {
  const { isAuthenticated, profile, loading, sessionId } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-2xl px-6 space-y-5 animate-fade-in">
          <div className="skeleton h-24 rounded-2xl" />
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map(i => <div key={i} className="skeleton h-20 rounded-xl" />)}
          </div>
          <div className="skeleton h-16 rounded-xl" />
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton h-20 rounded-xl" />)}
          </div>
          <div className="skeleton h-40 rounded-xl" />
        </div>
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
