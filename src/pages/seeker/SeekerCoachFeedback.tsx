import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO } from 'date-fns';
import { MessageSquare, Star, Loader2, BookOpen, Target, TrendingUp, ClipboardList } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDateDMY } from "@/lib/dateFormat";

const SeekerCoachFeedback = () => {
  const { profile } = useAuthStore();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id) return;
    const fetchAll = async () => {
      const [aRes, sRes] = await Promise.all([
        supabase.from('assignments').select('*').eq('seeker_id', profile.id).not('feedback', 'is', null).order('updated_at', { ascending: false }),
        supabase.from('sessions').select('*').eq('seeker_id', profile.id).in('status', ['completed', 'approved']).order('date', { ascending: false }).limit(30),
      ]);
      setAssignments(aRes.data || []);
      setSessions(sRes.data || []);
      setLoading(false);
    };
    fetchAll();
  }, [profile?.id]);

  const sessionsWithFeedback = sessions.filter(s => s.key_insights || s.breakthroughs || s.targets || s.rewards || s.punishments);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Coach Feedback</h1>
        <p className="text-muted-foreground">Review feedback and recommendations from your coach</p>
      </div>

      <Tabs defaultValue="assignments">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assignments" className="gap-1"><ClipboardList className="h-4 w-4" /> Assignments</TabsTrigger>
          <TabsTrigger value="sessions" className="gap-1"><BookOpen className="h-4 w-4" /> Sessions</TabsTrigger>
          <TabsTrigger value="growth" className="gap-1"><TrendingUp className="h-4 w-4" /> Growth</TabsTrigger>
        </TabsList>

        <TabsContent value="assignments" className="space-y-3 mt-4">
          {assignments.length === 0 ? (
            <Card><CardContent className="py-10 text-center text-muted-foreground"><MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-40" /><p>No assignment feedback yet</p></CardContent></Card>
          ) : assignments.map(a => (
            <Card key={a.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{a.title}</h3>
                    <p className="text-xs text-muted-foreground">{formatDateDMY(parseISO(a.updated_at))}</p>
                  </div>
                  {a.score != null && (
                    <div className="flex items-center gap-1">
                      <Star className={`h-4 w-4 ${a.score >= 7 ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                      <span className="font-bold text-sm">{a.score}/10</span>
                    </div>
                  )}
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-sm font-medium mb-1 flex items-center gap-1"><MessageSquare className="h-4 w-4 text-primary" /> Coach Feedback</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{a.feedback}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="sessions" className="space-y-3 mt-4">
          {sessionsWithFeedback.length === 0 ? (
            <Card><CardContent className="py-10 text-center text-muted-foreground"><BookOpen className="h-12 w-12 mx-auto mb-3 opacity-40" /><p>No session feedback yet</p></CardContent></Card>
          ) : sessionsWithFeedback.map(s => (
            <Card key={s.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{s.session_name || `Session #${s.session_number}`}</h3>
                    <p className="text-xs text-muted-foreground">{formatDateDMY(parseISO(s.date))}</p>
                  </div>
                  {s.engagement_score && <Badge variant="secondary">Engagement: {s.engagement_score}/10</Badge>}
                </div>
                {s.key_insights && (
                  <div className="bg-primary/5 p-3 rounded-lg">
                    <p className="text-sm font-medium mb-1">💡 Key Insights</p>
                    <p className="text-sm">{s.key_insights}</p>
                  </div>
                )}
                {s.targets && (
                  <div className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-orange-500 mt-0.5" />
                    <div><p className="text-sm font-medium">Targets</p><p className="text-sm text-muted-foreground">{s.targets}</p></div>
                  </div>
                )}
                {s.rewards && <div className="text-sm"><span className="font-medium">🏆 Rewards:</span> <span className="text-muted-foreground">{s.rewards}</span></div>}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="growth" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" /> Growth Recommendations</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {sessions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Complete sessions to receive growth recommendations</p>
              ) : (
                <>
                  {/* Latest insights aggregation */}
                  {sessions.slice(0, 5).filter(s => s.breakthroughs).map(s => (
                    <div key={s.id} className="border-l-4 border-primary pl-4 py-2">
                      <p className="text-xs text-muted-foreground">{format(parseISO(s.date), 'MMM d')}</p>
                      <p className="text-sm mt-1">{s.breakthroughs}</p>
                    </div>
                  ))}
                  {sessions.slice(0, 5).filter(s => s.breakthroughs).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">Keep attending sessions — breakthroughs are coming! 🌟</p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SeekerCoachFeedback;
