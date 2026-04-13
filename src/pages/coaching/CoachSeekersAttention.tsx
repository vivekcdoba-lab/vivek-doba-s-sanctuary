import { useSeekerProfiles } from '@/hooks/useSeekerProfiles';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, MessageSquare, Phone } from 'lucide-react';
import { format, subDays, differenceInDays } from 'date-fns';

export default function CoachSeekersAttention() {
  const { data: seekers = [], isLoading } = useSeekerProfiles();

  const { data: latestWorksheets = [] } = useQuery({
    queryKey: ['latest-worksheets-attention'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_worksheets')
        .select('seeker_id, worksheet_date')
        .order('worksheet_date', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const latestBySeeker = new Map<string, string>();
  latestWorksheets.forEach(ws => {
    if (!latestBySeeker.has(ws.seeker_id)) {
      latestBySeeker.set(ws.seeker_id, ws.worksheet_date);
    }
  });

  const today = new Date();
  const attentionSeekers = seekers.map(s => {
    const lastDate = latestBySeeker.get(s.id);
    const daysSince = lastDate ? differenceInDays(today, new Date(lastDate)) : 999;
    return { ...s, lastDate, daysSince };
  }).filter(s => s.daysSince >= 3).sort((a, b) => b.daysSince - a.daysSince);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B00]" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-amber-500" /> Needs Attention
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Seekers with no worksheet for 3+ days • {attentionSeekers.length} seekers</p>
      </div>

      {attentionSeekers.length === 0 ? (
        <Card className="p-12 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
          <p className="text-muted-foreground">🎉 All seekers are active! No one needs attention right now.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {attentionSeekers.map(seeker => {
            const initials = (seeker.full_name || 'S').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
            const isRed = seeker.daysSince >= 7;
            return (
              <Card key={seeker.id} className={`p-4 border ${isRed ? 'border-red-300 bg-red-50/30 dark:bg-red-900/10' : 'border-amber-200 bg-amber-50/30 dark:bg-amber-900/10'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${isRed ? 'bg-red-500' : 'bg-amber-500'}`}>
                    {initials}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{seeker.full_name}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {seeker.lastDate ? `Last worksheet: ${seeker.lastDate} (${seeker.daysSince} days ago)` : 'Never submitted a worksheet'}
                    </p>
                  </div>
                  <Badge className={isRed ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'}>
                    {isRed ? '🔴 At Risk' : '🟡 Attention'}
                  </Badge>
                  <div className="flex gap-1">
                    {seeker.whatsapp && (
                      <a href={`https://wa.me/${seeker.whatsapp}?text=${encodeURIComponent('🙏 नमस्कार! आपकी daily worksheet miss हो रही है। कृपया आज भरें।')}`}
                        target="_blank" rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors">
                        <Phone className="w-4 h-4" />
                      </a>
                    )}
                    <button className="p-2 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-colors">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
