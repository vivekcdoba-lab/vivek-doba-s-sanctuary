import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCoachingLang } from '@/components/CoachingLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, MessageCircle, Flame, Clock, Download } from 'lucide-react';
import { format, subDays } from 'date-fns';

export default function CoachWorksheetMissed() {
  const { lang } = useCoachingLang();
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const { data: profiles = [] } = useQuery({
    queryKey: ['coach-missed-profiles'],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('id, full_name, phone, whatsapp').eq('role', 'seeker');
      return data || [];
    },
  });

  const { data: worksheets = [] } = useQuery({
    queryKey: ['coach-missed-worksheets'],
    queryFn: async () => {
      const { data } = await supabase
        .from('daily_worksheets')
        .select('seeker_id, worksheet_date, is_submitted')
        .eq('is_submitted', true)
        .gte('worksheet_date', format(subDays(new Date(), 30), 'yyyy-MM-dd'));
      return data || [];
    },
  });

  // Build seeker stats
  const seekerStats = useMemo(() => {
    const submittedDates: Record<string, Set<string>> = {};
    worksheets.forEach((w: any) => {
      if (!submittedDates[w.seeker_id]) submittedDates[w.seeker_id] = new Set();
      submittedDates[w.seeker_id].add(w.worksheet_date);
    });

    return profiles.map((p: any) => {
      const dates = submittedDates[p.id] || new Set();
      const submittedToday = dates.has(todayStr);
      // Find last submission
      const sortedDates = Array.from(dates).sort().reverse();
      const lastSubmission = sortedDates[0] || null;
      const daysSinceLast = lastSubmission
        ? Math.floor((Date.now() - new Date(lastSubmission).getTime()) / 86400000)
        : 999;

      // Consecutive missed (from today backwards)
      let consecutiveMissed = 0;
      for (let i = 0; i < 30; i++) {
        const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
        if (!dates.has(d)) consecutiveMissed++;
        else break;
      }

      // Current streak
      let streak = 0;
      if (dates.has(todayStr) || dates.has(format(subDays(new Date(), 1), 'yyyy-MM-dd'))) {
        const startOffset = dates.has(todayStr) ? 0 : 1;
        for (let i = startOffset; i < 90; i++) {
          if (dates.has(format(subDays(new Date(), i), 'yyyy-MM-dd'))) streak++;
          else break;
        }
      }

      return {
        id: p.id,
        name: p.full_name,
        phone: p.whatsapp || p.phone || '',
        submittedToday,
        lastSubmission,
        daysSinceLast,
        consecutiveMissed,
        streak,
        isAtRisk: consecutiveMissed >= 3,
        isStreakAtRisk: streak > 0 && !dates.has(todayStr),
      };
    }).sort((a, b) => b.consecutiveMissed - a.consecutiveMissed);
  }, [profiles, worksheets, todayStr]);

  const missedToday = seekerStats.filter(s => !s.submittedToday);
  const atRisk = seekerStats.filter(s => s.isAtRisk);
  const streakAtRisk = seekerStats.filter(s => s.isStreakAtRisk);

  const sendWhatsApp = (phone: string, name: string) => {
    const msg = encodeURIComponent(`Namaste ${name}! 🙏\n\nI noticed you haven't submitted your daily worksheet today. Your consistency matters — even a quick entry helps! 💪\n\nLet's keep the momentum going. Fill it now and share your wins! 🌟`);
    window.open(`https://wa.me/91${phone.replace(/\D/g, '')}?text=${msg}`, '_blank');
  };

  const exportCsv = () => {
    const header = 'Seeker,Submitted Today,Last Submission,Days Since,Consecutive Missed,Current Streak\n';
    const rows = seekerStats.map(s =>
      `"${s.name}",${s.submittedToday ? 'Yes' : 'No'},${s.lastSubmission || 'Never'},${s.daysSinceLast},${s.consecutiveMissed},${s.streak}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'missed-worksheets.csv'; a.click();
  };

  const severityBadge = (missed: number) => {
    if (missed >= 7) return <Badge className="bg-destructive/10 text-destructive">Critical</Badge>;
    if (missed >= 3) return <Badge className="bg-orange-500/10 text-orange-600">Warning</Badge>;
    if (missed >= 1) return <Badge className="bg-yellow-500/10 text-yellow-600">Mild</Badge>;
    return <Badge className="bg-green-500/10 text-green-600">Active</Badge>;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{lang === 'en' ? 'Missed Worksheets' : 'छूटी वर्कशीट'}</h1>
          <p className="text-sm text-muted-foreground">{missedToday.length} seekers haven't submitted today</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCsv} className="gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Not Submitted Today', value: missedToday.length, icon: Clock, color: 'text-primary' },
          { label: 'At Risk (3+ days)', value: atRisk.length, icon: AlertTriangle, color: 'text-destructive' },
          { label: 'Streak at Risk', value: streakAtRisk.length, icon: Flame, color: 'text-orange-500' },
          { label: 'Submitted Today', value: seekerStats.length - missedToday.length, icon: Flame, color: 'text-green-600' },
        ].map(k => (
          <Card key={k.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted"><k.icon className={`w-5 h-5 ${k.color}`} /></div>
              <div>
                <p className="text-xs text-muted-foreground">{k.label}</p>
                <p className="text-2xl font-bold text-foreground">{k.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* At-risk alert */}
      {atRisk.length > 0 && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-4 h-4" /> 🚨 Auto-Flagged: {atRisk.length} seekers missing 3+ consecutive days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {atRisk.map(s => (
                <div key={s.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10 text-sm">
                  <span className="font-medium text-destructive">{s.name}</span>
                  <span className="text-xs text-destructive/70">{s.consecutiveMissed}d</span>
                  {s.phone && (
                    <button onClick={() => sendWhatsApp(s.phone, s.name)} className="text-green-600 hover:text-green-700">
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main list */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">All Seekers — Today's Status</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="p-3 text-left font-medium text-muted-foreground">Seeker</th>
                  <th className="p-3 text-center font-medium text-muted-foreground">Today</th>
                  <th className="p-3 text-center font-medium text-muted-foreground">Last Submitted</th>
                  <th className="p-3 text-center font-medium text-muted-foreground">Missed</th>
                  <th className="p-3 text-center font-medium text-muted-foreground">Streak</th>
                  <th className="p-3 text-center font-medium text-muted-foreground">Severity</th>
                  <th className="p-3 text-right font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {seekerStats.map(s => (
                  <tr key={s.id} className={`border-b border-border transition-colors ${s.isAtRisk ? 'bg-destructive/5' : 'hover:bg-muted/20'}`}>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${s.submittedToday ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'}`}>
                          {s.name.charAt(0)}
                        </div>
                        <span className="font-medium text-foreground">{s.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      {s.submittedToday
                        ? <Badge className="bg-green-500/10 text-green-600">✅ Done</Badge>
                        : <Badge variant="secondary" className="bg-destructive/10 text-destructive">❌ Missing</Badge>}
                    </td>
                    <td className="p-3 text-center text-muted-foreground text-xs">
                      {s.lastSubmission ? format(new Date(s.lastSubmission), 'dd MMM') : 'Never'}
                    </td>
                    <td className="p-3 text-center font-medium">
                      {s.consecutiveMissed > 0 ? <span className="text-destructive">{s.consecutiveMissed} days</span> : '—'}
                    </td>
                    <td className="p-3 text-center">
                      {s.streak > 0 ? (
                        <span className="flex items-center justify-center gap-1">
                          <Flame className={`w-3 h-3 ${s.isStreakAtRisk ? 'text-orange-500' : 'text-green-500'}`} />
                          <span className="font-medium">{s.streak}</span>
                          {s.isStreakAtRisk && <span className="text-[10px] text-orange-500">⚠️</span>}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="p-3 text-center">{severityBadge(s.consecutiveMissed)}</td>
                    <td className="p-3 text-right">
                      {!s.submittedToday && s.phone && (
                        <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => sendWhatsApp(s.phone, s.name)}>
                          <MessageCircle className="w-3 h-3" /> Remind
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
