import { useCoachingLang } from "@/components/CoachingLayout";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, User, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format, addDays, startOfWeek, isSameDay, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateDMY } from "@/lib/dateFormat";

const L = {
  title: { en: "Daily Planner", hi: "दैनिक योजना" },
  today: { en: "Today", hi: "आज" },
  noEvents: { en: "No events scheduled", hi: "कोई कार्यक्रम नियोजित नहीं" },
  sessions: { en: "Sessions", hi: "सत्र" },
  followUps: { en: "Follow-ups", hi: "अनुवर्ती" },
  tasks: { en: "Tasks Due", hi: "कार्य देय" },
};

const HOURS = Array.from({ length: 13 }, (_, i) => i + 7); // 7 AM to 7 PM

export default function CoachingPlanner() {
  const { lang } = useCoachingLang();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const dateStr = formatDateDMY(selectedDate);

  const { data: sessions = [] } = useQuery({
    queryKey: ["planner-sessions", dateStr],
    queryFn: async () => {
      const { data } = await supabase
        .from("sessions")
        .select("*, profiles!sessions_seeker_id_fkey(full_name)")
        .eq("date", dateStr)
        .order("start_time");
      return data || [];
    },
  });

  const { data: followUps = [] } = useQuery({
    queryKey: ["planner-followups", dateStr],
    queryFn: async () => {
      const { data } = await supabase
        .from("follow_ups")
        .select("*, profiles!follow_ups_seeker_id_fkey(full_name)")
        .eq("due_date", dateStr)
        .eq("status", "pending");
      return data || [];
    },
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ["planner-assignments", dateStr],
    queryFn: async () => {
      const { data } = await supabase
        .from("assignments")
        .select("*, profiles!assignments_seeker_id_fkey(full_name)")
        .eq("due_date", dateStr)
        .neq("status", "completed");
      return data || [];
    },
  });

  // Map sessions to time slots
  const sessionsByHour = useMemo(() => {
    const map: Record<number, any[]> = {};
    sessions.forEach((s: any) => {
      const hour = parseInt(s.start_time?.split(":")[0] || "0");
      if (!map[hour]) map[hour] = [];
      map[hour].push(s);
    });
    return map;
  }, [sessions]);

  const goToday = () => setSelectedDate(new Date());
  const goPrev = () => setSelectedDate(d => addDays(d, -7));
  const goNext = () => setSelectedDate(d => addDays(d, 7));

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/coaching")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-xl font-bold text-foreground">{L.title[lang]}</h1>
      </div>

      {/* Week strip */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <Button variant="ghost" size="icon" onClick={goPrev}><ChevronLeft className="w-4 h-4" /></Button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{format(weekStart, "MMM yyyy")}</span>
            <Button variant="outline" size="sm" onClick={goToday} className="text-xs h-7">{L.today[lang]}</Button>
          </div>
          <Button variant="ghost" size="icon" onClick={goNext}><ChevronRight className="w-4 h-4" /></Button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((d) => {
            const isSelected = isSameDay(d, selectedDate);
            const isToday = isSameDay(d, new Date());
            return (
              <button
                key={d.toISOString()}
                onClick={() => setSelectedDate(d)}
                className={`flex flex-col items-center py-2 rounded-lg text-xs transition-colors ${
                  isSelected ? "bg-[#1D9E75] text-white" : isToday ? "bg-[#1D9E75]/10 text-[#1D9E75]" : "hover:bg-muted text-muted-foreground"
                }`}
              >
                <span className="font-medium">{format(d, "EEE")}</span>
                <span className={`text-lg font-bold mt-0.5 ${isSelected ? "text-white" : "text-foreground"}`}>{format(d, "d")}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{sessions.length}</p>
          <p className="text-xs text-muted-foreground">{L.sessions[lang]}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{followUps.length}</p>
          <p className="text-xs text-muted-foreground">{L.followUps[lang]}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{assignments.length}</p>
          <p className="text-xs text-muted-foreground">{L.tasks[lang]}</p>
        </div>
      </div>

      {/* Timeline view */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4" /> {format(selectedDate, "EEEE, dd MMMM yyyy")}
          </h2>
        </div>
        <div className="divide-y divide-border">
          {HOURS.map((hour) => {
            const hourSessions = sessionsByHour[hour] || [];
            return (
              <div key={hour} className="flex min-h-[48px]">
                <div className="w-16 shrink-0 py-3 px-3 text-xs text-muted-foreground font-mono text-right border-r border-border">
                  {hour.toString().padStart(2, "0")}:00
                </div>
                <div className="flex-1 py-2 px-3 space-y-1">
                  {hourSessions.map((s: any) => (
                    <div key={s.id} className="bg-[#1D9E75]/10 rounded-lg px-3 py-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">{s.session_name || `Session #${s.session_number}`}</span>
                        <Badge variant="outline" className="text-[10px]">{s.status}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{s.profiles?.full_name}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{s.start_time}–{s.end_time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Follow-ups & Tasks */}
      {(followUps.length > 0 || assignments.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          {followUps.length > 0 && (
            <div className="bg-card rounded-xl border border-border p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">📞 {L.followUps[lang]}</h3>
              <div className="space-y-2">
                {followUps.map((f: any) => (
                  <div key={f.id} className="flex items-center gap-3 text-sm">
                    <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-xs">
                      {f.type === "call" ? "📞" : f.type === "whatsapp" ? "💬" : "🤝"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground truncate">{f.profiles?.full_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{f.notes}</p>
                    </div>
                    <Badge variant={f.priority === "high" ? "destructive" : "secondary"} className="text-[10px] shrink-0">{f.priority}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
          {assignments.length > 0 && (
            <div className="bg-card rounded-xl border border-border p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">📋 {L.tasks[lang]}</h3>
              <div className="space-y-2">
                {assignments.map((a: any) => (
                  <div key={a.id} className="flex items-center gap-3 text-sm">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${a.status === "overdue" ? "bg-red-500" : a.status === "in_progress" ? "bg-blue-500" : "bg-amber-500"}`} />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground truncate">{a.title}</p>
                      <p className="text-xs text-muted-foreground">{a.profiles?.full_name} · {a.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
