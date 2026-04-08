import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { NavLink } from '@/components/NavLink';
import NotificationBell from '@/components/NotificationBell';
import {
  Home, Sun, ClipboardList, TrendingUp, Sparkles, User, Bell, Flame, Moon,
  MessageSquare, CreditCard, BookOpen, Target, CalendarDays, Menu, LogOut, ScrollText
} from 'lucide-react';
import FloatingMusicButton from '@/components/FloatingMusicButton';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

const mainTabs = [
  { icon: Home, label: 'Home', path: '/seeker/home' },
  { icon: ScrollText, label: 'Daily Worksheet', path: '/seeker/worksheet' },
  { icon: Sun, label: 'Daily Log', path: '/seeker/daily-log' },
  { icon: ClipboardList, label: 'Tasks', path: '/seeker/tasks' },
  { icon: TrendingUp, label: 'Growth', path: '/seeker/growth' },
  { icon: Target, label: 'Assessments', path: '/seeker/assessments' },
  { icon: Sparkles, label: 'Sacred Space', path: '/seeker/sacred-space' },
];

const secondaryTabs = [
  { icon: BookOpen, label: 'My Journey', path: '/seeker/journey' },
  { icon: CalendarDays, label: 'Weekly Review', path: '/seeker/weekly-review' },
  { icon: MessageSquare, label: 'Messages', path: '/seeker/messages' },
  { icon: CreditCard, label: 'Payments', path: '/seeker/payments' },
  { icon: User, label: 'Profile', path: '/seeker/profile' },
];

const bottomTabs = [
  { icon: Home, label: 'Home', path: '/seeker/home' },
  { icon: Sun, label: 'Log', path: '/seeker/daily-log' },
  { icon: ClipboardList, label: 'Tasks', path: '/seeker/tasks' },
  { icon: TrendingUp, label: 'Growth', path: '/seeker/growth' },
  { icon: Sparkles, label: 'Sacred', path: '/seeker/sacred-space' },
  { icon: User, label: 'Profile', path: '/seeker/profile' },
];

function SeekerSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent className="pt-2">
        {/* Logo area */}
        <div className={`flex items-center gap-2 px-4 py-3 ${collapsed ? 'justify-center px-2' : ''}`}>
          <div className="w-8 h-8 rounded-full gradient-hero flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-primary-foreground">VD</span>
          </div>
          {!collapsed && <span className="font-semibold text-sm text-primary">VDTS</span>}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>🧭 Navigate</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainTabs.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild isActive={isActive(item.path)}>
                    <NavLink to={item.path} end className="hover:bg-muted/50" activeClassName="bg-primary/10 text-primary font-medium">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>📋 More</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryTabs.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild isActive={isActive(item.path)}>
                    <NavLink to={item.path} end className="hover:bg-muted/50" activeClassName="bg-primary/10 text-primary font-medium">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {/* Log Off */}
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} className="hover:bg-destructive/10 text-destructive cursor-pointer">
                  <LogOut className="h-4 w-4" />
                  {!collapsed && <span>Log Off</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

const SeekerLayoutInner = () => {
  const location = useLocation();
  const { profile, logout, darkMode, toggleDarkMode } = useAuthStore();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex w-full">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <SeekerSidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border h-14 flex items-center px-4 justify-between">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="hidden lg:flex" />
            <div className="lg:hidden flex items-center gap-2">
              <div className="w-8 h-8 rounded-full gradient-hero flex items-center justify-center">
                <span className="text-xs font-bold text-primary-foreground">VD</span>
              </div>
              <span className="font-semibold text-sm text-primary">VDTS</span>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-medium ml-2">👤 Seeker</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm">
              <Flame className="w-4 h-4 text-saffron pulse-fire" />
              <span className="font-semibold text-foreground">15</span>
            </div>
            <NotificationBell />
            <button onClick={toggleDarkMode} className="p-2 rounded-lg hover:bg-muted">
              {darkMode ? <Sun className="w-4 h-4 text-muted-foreground" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 pb-20 lg:pb-4 overflow-y-auto">
          <Outlet />
        </main>

        {/* Global Floating Music Button */}
        <FloatingMusicButton />

        {/* Bottom Tab Bar (mobile only) */}
        <nav className="fixed bottom-0 left-0 right-0 z-30 bg-background border-t border-border shadow-lg lg:hidden">
          <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
            {bottomTabs.map((tab) => (
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
      </div>
    </div>
  );
};

const SeekerLayout = () => {
  return (
    <SidebarProvider>
      <SeekerLayoutInner />
    </SidebarProvider>
  );
};

export default SeekerLayout;
