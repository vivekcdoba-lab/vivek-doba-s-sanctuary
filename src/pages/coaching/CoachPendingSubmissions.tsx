import { useState, useMemo } from 'react';
import { useCoachingLang } from '@/components/CoachingLayout';
import { useDbAssignments } from '@/hooks/useDbAssignments';
import { useScopedSeekers } from '@/hooks/useScopedSeekers';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { differenceInDays, parseISO, format } from 'date-fns';
import { ClipboardList, Loader2, CheckCircle, RotateCcw, AlertTriangle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { formatDateDMY } from "@/lib/dateFormat";

const L = {
  title: { en: 'Pending Submissions', hi: 'लंबित प्रस्तुतियाँ' },
  noItems: { en: 'No pending submissions', hi: 'कोई लंबित प्रस्तुति नहीं' },
  approve: { en: 'Approve', hi: 'स्वीकृत करें' },
  revision: { en: 'Request Revision', hi: 'संशोधन अनुरोध' },
  feedback: { en: 'Feedback', hi: 'प्रतिक्रिया' },
  score: { en: 'Score', hi: 'अंक' },
  overdue: { en: 'overdue', hi: 'अतिदेय' },
  daysOverdue: { en: 'days overdue', hi: 'दिन अतिदेय' },
  submitted: { en: 'Submitted', hi: 'प्रस्तुत' },
  assigned: { en: 'Assigned', hi: 'सौंपा गया' },
  inProgress: { en: 'In Progress', hi: 'प्रगति में' },
  bulkApprove: { en: 'Bulk Approve', hi: 'सामूहिक स्वीकृति' },
  selected: { en: 'selected', hi: 'चयनित' },
  all: { en: 'All Pending', hi: 'सभी लंबित' },
  submittedOnly: { en: 'Submitted', hi: 'प्रस्तुत' },
  overdueOnly: { en: 'Overdue', hi: 'अतिदेय' },
};

export default function CoachPendingSubmissions() {
  const { lang } = useCoachingLang();
  const t = (key: keyof typeof L) => L[key][lang];
  const { data: assignments = [], isLoading } = useDbAssignments();
  const { data: seekers = [] } = useScopedSeekers();
  const qc = useQueryClient();

  const [filter, setFilter] = useState<'all' | 'submitted' | 'overdue'>('all');
  const [feedbackMap, setFeedbackMap] = useState<Record<string, string>>({});
  const [scoreMap, setScoreMap] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const today = new Date();

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, any> }) => {
      const { error } = await supabase.from('assignments').update(updates as any).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['db-assignments'] });
    },
  });

  const pending = useMemo(() => {
    let result = assignments.filter(a => ['submitted', 'assigned', 'in_progress', 'under_review'].includes(a.status));
    if (filter === 'submitted') result = result.filter(a => a.status === 'submitted');
    if (filter === 'overdue') result = result.filter(a => a.status !== 'completed' && differenceInDays(today, parseISO(a.due_date)) > 0);
    return result.sort((a, b) => {
      // Submitted first, then by due_date
      if (a.status === 'submitted' && b.status !== 'submitted') return -1;
      if (b.status === 'submitted' && a.status !== 'submitted') return 1;
      return a.due_date.localeCompare(b.due_date);
    });
  }, [assignments, filter, today]);

  const seekerName = (id: string) => seekers.find(s => s.id === id)?.full_name || 'Unknown';

  const handleApprove = (id: string) => {
    updateMutation.mutate({
      id,
      updates: {
        status: 'reviewed',
        feedback: feedbackMap[id] || null,
        score: scoreMap[id] || null,
      },
    }, { onSuccess: () => toast.success('Assignment approved') });
  };

  const handleRevision = (id: string) => {
    if (!feedbackMap[id]?.trim()) {
      toast.error('Please provide feedback for revision request');
      return;
    }
    updateMutation.mutate({
      id,
      updates: { status: 'revision_requested', feedback: feedbackMap[id] },
    }, { onSuccess: () => toast.success('Revision requested') });
  };

  const handleBulkApprove = () => {
    if (selected.size === 0) return;
    selected.forEach(id => {
      updateMutation.mutate({
        id,
        updates: { status: 'reviewed', feedback: feedbackMap[id] || null, score: scoreMap[id] || null },
      });
    });
    setSelected(new Set());
    toast.success(`${selected.size} assignments approved`);
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const getDaysOverdue = (dueDate: string) => {
    const diff = differenceInDays(today, parseISO(dueDate));
    return diff > 0 ? diff : 0;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-saffron" /> {t('title')}
        </h1>
        {selected.size > 0 && (
          <Button size="sm" onClick={handleBulkApprove}>
            <CheckCircle className="w-3.5 h-3.5 mr-1" />
            {t('bulkApprove')} ({selected.size} {t('selected')})
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: t('submittedOnly'), value: assignments.filter(a => a.status === 'submitted').length, emoji: '📤' },
          { label: t('assigned'), value: assignments.filter(a => ['assigned', 'in_progress'].includes(a.status)).length, emoji: '📌' },
          { label: t('overdueOnly'), value: assignments.filter(a => a.status !== 'completed' && a.status !== 'reviewed' && differenceInDays(today, parseISO(a.due_date)) > 0).length, emoji: '⚠️', danger: true },
        ].map((s, i) => (
          <div key={i} className={`bg-card rounded-xl border p-3 text-center ${s.danger ? 'border-destructive/30' : 'border-border'}`}>
            <div className="text-xl mb-1">{s.emoji}</div>
            <div className={`text-xl font-bold ${s.danger ? 'text-destructive' : 'text-foreground'}`}>{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {([
          { key: 'all' as const, label: t('all') },
          { key: 'submitted' as const, label: t('submittedOnly') },
          { key: 'overdue' as const, label: t('overdueOnly') },
        ]).map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {pending.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">{t('noItems')}</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {pending.map(assignment => {
            const daysOver = getDaysOverdue(assignment.due_date);
            const isSubmitted = assignment.status === 'submitted';
            return (
              <Card key={assignment.id} className={`transition-all ${isSubmitted ? 'border-chakra-indigo/30' : daysOver > 0 ? 'border-destructive/30' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox checked={selected.has(assignment.id)} onCheckedChange={() => toggleSelect(assignment.id)} className="mt-1" />
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-foreground">{assignment.title}</h3>
                          <p className="text-sm text-muted-foreground">{seekerName(assignment.seeker_id)}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge variant="outline" className={
                            assignment.status === 'submitted' ? 'bg-chakra-indigo/10 text-chakra-indigo' :
                            'bg-sky-blue/10 text-sky-blue'
                          }>
                            {assignment.status}
                          </Badge>
                          {daysOver > 0 && (
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              {daysOver}d {t('overdue')}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Due: {formatDateDMY(parseISO(assignment.due_date))}</span>
                        {assignment.category && <Badge variant="secondary" className="text-[10px]">{assignment.category}</Badge>}
                        {assignment.priority && (
                          <Badge variant={assignment.priority === 'high' ? 'destructive' : 'outline'} className="text-[10px]">
                            {assignment.priority}
                          </Badge>
                        )}
                      </div>

                      {assignment.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{assignment.description}</p>
                      )}

                      {/* Review interface */}
                      <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-3">
                          <label className="text-xs font-medium text-muted-foreground">{t('score')}:</label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                              <button key={n} onClick={() => setScoreMap(p => ({ ...p, [assignment.id]: n }))}
                                className={`w-6 h-6 rounded text-xs font-bold transition-colors ${
                                  (scoreMap[assignment.id] || 0) >= n ? 'bg-saffron text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}>
                                {n}
                              </button>
                            ))}
                          </div>
                        </div>
                        <Textarea
                          placeholder="Add feedback..."
                          value={feedbackMap[assignment.id] || ''}
                          onChange={e => setFeedbackMap(p => ({ ...p, [assignment.id]: e.target.value }))}
                          className="min-h-[60px] text-sm"
                          maxLength={1000}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleApprove(assignment.id)} disabled={updateMutation.isPending}
                            className="bg-dharma-green hover:bg-dharma-green/90">
                            <CheckCircle className="w-3.5 h-3.5 mr-1" /> {t('approve')}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleRevision(assignment.id)} disabled={updateMutation.isPending}>
                            <RotateCcw className="w-3.5 h-3.5 mr-1" /> {t('revision')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
