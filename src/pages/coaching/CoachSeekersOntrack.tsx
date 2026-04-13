import { useSeekerProfiles } from '@/hooks/useSeekerProfiles';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Trophy, Flame } from 'lucide-react';
import { format, subDays } from 'date-fns';

export default function CoachSeekersOntrack() {
  const { data: seekers = [], isLoading } = useSeekerProfiles();
  const threeDaysAgo = format(subDays(new Date(), 3), 'yyyy-MM-dd');

  const { data: recentWorksheets = [] } = useQuery({
    queryKey: ['recent-worksheets-ontrack'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_worksheets')
        .select('seeker_id, worksheet_date, sampoorna_din_score')
        .gte('worksheet_date', threeDaysAgo)
        .order('worksheet_date', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const seekerStreaks = new Map<string, number>();
  recentWorksheets.forEach(ws => {
    seekerStreaks.set(ws.seeker_id, (seekerStreaks.get(ws.seeker_id) || 0) + 1);
  });

  const onTrackSeekers = seekers
    .map(s => ({ ...s, streakDays: seekerStreaks.get(s.id) || 0 }))
    .filter(s => s.streakDays >= 2)
    .sort((a, b) => b.streakDays - a.streakDays);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B00]" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <CheckCircle className="w-6 h-6 text-green-500" /> On Track Seekers
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Seekers with consistent worksheet activity (2+ days in last 3) • {onTrackSeekers.length} seekers</p>
      </div>

      {onTrackSeekers.length === 0 ? (
        <Card className="p-12 text-center">
          <CheckCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
          <p className="text-muted-foreground">No seekers currently on track. Encourage worksheet submissions!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {onTrackSeekers.map((seeker, idx) => {
            const initials = (seeker.full_name || 'S').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
            return (
              <Card key={seeker.id} className="p-4 border border-green-200 bg-green-50/30 dark:bg-green-900/10">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                      {initials}
                    </div>
                    {idx < 3 && (
                      <div className="absolute -top-1 -right-1">
                        <Trophy className="w-4 h-4 text-amber-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{seeker.full_name}</h3>
                    <p className="text-xs text-muted-foreground">{seeker.city || seeker.occupation || seeker.email}</p>
                  </div>
                  <Badge className="bg-green-500 text-white">🟢 On Track</Badge>
                </div>

                <div className="flex items-center gap-2 mt-3 p-2 bg-background rounded-lg">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium text-foreground">{seeker.streakDays} worksheets in 3 days</span>
                  {seeker.streakDays >= 3 && <span className="text-xs">🔥 Perfect!</span>}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
