import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

const NotFound = () => {
  const location = useLocation();
  const { isAuthenticated, profile } = useAuthStore();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const homeLink = isAuthenticated
    ? profile?.role === 'admin' ? '/dashboard' : '/seeker/home'
    : '/';

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <p className="text-xl text-muted-foreground">Page not found</p>
        <p className="text-sm text-muted-foreground">The page you're looking for doesn't exist.</p>
        <Link to={homeLink} className="inline-block px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity">
          Go to {isAuthenticated ? 'Dashboard' : 'Home'}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
