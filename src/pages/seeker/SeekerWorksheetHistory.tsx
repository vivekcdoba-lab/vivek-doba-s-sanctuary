import { useState, useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import BackToHome from '@/components/BackToHome';
import { useStreakCount } from '@/hooks/useStreakCount';
import { Calendar, Check, X, Flame, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type ViewMode = 'week' | 'month' | 'year';
type PillarFilter = 'all' | 'dharma' | 'artha' | 'kama' | 'moksha';

export default function SeekerWorksheetHistory() {
  const { profile } = useAuthStore();
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [pillarFilter, setPillarFilter] = useState<PillarFilter>('all');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { data: streak = 0 } = useStreakCount(profile?.id ?? null);

  const { data: worksheets = [] } = useQuery({
    queryKey: ['worksheet-history', profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('daily_worksheets')
        .select('*')
        .eq('seeker_id', profile!.id)
        .order('worksheet_date', { ascending: false })
        .limit(1000);
      return data || [];
    },
  });

  const wsMap = useMemo(() => {
    const map = new Map<string, any>();
    worksheets.forEach((w: any) => map.set(w.worksheet_date, w));
    return map;
  }, [worksheets]);

  // Best streak calculation
  const bestStreak = useMemo(() => {
    const submitted = worksheets
      .filter((w: any) => w.is_submitted)
      .map((w: any) => w.worksheet_date)
      .sort();
    if (!submitted.length) return 0;
    let best = 1, curr = 1;
    for (let i = 1; i < submitted.length; i++) {
      const prev = new Date(submitted[i - 1]);
      const next = new Date(submitted[i]);
      const diff = (next.getTime() - prev.getTime()) / 86400000;
      if (diff === 1) { curr++; best = Math.max(best, curr); }
      else curr = 1;
    }
    return best;
  }, [worksheets]);

  // Monthly stats
  const monthStats = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthWs = worksheets.filter((w: any) => {
      const d = new Date(w.worksheet_date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
    const submitted = monthWs.filter((w: any) => w.is_submitted);
    const avgCompletion = submitted.length
      ? Math.round(submitted.reduce((s: number, w: any) => s + (w.completion_rate_percent || 0), 0) / submitted.length)
      : 0;
    return { total: submitted.length, avgCompletion };
  }, [worksheets, currentDate]);

  // Calendar grid
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    if (viewMode === 'week') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(startOfWeek);
        d.setDate(d.getDate() + i);
        return d;
      });
    }

    if (viewMode === 'year') {
      // Show months as summary
      return Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));
    }

    // Month view
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = firstDay.getDay();
    const days: (Date | null)[] = Array(startPad).fill(null);
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  }, [currentDate, viewMode]);

  const navigate = (dir: number) => {
    const d = new Date(currentDate);
    if (viewMode === 'week') d.setDate(d.getDate() + dir * 7);
    else if (viewMode === 'month') d.setMonth(d.getMonth() + dir);
    else d.setFullYear(d.getFullYear() + dir);
    setCurrentDate(d);
  };

  const getStatus = (dateStr: string) => {
    const ws = wsMap.get(dateStr);
    if (!ws || !ws.is_submitted) return 'none';
    if ((ws.completion_rate_percent || 0) >= 100) return 'complete';
    if ((ws.completion_rate_percent || 0) >= 50) return 'partial';
    return 'partial';
  };

  const statusColor = (status: string) => {
    if (status === 'complete') return 'bg-green-500';
    if (status === 'partial') return 'bg-yellow-500';
    return 'bg-muted';
  };

  const selectedWs = selectedDate ? wsMap.get(selectedDate) : null;

  const filteredCheck = (ws: any) => {
    if (pillarFilter === 'all') return true;
    const scoreKey = `${pillarFilter}_score`;
    return ws[scoreKey] != null && ws[scoreKey] > 0;
  };

  const pillars: { key: PillarFilter; label: string; color: string }[] = [
    { key: 'all', label: 'All', color: 'bg-primary' },
    { key: 'dharma', label: 'Dharma', color: 'bg-green-600' },
    { key: 'artha', label: 'Artha', color: 'bg-yellow-500' },
    { key: 'kama', label: 'Kama', color: 'bg-pink-500' },
    { key: 'moksha', label: 'Moksha', color: 'bg-[hsl(var(--saffron))]' },
  ];

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <BackToHome />

      {/* Header */}
      <div className="rounded-2xl bg-gradient-sacred p-5 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Calendar className="w-5 h-5" />
          <h1 className="text-xl font-bold">Worksheet History</h1>
        </div>
        <p className="text-sm opacity-80">Track your daily practice journey</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'This Month', value: monthStats.total, icon: <Check className="w-4 h-4 text-green-500" /> },
          { label: 'Avg Completion', value: `${monthStats.avgCompletion}%`, icon: <Calendar className="w-4 h-4 text-[hsl(var(--saffron))]" /> },
          { label: 'Current Streak', value: `${streak} 🔥`, icon: <Flame className="w-4 h-4 text-orange-500" /> },
          { label: 'Best Streak', value: `${bestStreak} 🏆`, icon: <Flame className="w-4 h-4 text-[hsl(var(--gold))]" /> },
        ].map((s, i) => (
          <div key={i} className="bg-card rounded-2xl border border-border p-4 text-center shadow-sm">
            <div className="flex justify-center mb-1">{s.icon}</div>
            <p className="text-lg font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* View Mode & Pillar Filters */}
      <div className="flex flex-wrap gap-2">
        {(['week', 'month', 'year'] as ViewMode[]).map(v => (
          <button key={v} onClick={() => setViewMode(v)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${viewMode === v ? 'bg-[hsl(var(--saffron))] text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
            {v}
          </button>
        ))}
        <div className="w-px bg-border mx-1" />
        {pillars.map(p => (
          <button key={p.key} onClick={() => setPillarFilter(p.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${pillarFilter === p.key ? `${p.color} text-white` : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-muted"><ChevronLeft className="w-5 h-5" /></button>
        <h2 className="text-lg font-semibold text-foreground">
          {viewMode === 'year' ? currentDate.getFullYear() : `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
        </h2>
        <button onClick={() => navigate(1)} className="p-2 rounded-xl hover:bg-muted"><ChevronRight className="w-5 h-5" /></button>
      </div>

      {/* Calendar Grid */}
      {viewMode === 'year' ? (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          {(calendarDays as Date[]).map((d, i) => {
            const monthWs = worksheets.filter((w: any) => {
              const wd = new Date(w.worksheet_date);
              return wd.getFullYear() === d.getFullYear() && wd.getMonth() === d.getMonth() && w.is_submitted && filteredCheck(w);
            });
            return (
              <div key={i} className="bg-card rounded-2xl border border-border p-3 text-center shadow-sm cursor-pointer hover:ring-2 hover:ring-[hsl(var(--saffron))]"
                onClick={() => { setCurrentDate(new Date(d.getFullYear(), d.getMonth(), 1)); setViewMode('month'); }}>
                <p className="text-sm font-semibold text-foreground">{monthNames[d.getMonth()].slice(0, 3)}</p>
                <p className="text-2xl font-bold text-[hsl(var(--saffron))]">{monthWs.length}</p>
                <p className="text-xs text-muted-foreground">submitted</p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayLabels.map(d => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {(calendarDays as (Date | null)[]).map((d, i) => {
              if (!d) return <div key={i} />;
              const dateStr = d.toISOString().split('T')[0];
              const ws = wsMap.get(dateStr);
              const status = getStatus(dateStr);
              const isToday = dateStr === new Date().toISOString().split('T')[0];
              const show = !ws || pillarFilter === 'all' || filteredCheck(ws);

              return (
                <button key={i} onClick={() => ws?.is_submitted && setSelectedDate(dateStr)}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm transition-all relative
                    ${isToday ? 'ring-2 ring-[hsl(var(--saffron))]' : ''}
                    ${ws?.is_submitted && show ? 'hover:scale-105 cursor-pointer' : 'cursor-default'}
                  `}>
                  <span className={`text-xs md:text-sm font-medium ${isToday ? 'text-[hsl(var(--saffron))]' : 'text-foreground'}`}>{d.getDate()}</span>
                  {show && (
                    <div className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full mt-0.5 ${statusColor(status)}`} />
                  )}
                </button>
              );
            })}
          </div>
          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 justify-center text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Complete</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500" /> Partial</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-muted" /> Not Submitted</span>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[hsl(var(--saffron))]" />
              Worksheet — {selectedDate}
            </DialogTitle>
          </DialogHeader>
          {selectedWs ? (
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Completion</span>
                <span className="font-bold text-foreground">{selectedWs.completion_rate_percent ?? 0}%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-[hsl(var(--saffron))] rounded-full" style={{ width: `${selectedWs.completion_rate_percent ?? 0}%` }} />
              </div>

              {/* Morning */}
              <div className="bg-muted/30 rounded-xl p-3 space-y-2">
                <h4 className="font-semibold text-foreground">🌅 Morning</h4>
                {selectedWs.morning_intention && <p><span className="text-muted-foreground">Intention:</span> {selectedWs.morning_intention}</p>}
                {selectedWs.morning_mood && <p><span className="text-muted-foreground">Mood:</span> {selectedWs.morning_mood}</p>}
                {selectedWs.morning_energy_score != null && <p><span className="text-muted-foreground">Energy:</span> {selectedWs.morning_energy_score}/10</p>}
              </div>

              {/* Pillar Scores */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Dharma', score: selectedWs.dharma_score, color: 'text-green-600' },
                  { label: 'Artha', score: selectedWs.artha_score, color: 'text-yellow-600' },
                  { label: 'Kama', score: selectedWs.kama_score, color: 'text-pink-500' },
                  { label: 'Moksha', score: selectedWs.moksha_score, color: 'text-[hsl(var(--saffron))]' },
                ].map(p => (
                  <div key={p.label} className="text-center bg-muted/30 rounded-xl p-2">
                    <p className={`text-lg font-bold ${p.color}`}>{p.score ?? '—'}</p>
                    <p className="text-xs text-muted-foreground">{p.label}</p>
                  </div>
                ))}
              </div>

              {/* Evening */}
              <div className="bg-muted/30 rounded-xl p-3 space-y-2">
                <h4 className="font-semibold text-foreground">🌙 Evening</h4>
                {selectedWs.what_went_well && <p><span className="text-muted-foreground">Went well:</span> {selectedWs.what_went_well}</p>}
                {selectedWs.what_i_learned && <p><span className="text-muted-foreground">Learned:</span> {selectedWs.what_i_learned}</p>}
                {selectedWs.aha_moment && <p><span className="text-muted-foreground">Aha:</span> {selectedWs.aha_moment}</p>}
                {selectedWs.evening_mood && <p><span className="text-muted-foreground">Mood:</span> {selectedWs.evening_mood}</p>}
              </div>

              {/* Gratitudes */}
              {(selectedWs.gratitude_1 || selectedWs.gratitude_2 || selectedWs.gratitude_3) && (
                <div className="bg-muted/30 rounded-xl p-3 space-y-1">
                  <h4 className="font-semibold text-foreground">🙏 Gratitude</h4>
                  {[selectedWs.gratitude_1, selectedWs.gratitude_2, selectedWs.gratitude_3, selectedWs.gratitude_4, selectedWs.gratitude_5]
                    .filter(Boolean).map((g: string, i: number) => <p key={i}>• {g}</p>)}
                </div>
              )}

              {/* Wins */}
              {(selectedWs.todays_win_1 || selectedWs.todays_win_2 || selectedWs.todays_win_3) && (
                <div className="bg-muted/30 rounded-xl p-3 space-y-1">
                  <h4 className="font-semibold text-foreground">🏆 Wins</h4>
                  {[selectedWs.todays_win_1, selectedWs.todays_win_2, selectedWs.todays_win_3]
                    .filter(Boolean).map((w: string, i: number) => <p key={i}>• {w}</p>)}
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No worksheet data for this date.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
