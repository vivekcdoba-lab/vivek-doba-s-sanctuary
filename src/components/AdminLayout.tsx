import { useState, createContext, useContext, useCallback } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import NotificationBell from '@/components/NotificationBell';
import {
  LayoutDashboard, Users, Target, BookOpen, CalendarDays, Calendar,
  ClipboardList, BarChart3, Sun, TrendingUp, RefreshCw, IndianRupee,
  MessageSquare, FolderOpen, PieChart, Settings, LogOut, Moon,
  Menu, X, Bell, Search, ChevronRight, Inbox, ScrollText
} from 'lucide-react';

const navGroups = [
  {
    label: 'MAIN', items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
      { icon: Sun, label: "Coach's Day", path: '/coach-day' },
      { icon: Users, label: 'Seekers', path: '/seekers' },
      { icon: Target, label: 'Leads', path: '/leads' },
      { icon: Inbox, label: 'Applications', path: '/applications', badge: true },
    ]
  },
  {
    label: 'PROGRAMS', items: [
      { icon: BookOpen, label: 'Courses', path: '/courses' },
      { icon: CalendarDays, label: 'Sessions', path: '/sessions' },
      { icon: ScrollText, label: 'Session Templates', path: '/session-templates' },
      { icon: Calendar, label: 'Calendar', path: '/calendar' },
    ]
  },
  {
    label: 'TRANSFORMATION', items: [
      { icon: ScrollText, label: 'Worksheet Analytics', path: '/worksheet-analytics' },
      { icon: ClipboardList, label: 'Assignments', path: '/assignments' },
      { icon: BarChart3, label: 'Assessments', path: '/assessments' },
      { icon: Sun, label: 'Daily Tracking', path: '/daily-tracking' },
      { icon: TrendingUp, label: 'Growth Matrix', path: '/growth-matrix' },
    ]
  },
  {
    label: 'OPERATIONS', items: [
      { icon: RefreshCw, label: 'Follow-ups', path: '/follow-ups' },
      { icon: IndianRupee, label: 'Payments', path: '/payments' },
      { icon: MessageSquare, label: 'Messages', path: '/messages' },
      { icon: FolderOpen, label: 'Resources', path: '/resources' },
      { icon: PieChart, label: 'Reports', path: '/reports' },
      { icon: Settings, label: 'Settings', path: '/settings' },
    ]
  },
];

// Context so child pages can override breadcrumb segments (e.g. replace a UUID with a name)
export const BreadcrumbOverrideContext = createContext<{
  overrides: Record<string, string>;
  setOverride: (segment: string, label: string) => void;
}>({ overrides: {}, setOverride: () => {} });

export const useBreadcrumbOverride = () => useContext(BreadcrumbOverrideContext);

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [breadcrumbOverrides, setBreadcrumbOverrides] = useState<Record<string, string>>({});
  const location = useLocation();
  const { profile, logout, darkMode, toggleDarkMode } = useAuthStore();

  const setOverride = useCallback((segment: string, label: string) => {
    setBreadcrumbOverrides(prev => prev[segment] === label ? prev : { ...prev, [segment]: label });
  }, []);

  const isActive = (path: string) => location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path + '/'));

  // Replace UUID-looking segments with override labels
  const isUUID = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
  const breadcrumbs = location.pathname.split('/').filter(Boolean).map((seg) => {
    if (breadcrumbOverrides[seg]) return breadcrumbOverrides[seg];
    if (isUUID(seg)) return '...';
    return seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ');
  });

  const sidebarWidth = collapsed ? 'w-[72px]' : 'w-[260px]';

  const SidebarContent = () => (
    <div className="flex flex-col h-full gradient-maroon text-sidebar-foreground">
      {/* Logo */}
      <Link to="/" className="p-4 flex items-center gap-3 border-b border-sidebar-border hover:bg-primary/10 transition-colors">
        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mandala-border">
          <div className="w-full h-full rounded-full bg-primary/30 flex items-center justify-center">
            <span className="text-sm font-bold text-primary-foreground">VD</span>
          </div>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-semibold text-primary-foreground truncate">Vivek Doba</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">Training Solutions</p>
          </div>
        )}
      </Link>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && <p className="text-[10px] font-semibold tracking-wider text-primary/80 px-3 mb-1.5">{group.label}</p>}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                    isActive(item.path)
                      ? 'bg-primary/20 text-primary border-l-[3px] border-primary'
                      : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50'
                  }`}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-sidebar-border space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-primary-foreground">VD</span>
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-primary-foreground truncate">{profile?.full_name || 'Coach'}</p>
              <p className="text-[10px] text-sidebar-foreground/60">Coach</p>
            </div>
          )}
        </div>
        <div className="flex gap-1">
          <button onClick={toggleDarkMode} className="flex-1 p-1.5 rounded-md text-sidebar-foreground/60 hover:bg-sidebar-accent/50 transition-colors">
            {darkMode ? <Sun className="w-4 h-4 mx-auto" /> : <Moon className="w-4 h-4 mx-auto" />}
          </button>
          <button onClick={() => { logout().then(() => window.location.href = '/login'); }} className="flex-1 p-1.5 rounded-md text-sidebar-foreground/60 hover:bg-sidebar-accent/50 transition-colors">
            <LogOut className="w-4 h-4 mx-auto" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:block ${sidebarWidth} transition-all duration-300 flex-shrink-0`}>
        <div className="fixed top-0 left-0 h-full" style={{ width: collapsed ? 72 : 260 }}>
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[260px] z-10">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border h-14 flex items-center px-4 gap-3">
          <button className="lg:hidden p-1.5" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <button className="hidden lg:block p-1.5 text-muted-foreground hover:text-foreground" onClick={() => setCollapsed(!collapsed)}>
            <Menu className="w-4 h-4" />
          </button>

          {/* Breadcrumbs */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="w-3 h-3 text-primary" />}
                <span className={i === breadcrumbs.length - 1 ? 'text-foreground font-medium' : ''}>{crumb}</span>
              </span>
            ))}
          </div>

          <div className="flex-1" />

          {/* Role Badge */}
          <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
            👤 Coach
          </span>

          {/* Search */}
          <div className="hidden md:flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input placeholder="Search... (Ctrl+K)" className="bg-transparent text-sm outline-none w-40 placeholder:text-muted-foreground/60" />
          </div>

          {/* Notifications */}
          <NotificationBell />
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
