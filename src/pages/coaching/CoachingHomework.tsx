import { useCoachingLang } from "@/components/CoachingLayout";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, CheckCircle2, Clock, AlertTriangle, CircleDot, Filter } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const L = {
  title: { en: "Homework Tracker", hi: "होमवर्क ट्रैकर" },
  search: { en: "Search assignments...", hi: "कार्य खोजें..." },
  allStatus: { en: "All Status", hi: "सभी स्थिति" },
  allSeekers: { en: "All Seekers", hi: "सभी साधक" },
  noAssignments: { en: "No assignments found", hi: "कोई कार्य नहीं मिला" },
  feedback: { en: "Add Feedback", hi: "प्रतिक्रिया जोड़ें" },
  saveFeedback: { en: "Save Feedback", hi: "प्रतिक्रिया सहेजें" },
  score: { en: "Score", hi: "स्कोर" },
  markComplete: { en: "Mark Complete", hi: "पूर्ण चिह्नित करें" },
};

const STATUS_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  assigned: { icon: CircleDot, color: "text-amber-500", label: "Assigned" },
  in_progress: { icon: Clock, color: "text-blue-500", label: "In Progress" },
  completed: { icon: CheckCircle2, color: "text-green-500", label: "Completed" },
  overdue: { icon: AlertTriangle, color: "text-red-500", label: "Overdue" },
};

const PILLAR_EMOJI: Record<string, string> = { dharma: "🕉️", artha: "💰", kama: "❤️", moksha: "☀️" };

export default function CoachingHomework() {
  const { lang } = useCoachingLang();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [seekerFilter, setSeekerFilter] = useState("all");
  const [feedbackMap, setFeedbackMap] = useState<Record<string, { feedback: string; score: string }>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ["coaching-assignments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assignments")
        .select("*, profiles!assignments_seeker_id_fkey(full_name)")
        .order("due_date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, feedback, score, status }: { id: string; feedback?: string; score?: number; status?: string }) => {
      const update: any = {};
      if (feedback !== undefined) update.feedback = feedback;
      if (score !== undefined) update.score = score;
      if (status !== undefined) update.status = status;
      const { error } = await supabase.from("assignments").update(update).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaching-assignments"] });
      toast.success(lang === "en" ? "Assignment updated" : "कार्य अपडेट किया गया");
    },
  });

  const seekerNames = [...new Set(assignments.map((a: any) => a.profiles?.full_name).filter(Boolean))];

  const filtered = assignments.filter((a: any) => {
    const matchSearch = !search || a.title?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    const matchSeeker = seekerFilter === "all" || a.profiles?.full_name === seekerFilter;
    return matchSearch && matchStatus && matchSeeker;
  });

  // Group by status
  const grouped = {
    overdue: filtered.filter((a: any) => a.status === "overdue"),
    assigned: filtered.filter((a: any) => a.status === "assigned"),
    in_progress: filtered.filter((a: any) => a.status === "in_progress"),
    completed: filtered.filter((a: any) => a.status === "completed"),
  };

  const handleSaveFeedback = (id: string) => {
    const fb = feedbackMap[id];
    if (!fb) return;
    updateMutation.mutate({
      id,
      feedback: fb.feedback,
      score: fb.score ? parseInt(fb.score) : undefined,
    });
    setExpandedId(null);
  };

  const renderCard = (a: any) => {
    const cfg = STATUS_CONFIG[a.status] || STATUS_CONFIG.assigned;
    const Icon = cfg.icon;
    const isExpanded = expandedId === a.id;

    return (
      <div key={a.id} className="bg-card rounded-xl border border-border overflow-hidden card-hover">
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${cfg.color}`} />
              <div className="min-w-0">
                <p className="font-semibold text-sm text-foreground">{a.title}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs text-muted-foreground">{a.profiles?.full_name}</span>
                  {a.category && <span className="text-xs">{PILLAR_EMOJI[a.category] || ""} {a.category}</span>}
                  <span className="text-xs text-muted-foreground">Due: {format(new Date(a.due_date), "dd MMM")}</span>
                  {a.priority && (
                    <Badge variant={a.priority === "high" ? "destructive" : "secondary"} className="text-[10px]">{a.priority}</Badge>
                  )}
                </div>
                {a.description && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{a.description}</p>}
                {a.feedback && (
                  <div className="mt-2 bg-muted rounded-lg px-3 py-2">
                    <p className="text-xs font-medium text-muted-foreground">Coach Feedback:</p>
                    <p className="text-xs text-foreground">{a.feedback}</p>
                    {a.score && <p className="text-xs text-muted-foreground mt-1">Score: {a.score}/10</p>}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1 shrink-0">
              {a.status !== "completed" && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs h-7"
                  onClick={() => updateMutation.mutate({ id: a.id, status: "completed" })}
                >
                  ✅
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="text-xs h-7"
                onClick={() => setExpandedId(isExpanded ? null : a.id)}
              >
                💬
              </Button>
            </div>
          </div>
        </div>
        {isExpanded && (
          <div className="px-4 pb-4 border-t border-border pt-3 space-y-2 animate-fade-in">
            <Textarea
              placeholder={L.feedback[lang]}
              value={feedbackMap[a.id]?.feedback || a.feedback || ""}
              onChange={(e) => setFeedbackMap(m => ({ ...m, [a.id]: { ...m[a.id], feedback: e.target.value, score: m[a.id]?.score || "" } }))}
              rows={2}
              className="text-sm"
            />
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                max="10"
                placeholder={`${L.score[lang]} (0-10)`}
                value={feedbackMap[a.id]?.score || a.score || ""}
                onChange={(e) => setFeedbackMap(m => ({ ...m, [a.id]: { ...m[a.id], score: e.target.value, feedback: m[a.id]?.feedback || "" } }))}
                className="w-28 text-sm"
              />
              <Button size="sm" onClick={() => handleSaveFeedback(a.id)} disabled={updateMutation.isPending}>
                {L.saveFeedback[lang]}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/coaching")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-xl font-bold text-foreground">{L.title[lang]}</h1>
        <Badge variant="secondary" className="text-xs">{filtered.length}</Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder={L.search[lang]} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{L.allStatus[lang]}</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
        <Select value={seekerFilter} onValueChange={setSeekerFilter}>
          <SelectTrigger className="w-full sm:w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{L.allSeekers[lang]}</SelectItem>
            {seekerNames.map(n => <SelectItem key={n} value={n!}>{n}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-3">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
          const Icon = cfg.icon;
          const count = grouped[key as keyof typeof grouped]?.length || 0;
          return (
            <button key={key} onClick={() => setStatusFilter(key === statusFilter ? "all" : key)} className={`bg-card rounded-xl border p-3 text-center transition-colors ${statusFilter === key ? "border-[#1D9E75] ring-1 ring-[#1D9E75]" : "border-border"}`}>
              <Icon className={`w-5 h-5 mx-auto ${cfg.color}`} />
              <p className="text-xl font-bold text-foreground mt-1">{count}</p>
              <p className="text-[10px] text-muted-foreground">{cfg.label}</p>
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <p className="font-medium text-foreground">{L.noAssignments[lang]}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(renderCard)}
        </div>
      )}
    </div>
  );
}
