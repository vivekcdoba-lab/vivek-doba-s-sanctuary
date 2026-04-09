import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BackToHome } from '@/components/BackToHome';
import { ClipboardList, Clock, AlertTriangle, CheckCircle, Send, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

const PILLAR_COLORS: Record<string, string> = {
  dharma: 'bg-[hsl(122,46%,33%)]/10 text-[hsl(122,46%,33%)]',
  artha: 'bg-[hsl(36,87%,38%)]/10 text-[hsl(36,87%,38%)]',
  kama: 'bg-[hsl(340,82%,52%)]/10 text-[hsl(340,82%,52%)]',
  moksha: 'bg-[hsl(282,68%,38%)]/10 text-[hsl(282,68%,38%)]',
};

const STATUS_TABS = ['assigned', 'in_progress', 'completed', 'overdue'] as const;

export default function SeekerTasksEnhanced() {
  const { profile } = useAuthStore();
  const [tab, setTab] = useState<string>('assigned');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reflection, setReflection] = useState('');
  const qc = useQueryClient();

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ['seeker-assignments', profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('assignments')
        .select('*, courses(name)')
        .eq('seeker_id', profile!.id)
        .order('due_date', { ascending: true });
      return data || [];
    },
  });

  const submitMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('assignments').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['seeker-assignments'] });
      toast({ title: '✅ Assignment updated!' });
      setExpandedId(null);
      setReflection('');
    },
  });

  const today = new Date();
  const filtered = assignments.filter((a: any) => {
    if (tab === 'overdue') return a.status !== 'completed' && differenceInDays(today, parseISO(a.due_date)) > 0;
    return a.status === tab;
  });

  const counts = {
    assigned: assignments.filter((a: any) => a.status === 'assigned').length,
    in_progress: assignments.filter((a: any) => a.status === 'in_progress').length,
    completed: assignments.filter((a: any) => a.status === 'completed').length,
    overdue: assignments.filter((a: any) => a.status !== 'completed' && differenceInDays(today, parseISO(a.due_date)) > 0).length,
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <BackToHome />
      <h1 className="text-2xl font-bold text-foreground">📋 My Assignments</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-lg p-1">
        {STATUS_TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-colors ${tab === t ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
            {t === 'in_progress' ? 'In Progress' : t.charAt(0).toUpperCase() + t.slice(1)}
            {counts[t] > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] bg-primary/10 text-primary">{counts[t]}</span>}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No {tab === 'overdue' ? 'overdue' : tab} assignments</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a: any) => {
            const daysLeft = differenceInDays(parseISO(a.due_date), today);
            const isOverdue = daysLeft < 0 && a.status !== 'completed';
            const isExpanded = expandedId === a.id;

            return (
              <div key={a.id} className={`bg-card rounded-xl border ${isOverdue ? 'border-destructive/30' : 'border-border'} overflow-hidden`}>
                <button onClick={() => setExpandedId(isExpanded ? null : a.id)}
                  className="w-full p-4 flex items-start gap-3 text-left">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isOverdue ? 'bg-destructive/10' : 'bg-primary/10'}`}>
                    {isOverdue ? <AlertTriangle className="w-5 h-5 text-destructive" /> : <ClipboardList className="w-5 h-5 text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm text-foreground">{a.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {isOverdue ? `${Math.abs(daysLeft)} days overdue` : daysLeft === 0 ? 'Due today' : `${daysLeft} days left`}
                      </span>
                      {a.category && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${PILLAR_COLORS[a.category?.toLowerCase()] || 'bg-muted text-muted-foreground'}`}>
                          {a.category}
                        </span>
                      )}
                      {a.priority && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${a.priority === 'high' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}>
                          {a.priority}
                        </span>
                      )}
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                    {a.description && <p className="text-sm text-muted-foreground">{a.description}</p>}
                    
                    {a.feedback && (
                      <div className="bg-primary/5 rounded-lg p-3">
                        <p className="text-[10px] font-semibold text-primary mb-1 flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Coach Feedback</p>
                        <p className="text-xs text-foreground">{a.feedback}</p>
                        {a.score != null && <p className="text-[10px] text-muted-foreground mt-1">Score: {a.score}/10</p>}
                      </div>
                    )}

                    {a.status !== 'completed' && (
                      <div className="flex gap-2">
                        {a.status === 'assigned' && (
                          <button onClick={() => submitMutation.mutate({ id: a.id, status: 'in_progress' })}
                            className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20">
                            Start Working
                          </button>
                        )}
                        {(a.status === 'in_progress' || a.status === 'assigned') && (
                          <button onClick={() => submitMutation.mutate({ id: a.id, status: 'completed' })}
                            className="px-3 py-1.5 rounded-lg bg-[hsl(var(--dharma-green))]/10 text-[hsl(var(--dharma-green))] text-xs font-medium hover:bg-[hsl(var(--dharma-green))]/20 flex items-center gap-1">
                            <Send className="w-3 h-3" /> Mark Complete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
