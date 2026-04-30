import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { format, isToday, isFuture, parseISO } from 'date-fns';
import { Video, Clock, CheckCircle2, BookOpen, Zap, ExternalLink, Loader2, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import LocalTime from '@/components/common/LocalTime';

const PILLAR_CONFIG: Record<string, { emoji: string; label: string }> = {
  dharma: { emoji: '🙏', label: 'Dharma' },
  artha: { emoji: '💰', label: 'Artha' },
  kama: { emoji: '❤️', label: 'Kama' },
  moksha: { emoji: '🕉️', label: 'Moksha' },
  all: { emoji: '✨', label: 'All Pillars' },
};

const PREP_CHECKLIST = [
  'Review notes from last session',
  'Complete pending assignments',
  'Prepare questions for coach',
  'Find a quiet, distraction-free space',
  'Test your audio and video',
  'Have a notebook ready',
];

const SeekerLiveSession = () => {
  const { profile } = useAuthStore();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [checkedItems, setCheckedItems] = useState<boolean[]>(new Array(PREP_CHECKLIST.length).fill(false));

  useEffect(() => {
    if (!profile?.id) return;
    const fetchSessions = async () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data } = await supabase
        .from('sessions')
        .select('*')
        .eq('seeker_id', profile.id)
        .gte('date', today)
        .in('status', ['scheduled', 'in_progress'])
        .order('date', { ascending: true })
        .order('start_time', { ascending: true })
        .limit(10);
      setSessions(data || []);
      setLoading(false);
    };
    fetchSessions();
  }, [profile?.id]);

  const toggleCheck = (i: number) => {
    const next = [...checkedItems];
    next[i] = !next[i];
    setCheckedItems(next);
  };

  const todaySessions = sessions.filter(s => isToday(parseISO(s.date)));
  const upcomingSessions = sessions.filter(s => isFuture(parseISO(s.date)) && !isToday(parseISO(s.date)));
  const prepComplete = checkedItems.filter(Boolean).length;

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Live Session</h1>
        <p className="text-muted-foreground">Join your sessions and prepare effectively</p>
      </div>

      {/* Today's Sessions */}
      {todaySessions.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2"><Zap className="h-5 w-5 text-primary" /> Today's Sessions</h2>
          {todaySessions.map(s => {
            const pillar = PILLAR_CONFIG[s.pillar || 'all'] || PILLAR_CONFIG.all;
            return (
              <Card key={s.id} className="border-primary/30 bg-primary/5">
                <CardContent className="p-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{pillar.emoji} {pillar.label}</Badge>
                        <Badge className={s.status === 'in_progress' ? 'bg-green-600 text-white' : 'bg-primary/20 text-primary'}>{s.status === 'in_progress' ? '🔴 LIVE' : 'Scheduled'}</Badge>
                      </div>
                      <h3 className="text-lg font-semibold">{s.session_name || `Session #${s.session_number}`}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1"><Clock className="h-4 w-4" />
                        <LocalTime startAt={s.start_at} sessionTz={s.timezone} fallbackTime={s.start_time} />
                        {' – '}
                        <LocalTime startAt={s.end_at} sessionTz={s.timezone} fallbackTime={s.end_time} showHint={false} />
                        {' • '}{s.duration_minutes || 60} min
                      </p>
                    </div>
                    {s.meeting_link && (
                      <Button asChild size="lg" className="gap-2">
                        <a href={s.meeting_link} target="_blank" rel="noopener noreferrer"><Video className="h-5 w-5" /> Join Meeting <ExternalLink className="h-4 w-4" /></a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No sessions scheduled for today</p>
          </CardContent>
        </Card>
      )}

      {/* Preparation Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><BookOpen className="h-5 w-5 text-primary" /> Pre-Session Preparation ({prepComplete}/{PREP_CHECKLIST.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {PREP_CHECKLIST.map((item, i) => (
            <label key={i} className="flex items-center gap-3 cursor-pointer group">
              <button onClick={() => toggleCheck(i)} className={`h-5 w-5 rounded border flex items-center justify-center transition-colors ${checkedItems[i] ? 'bg-primary border-primary text-primary-foreground' : 'border-border group-hover:border-primary/50'}`}>
                {checkedItems[i] && <CheckCircle2 className="h-4 w-4" />}
              </button>
              <span className={`text-sm ${checkedItems[i] ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{item}</span>
            </label>
          ))}
        </CardContent>
      </Card>

      {/* Real-time Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">📝 Session Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea placeholder="Take notes during your session..." value={notes} onChange={e => setNotes(e.target.value)} rows={6} className="resize-none" />
          <Button className="mt-3" size="sm" onClick={() => toast.success('Notes saved locally')}>Save Notes</Button>
        </CardContent>
      </Card>

      {/* Upcoming Sessions */}
      {upcomingSessions.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Upcoming Sessions</h2>
          {upcomingSessions.map(s => (
            <Card key={s.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{s.session_name || `Session #${s.session_number}`}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(parseISO(s.date), 'EEE, MMM d')} •{' '}
                    <LocalTime startAt={s.start_at} sessionTz={s.timezone} fallbackTime={s.start_time} />
                  </p>
                </div>
                <Badge variant="outline">{s.location_type || 'online'}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SeekerLiveSession;
