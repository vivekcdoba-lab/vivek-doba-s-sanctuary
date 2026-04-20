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

  const isSuperAdmin = profile.role === 'admin' && profile.admin_level === 'super_admin';

  // Super admin: universal access
  if (isSuperAdmin) {
    return <>{children}</>;
  }

  // Regular admin: only admin routes
  if (profile.role === 'admin') {
    if (requiredRole === 'admin') return <>{children}</>;
    return <Navigate to="/dashboard" replace />;
  }

  // Coach: only coach routes
  if (profile.role === 'coach') {
    if (requiredRole === 'coach') return <>{children}</>;
    return <Navigate to="/coaching" replace />;
  }

  // Seeker: only seeker routes
  if (profile.role === 'seeker' && requiredRole === 'seeker') {
    return <>{children}</>;
  }
  return <Navigate to="/seeker/home" replace />;
};

export default AuthGuard;
