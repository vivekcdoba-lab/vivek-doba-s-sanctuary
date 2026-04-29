import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useSessionHeartbeat } from '@/hooks/useSessionHeartbeat';
import { useAuthStore } from '@/store/authStore';
import NotificationBell from '@/components/NotificationBell';
import PasswordRotationBanner from '@/components/PasswordRotationBanner';
import {
  LayoutDashboard, Users, Target, BookOpen, CalendarDays, Calendar,
  ClipboardList, BarChart3, Sun, TrendingUp, RefreshCw, IndianRupee,
  MessageSquare, FolderOpen, PieChart, Settings, LogOut, Moon,
  Menu, ChevronRight, ChevronDown, Inbox, ScrollText, Monitor,
  UserPlus, Crown, Search as SearchIcon, FileText, CheckCircle,
  Megaphone, Video, Headphones, Building2, Trophy, Award,
  PanelLeftClose, PanelLeft, Shield, Bell, Link2, Database, Palette,
  DollarSign, UserCheck, RotateCcw, Banknote, CreditCard, Mail
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type NavItem = { icon: any; label: string; path: string };
type NavGroup = { label: string; emoji: string; items: NavItem[]; dividerBefore?: string };

const adminNav: NavGroup[] = [
  {
    label: 'DASHBOARD', emoji: '🏠', items: [
      { icon: LayoutDashboard, label: 'Master Overview', path: '/dashboard' },
      { icon: Sun, label: "Coach's Day", path: '/coach-day' },
    ],
  },
  {
    label: 'USERS', emoji: '👥', dividerBefore: 'USER MANAGEMENT', items: [
      { icon: Users, label: 'All Seekers', path: '/seekers' },
      { icon: Crown, label: 'All Coaches', path: '/admin/coaches' },
      { icon: Link2, label: 'Linked Profiles', path: '/admin/linked-profiles' },
      { icon: UserCheck, label: 'Coach ↔ Seeker', path: '/admin/coach-seekers' },
      { icon: Shield, label: 'Admins', path: '/admin/admins' },
      { icon: UserPlus, label: 'Add User', path: '/admin/add-user' },
      { icon: BarChart3, label: 'User Analytics', path: '/admin/user-analytics' },
      { icon: SearchIcon, label: 'Search Users', path: '/admin/search-users' },
    ],
  },
  {
    label: 'PROGRAMS', emoji: '📚', items: [
      { icon: BookOpen, label: 'All Programs', path: '/courses' },
      { icon: UserPlus, label: 'Create Program', path: '/admin/create-program' },
      { icon: FileText, label: 'Edit Programs', path: '/admin/edit-programs' },
      { icon: Crown, label: 'Program Coaches', path: '/admin/program-coaches' },
      { icon: BarChart3, label: 'Program Analytics', path: '/admin/program-analytics' },
    ],
  },
  {
    label: 'ENROLLMENTS', emoji: '📝', items: [
      { icon: Inbox, label: 'Applications Review', path: '/applications' },
      { icon: CheckCircle, label: 'All Enrollments', path: '/admin/enrollments' },
      { icon: UserPlus, label: 'New Enrollment', path: '/admin/new-enrollment' },
      { icon: ClipboardList, label: 'LGT Application (In-Person)', path: '/admin/apply-lgt' },
      { icon: Users, label: 'Batch Management', path: '/admin/batches' },
      { icon: BarChart3, label: 'Enrollment Stats', path: '/admin/enrollment-stats' },
    ],
  },
  {
    label: 'LEADS (CRM)', emoji: '📞', dividerBefore: 'CRM & SALES', items: [
      { icon: Target, label: 'Pipeline (Kanban)', path: '/leads' },
      { icon: UserPlus, label: 'Add Lead', path: '/admin/add-lead' },
      { icon: ClipboardList, label: 'All Leads', path: '/admin/all-leads' },
      { icon: TrendingUp, label: 'Hot Leads', path: '/admin/hot-leads' },
      { icon: BarChart3, label: 'Conversion Funnel', path: '/admin/conversion-funnel' },
      { icon: PieChart, label: 'Lead Sources', path: '/admin/lead-sources' },
    ],
  },
  {
    label: 'PAYMENTS', emoji: '💰', items: [
      { icon: IndianRupee, label: 'All Payments', path: '/payments' },
      { icon: CreditCard, label: 'Record Payment', path: '/admin/record-payment' },
      { icon: FileText, label: 'Invoices', path: '/admin/invoices' },
      { icon: Banknote, label: 'Overdue', path: '/admin/overdue-payments' },
      { icon: DollarSign, label: 'Revenue Dashboard', path: '/admin/revenue' },
      { icon: FileText, label: 'Export Financials', path: '/admin/export-financials' },
    ],
  },
  {
    label: 'RESOURCES', emoji: '📚', dividerBefore: 'CONTENT', items: [
      { icon: Video, label: 'Videos', path: '/admin/videos' },
      { icon: Headphones, label: 'Audios', path: '/admin/audios' },
      { icon: FileText, label: 'Resources', path: '/resources' },
      { icon: FileText, label: 'Agreement Document Library', path: '/admin/documents' },
      { icon: UserPlus, label: 'Upload Resource', path: '/admin/upload-resource' },
      { icon: FolderOpen, label: 'Categories', path: '/admin/categories' },
    ],
  },
  {
    label: 'ASSESSMENTS', emoji: '📋', items: [
      { icon: ClipboardList, label: 'Question Bank', path: '/admin/question-bank' },
      { icon: UserPlus, label: 'Create Assessment', path: '/admin/create-assessment' },
      { icon: BarChart3, label: 'Assessment Results', path: '/assessments' },
      { icon: Settings, label: 'Configure Assessments', path: '/admin/assessments/configure' },
      { icon: PieChart, label: 'Assessment Analytics', path: '/admin/assessments/analytics' },
    ],
  },
  {
    label: 'MESSAGES', emoji: '💬', dividerBefore: 'COMMUNICATION', items: [
      { icon: MessageSquare, label: 'All Conversations', path: '/messages' },
      { icon: Megaphone, label: 'Announcements', path: '/admin/announcements' },
    ],
  },
  {
    label: 'OUR COMPANY', emoji: '🏢', dividerBefore: 'VDTS BUSINESS', items: [
      { icon: BarChart3, label: 'VDTS SWOT', path: '/swot' },
      { icon: Trophy, label: 'Competitor Analysis', path: '/admin/competitors' },
      { icon: TrendingUp, label: 'Business Metrics', path: '/admin/business-metrics' },
      { icon: Target, label: 'Strategic Goals', path: '/admin/strategic-goals' },
    ],
  },
  {
    label: 'REPORTS', emoji: '📊', dividerBefore: 'ANALYTICS', items: [
      { icon: TrendingUp, label: 'User Growth', path: '/admin/user-growth' },
      { icon: DollarSign, label: 'Revenue Analytics', path: '/reports' },
      { icon: BarChart3, label: 'Engagement Metrics', path: '/admin/engagement' },
      { icon: Award, label: 'Coach Performance', path: '/admin/coach-performance' },
      { icon: RotateCcw, label: 'Retention Analysis', path: '/admin/retention' },
      { icon: FileText, label: 'Export Reports', path: '/admin/export-reports' },
      { icon: Mail, label: 'Daily Seeker Emails', path: '/admin/daily-reports' },
    ],
  },
  {
    label: 'SYSTEM', emoji: '⚙️', dividerBefore: 'SYSTEM', items: [
      { icon: Palette, label: 'Branding', path: '/admin/branding' },
      { icon: Bell, label: 'Notifications', path: '/admin/notifications' },
      { icon: Link2, label: 'Integrations', path: '/admin/integrations' },
      { icon: ScrollText, label: 'Audit Logs', path: '/admin/audit-logs' },
      { icon: Database, label: 'Backup', path: '/admin/backup' },
      { icon: Shield, label: 'Encryption Status', path: '/admin/encryption-status' },
      { icon: Settings, label: 'Settings', path: '/settings' },
      { icon: Monitor, label: 'Active Sessions', path: '/active-sessions' },
    ],
  },
];

export const BreadcrumbOverrideContext = createContext<{
  overrides: Record<string, string>;
  setOverride: (segment: string, label: string) => void;
}>({ overrides: {}, setOverride: () => {} });

export const useBreadcrumbOverride = () => useContext(BreadcrumbOverrideContext);

const STORAGE_KEY = 'admin_nav_expanded';

function AdminSidebar({ collapsed, onCollapse, onClose }: { collapsed: boolean; onCollapse?: () => void; onClose?: () => void }) {
  const location = useLocation();
  const { profile, logout, darkMode, toggleDarkMode } = useAuthStore();

  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : { DASHBOARD: true, USERS: true };
    } catch { return { DASHBOARD: true, USERS: true }; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expanded));
  }, [expanded]);

  const toggle = (label: string) => setExpanded(p => ({ ...p, [label]: !p[label] }));
  const isActive = (path: string) => location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path + '/'));

  const handleNavClick = () => { onClose?.(); };

  return (
    <div className="flex flex-col h-full border-r border-black/10 shadow-[2px_0_10px_rgba(0,0,0,0.05)]" style={{ background: 'linear-gradient(180deg, #FFF8F0, #FFF0E0)' }}>
      {/* Profile */}
      <Link to="/" className="p-4 border-b border-border hover:bg-muted/50 transition-colors">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 rounded-full gradient-hero flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-primary-foreground">👑</span>
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground truncate">{profile?.full_name || 'Vivek Doba'}</p>
              <p className="text-[10px] text-muted-foreground">Super Admin 👑</p>
              <p className="text-[9px] text-muted-foreground">VDTS Platform</p>
            </div>
          )}
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {adminNav.map(group => {
          const isExpanded = expanded[group.label] ?? false;
          return (
            <div key={group.label}>
              {group.dividerBefore && !collapsed && (
                <div className="flex items-center gap-2 px-3 py-2 mt-4 mb-1">
                  <div className="flex-1 h-px bg-border" />
                  <span className="uppercase text-[10px] tracking-[0.15em] text-[#999] font-semibold">{group.dividerBefore}</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
              )}
              {collapsed ? (
                <div className="py-1">
                  {group.items.map(item => (
                    <Tooltip key={item.path}>
                      <TooltipTrigger asChild>
                        <Link to={item.path} onClick={handleNavClick}
                          className={`flex items-center justify-center p-2.5 rounded-lg transition-all ${isActive(item.path) ? 'bg-[#FF6B00] text-white' : 'text-muted-foreground hover:bg-[#FFE5CC]'}`}>
                          <item.icon className="w-4 h-4" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right"><p>{item.label}</p></TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              ) : (
                <>
                  <button onClick={() => toggle(group.label)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[10px] font-semibold tracking-[0.15em] uppercase text-[#999] hover:text-foreground transition-colors">
                    <span>{group.emoji}</span>
                    <span className="flex-1 text-left">{group.label}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-90'}`} />
                  </button>
                  {isExpanded && (
                    <div className="space-y-0.5 ml-1">
                      {group.items.map(item => (
                        <Link key={item.path} to={item.path} onClick={handleNavClick}
                          className={`flex items-center gap-2.5 px-4 py-2.5 h-11 rounded-lg text-sm transition-all ${isActive(item.path) ? 'bg-[#FF6B00] text-white font-medium border-l-4 border-[#FF6B00]' : 'text-muted-foreground hover:bg-[#FFE5CC] hover:text-foreground'}`}>
                          <item.icon className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-2 border-t border-border space-y-1">
        <div className="flex gap-1">
          {onCollapse && (
            <button onClick={onCollapse} className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
              {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          )}
          <button onClick={() => useAuthStore.getState().toggleDarkMode()} className="flex-1 p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            {useAuthStore.getState().darkMode ? <Sun className="w-4 h-4 mx-auto" /> : <Moon className="w-4 h-4 mx-auto" />}
          </button>
          <button onClick={() => { useAuthStore.getState().logout().then(() => window.location.href = '/login'); }} className="flex-1 p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors">
            <LogOut className="w-4 h-4 mx-auto" />
          </button>
        </div>
      </div>
    </div>
  );
}

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [breadcrumbOverrides, setBreadcrumbOverrides] = useState<Record<string, string>>({});
  const location = useLocation();
  const { profile } = useAuthStore();
  useSessionHeartbeat();

  const setOverride = useCallback((segment: string, label: string) => {
    setBreadcrumbOverrides(prev => prev[segment] === label ? prev : { ...prev, [segment]: label });
  }, []);

  const isUUID = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
  const breadcrumbs = location.pathname.split('/').filter(Boolean).map(seg => {
    if (breadcrumbOverrides[seg]) return breadcrumbOverrides[seg];
    if (isUUID(seg)) return '...';
    return seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ');
  });

  const sidebarWidth = collapsed ? 'w-[72px]' : 'w-[260px]';

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop */}
      <aside className={`hidden lg:block ${sidebarWidth} transition-all duration-300 flex-shrink-0`}>
        <div className="fixed top-0 left-0 h-full" style={{ width: collapsed ? 72 : 260 }}>
          <AdminSidebar collapsed={collapsed} onCollapse={() => setCollapsed(!collapsed)} />
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[260px] z-10 shadow-xl animate-sidebar-slide-in">
            <AdminSidebar collapsed={false} onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border h-14 flex items-center px-4 gap-3">
          <button className="lg:hidden p-1.5" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="w-3 h-3 text-primary" />}
                <span className={i === breadcrumbs.length - 1 ? 'text-foreground font-medium' : ''}>{crumb}</span>
              </span>
            ))}
          </div>

          <div className="flex-1" />

          <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">👑 Admin</span>

          <NotificationBell />
        </header>

        <PasswordRotationBanner />
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <BreadcrumbOverrideContext.Provider value={{ overrides: breadcrumbOverrides, setOverride }}>
            <Outlet />
          </BreadcrumbOverrideContext.Provider>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
