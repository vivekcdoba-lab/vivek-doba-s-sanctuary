import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import NotificationBell from '@/components/NotificationBell';
import { useStreakCount } from '@/hooks/useStreakCount';
import FloatingMusicButton from '@/components/FloatingMusicButton';
import { useSessionHeartbeat } from '@/hooks/useSessionHeartbeat';
import {
  Home, ScrollText, BarChart3, Sun, ClipboardList, TrendingUp, Target, Sparkles,
  BookOpen, CalendarDays, MessageSquare, CreditCard, User, Flame, Moon,
  Menu, X, LogOut, ChevronDown, ChevronLeft, Settings, Bell, Lock, HelpCircle,
  Video, Headphones, FileText, Bookmark, Volume2, Trophy, Medal, Star,
  Heart, Users, Smile, Sunrise, Brain, Compass, Building2, Eye, BarChart,
  Megaphone, Palette, Briefcase, DollarSign, Banknote, UsersRound, Microscope,
  Award, PanelLeftClose, PanelLeft, Clock
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type NavItem = { icon: any; label: string; path: string };
type NavGroup = { label: string; emoji: string; items: NavItem[]; dividerBefore?: string };

const seekerNav: NavGroup[] = [
  {
    label: 'HOME', emoji: '🏠', items: [
      { icon: Home, label: 'Dashboard', path: '/seeker/home' },
      { icon: Compass, label: 'My Journey', path: '/seeker/transformation' },
    ],
  },
  {
    label: 'DAILY PRACTICE', emoji: '📝', dividerBefore: 'MY JOURNEY', items: [
      { icon: ScrollText, label: "Today's Worksheet", path: '/seeker/worksheet' },
      { icon: Clock, label: 'Time Sheet', path: '/seeker/timesheet' },
      { icon: Target, label: 'Challenges', path: '/seeker/challenges' },
      { icon: BarChart3, label: 'Worksheet History', path: '/seeker/worksheet-history' },
      { icon: Flame, label: 'My Streaks', path: '/seeker/streaks' },
      { icon: Star, label: 'Weekly Review', path: '/seeker/weekly-review' },
      { icon: Heart, label: 'Gratitude Wall', path: '/seeker/gratitude-wall' },
      { icon: Trophy, label: 'Win Journal', path: '/seeker/win-journal' },
    ],
  },
  {
    label: 'ASSESSMENTS', emoji: '📋', items: [
      // { icon: BarChart3, label: 'My Assessments', path: '/seeker/assessments' }, // hidden for now
      { icon: Target, label: 'Wheel of Life', path: '/seeker/assessments/wheel-of-life' },
      { icon: ClipboardList, label: 'SWOT Analysis', path: '/seeker/assessments/swot' },
      { icon: TrendingUp, label: 'LGT Dimension', path: '/seeker/assessments/lgt' },
      { icon: Sparkles, label: 'Purusharthas', path: '/seeker/assessments/purusharthas' },
      { icon: Smile, label: 'Happiness Index', path: '/seeker/assessments/happiness' },
      { icon: Brain, label: 'MOOCH Patterns', path: '/seeker/assessments/mooch' },
      { icon: Users, label: 'FIRO-B', path: '/seeker/assessments/firo-b' },
      { icon: ScrollText, label: 'Assessment History', path: '/seeker/assessments/history' },
      { icon: Brain, label: 'Personality Type', path: '/seeker/personality' },
      { icon: BarChart3, label: 'My Progress Charts', path: '/seeker/progress-charts' },
    ],
  },
  {
    label: 'SESSIONS', emoji: '📚', items: [
      { icon: CalendarDays, label: 'Upcoming Sessions', path: '/seeker/upcoming-sessions' },
      { icon: Video, label: 'Join Live Session', path: '/seeker/live-session' },
      { icon: ClipboardList, label: 'Session Notes', path: '/seeker/session-notes' },
      { icon: BookOpen, label: 'Session History', path: '/seeker/session-history' },
      { icon: Star, label: 'Give Feedback', path: '/seeker/feedback' },
    ],
  },
  {
    label: 'ASSIGNMENTS', emoji: '✅', items: [
      { icon: ClipboardList, label: 'Pending Tasks', path: '/seeker/tasks' },
      { icon: Target, label: 'Completed Tasks', path: '/seeker/completed-tasks' },
      { icon: FileText, label: 'Submit Assignment', path: '/seeker/submit-assignment' },
      { icon: MessageSquare, label: 'Coach Feedback', path: '/seeker/coach-feedback' },
    ],
  },
  {
    label: 'DHARMA (Purpose)', emoji: '🕉️', dividerBefore: 'PURUSHAARTH', items: [
      { icon: Target, label: 'My Mission', path: '/seeker/dharma/mission' },
      { icon: Sparkles, label: 'My Values', path: '/seeker/dharma/values' },
      { icon: BookOpen, label: 'Dharma Journal', path: '/seeker/dharma/journal' },
      { icon: Sunrise, label: 'Daily Practices', path: '/seeker/dharma/practices' },
      { icon: Compass, label: 'IKIGAI Discovery', path: '/seeker/dharma/ikigai' },
    ],
  },
  {
    label: 'ARTHA (Business)', emoji: '💰', items: [
      { icon: Building2, label: 'Business Profile', path: '/seeker/artha/profile' },
      { icon: Eye, label: 'Vision & Mission', path: '/seeker/artha/vision' },
      { icon: Heart, label: 'Core Values', path: '/seeker/artha/values' },
      { icon: BarChart3, label: 'SWOT Analysis', path: '/seeker/artha/swot' },
      { icon: Megaphone, label: 'Marketing Strategy', path: '/seeker/artha/marketing' },
      { icon: Palette, label: 'Branding Strategy', path: '/seeker/artha/branding' },
      { icon: Briefcase, label: 'Sales Strategy', path: '/seeker/artha/sales' },
      { icon: DollarSign, label: 'Accounting & Finance', path: '/seeker/artha/accounting' },
      { icon: Banknote, label: 'Cash Flow Tracker', path: '/seeker/artha/cashflow' },
      { icon: UsersRound, label: 'Team Building', path: '/seeker/artha/team' },
      { icon: Microscope, label: 'R&D / Innovation', path: '/seeker/artha/rnd' },
      { icon: Smile, label: 'Client Satisfaction', path: '/seeker/artha/satisfaction' },
      { icon: Trophy, label: 'Competitor Analysis', path: '/seeker/artha/competitors' },
      { icon: TrendingUp, label: 'Department Health', path: '/seeker/artha/departments' },
      { icon: BarChart, label: 'Business Dashboard', path: '/seeker/artha/dashboard' },
    ],
  },
  {
    label: 'KAMA (Relationships)', emoji: '❤️', items: [
      { icon: Heart, label: 'Relationship Goals', path: '/seeker/kama/goals' },
      { icon: Users, label: 'Family Harmony', path: '/seeker/kama/family' },
      { icon: UsersRound, label: 'Social Connections', path: '/seeker/kama/social' },
      { icon: Smile, label: 'Desire Fulfillment', path: '/seeker/kama/desires' },
      { icon: Heart, label: 'Relationship Tracker', path: '/seeker/kama/relationships' },
    ],
  },
  {
    label: 'MOKSHA (Liberation)', emoji: '☀️', items: [
      { icon: Sunrise, label: 'Meditation Practice', path: '/seeker/moksha/meditation' },
      { icon: Clock, label: 'Meditation Timer', path: '/seeker/moksha/meditation-timer' },
      { icon: Compass, label: 'Spiritual Goals', path: '/seeker/moksha/goals' },
      { icon: BookOpen, label: 'Inner Peace Journal', path: '/seeker/moksha/journal' },
      { icon: Sparkles, label: 'Consciousness Growth', path: '/seeker/moksha/consciousness' },
    ],
  },
  {
    label: 'LEARNING', emoji: '📚', dividerBefore: 'RESOURCES', items: [
      { icon: Video, label: 'Video Library', path: '/seeker/learning/videos' },
      { icon: Headphones, label: 'Audio Meditations', path: '/seeker/learning/audio' },
      { icon: FileText, label: 'PDF Resources', path: '/seeker/learning/pdfs' },
      { icon: BookOpen, label: 'Frameworks & Models', path: '/seeker/learning/frameworks' },
      { icon: Bookmark, label: 'My Bookmarks', path: '/seeker/learning/bookmarks' },
    ],
  },
  {
    label: 'AMBIENT SOUNDS', emoji: '🎧', items: [
      { icon: Volume2, label: 'Sound Player', path: '/seeker/sacred-space' },
    ],
  },
  {
    label: 'MESSAGES', emoji: '💬', items: [
      { icon: MessageSquare, label: 'Chat with Coach', path: '/seeker/messages' },
      { icon: Megaphone, label: 'Announcements', path: '/seeker/announcements' },
    ],
  },
  {
    label: 'ACHIEVEMENTS', emoji: '🏆', items: [
      { icon: Medal, label: 'My Badges', path: '/seeker/badges' },
      { icon: Star, label: 'Points & Levels', path: '/seeker/points' },
      { icon: Trophy, label: 'Leaderboard', path: '/seeker/leaderboard' },
    ],
  },
  {
    label: 'SETTINGS', emoji: '⚙️', items: [
      { icon: User, label: 'My Profile', path: '/seeker/profile' },
      { icon: Bell, label: 'Notifications', path: '/seeker/notifications' },
      { icon: Lock, label: 'Privacy', path: '/seeker/privacy-settings' },
      { icon: HelpCircle, label: 'Help & Support', path: '/seeker/help' },
    ],
  },
];

const STORAGE_KEY = 'seeker_nav_expanded';

function SeekerSidebar({ collapsed, onCollapse, onClose }: { collapsed: boolean; onCollapse?: () => void; onClose?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, logout } = useAuthStore();
  const { data: streak = 0 } = useStreakCount(profile?.id || null);

  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : { HOME: true, 'DAILY PRACTICE': true };
    } catch { return { HOME: true, 'DAILY PRACTICE': true }; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expanded));
  }, [expanded]);

  const toggle = (label: string) => setExpanded(p => ({ ...p, [label]: !p[label] }));
  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => { logout(); navigate('/'); };
  const handleNavClick = () => { onClose?.(); };

  return (
    <div className="flex flex-col h-full border-r border-black/10 shadow-[2px_0_10px_rgba(0,0,0,0.05)]" style={{ background: 'linear-gradient(180deg, #FFF8F0, #FFF0E0)' }}>
      <style>{`.dark .sidebar-container { background: linear-gradient(180deg, hsl(260,50%,12%), hsl(260,50%,10%)) !important; }`}</style>
      {/* Profile Section */}
      <div className="p-4 border-b border-border">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 rounded-full gradient-hero flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-primary-foreground">
              {(profile?.full_name || 'S')[0].toUpperCase()}
            </span>
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground truncate">{profile?.full_name || 'Seeker'}</p>
              <p className="text-[10px] text-muted-foreground">LGT Platinum 🏆</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-[hsl(var(--saffron))] rounded-full" style={{ width: '25%' }} />
                </div>
                <span className="text-[9px] text-muted-foreground">Day 45/180</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Flame className="w-3 h-3 text-[hsl(var(--saffron))] pulse-fire" />
                <span className="text-[10px] font-semibold text-foreground">{streak} Day Streak</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {seekerNav.map((group, gi) => {
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
              {/* Group header */}
              {collapsed ? (
                <div className="py-1">
                  {group.items.map(item => (
                    <Tooltip key={item.path}>
                      <TooltipTrigger asChild>
                        <Link
                          to={item.path}
                          onClick={handleNavClick}
                          className={`flex items-center justify-center p-2.5 rounded-lg transition-all ${
                            isActive(item.path)
                              ? 'bg-[#FF6B00] text-white'
                              : 'text-muted-foreground hover:bg-[#FFE5CC]'
                          }`}
                        >
                          <item.icon className="w-4 h-4" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right"><p>{item.label}</p></TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              ) : (
                <>
                  <button
                    onClick={() => toggle(group.label)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[10px] font-semibold tracking-[0.15em] uppercase text-[#999] hover:text-foreground transition-colors"
                  >
                    <span>{group.emoji}</span>
                    <span className="flex-1 text-left">{group.label}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-90'}`} />
                  </button>
                  {isExpanded && (
                    <div className="space-y-0.5 ml-1">
                      {group.items.map(item => (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={handleNavClick}
                          className={`flex items-center gap-2.5 px-4 py-2.5 h-11 rounded-lg text-sm transition-all ${
                            isActive(item.path)
                              ? 'bg-[#FF6B00] text-white font-medium border-l-4 border-[#FF6B00]'
                              : 'text-muted-foreground hover:bg-[#FFE5CC] hover:text-foreground'
                          }`}
                        >
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

      {/* Bottom: Collapse toggle + logout */}
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

const bottomTabs = [
  { icon: Home, label: 'Home', path: '/seeker/home' },
  { icon: Sun, label: 'Log', path: '/seeker/worksheet' },
  { icon: ClipboardList, label: 'Tasks', path: '/seeker/tasks' },
  { icon: TrendingUp, label: 'Growth', path: '/seeker/growth' },
  { icon: User, label: 'Profile', path: '/seeker/profile' },
];

const SeekerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { profile, darkMode, toggleDarkMode } = useAuthStore();
  const { data: streak = 0 } = useStreakCount(profile?.id || null);
  useSessionHeartbeat();

  const isActive = (path: string) => location.pathname === path;
  const sidebarWidth = collapsed ? 'w-[72px]' : 'w-[260px]';

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:block ${sidebarWidth} transition-all duration-300 flex-shrink-0`}>
        <div className="fixed top-0 left-0 h-full" style={{ width: collapsed ? 72 : 260 }}>
          <SeekerSidebar collapsed={collapsed} onCollapse={() => setCollapsed(!collapsed)} />
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[260px] z-10 shadow-xl animate-sidebar-slide-in">
            <SeekerSidebar collapsed={false} onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border h-14 flex items-center px-4 justify-between">
          <div className="flex items-center gap-2">
            <button className="lg:hidden p-1.5" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <div className="lg:hidden flex items-center gap-2">
              <div className="w-8 h-8 rounded-full gradient-hero flex items-center justify-center">
                <span className="text-xs font-bold text-primary-foreground">VD</span>
              </div>
              <span className="font-semibold text-sm text-primary">VDTS</span>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-medium ml-2">
              👤 Seeker - {profile?.full_name || 'Seeker'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm">
              <Flame className="w-4 h-4 text-[hsl(var(--saffron))]" />
              <span className="font-semibold text-foreground">{streak}</span>
            </div>
            <NotificationBell />
            <button onClick={toggleDarkMode} className="p-2 rounded-lg hover:bg-muted">
              {darkMode ? <Sun className="w-4 h-4 text-muted-foreground" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
            </button>
          </div>
        </header>

        <main className="flex-1 pb-20 lg:pb-4 overflow-y-auto">
          <Outlet />
        </main>

        <FloatingMusicButton />

        {/* Mobile bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-30 bg-background border-t border-border shadow-lg lg:hidden">
          <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
            {bottomTabs.map((tab) => (
              <Link key={tab.path} to={tab.path} className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors ${isActive(tab.path) ? 'text-[hsl(var(--saffron))]' : 'text-muted-foreground'}`}>
                <tab.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default SeekerLayout;
