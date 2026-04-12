import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO, isPast } from 'date-fns';
import { ClipboardList, Send, Loader2, Upload, FileText, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const STATUS_COLORS: Record<string, string> = {
  assigned: 'bg-blue-500/10 text-blue-600',
  in_progress: 'bg-yellow-500/10 text-yellow-600',
  submitted: 'bg-green-500/10 text-green-600',
  reviewed: 'bg-purple-500/10 text-purple-600',
  overdue: 'bg-red-500/10 text-red-600',
};

const SeekerSubmitAssignment = () => {
  const { profile } = useAuthStore();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [response, setResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!profile?.id) return;
    const fetch = async () => {
      const { data } = await supabase
        .from('assignments')
        .select('*')
        .eq('seeker_id', profile.id)
        .order('due_date', { ascending: true });
      setAssignments(data || []);
      setLoading(false);
    };
    fetch();
  }, [profile?.id]);

  const handleSubmit = async () => {
    if (!selectedId || !response.trim()) { toast.error('Please write a response'); return; }
    setSubmitting(true);
    const { error } = await supabase.from('assignments').update({ status: 'submitted', description: response } as any).eq('id', selectedId);
    if (error) toast.error('Failed to submit');
    else {
      toast.success('Assignment submitted! 🎉');
      setAssignments(prev => prev.map(a => a.id === selectedId ? { ...a, status: 'submitted' } : a));
      setSelectedId(null); setResponse('');
    }
    setSubmitting(false);
  };

  const pending = assignments.filter(a => ['assigned', 'in_progress'].includes(a.status));
  const submitted = assignments.filter(a => ['submitted', 'under_review', 'reviewed'].includes(a.status));
  const overdue = pending.filter(a => isPast(parseISO(a.due_date)));
  const completionRate = assignments.length ? Math.round((submitted.length / assignments.length) * 100) : 0;

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Submit Assignment</h1>
        <p className="text-muted-foreground">Complete and submit your coaching assignments</p>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
          <div className="flex gap-4 mt-3 text-sm">
            <span className="text-muted-foreground">Pending: <strong className="text-foreground">{pending.length}</strong></span>
            <span className="text-muted-foreground">Submitted: <strong className="text-foreground">{submitted.length}</strong></span>
            {overdue.length > 0 && <span className="text-red-500 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Overdue: <strong>{overdue.length}</strong></span>}
          </div>
        </CardContent>
      </Card>

      {/* Pending Assignments */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2"><ClipboardList className="h-5 w-5 text-primary" /> Pending Assignments</h2>
        {pending.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground"><CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-green-500" /><p>All caught up! No pending assignments.</p></CardContent></Card>
        ) : pending.map(a => {
          const isOverdue = isPast(parseISO(a.due_date));
          const isSelected = selectedId === a.id;
          return (
            <Card key={a.id} className={`transition-shadow ${isSelected ? 'ring-2 ring-primary' : 'hover:shadow-md'} ${isOverdue ? 'border-red-300' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between cursor-pointer" onClick={() => setSelectedId(isSelected ? null : a.id)}>
                  <div className="space-y-1">
                    <h3 className="font-semibold">{a.title}</h3>
                    {a.description && <p className="text-sm text-muted-foreground line-clamp-2">{a.description}</p>}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={STATUS_COLORS[isOverdue ? 'overdue' : a.status] || ''}>{isOverdue ? 'Overdue' : a.status}</Badge>
                      <span className="text-xs text-muted-foreground">Due: {format(parseISO(a.due_date), 'MMM d, yyyy')}</span>
                      {a.priority && <Badge variant="outline" className="text-xs">{a.priority}</Badge>}
                    </div>
                  </div>
                  <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                </div>

                {isSelected && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    <Textarea placeholder="Write your response here..." value={response} onChange={e => setResponse(e.target.value)} rows={5} />
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">{response.length} characters</p>
                      <Button onClick={handleSubmit} disabled={submitting || !response.trim()} className="gap-2">
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Submit
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Submitted Assignments */}
      {submitted.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">✅ Submitted ({submitted.length})</h2>
          {submitted.map(a => (
            <Card key={a.id} className="opacity-80">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{format(parseISO(a.due_date), 'MMM d, yyyy')}</p>
                </div>
                <div className="flex items-center gap-2">
                  {a.score != null && <Badge variant="secondary">Score: {a.score}/10</Badge>}
                  <Badge className={STATUS_COLORS[a.status] || ''}>{a.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SeekerSubmitAssignment;
