import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import BackToHome from '@/components/BackToHome';
import { ClipboardList, Clock, AlertTriangle, CheckCircle, Send, MessageSquare, ChevronDown, ChevronUp, BookOpen, Eye, Zap, Target, Filter } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

const CATEGORY_CONFIG: Record<string, { emoji: string; label: string }> = {
  reading: { emoji: '📖', label: 'Reading' },
  watching: { emoji: '🎬', label: 'Watching' },
  writing: { emoji: '✍️', label: 'Writing/Reflection' },
  action: { emoji: '🎯', label: 'Action/Practice' },
  business: { emoji: '💼', label: 'Business Task' },
  spiritual: { emoji: '🧘', label: 'Spiritual Practice' },
  challenge: { emoji: '💪', label: 'Challenge' },
};

const DIMENSION_CONFIG: Record<string, { emoji: string; label: string; cls: string }> = {
  dharma: { emoji: '🕉️', label: 'Dharma', cls: 'bg-[hsl(var(--dharma-green))]/10 text-[hsl(var(--dharma-green))]' },
  artha: { emoji: '💰', label: 'Artha', cls: 'bg-[hsl(var(--saffron))]/10 text-[hsl(var(--saffron))]' },
  kama: { emoji: '❤️', label: 'Kama', cls: 'bg-destructive/10 text-destructive' },
  moksha: { emoji: '☀️', label: 'Moksha', cls: 'bg-[hsl(var(--wisdom-purple))]/10 text-[hsl(var(--wisdom-purple))]' },
};

const STATUS_TABS = ['assigned', 'in_progress', 'completed', 'overdue'] as const;

export default function SeekerTasksEnhanced() {
  const { profile } = useAuthStore();
  const [tab, setTab] = useState<string>('assigned');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dimensionFilter, setDimensionFilter] = useState<string>('all');
  const [submission, setSubmission] = useState('');
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
      const { error } = await supabase.from('assignments').update({ status } as any).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['seeker-assignments'] });
      toast({ title: '✅ Assignment updated!' });
      setExpandedId(null);
      setSubmission('');
    },
  });

  const today = new Date();
  const counts = {
    assigned: assignments.filter((a: any) => a.status === 'assigned').length,
    in_progress: assignments.filter((a: any) => a.status === 'in_progress').length,
    completed: assignments.filter((a: any) => a.status === 'completed').length,
    overdue: assignments.filter((a: any) => a.status !== 'completed' && differenceInDays(today, parseISO(a.due_date)) > 0).length,
  };

  const tabIcons = { assigned: '📋', in_progress: '⏳', completed: '✅', overdue: '⚠️' };

  let filtered = assignments.filter((a: any) => {
    if (tab === 'overdue') return a.status !== 'completed' && differenceInDays(today, parseISO(a.due_date)) > 0;
    return a.status === tab;
  });

  if (dimensionFilter !== 'all') {
    filtered = filtered.filter((a: any) => a.category?.toLowerCase() === dimensionFilter);
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <BackToHome />
      <h1 className="text-2xl font-bold text-foreground">📋 My Assignments</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-2">
        {STATUS_TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`bg-card rounded-xl border p-3 text-center transition-all ${tab === t ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/30'}`}>
            <p className="text-lg font-bold text-foreground">{tabIcons[t]} {counts[t]}</p>
            <p className="text-[9px] text-muted-foreground">
              {t === 'in_progress' ? 'In Progress' : t.charAt(0).toUpperCase() + t.slice(1)}
            </p>
          </button>
        ))}
      </div>

      {/* Dimension Filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <button onClick={() => setDimensionFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${dimensionFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
          All
        </button>
        {Object.entries(DIMENSION_CONFIG).map(([key, cfg]) => (
          <button key={key} onClick={() => setDimensionFilter(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${dimensionFilter === key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {cfg.emoji} {cfg.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>
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
            const catCfg = CATEGORY_CONFIG[a.type?.toLowerCase()] || CATEGORY_CONFIG.action;
            const dimCfg = DIMENSION_CONFIG[a.category?.toLowerCase()] || null;

            return (
              <div key={a.id} className={`bg-card rounded-xl border ${isOverdue ? 'border-destructive/30' : 'border-border'} overflow-hidden`}>
                <button onClick={() => setExpandedId(isExpanded ? null : a.id)}
                  className="w-full p-4 flex items-start gap-3 text-left">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-lg ${isOverdue ? 'bg-destructive/10' : 'bg-primary/10'}`}>
                    {isOverdue ? '⚠️' : catCfg.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm text-foreground">{a.title}</h3>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {a.status === 'completed'
                          ? `Completed ${format(parseISO(a.updated_at), 'MMM dd')}`
                          : isOverdue
                            ? `${Math.abs(daysLeft)} days overdue`
                            : daysLeft === 0
                              ? 'Due today'
                              : `${daysLeft} days left`}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {catCfg.emoji} {catCfg.label}
                      </span>
                      {dimCfg && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${dimCfg.cls}`}>
                          {dimCfg.emoji} {dimCfg.label}
                        </span>
                      )}
                      {a.priority === 'high' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium">
                          🔥 High
                        </span>
                      )}
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                    {a.description && (
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-xs font-medium text-foreground mb-1">📝 Description</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{a.description}</p>
                      </div>
                    )}

                    {/* Due date */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>📅 Due: {format(parseISO(a.due_date), 'MMMM dd, yyyy')}</span>
                      {(a.courses as any)?.name && <span>📚 Course: {(a.courses as any).name}</span>}
                    </div>

                    {/* Coach Feedback */}
                    {a.feedback && (
                      <div className="bg-primary/5 rounded-lg p-3">
                        <p className="text-[10px] font-semibold text-primary mb-1 flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" /> Coach Feedback
                        </p>
                        <p className="text-xs text-foreground whitespace-pre-wrap">{a.feedback}</p>
                        {a.score != null && (
                          <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                            ⭐ Score: {a.score}/10
                          </p>
                        )}
                      </div>
                    )}

                    {/* Action buttons */}
                    {a.status !== 'completed' && (
                      <div className="flex gap-2 flex-wrap">
                        {a.status === 'assigned' && (
                          <button onClick={() => submitMutation.mutate({ id: a.id, status: 'in_progress' })}
                            className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 flex items-center gap-1">
                            <Zap className="w-3 h-3" /> Start Working
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
