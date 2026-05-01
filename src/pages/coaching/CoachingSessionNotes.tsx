import { useCoachingLang } from "@/components/CoachingLayout";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Search, Filter, Calendar, Clock, MapPin, User, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDateDMY } from "@/lib/dateFormat";
import { toast } from "sonner";

const L = {
  title: { en: "Session Notes", hi: "सत्र नोट्स" },
  back: { en: "Back", hi: "वापस" },
  search: { en: "Search sessions...", hi: "सत्र खोजें..." },
  allStatus: { en: "All Status", hi: "सभी स्थिति" },
  noSessions: { en: "No sessions found", hi: "कोई सत्र नहीं मिला" },
  noSessionsDesc: { en: "Sessions will appear here once scheduled.", hi: "शेड्यूल होने पर सत्र यहाँ दिखाई देंगे।" },
  session: { en: "Session", hi: "सत्र" },
  insights: { en: "Key Insights", hi: "मुख्य अंतर्दृष्टि" },
  notes: { en: "Notes", hi: "नोट्स" },
  privateNotes: { en: "Private Notes", hi: "निजी नोट्स" },
  win: { en: "Major Win", hi: "बड़ी जीत" },
  seeker: { en: "Seeker", hi: "साधक" },
};

const STATUS_COLORS: Record<string, string> = {
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  submitted: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  scheduled: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  reviewing: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const PILLAR_EMOJI: Record<string, string> = {
  dharma: "🕉️",
  artha: "💰",
  kama: "❤️",
  moksha: "☀️",
};

export default function CoachingSessionNotes() {
  const { lang } = useCoachingLang();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const setAttendance = async (sessionId: string, value: 'present' | 'no_show' | 'excused') => {
    const { error } = await supabase.from('sessions').update({ attendance: value }).eq('id', sessionId);
    if (error) { toast.error(error.message); return; }
    const labels: Record<string, string> = {
      present: '✅ Marked Present (counts as attended)',
      no_show: '🚫 Marked No-Show (counts as attended)',
      excused: '🛡️ Marked Excused (does NOT count toward sessions)',
    };
    toast.success(labels[value]);
    qc.invalidateQueries({ queryKey: ['coaching-sessions'] });
  };

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["coaching-sessions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sessions")
        .select("*, profiles!sessions_seeker_id_fkey(full_name), session_private_notes(notes)")
        .order("date", { ascending: false });
      if (error) throw error;
      return (data || []).map((s: any) => ({
        ...s,
        coach_private_notes: s.session_private_notes?.notes ?? null,
      }));
    },
  });

  const filtered = sessions.filter((s: any) => {
    const matchSearch = !search || 
      s.session_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.profiles?.full_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/coaching")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-xl font-bold text-foreground">{L.title[lang]}</h1>
          <Badge variant="secondary" className="text-xs">{filtered.length}</Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder={L.search[lang]} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder={L.allStatus[lang]} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{L.allStatus[lang]}</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="reviewing">Reviewing</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sessions List */}
      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-foreground">{L.noSessions[lang]}</p>
          <p className="text-sm text-muted-foreground mt-1">{L.noSessionsDesc[lang]}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s: any) => {
            const isExpanded = expandedId === s.id;
            return (
              <div key={s.id} className="bg-card rounded-xl border border-border overflow-hidden card-hover transition-all">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : s.id)}
                  className="w-full text-left p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-lg shrink-0">
                      {PILLAR_EMOJI[s.pillar] || "📋"}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground text-sm truncate">
                          {s.session_name || `${L.session[lang]} #${s.session_number}`}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[s.status] || "bg-muted text-muted-foreground"}`}>
                          {s.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{s.profiles?.full_name || "—"}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDateDMY(new Date(s.date))}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{s.start_time}–{s.end_time}</span>
                        {s.location_type && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{s.location_type}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {s.engagement_score && (
                      <span className="text-xs font-medium text-muted-foreground">⭐ {s.engagement_score}/10</span>
                    )}
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-border pt-3 space-y-3 animate-fade-in">
                    {s.major_win && (
                      <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-3">
                        <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">🏆 {L.win[lang]}</p>
                        <p className="text-sm text-foreground">{s.major_win}</p>
                      </div>
                    )}
                    {s.key_insights && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1">💡 {L.insights[lang]}</p>
                        <p className="text-sm text-foreground">{s.key_insights}</p>
                      </div>
                    )}
                    {s.session_notes && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1">📝 {L.notes[lang]}</p>
                        <p className="text-sm text-foreground">{s.session_notes}</p>
                      </div>
                    )}
                    {s.coach_private_notes && (
                      <div className="bg-amber-50 dark:bg-amber-900/10 rounded-lg p-3">
                        <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">🔒 {L.privateNotes[lang]}</p>
                        <p className="text-sm text-foreground">{s.coach_private_notes}</p>
                      </div>
                    )}
                    {/* Attendance — Excused does NOT count toward total sessions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                      <span className="text-xs font-semibold text-muted-foreground">Attendance:</span>
                      <select
                        value={s.attendance || ''}
                        onChange={(e) => setAttendance(s.id, e.target.value as any)}
                        title="Excused = strong acceptable reason; does not consume a session"
                        className="text-xs px-2 py-1 rounded-md border border-border bg-background"
                      >
                        <option value="">— Select —</option>
                        <option value="present">✅ Present (counts)</option>
                        <option value="no_show">🚫 No-Show (counts)</option>
                        <option value="excused">🛡️ Excused (free, does NOT count)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
