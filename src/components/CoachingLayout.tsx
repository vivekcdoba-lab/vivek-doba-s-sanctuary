import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, createContext, useContext } from 'react';
import { useAuthStore } from '@/store/authStore';
import NotificationBell from '@/components/NotificationBell';
import PasswordRotationBanner from '@/components/PasswordRotationBanner';
import { useSessionHeartbeat } from '@/hooks/useSessionHeartbeat';
import {
  LayoutDashboard, Users, ClipboardList, CalendarDays, BookOpen,
  TrendingUp, LogOut, Menu, ChevronDown, Moon, Sun, Search,
  ChevronRight, PanelLeftClose, PanelLeft, ScrollText, BarChart3,
  AlertTriangle, CheckCircle, Eye, UserPlus, Video, FileText,
  Target, MessageSquare, Megaphone, PieChart, Building2, Settings,
  Flame, Brain
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type Lang = 'en' | 'hi';
const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: 'en', setLang: () => {} });
export const useCoachingLang = () => useContext(LangContext);

type NavItem = { icon: any; label: string; path: string };
type NavGroup = { label: string; emoji: string; items: NavItem[]; dividerBefore?: string };

const coachNav: NavGroup[] = [
  {
    label: 'DASHBOARD', emoji: '🏠', items: [
      { icon: LayoutDashboard, label: 'Overview', path: '/coaching' },
    ],
  },
  {
    label: 'SEEKERS', emoji: '👥', dividerBefore: 'MY SEEKERS', items: [
      { icon: Users, label: 'All Seekers', path: '/coaching/seekers' },
      { icon: Flame, label: 'Active Now', path: '/coaching/seekers-active' },
      { icon: AlertTriangle, label: 'Needs Attention', path: '/coaching/seekers-attention' },
      { icon: CheckCircle, label: 'On Track', path: '/coaching/seekers-ontrack' },
      { icon: Eye, label: 'Search Seeker', path: '/coaching/seekers-search' },
    ],
  },
  {
    label: 'WORKSHEET REVIEWS', emoji: '📝', items: [
      { icon: ClipboardList, label: 'Pending Reviews', path: '/coaching/worksheet-pending' },
      { icon: CheckCircle, label: 'Reviewed Today', path: '/coaching/worksheet-reviewed' },
      { icon: BarChart3, label: 'Completion Stats', path: '/coaching/worksheet-stats' },
      { icon: AlertTriangle, label: 'Missed Worksheets', path: '/coaching/worksheet-missed' },
    ],
  },
  {
    label: 'SESSIONS', emoji: '📚', items: [
      { icon: CalendarDays, label: 'Calendar View', path: '/coaching/planner' },
      { icon: UserPlus, label: 'Schedule Session', path: '/coaching/schedule' },
      { icon: Video, label: "Today's Sessions", path: '/coaching/today-sessions' },
      { icon: FileText, label: 'Session Notes', path: '/coaching/sessions' },
      { icon: BookOpen, label: 'Past Sessions', path: '/coaching/past-sessions' },
      { icon: BarChart3, label: 'Session Analytics', path: '/coaching/session-analytics' },
    ],
  },
  {
    label: 'ASSIGNMENTS', emoji: '✅', items: [
      { icon: UserPlus, label: 'Create Assignment', path: '/coaching/create-assignment' },
      { icon: ClipboardList, label: 'Assigned Tasks', path: '/coaching/homework' },
      { icon: ScrollText, label: 'Pending Submissions', path: '/coaching/pending-submissions' },
      { icon: CheckCircle, label: 'Reviewed', path: '/coaching/reviewed' },
      { icon: BarChart3, label: 'Completion Rate', path: '/coaching/completion-rate' },
    ],
  },
  {
    label: 'ASSESSMENTS', emoji: '📊', items: [
      { icon: BarChart3, label: 'Seeker Assessments', path: '/coaching/firo-b' },
      { icon: Brain, label: 'Assessment Dashboard', path: '/coaching/seeker-assessments' },
      { icon: PieChart, label: 'Assessment Analytics', path: '/coaching/assessment-analytics' },
      { icon: TrendingUp, label: 'Progress Comparison', path: '/coaching/progress' },
      { icon: FileText, label: 'Generate Reports', path: '/coaching/generate-reports' },
    ],
  },
  {
    label: 'BUSINESS REVIEWS', emoji: '💼', dividerBefore: 'ARTHA COACHING', items: [
      { icon: Building2, label: 'Seeker Businesses', path: '/coaching/businesses' },
      { icon: BarChart3, label: 'SWOT Reviews', path: '/coaching/swot-reviews' },
      { icon: TrendingUp, label: 'Department Health', path: '/coaching/dept-health' },
      { icon: FileText, label: 'Business Notes', path: '/coaching/business-notes' },
    ],
  },
  {
    label: 'MESSAGES', emoji: '💬', dividerBefore: 'COMMUNICATION', items: [
      { icon: MessageSquare, label: 'All Conversations', path: '/coaching/messages' },
      { icon: FileText, label: 'Message Templates', path: '/coaching/templates' },
      { icon: Megaphone, label: 'Send Announcement', path: '/coaching/announcements' },
      { icon: Megaphone, label: 'Broadcast Message', path: '/coaching/broadcast' },
    ],
  },
  {
    label: 'REPORTS', emoji: '📊', items: [
      { icon: TrendingUp, label: 'Engagement Report', path: '/coaching/engagement' },
      { icon: BarChart3, label: 'Progress Report', path: '/coaching/progress-report' },
      { icon: PieChart, label: 'Artha Progress', path: '/coaching/artha-progress' },
      { icon: BarChart3, label: 'Weekly Report', path: '/coaching/weekly-report' },
      { icon: FileText, label: 'Export Data', path: '/coaching/export' },
    ],
  },
  {
    label: 'SETTINGS', emoji: '⚙️', items: [
      { icon: Settings, label: 'Settings', path: '/coaching/settings' },
    ],
  },
];

const STORAGE_KEY = 'coach_nav_expanded';

function CoachSidebar({ collapsed, onCollapse, onClose }: { collapsed: boolean; onCollapse?: () => void; onClose?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, logout } = useAuthStore();

  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : { DASHBOARD: true, SEEKERS: true };
    } catch { return { DASHBOARD: true, SEEKERS: true }; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expanded));
  }, [expanded]);

  const toggle = (label: string) => setExpanded(p => ({ ...p, [label]: !p[label] }));
  const isActive = (path: string) => path === '/coaching' ? location.pathname === '/coaching' : location.pathname.startsWith(path);

  const handleLogout = () => { logout(); navigate('/'); };
  const handleNavClick = () => { onClose?.(); };

  return (
    <div className="flex flex-col h-full border-r border-black/10 shadow-[2px_0_10px_rgba(0,0,0,0.05)]" style={{ background: 'linear-gradient(180deg, #FFF8F0, #FFF0E0)' }}>
      {/* Profile */}
      <div className="p-4 border-b border-border">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 rounded-full gradient-hero flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-primary-foreground">🎓</span>
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground truncate">{profile?.full_name || 'Coach'}</p>
              <p className="text-[10px] text-muted-foreground">Senior Coach 🎓</p>
              <p className="text-[9px] text-muted-foreground">12 Seekers Assigned</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {coachNav.map(group => {
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
        {onCollapse && (
          <button onClick={onCollapse} className="w-full flex items-center justify-center gap-2 p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            {!collapsed && <span className="text-xs">Collapse</span>}
          </button>
        )}
        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors">
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="text-sm">Log Out</span>}
        </button>
      </div>
    </div>
  );
}

export default function CoachingLayout() {
  const [lang, setLang] = useState<Lang>('en');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { darkMode, toggleDarkMode } = useAuthStore();
  useSessionHeartbeat();

  const sidebarWidth = collapsed ? 'w-[72px]' : 'w-[260px]';

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      <div className="min-h-screen flex w-full bg-background">
        {/* Desktop */}
        <aside className={`hidden lg:block ${sidebarWidth} transition-all duration-300 flex-shrink-0`}>
          <div className="fixed top-0 left-0 h-full" style={{ width: collapsed ? 72 : 260 }}>
            <CoachSidebar collapsed={collapsed} onCollapse={() => setCollapsed(!collapsed)} />
          </div>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-[260px] z-10 shadow-xl animate-sidebar-slide-in">
              <CoachSidebar collapsed={false} onClose={() => setSidebarOpen(false)} />
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b border-border px-4 bg-background/80 backdrop-blur-md sticky top-0 z-30 shrink-0">
            <div className="flex items-center gap-3">
              <button className="lg:hidden p-1.5" onClick={() => setSidebarOpen(true)}>
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-base font-semibold text-foreground">
                {lang === 'en' ? 'Coach Vivek Doba' : 'कोच विवेक डोबा'}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg overflow-hidden border border-border">
                {(['en', 'hi'] as const).map(l => (
                  <button key={l} onClick={() => setLang(l)}
                    className={`px-3 py-1.5 text-xs transition-colors ${lang === l ? 'bg-[hsl(var(--saffron))] text-primary-foreground font-medium' : 'bg-transparent text-muted-foreground hover:bg-muted'}`}>
                    {l === 'en' ? 'EN' : 'HI'}
                  </button>
                ))}
              </div>
              <NotificationBell />
              <button onClick={toggleDarkMode} className="p-2 rounded-lg hover:bg-muted">
                {darkMode ? <Sun className="w-4 h-4 text-muted-foreground" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
              </button>
            </div>
          </header>
          <PasswordRotationBanner />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </LangContext.Provider>
  );
}
