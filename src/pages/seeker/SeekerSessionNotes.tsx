import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO } from 'date-fns';
import { BookOpen, Search, Loader2, Target, Award, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { formatDateDMY } from "@/lib/dateFormat";

const SeekerSessionNotes = () => {
  const { profile } = useAuthStore();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.id) return;
    const fetch = async () => {
      const { data } = await supabase
        .from('sessions')
        .select('*')
        .eq('seeker_id', profile.id)
        .in('status', ['completed', 'approved', 'submitted', 'reviewing'])
        .order('date', { ascending: false });
      setSessions(data || []);
      setLoading(false);
    };
    fetch();
  }, [profile?.id]);

  const filtered = sessions.filter(s => {
    const q = search.toLowerCase();
    return !q || (s.session_name || '').toLowerCase().includes(q) ||
      (s.session_notes || '').toLowerCase().includes(q) ||
      (s.key_insights || '').toLowerCase().includes(q) ||
      ((s.topics_covered as string[]) || []).some((t: string) => t.toLowerCase().includes(q));
  });

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Session Notes</h1>
        <p className="text-muted-foreground">Review insights and notes from your coaching sessions</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search notes, topics, insights..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-muted-foreground"><BookOpen className="h-12 w-12 mx-auto mb-3 opacity-40" /><p>No session notes found</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(s => {
            const isOpen = expanded === s.id;
            const topics = (s.topics_covered as string[]) || [];
            return (
              <Card key={s.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setExpanded(isOpen ? null : s.id)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{s.session_name || `Session #${s.session_number}`}</h3>
                        {s.pillar && <Badge variant="secondary" className="text-xs">{s.pillar}</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{formatDateDMY(parseISO(s.date))} • {s.duration_minutes || 60} min</p>
                      {topics.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {topics.slice(0, 3).map((t: string) => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
                          {topics.length > 3 && <Badge variant="outline" className="text-xs">+{topics.length - 3}</Badge>}
                        </div>
                      )}
                    </div>
                    {isOpen ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                  </div>

                  {isOpen && (
                    <div className="mt-4 space-y-4 border-t pt-4">
                      {s.session_notes && (
                        <div>
                          <h4 className="text-sm font-medium flex items-center gap-1 mb-1"><BookOpen className="h-4 w-4 text-primary" /> Session Notes</h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{s.session_notes}</p>
                        </div>
                      )}
                      {s.key_insights && (
                        <div className="bg-primary/5 p-3 rounded-lg">
                          <h4 className="text-sm font-medium flex items-center gap-1 mb-1"><Zap className="h-4 w-4 text-primary" /> Key Insights</h4>
                          <p className="text-sm">{s.key_insights}</p>
                        </div>
                      )}
                      {s.breakthroughs && (
                        <div className="bg-green-500/5 p-3 rounded-lg">
                          <h4 className="text-sm font-medium flex items-center gap-1 mb-1"><Award className="h-4 w-4 text-green-600" /> Breakthroughs</h4>
                          <p className="text-sm">{s.breakthroughs}</p>
                        </div>
                      )}
                      {s.targets && (
                        <div>
                          <h4 className="text-sm font-medium flex items-center gap-1 mb-1"><Target className="h-4 w-4 text-orange-500" /> Targets</h4>
                          <p className="text-sm text-muted-foreground">{s.targets}</p>
                        </div>
                      )}
                      {s.next_week_assignments && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">📋 Assignments</h4>
                          <p className="text-sm text-muted-foreground">{s.next_week_assignments}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SeekerSessionNotes;
