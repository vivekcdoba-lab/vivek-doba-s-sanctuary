import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Home, Sun, ClipboardList, TrendingUp, Sparkles, User, Bell, Flame, Moon } from 'lucide-react';

const tabs = [
  { icon: Home, label: 'Home', path: '/seeker/home' },
  { icon: Sun, label: 'Log', path: '/seeker/daily-log' },
  { icon: ClipboardList, label: 'Tasks', path: '/seeker/tasks' },
  { icon: TrendingUp, label: 'Growth', path: '/seeker/growth' },
  { icon: Sparkles, label: 'Sacred', path: '/seeker/sacred-space' },
  { icon: User, label: 'Profile', path: '/seeker/profile' },
];

const SeekerLayout = () => {
  const location = useLocation();
  const { user, logout, darkMode, toggleDarkMode } = useAuthStore();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border h-14 flex items-center px-4 justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full gradient-hero flex items-center justify-center">
            <span className="text-xs font-bold text-primary-foreground">VD</span>
          </div>
          <span className="font-semibold text-sm text-primary">VDTS</span>
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-medium ml-2">👤 Seeker</span>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm">
            <Flame className="w-4 h-4 text-saffron pulse-fire" />
            <span className="font-semibold text-foreground">15</span>
          </div>
          <button className="relative p-2 rounded-lg hover:bg-muted">
            <Bell className="w-4 h-4 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-destructive" />
          </button>
          <button onClick={toggleDarkMode} className="p-2 rounded-lg hover:bg-muted">
            {darkMode ? <Sun className="w-4 h-4 text-muted-foreground" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
          </button>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 pb-20 lg:pb-4 overflow-y-auto">
        <Outlet />
      </main>

      {/* Bottom Tab Bar (mobile) / Top nav bar concept handled by tabs */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-background border-t border-border shadow-lg lg:hidden">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {tabs.map((tab) => (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors ${
                isActive(tab.path) ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Desktop top nav */}
      <nav className="hidden lg:flex fixed bottom-0 left-0 right-0 z-30 bg-background border-t border-border">
        <div className="flex items-center justify-center gap-6 h-14 max-w-2xl mx-auto">
          {tabs.map((tab) => (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                isActive(tab.path) ? 'text-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default SeekerLayout;
