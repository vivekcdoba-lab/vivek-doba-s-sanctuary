import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useScopedSeekers } from '@/hooks/useScopedSeekers';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function CoachProgressReport() {
  const { data: seekers = [] } = useScopedSeekers();

  const { data: checkins = [] } = useQuery({
    queryKey: ['progress-checkins'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_lgt_checkins')
        .select('seeker_id, dharma_score, artha_score, kama_score, moksha_score, overall_balance, checkin_date')
        .order('checkin_date', { ascending: false })
        .limit(500);
      if (error) throw error;
      return data || [];
    },
  });

  const seekerProgress = seekers.map(seeker => {
    const myCheckins = checkins.filter(c => c.seeker_id === seeker.id);
    const recent = myCheckins.slice(0, 7);
    const older = myCheckins.slice(7, 14);

    const avg = (arr: any[], field: string) => arr.length > 0 ? arr.reduce((s, c) => s + (c[field] || 0), 0) / arr.length : 0;

    const recentAvg = {
      dharma: avg(recent, 'dharma_score'),
      artha: avg(recent, 'artha_score'),
      kama: avg(recent, 'kama_score'),
      moksha: avg(recent, 'moksha_score'),
    };
    const olderAvg = {
      dharma: avg(older, 'dharma_score'),
      artha: avg(older, 'artha_score'),
      kama: avg(older, 'kama_score'),
      moksha: avg(older, 'moksha_score'),
    };

    return { ...seeker, recentAvg, olderAvg, totalCheckins: myCheckins.length };
  }).sort((a, b) => b.totalCheckins - a.totalCheckins);

  const TrendIcon = ({ current, prev }: { current: number; prev: number }) => {
    if (current > prev + 0.5) return <TrendingUp className="w-3 h-3 text-green-500" />;
    if (current < prev - 0.5) return <TrendingDown className="w-3 h-3 text-red-500" />;
    return <Minus className="w-3 h-3 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-[#FF6B00]" /> Progress Report
        </h1>
        <p className="text-sm text-muted-foreground mt-1">LGT dimension trends across all seekers</p>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-3 font-medium text-muted-foreground">Seeker</th>
              <th className="text-center p-3 font-medium text-muted-foreground">Check-ins</th>
              <th className="text-center p-3 font-medium text-muted-foreground">🕉️ Dharma</th>
              <th className="text-center p-3 font-medium text-muted-foreground">💰 Artha</th>
              <th className="text-center p-3 font-medium text-muted-foreground">❤️ Kama</th>
              <th className="text-center p-3 font-medium text-muted-foreground">☀️ Moksha</th>
            </tr>
          </thead>
          <tbody>
            {seekerProgress.map(s => (
              <tr key={s.id} className="border-b border-border/50 hover:bg-muted/30">
                <td className="p-3 font-medium text-foreground">{s.full_name}</td>
                <td className="p-3 text-center"><Badge variant="outline">{s.totalCheckins}</Badge></td>
                {(['dharma', 'artha', 'kama', 'moksha'] as const).map(dim => (
                  <td key={dim} className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="font-medium">{s.recentAvg[dim].toFixed(1)}</span>
                      <TrendIcon current={s.recentAvg[dim]} prev={s.olderAvg[dim]} />
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {seekerProgress.length === 0 && (
        <Card className="p-12 text-center"><p className="text-muted-foreground">No LGT check-in data available yet.</p></Card>
      )}
    </div>
  );
}
