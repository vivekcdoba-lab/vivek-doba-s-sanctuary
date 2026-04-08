import { useCoachingLang } from "@/components/CoachingLayout";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, User, Target, Award, Calendar, BarChart3 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const L = {
  title: { en: "Progress Matrix", hi: "प्रगति मैट्रिक्स" },
  selectSeeker: { en: "Select Seeker", hi: "साधक चुनें" },
  allSeekers: { en: "All Seekers Overview", hi: "सभी साधकों का अवलोकन" },
  worksheets: { en: "Worksheets", hi: "वर्कशीट" },
  sessions: { en: "Sessions", hi: "सत्र" },
  assignments: { en: "Assignments", hi: "कार्य" },
  assessments: { en: "Assessments", hi: "मूल्यांकन" },
  noData: { en: "No progress data available yet", hi: "अभी कोई प्रगति डेटा उपलब्ध नहीं" },
  comparison: { en: "Seeker Comparison", hi: "साधक तुलना" },
  wheelOfLife: { en: "Wheel of Life", hi: "जीवन चक्र" },
  lgtBalance: { en: "LGT Balance", hi: "LGT संतुलन" },
};

const CHART_COLORS = { primary: "#1D9E75", secondary: "#FF6B00", accent: "#FFD700", muted: "#94a3b8" };

export default function CoachingProgress() {
  const { lang } = useCoachingLang();
  const navigate = useNavigate();
  const [selectedSeeker, setSelectedSeeker] = useState("all");

  // Fetch all seekers
  const { data: seekers = [] } = useQuery({
    queryKey: ["coaching-seekers"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("id, full_name").eq("role", "seeker").order("full_name");
      return data || [];
    },
  });

  // Fetch aggregate stats per seeker
  const { data: stats = [], isLoading } = useQuery({
    queryKey: ["coaching-progress-stats"],
    queryFn: async () => {
      const [worksheetsRes, sessionsRes, assignmentsRes, assessmentsRes] = await Promise.all([
        supabase.from("daily_worksheets").select("seeker_id, is_submitted"),
        supabase.from("sessions").select("seeker_id, status"),
        supabase.from("assignments").select("seeker_id, status"),
        supabase.from("seeker_assessments").select("seeker_id, type, scores_json, period"),
      ]);

      const seekerStats: Record<string, any> = {};

      // Worksheets
      (worksheetsRes.data || []).forEach((w: any) => {
        if (!seekerStats[w.seeker_id]) seekerStats[w.seeker_id] = { worksheets: 0, worksheetsSubmitted: 0, sessions: 0, sessionsCompleted: 0, assignments: 0, assignmentsCompleted: 0, assessments: [] };
        seekerStats[w.seeker_id].worksheets++;
        if (w.is_submitted) seekerStats[w.seeker_id].worksheetsSubmitted++;
      });

      // Sessions
      (sessionsRes.data || []).forEach((s: any) => {
        if (!seekerStats[s.seeker_id]) seekerStats[s.seeker_id] = { worksheets: 0, worksheetsSubmitted: 0, sessions: 0, sessionsCompleted: 0, assignments: 0, assignmentsCompleted: 0, assessments: [] };
        seekerStats[s.seeker_id].sessions++;
        if (s.status === "completed") seekerStats[s.seeker_id].sessionsCompleted++;
      });

      // Assignments
      (assignmentsRes.data || []).forEach((a: any) => {
        if (!seekerStats[a.seeker_id]) seekerStats[a.seeker_id] = { worksheets: 0, worksheetsSubmitted: 0, sessions: 0, sessionsCompleted: 0, assignments: 0, assignmentsCompleted: 0, assessments: [] };
        seekerStats[a.seeker_id].assignments++;
        if (a.status === "completed") seekerStats[a.seeker_id].assignmentsCompleted++;
      });

      // Assessments
      (assessmentsRes.data || []).forEach((a: any) => {
        if (!seekerStats[a.seeker_id]) seekerStats[a.seeker_id] = { worksheets: 0, worksheetsSubmitted: 0, sessions: 0, sessionsCompleted: 0, assignments: 0, assignmentsCompleted: 0, assessments: [] };
        seekerStats[a.seeker_id].assessments.push(a);
      });

      return seekerStats;
    },
  });

  // Build comparison bar chart data
  const comparisonData = seekers.map((s: any) => {
    const st = stats[s.id] || {};
    return {
      name: s.full_name?.split(" ")[0] || "—",
      sessions: st.sessionsCompleted || 0,
      assignments: st.assignmentsCompleted || 0,
      worksheets: st.worksheetsSubmitted || 0,
    };
  }).filter(d => d.sessions > 0 || d.assignments > 0 || d.worksheets > 0);

  // Build radar data for selected seeker's latest WoL assessment
  const selectedStats = selectedSeeker !== "all" ? stats[selectedSeeker] : null;
  const latestWol = selectedStats?.assessments?.filter((a: any) => a.type === "wheel_of_life")?.sort((a: any, b: any) => (a.period > b.period ? -1 : 1))?.[0];
  const wolScores = latestWol?.scores_json as Record<string, number> | null;
  const radarData = wolScores ? Object.entries(wolScores).map(([key, val]) => ({
    area: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "),
    score: val,
    fullMark: 10,
  })) : [];

  // LGT data
  const latestLgt = selectedStats?.assessments?.filter((a: any) => a.type === "lgt")?.sort((a: any, b: any) => (a.period > b.period ? -1 : 1))?.[0];
  const lgtScores = latestLgt?.scores_json as Record<string, number> | null;

  const selectedSeekerName = seekers.find((s: any) => s.id === selectedSeeker)?.full_name || "";

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/coaching")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-xl font-bold text-foreground">{L.title[lang]}</h1>
        </div>
        <Select value={selectedSeeker} onValueChange={setSelectedSeeker}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{L.allSeekers[lang]}</SelectItem>
            {seekers.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {selectedSeeker === "all" ? (
        <>
          {/* Seeker overview cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {seekers.map((s: any) => {
              const st = stats[s.id] || {};
              const totalTasks = (st.assignments || 0);
              const completedTasks = (st.assignmentsCompleted || 0);
              const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedSeeker(s.id)}
                  className="bg-card rounded-xl border border-border p-4 text-left card-hover transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#1D9E75]/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-[#1D9E75]" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{s.full_name}</p>
                      <p className="text-xs text-muted-foreground">{st.assessments?.length || 0} {L.assessments[lang].toLowerCase()}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-bold text-foreground">{st.sessionsCompleted || 0}</p>
                      <p className="text-[10px] text-muted-foreground">{L.sessions[lang]}</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-foreground">{st.worksheetsSubmitted || 0}</p>
                      <p className="text-[10px] text-muted-foreground">{L.worksheets[lang]}</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-foreground">{completionRate}%</p>
                      <p className="text-[10px] text-muted-foreground">Tasks</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Comparison chart */}
          {comparisonData.length > 0 && (
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> {L.comparison[lang]}
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sessions" fill={CHART_COLORS.primary} name={L.sessions[lang]} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="assignments" fill={CHART_COLORS.secondary} name={L.assignments[lang]} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="worksheets" fill={CHART_COLORS.accent} name={L.worksheets[lang]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Individual seeker view */}
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-[#1D9E75]/10 flex items-center justify-center">
                <User className="w-6 h-6 text-[#1D9E75]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">{selectedSeekerName}</h2>
                <p className="text-xs text-muted-foreground">
                  {selectedStats?.sessionsCompleted || 0} sessions · {selectedStats?.assignmentsCompleted || 0}/{selectedStats?.assignments || 0} tasks · {selectedStats?.worksheetsSubmitted || 0} worksheets
                </p>
              </div>
            </div>

            {/* KPI row */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: L.sessions[lang], value: selectedStats?.sessionsCompleted || 0, total: selectedStats?.sessions || 0, icon: Calendar, color: CHART_COLORS.primary },
                { label: L.assignments[lang], value: selectedStats?.assignmentsCompleted || 0, total: selectedStats?.assignments || 0, icon: Target, color: CHART_COLORS.secondary },
                { label: L.worksheets[lang], value: selectedStats?.worksheetsSubmitted || 0, total: selectedStats?.worksheets || 0, icon: TrendingUp, color: CHART_COLORS.accent },
                { label: L.assessments[lang], value: selectedStats?.assessments?.length || 0, total: null, icon: Award, color: "#8b5cf6" },
              ].map((kpi, i) => (
                <div key={i} className="bg-muted/50 rounded-lg p-3 text-center">
                  <kpi.icon className="w-5 h-5 mx-auto mb-1" style={{ color: kpi.color }} />
                  <p className="text-xl font-bold text-foreground">{kpi.value}{kpi.total !== null ? `/${kpi.total}` : ""}</p>
                  <p className="text-[10px] text-muted-foreground">{kpi.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Charts row */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Wheel of Life */}
            {radarData.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3">🎯 {L.wheelOfLife[lang]} ({latestWol?.period})</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="area" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fontSize: 10 }} />
                    <Radar name="Score" dataKey="score" stroke={CHART_COLORS.primary} fill={CHART_COLORS.primary} fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* LGT Quadrant */}
            {lgtScores && (
              <div className="bg-card rounded-xl border border-border p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3">🔷 {L.lgtBalance[lang]} ({latestLgt?.period})</h3>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {[
                    { key: "dharma", emoji: "🕉️", label: "Dharma", color: "#FF6B00" },
                    { key: "artha", emoji: "💰", label: "Artha", color: "#FFD700" },
                    { key: "kama", emoji: "❤️", label: "Kama", color: "#E91E63" },
                    { key: "moksha", emoji: "☀️", label: "Moksha", color: "#1D9E75" },
                  ].map((p) => {
                    const score = lgtScores[p.key] || 0;
                    return (
                      <div key={p.key} className="rounded-xl p-4 text-center" style={{ backgroundColor: `${p.color}15` }}>
                        <span className="text-2xl">{p.emoji}</span>
                        <p className="text-3xl font-bold mt-1" style={{ color: p.color }}>{score}</p>
                        <p className="text-xs text-muted-foreground">{p.label}</p>
                        <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                          <div className="h-1.5 rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: p.color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {!radarData.length && !lgtScores && (
            <div className="bg-card rounded-xl border border-border p-12 text-center">
              <TrendingUp className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium text-foreground">{L.noData[lang]}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
