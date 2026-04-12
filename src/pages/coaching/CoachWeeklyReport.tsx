import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BarChart3, Users, FileText, Calendar, TrendingUp, CheckCircle, AlertTriangle, XCircle, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { startOfWeek, endOfWeek, format, subWeeks } from 'date-fns';

interface WeeklyStats {
  totalSeekers: number;
  onTrack: number;
  needsAttention: number;
  atRisk: number;
  worksheetsSubmitted: number;
  worksheetsTarget: number;
  sessionsCompleted: number;
  sessionsScheduled: number;
  assignmentsReviewed: number;
  assignmentsTotal: number;
  topSeekers: { name: string; streak: number; points: number }[];
  atRiskSeekers: { name: string; lastActive: string; reason: string }[];
}

const CoachWeeklyReport = () => {
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const [stats, setStats] = useState<WeeklyStats | null>(null);

  const weekStart = startOfWeek(subWeeks(new Date(), weekOffset), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

  useEffect(() => {
    loadStats();
  }, [weekOffset]);

  const loadStats = async () => {
    setLoading(true);
    const ws = format(weekStart, 'yyyy-MM-dd');
    const we = format(weekEnd, 'yyyy-MM-dd');

    const [{ data: seekers }, { data: worksheets }, { data: sessions }, { data: assignments }] = await Promise.all([
      supabase.from('profiles').select('id, full_name, created_at').eq('role', 'seeker'),
      supabase.from('daily_worksheets').select('seeker_id, worksheet_date, is_submitted, completion_rate_percent').gte('worksheet_date', ws).lte('worksheet_date', we),
      supabase.from('sessions').select('id, status, date').gte('date', ws).lte('date', we),
      supabase.from('assignments').select('id, status, created_at').gte('created_at', ws + 'T00:00:00'),
    ]);

    const seekerList = seekers || [];
    const wsList = worksheets || [];
    const sessionList = sessions || [];
    const assignmentList = assignments || [];

    // Calculate per-seeker worksheet counts
    const seekerWsCount: Record<string, number> = {};
    wsList.forEach(w => {
      if (w.is_submitted) seekerWsCount[w.seeker_id] = (seekerWsCount[w.seeker_id] || 0) + 1;
    });

    let onTrack = 0, needsAttention = 0, atRisk = 0;
    const topSeekers: WeeklyStats['topSeekers'] = [];
    const atRiskList: WeeklyStats['atRiskSeekers'] = [];

    seekerList.forEach(s => {
      const count = seekerWsCount[s.id] || 0;
      if (count >= 5) { onTrack++; topSeekers.push({ name: s.full_name, streak: count, points: count * 10 }); }
      else if (count >= 2) { needsAttention++; }
      else { atRisk++; atRiskList.push({ name: s.full_name, lastActive: count > 0 ? `${count} worksheets` : 'No activity', reason: count === 0 ? 'No worksheets submitted' : 'Low engagement' }); }
    });

    topSeekers.sort((a, b) => b.streak - a.streak);

    setStats({
      totalSeekers: seekerList.length,
      onTrack,
      needsAttention,
      atRisk,
      worksheetsSubmitted: wsList.filter(w => w.is_submitted).length,
      worksheetsTarget: seekerList.length * 7,
      sessionsCompleted: sessionList.filter(s => s.status === 'completed').length,
      sessionsScheduled: sessionList.length,
      assignmentsReviewed: assignmentList.filter(a => a.status === 'reviewed' || a.status === 'completed').length,
      assignmentsTotal: assignmentList.length,
      topSeekers: topSeekers.slice(0, 5),
      atRiskSeekers: atRiskList.slice(0, 5),
    });
    setLoading(false);
  };

  const pct = (a: number, b: number) => b === 0 ? 0 : Math.round((a / b) * 100);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!stats) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" /> 📊 Weekly Coach Report
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setWeekOffset(w => w + 1)}>← Previous</Button>
          {weekOffset > 0 && <Button variant="outline" size="sm" onClick={() => setWeekOffset(w => w - 1)}>Next →</Button>}
          {weekOffset > 0 && <Button variant="outline" size="sm" onClick={() => setWeekOffset(0)}>This Week</Button>}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <Users className="w-5 h-5 mx-auto text-primary mb-1" />
          <p className="text-2xl font-bold text-foreground">{stats.totalSeekers}</p>
          <p className="text-xs text-muted-foreground">Total Seekers</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800 p-4 text-center">
          <CheckCircle className="w-5 h-5 mx-auto text-emerald-600 mb-1" />
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">🟢 {stats.onTrack}</p>
          <p className="text-xs text-muted-foreground">On Track ({pct(stats.onTrack, stats.totalSeekers)}%)</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 p-4 text-center">
          <AlertTriangle className="w-5 h-5 mx-auto text-amber-600 mb-1" />
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">🟡 {stats.needsAttention}</p>
          <p className="text-xs text-muted-foreground">Needs Attention</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 p-4 text-center">
          <XCircle className="w-5 h-5 mx-auto text-red-600 mb-1" />
          <p className="text-2xl font-bold text-red-700 dark:text-red-400">🔴 {stats.atRisk}</p>
          <p className="text-xs text-muted-foreground">At Risk</p>
        </div>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={<FileText className="w-5 h-5" />} label="📝 Worksheets Submitted" value={stats.worksheetsSubmitted} target={stats.worksheetsTarget} />
        <StatCard icon={<Calendar className="w-5 h-5" />} label="📅 Sessions Completed" value={stats.sessionsCompleted} target={stats.sessionsScheduled} />
        <StatCard icon={<CheckCircle className="w-5 h-5" />} label="✅ Assignments Reviewed" value={stats.assignmentsReviewed} target={stats.assignmentsTotal} />
      </div>

      {/* Top Performers & At Risk */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">⭐ Top Performers</h3>
          {stats.topSeekers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data for this week</p>
          ) : (
            <div className="space-y-2">
              {stats.topSeekers.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/10">
                  <span className="text-sm font-medium text-foreground">{['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][i]} {s.name}</span>
                  <span className="text-xs text-emerald-600">🔥 {s.streak} days | +{s.points} pts</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">⚠️ Needs Attention</h3>
          {stats.atRiskSeekers.length === 0 ? (
            <p className="text-sm text-muted-foreground">Everyone is on track! 🎉</p>
          ) : (
            <div className="space-y-2">
              {stats.atRiskSeekers.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-red-50 dark:bg-red-900/10">
                  <span className="text-sm font-medium text-foreground">🔴 {s.name}</span>
                  <span className="text-xs text-red-600">{s.reason}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Button variant="outline" className="gap-2 w-full" onClick={() => toast.info('PDF export coming soon!')}>
        <Download className="w-4 h-4" /> 📄 Export Report as PDF
      </Button>
    </div>
  );
};

function StatCard({ icon, label, value, target }: { icon: React.ReactNode; label: string; value: number; target: number }) {
  const percent = target === 0 ? 0 : Math.round((value / target) * 100);
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center gap-2 mb-2 text-primary">{icon}<span className="text-sm font-semibold text-foreground">{label}</span></div>
      <p className="text-2xl font-bold text-foreground">{value} <span className="text-sm font-normal text-muted-foreground">/ {target}</span></p>
      <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(percent, 100)}%` }} />
      </div>
      <p className="text-xs text-muted-foreground mt-1">{percent}% completion</p>
    </div>
  );
}

export default CoachWeeklyReport;
