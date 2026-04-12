import { useCoachingLang } from "@/components/CoachingLayout";
import { useNavigate, Link } from "react-router-dom";
import { Home, Users, ClipboardList, CalendarDays, AlertTriangle, Plus, Megaphone, Star } from "lucide-react";
import { useDbSessions } from "@/hooks/useDbSessions";
import { useDbAssignments } from "@/hooks/useDbAssignments";
import { useSeekerProfiles } from "@/hooks/useSeekerProfiles";

export default function CoachingDashboard() {
  const { lang } = useCoachingLang();
  const navigate = useNavigate();

  const { data: seekers = [] } = useSeekerProfiles();
  const { data: sessions = [] } = useDbSessions();
  const { data: assignments = [] } = useDbAssignments();

  const todayStr = new Date().toISOString().split('T')[0];
  const todaySessions = sessions.filter(s => s.date === todayStr);
  const pendingWorksheets = 8; // would come from DB
  const pendingAssignmentReviews = assignments.filter(a => a.status === 'in_progress').length;
  const needsAttention = seekers.filter(s => {
    const overdue = assignments.filter(a => a.seeker_id === s.id && a.status === 'overdue');
    return overdue.length > 0;
  });

  const kpis = [
    { label: lang === "en" ? "Total Seekers" : "कुल साधक", value: seekers.length, icon: "👥", gradient: "gradient-chakravartin" },
    { label: lang === "en" ? "Pending Reviews" : "लंबित समीक्षा", value: pendingWorksheets + pendingAssignmentReviews, icon: "📝", gradient: "gradient-saffron" },
    { label: lang === "en" ? "Today's Sessions" : "आज के सत्र", value: todaySessions.length, icon: "📅", gradient: "gradient-sacred" },
    { label: lang === "en" ? "Needs Attention" : "ध्यान चाहिए", value: needsAttention.length, icon: "⚠️", gradient: "gradient-hero" },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">
          🎓 {lang === "en" ? "Coach Dashboard" : "कोच डैशबोर्ड"}
        </h1>
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <Home className="w-4 h-4" /> {lang === "en" ? "Main Dashboard" : "मुख्य डैशबोर्ड"}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-card rounded-2xl shadow-md border border-border overflow-hidden">
            <div className={`h-1.5 ${kpi.gradient}`} />
            <div className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{kpi.icon}</span>
                <span className="text-xs text-muted-foreground">{kpi.label}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Today's Sessions & Needs Attention */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-2xl shadow-md border border-border p-5">
          <h3 className="font-semibold text-foreground mb-3">📅 {lang === "en" ? "Today's Sessions" : "आज के सत्र"}</h3>
          {todaySessions.length > 0 ? (
            <div className="space-y-2">
              {todaySessions.map(s => {
                const seeker = seekers.find(sk => sk.id === s.seeker_id);
                return (
                  <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                    <div className="text-center min-w-[50px]">
                      <p className="text-sm font-bold text-foreground">{s.start_time}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{seeker?.full_name || 'Seeker'}</p>
                      <p className="text-[10px] text-muted-foreground">Session #{s.session_number}</p>
                    </div>
                    {s.location_type === 'online' && s.meeting_link && (
                      <a href={s.meeting_link} target="_blank" rel="noopener noreferrer" className="px-2 py-1 rounded-lg text-xs font-medium bg-sky-blue text-primary-foreground">Join</a>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">🧘 {lang === "en" ? "No sessions today" : "आज कोई सत्र नहीं"}</p>
          )}
        </div>

        <div className="bg-card rounded-2xl shadow-md border border-border p-5">
          <h3 className="font-semibold text-foreground mb-3">⚠️ {lang === "en" ? "Needs Attention" : "ध्यान चाहिए"}</h3>
          {needsAttention.length > 0 ? (
            <div className="space-y-2">
              {needsAttention.slice(0, 5).map(s => (
                <Link key={s.id} to={`/seekers/${s.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <span className="text-sm">🔴</span>
                  <p className="text-sm text-foreground flex-1 truncate">{s.full_name}</p>
                  <span className="text-[10px] text-destructive">Overdue tasks</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">✅ {lang === "en" ? "All seekers on track!" : "सभी साधक ट्रैक पर!"}</p>
          )}
        </div>
      </div>

      {/* Pending Reviews & Weekly Stats */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-2xl shadow-md border border-border p-5">
          <h3 className="font-semibold text-foreground mb-3">📝 {lang === "en" ? "Pending Reviews" : "लंबित समीक्षा"}</h3>
          <div className="space-y-3">
            <Link to="/coaching/worksheet-pending" className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
              <span className="text-sm text-foreground">Worksheets</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">{pendingWorksheets}</span>
            </Link>
            <Link to="/coaching/pending-submissions" className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
              <span className="text-sm text-foreground">Assignments</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">{pendingAssignmentReviews}</span>
            </Link>
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-md border border-border p-5">
          <h3 className="font-semibold text-foreground mb-3">📊 {lang === "en" ? "Weekly Stats" : "साप्ताहिक आँकड़े"}</h3>
          <div className="space-y-3">
            {[
              { label: lang === "en" ? "Sessions completed" : "सत्र पूर्ण", value: sessions.filter(s => s.status === 'completed' || s.status === 'approved').length },
              { label: lang === "en" ? "Worksheets reviewed" : "कार्यपत्रक समीक्षित", value: 45 },
              { label: lang === "en" ? "Satisfaction" : "संतुष्टि", value: "4.7/5 ⭐" },
            ].map((stat, i) => (
              <div key={i} className="flex items-center justify-between p-2">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <span className="text-sm font-bold text-foreground">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* My Seekers Grid */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">👥 {lang === "en" ? "My Seekers" : "मेरे साधक"}</h2>
        {seekers.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {seekers.map(s => (
              <Link key={s.id} to={`/seekers/${s.id}`} className="bg-card rounded-xl p-4 shadow-sm border border-border text-center card-hover">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2 text-lg">
                  {s.full_name?.charAt(0) || '?'}
                </div>
                <p className="text-sm font-medium text-foreground truncate">{s.full_name}</p>
                <p className="text-[10px] text-muted-foreground">{s.email}</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-xl p-8 text-center border border-border">
            <p className="text-muted-foreground">{lang === "en" ? "No seekers assigned yet" : "अभी तक कोई साधक नहीं"}</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-2">{lang === "en" ? "Quick Actions" : "त्वरित कार्य"}</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: lang === "en" ? "Schedule Session" : "सत्र शेड्यूल", icon: CalendarDays, gradient: 'gradient-sacred', path: '/coaching/schedule' },
            { label: lang === "en" ? "Create Assignment" : "असाइनमेंट बनाएं", icon: ClipboardList, gradient: 'gradient-saffron', path: '/coaching/create-assignment' },
            { label: lang === "en" ? "Announcement" : "घोषणा", icon: Megaphone, gradient: 'gradient-growth', path: '/coaching/planner' },
          ].map(a => (
            <Link key={a.label} to={a.path} className={`${a.gradient} rounded-xl p-4 text-center text-primary-foreground card-hover btn-press`}>
              <a.icon className="w-6 h-6 mx-auto mb-2" />
              <p className="text-xs font-medium">{a.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
