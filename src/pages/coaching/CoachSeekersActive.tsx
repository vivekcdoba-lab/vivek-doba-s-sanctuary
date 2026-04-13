import { useSeekerProfiles } from '@/hooks/useSeekerProfiles';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Clock, TrendingUp } from 'lucide-react';
import { format, subDays } from 'date-fns';

export default function CoachSeekersActive() {
  const { data: seekers = [], isLoading } = useSeekerProfiles();
  const twoDaysAgo = format(subDays(new Date(), 2), 'yyyy-MM-dd');

  const { data: recentWorksheets = [] } = useQuery({
    queryKey: ['recent-worksheets-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_worksheets')
        .select('seeker_id, worksheet_date, sampoorna_din_score, dharma_score, artha_score, kama_score, moksha_score')
        .gte('worksheet_date', twoDaysAgo)
        .order('worksheet_date', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const activeSeekersMap = new Map<string, any>();
  recentWorksheets.forEach(ws => {
    if (!activeSeekersMap.has(ws.seeker_id)) {
      activeSeekersMap.set(ws.seeker_id, ws);
    }
  });

  const activeSeekers = seekers.filter(s => activeSeekersMap.has(s.id));

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B00]" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Flame className="w-6 h-6 text-orange-500" /> Active Seekers
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Seekers with worksheet activity in last 2 days • {activeSeekers.length} active</p>
      </div>

      {activeSeekers.length === 0 ? (
        <Card className="p-12 text-center">
          <Flame className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
          <p className="text-muted-foreground">No seekers have submitted worksheets in the last 2 days</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeSeekers.map(seeker => {
            const ws = activeSeekersMap.get(seeker.id);
            const initials = (seeker.full_name || 'S').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
            return (
              <Card key={seeker.id} className="p-4 border border-green-200 bg-green-50/30 dark:bg-green-900/10 dark:border-green-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                    {initials}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{seeker.full_name}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Last: {ws?.worksheet_date}
                    </p>
                  </div>
                  <Badge className="bg-green-500 text-white">🟢 Active</Badge>
                </div>

                {ws && (
                  <div className="grid grid-cols-4 gap-1.5 mt-2">
                    {[
                      { label: '🕉️ Dharma', score: ws.dharma_score },
                      { label: '💰 Artha', score: ws.artha_score },
                      { label: '❤️ Kama', score: ws.kama_score },
                      { label: '☀️ Moksha', score: ws.moksha_score },
                    ].map(d => (
                      <div key={d.label} className="text-center bg-background rounded-lg p-1.5">
                        <p className="text-[10px] text-muted-foreground">{d.label}</p>
                        <p className="text-sm font-bold text-foreground">{d.score ?? '—'}</p>
                      </div>
                    ))}
                  </div>
                )}

                {ws?.sampoorna_din_score && (
                  <div className="mt-2 flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5 text-[#FF6B00]" />
                    <span className="text-xs text-muted-foreground">Sampoorna Din:</span>
                    <span className="text-sm font-bold text-[#FF6B00]">{ws.sampoorna_din_score}/10</span>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
