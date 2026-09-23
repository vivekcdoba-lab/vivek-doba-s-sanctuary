import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import PublicSeo from "@/components/public/PublicSeo";

const NotFound = () => {
  const location = useLocation();
  const { isAuthenticated, profile } = useAuthStore();

  const homeLink = isAuthenticated
    ? profile?.role === 'admin' ? '/dashboard' : '/seeker/home'
    : '/';

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <PublicSeo title="Page Not Found | Vivek Doba" description="The requested page could not be found." path={location.pathname} noindex />
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <p className="text-xl text-muted-foreground">Page not found</p>
        <p className="text-sm text-muted-foreground">The page you're looking for doesn't exist.</p>
        <div className="flex flex-wrap justify-center gap-3"><Link to={homeLink} className="inline-block px-6 py-2.5 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity">Go to {isAuthenticated ? 'Dashboard' : 'Home'}</Link>{!isAuthenticated && <><Link to="/courses" className="inline-block px-6 py-2.5 rounded-md border border-border font-medium">Courses</Link><Link to="/contact" className="inline-block px-6 py-2.5 rounded-md border border-border font-medium">Contact</Link></>}</div>
      </div>
    </div>
  );
};

export default NotFound;
