import { Outlet, useLocation } from "react-router-dom";
import { useState, createContext, useContext } from "react";
import { NavLink } from "@/components/NavLink";
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
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  UserPlus,
  FileSignature,
  Brain,
  ClipboardList,
  CalendarClock,
  BookCheck,
  TrendingUp,
} from "lucide-react";

type Lang = "en" | "hi";

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: "en",
  setLang: () => {},
});

export const useCoachingLang = () => useContext(LangContext);

const NAV_ITEMS = [
  { title: { en: "Dashboard", hi: "डैशबोर्ड" }, url: "/coaching", icon: LayoutDashboard },
  { title: { en: "Client Intake", hi: "ग्राहक प्रवेश" }, url: "/coaching/intake", icon: UserPlus },
  { title: { en: "Agreements", hi: "समझौते" }, url: "/coaching/agreements", icon: FileSignature },
  { title: { en: "FIRO-B Assessment", hi: "FIRO-B मूल्यांकन" }, url: "/coaching/firo-b", icon: Brain },
  { title: { en: "Session Notes", hi: "सत्र नोट्स" }, url: "/coaching/sessions", icon: ClipboardList },
  { title: { en: "Daily Planner", hi: "दैनिक योजना" }, url: "/coaching/planner", icon: CalendarClock },
  { title: { en: "Homework Tracker", hi: "होमवर्क ट्रैकर" }, url: "/coaching/homework", icon: BookCheck },
  { title: { en: "Progress Matrix", hi: "प्रगति मैट्रिक्स" }, url: "/coaching/progress", icon: TrendingUp },
];

function CoachingSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { lang } = useCoachingLang();

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-card">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground">
            {lang === "en" ? "Coaching Modules" : "कोचिंग मॉड्यूल"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const isActive =
                  item.url === "/coaching"
                    ? location.pathname === "/coaching"
                    : location.pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === "/coaching"}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                          isActive
                            ? "bg-[#1D9E75]/10 text-[#1D9E75] font-medium"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span>{item.title[lang]}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default function CoachingLayout() {
  const [lang, setLang] = useState<Lang>("en");

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <CoachingSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header */}
            <header className="h-14 flex items-center justify-between border-b border-border px-4 bg-card shrink-0">
              <div className="flex items-center gap-3">
                <SidebarTrigger />
                <h1 className="text-base font-semibold text-foreground">
                  {lang === "en" ? "Coach Vivek Doba" : "कोच विवेक डोबा"}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex rounded-lg overflow-hidden border border-border">
                  {(["en", "hi"] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLang(l)}
                      className={`px-3 py-1.5 text-xs transition-colors ${
                        lang === l
                          ? "bg-[#1D9E75] text-white font-medium"
                          : "bg-transparent text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {l === "en" ? "EN" : "HI"}
                    </button>
                  ))}
                </div>
              </div>
            </header>
            {/* Main content */}
            <main className="flex-1 overflow-y-auto p-4 md:p-6">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </LangContext.Provider>
  );
}
