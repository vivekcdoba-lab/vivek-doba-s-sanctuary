import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Home, Sunrise, ClipboardList, TrendingUp, Sparkles, User, Bell, Flame, LogOut, Sun, Moon } from 'lucide-react';

const tabs = [
  { icon: Home, label: 'Home', path: '/seeker/home' },
  { icon: Sunrise, label: 'Log', path: '/seeker/daily-log' },
  { icon: ClipboardList, label: 'Tasks', path: '/seeker/tasks' },
  { icon: TrendingUp, label: 'Growth', path: '/seeker/growth' },
  { icon: Sparkles, label: 'Sacred', path: '/seeker/sacred-space' },
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
          <span className="font-semibold text-sm text-foreground">VDTS</span>
        </div>

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
          <Link to="/seeker/profile" className="p-2 rounded-lg hover:bg-muted">
            <User className="w-4 h-4 text-muted-foreground" />
          </Link>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 pb-20 overflow-y-auto">
        <Outlet />
      </main>

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-md border-t border-border">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {tabs.map((tab) => (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
                isActive(tab.path) ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default SeekerLayout;
