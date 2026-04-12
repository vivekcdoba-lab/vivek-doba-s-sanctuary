import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { CheckCircle2, Trophy, Bell, ChevronDown, ChevronUp } from 'lucide-react';

const dimensionColors: Record<string, string> = {
  dharma: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  artha: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  kama: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
  moksha: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
};

const SeekerChallenges = () => {
  const { profile } = useAuthStore();
  const profileId = profile?.id;
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ['weekly-challenges'],
    queryFn: async () => {
      const { data } = await supabase
        .from('weekly_challenges')
        .select('*')
        .eq('is_active', true)
        .order('start_date');
      return data || [];
    },
  });

  const { data: progress = [] } = useQuery({
    queryKey: ['challenge-progress', profileId],
    queryFn: async () => {
      if (!profileId) return [];
      const { data } = await supabase
        .from('weekly_challenge_progress')
        .select('*')
        .eq('seeker_id', profileId);
      return data || [];
    },
    enabled: !!profileId,
  });

  const completeMutation = useMutation({
    mutationFn: async ({ challengeId, dayNumber }: { challengeId: string; dayNumber: number }) => {
      if (!profileId) throw new Error('No profile');
      const { error } = await supabase.from('weekly_challenge_progress').insert({
        challenge_id: challengeId,
        seeker_id: profileId,
        day_number: dayNumber,
        task_completed: true,
        notes: notes || null,
        completed_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenge-progress'] });
      setNotes('');
      toast({ title: '✅ Task completed! Great job!' });
    },
  });

  const today = new Date();
  const active = challenges.filter(c => new Date(c.start_date) <= today && new Date(c.end_date) >= today);
  const upcoming = challenges.filter(c => new Date(c.start_date) > today);
  const completed = challenges.filter(c => new Date(c.end_date) < today);

  const getChallengeProgress = (challengeId: string) => {
    return progress.filter(p => p.challenge_id === challengeId && p.task_completed);
  };

  const getTasks = (c: any): { day: number; task: string }[] => {
    try {
      return Array.isArray(c.tasks_json) ? c.tasks_json : JSON.parse(c.tasks_json || '[]');
    } catch { return []; }
  };

  const getCurrentDay = (c: any) => {
    const start = new Date(c.start_date);
    const diff = Math.floor((today.getTime() - start.getTime()) / 86400000) + 1;
    return Math.min(diff, 7);
  };

  if (isLoading) return <div className="p-6 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="p-4 space-y-5 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-foreground">💪 Weekly Challenges</h1>
        <p className="text-sm text-muted-foreground">"Small Daily Actions, Big Transformations"</p>
      </div>

      {/* Active Challenges */}
      {active.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-foreground">🟢 Active Challenges</h2>
          {active.map(c => {
            const tasks = getTasks(c);
            const done = getChallengeProgress(c.id);
            const totalDays = tasks.length || 7;
            const pct = Math.round((done.length / totalDays) * 100);
            const currentDay = getCurrentDay(c);
            const isExpanded = expandedId === c.id;
            const todayDone = done.some(d => d.day_number === currentDay);
            const currentTask = tasks.find(t => t.day === currentDay);

            return (
              <Card key={c.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{c.title}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">{c.description}</p>
                    </div>
                    {c.dimension && (
                      <Badge className={dimensionColors[c.dimension] || 'bg-muted'}>
                        {c.dimension?.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Progress: Day {currentDay} of {totalDays}</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    🏅 Reward: {c.points_reward || 100} Points
                  </p>

                  {/* Today's task */}
                  {currentTask && !todayDone && (
                    <div className="bg-muted/50 rounded-lg p-3 border border-border">
                      <p className="text-xs font-semibold text-muted-foreground mb-1">TODAY'S TASK:</p>
                      <p className="text-sm text-foreground">☐ {currentTask.task}</p>
                      <div className="flex gap-2 mt-2">
                        <Textarea placeholder="Add notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} rows={1} className="text-xs" />
                      </div>
                      <Button size="sm" className="mt-2 gradient-saffron text-primary-foreground" onClick={() => completeMutation.mutate({ challengeId: c.id, dayNumber: currentDay })}>
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Complete
                      </Button>
                    </div>
                  )}
                  {todayDone && (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800 text-center">
                      <p className="text-sm text-green-700 dark:text-green-300">✅ Today's task completed!</p>
                    </div>
                  )}

                  {/* Daily log */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-muted-foreground">📅</span>
                    {Array.from({ length: totalDays }, (_, i) => {
                      const dayNum = i + 1;
                      const isDone = done.some(d => d.day_number === dayNum);
                      const isCurrent = dayNum === currentDay;
                      return (
                        <span key={dayNum} className="text-xs">
                          Day {dayNum}: {isDone ? '✅' : isCurrent ? '🔵' : '○'}
                          {dayNum < totalDays && ' |'}
                        </span>
                      );
                    })}
                  </div>

                  <button onClick={() => setExpandedId(isExpanded ? null : c.id)} className="text-xs text-primary flex items-center gap-1">
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {isExpanded ? 'Hide Details' : 'View Details'}
                  </button>

                  {isExpanded && (
                    <div className="space-y-1 pl-2 border-l-2 border-muted">
                      {tasks.map(t => {
                        const isDone = done.some(d => d.day_number === t.day);
                        return (
                          <p key={t.day} className={`text-xs ${isDone ? 'text-green-600 line-through' : 'text-muted-foreground'}`}>
                            Day {t.day}: {t.task}
                          </p>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">📚 Upcoming Challenges</h2>
          {upcoming.map(c => (
            <Card key={c.id}>
              <CardContent className="py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{c.title}</p>
                  <p className="text-xs text-muted-foreground">Starts {format(new Date(c.start_date), 'MMM d')}</p>
                </div>
                <Button variant="outline" size="sm" className="text-xs gap-1">
                  <Bell className="w-3 h-3" /> Notify Me
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">🏆 Completed Challenges</h2>
          {completed.map(c => (
            <Card key={c.id} className="opacity-75">
              <CardContent className="py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{c.title}</p>
                  <p className="text-xs text-muted-foreground">Ended {format(new Date(c.end_date), 'MMM d')}</p>
                </div>
                <Trophy className="w-5 h-5 text-amber-500" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {challenges.length === 0 && (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">🏋️</p>
          <p className="text-muted-foreground">No challenges yet. Check back soon!</p>
        </div>
      )}
    </div>
  );
};

export default SeekerChallenges;
