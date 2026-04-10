import { useState } from 'react';
import { Plus, MessageSquare, CheckCircle, Clock, AlertTriangle, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useDbAssignments, useCreateAssignment } from '@/hooks/useDbAssignments';
import { useSeekerProfiles } from '@/hooks/useSeekerProfiles';
import { useDbCourses } from '@/hooks/useDbCourses';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { differenceInDays, parseISO, format } from 'date-fns';

const CATEGORIES = [
  { value: 'reading', label: '📖 Reading' },
  { value: 'watching', label: '🎬 Watching' },
  { value: 'writing', label: '✍️ Writing/Reflection' },
  { value: 'action', label: '🎯 Action/Practice' },
  { value: 'business', label: '💼 Business Task' },
  { value: 'spiritual', label: '🧘 Spiritual Practice' },
  { value: 'challenge', label: '💪 Challenge' },
];

const DIMENSIONS = [
  { value: 'dharma', label: '🕉️ Dharma' },
  { value: 'artha', label: '💰 Artha' },
  { value: 'kama', label: '❤️ Kama' },
  { value: 'moksha', label: '☀️ Moksha' },
];

const statusColors: Record<string, string> = {
  assigned: 'bg-[hsl(var(--sky-blue))]/10 text-[hsl(var(--sky-blue))]',
  in_progress: 'bg-[hsl(var(--saffron))]/10 text-[hsl(var(--saffron))]',
  submitted: 'bg-[hsl(var(--chakra-indigo))]/10 text-[hsl(var(--chakra-indigo))]',
  completed: 'bg-[hsl(var(--dharma-green))]/10 text-[hsl(var(--dharma-green))]',
  overdue: 'bg-destructive/10 text-destructive',
};

const AssignmentsPage = () => {
  const { data: assignments = [], isLoading } = useDbAssignments();
  const { data: seekers = [] } = useSeekerProfiles();
  const { data: courses = [] } = useDbCourses();
  const createAssignment = useCreateAssignment();
  const qc = useQueryClient();

  const [statusFilter, setStatusFilter] = useState('all');
  const [seekerFilter, setSeekerFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackScore, setFeedbackScore] = useState(7);

  const [newAssignment, setNewAssignment] = useState({
    seeker_id: '', course_id: '', title: '', description: '',
    type: 'action', category: '', due_date: '', priority: 'medium',
  });

  const today = new Date();

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, any> }) => {
      const { error } = await supabase.from('assignments').update(updates as any).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['db-assignments'] });
      toast.success('Assignment updated');
      setFeedbackText('');
      setFeedbackScore(7);
    },
  });

  const filtered = assignments.filter(a => {
    const isOverdue = a.status !== 'completed' && differenceInDays(today, parseISO(a.due_date)) > 0;
    if (statusFilter === 'overdue') return isOverdue;
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (seekerFilter !== 'all' && a.seeker_id !== seekerFilter) return false;
    return true;
  });

  // Analytics
  const total = assignments.length;
  const completedCount = assignments.filter(a => a.status === 'completed').length;
  const overdueCount = assignments.filter(a => a.status !== 'completed' && differenceInDays(today, parseISO(a.due_date)) > 0).length;
  const inProgressCount = assignments.filter(a => a.status === 'in_progress').length;
  const completionRate = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  const handleCreate = async () => {
    if (!newAssignment.seeker_id || !newAssignment.title || !newAssignment.due_date) {
      toast.error('Fill Seeker, Title and Due Date');
      return;
    }
    try {
      await createAssignment.mutateAsync({
        seeker_id: newAssignment.seeker_id,
        title: newAssignment.title,
        due_date: newAssignment.due_date,
        description: newAssignment.description,
        type: newAssignment.type,
        priority: newAssignment.priority,
        course_id: newAssignment.course_id || undefined,
      });
      toast.success('Assignment created!');
      setShowCreate(false);
      setNewAssignment({ seeker_id: '', course_id: '', title: '', description: '', type: 'action', category: '', due_date: '', priority: 'medium' });
    } catch (e: any) {
      toast.error(e.message || 'Failed');
    }
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">📋 Assignments</h1>
        <button onClick={() => setShowCreate(true)}
          className="gradient-saffron text-primary-foreground px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2 hover:opacity-90">
          <Plus className="w-4 h-4" /> Create Assignment
        </button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: 'Total', value: total, emoji: '📋' },
          { label: 'Assigned', value: assignments.filter(a => a.status === 'assigned').length, emoji: '📌' },
          { label: 'In Progress', value: inProgressCount, emoji: '⏳' },
          { label: 'Completed', value: completedCount, emoji: '✅' },
          { label: 'Overdue', value: overdueCount, emoji: '⚠️' },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-xl border border-border p-3 text-center">
            <p className="text-xl font-bold text-foreground">{s.emoji} {s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border p-3 text-center">
        <p className="text-sm text-muted-foreground">Completion Rate</p>
        <div className="w-full bg-muted rounded-full h-2 mt-1">
          <div className="bg-primary rounded-full h-2 transition-all" style={{ width: `${completionRate}%` }} />
        </div>
        <p className="text-xs text-muted-foreground mt-1">{completionRate}%</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap items-center">
        <div className="flex gap-1.5 flex-wrap">
          {['all', 'assigned', 'in_progress', 'completed', 'overdue'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {s === 'all' ? 'All' : s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>
        <select value={seekerFilter} onChange={e => setSeekerFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-input bg-background text-foreground text-sm">
          <option value="all">All Seekers</option>
          {seekers.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
        </select>
      </div>

      {/* Assignments List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-5xl block mb-4">📋</span>
          <p className="text-muted-foreground">No assignments found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(a => {
            const seeker = seekers.find(s => s.id === a.seeker_id);
            const isOverdue = a.status !== 'completed' && differenceInDays(today, parseISO(a.due_date)) > 0;
            const isExpanded = expandedId === a.id;
            const daysLeft = differenceInDays(parseISO(a.due_date), today);

            return (
              <div key={a.id} className={`bg-card rounded-xl border ${isOverdue ? 'border-destructive/30' : 'border-border'} overflow-hidden`}>
                <button onClick={() => setExpandedId(isExpanded ? null : a.id)}
                  className="w-full p-4 flex items-start justify-between gap-3 text-left">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{a.title}</h3>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      <span className="text-xs text-muted-foreground">👤 {seeker?.full_name || 'Unknown'}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {isOverdue ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? 'Due today' : `${daysLeft}d left`}
                      </span>
                      {a.type && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {CATEGORIES.find(c => c.value === a.type)?.label || a.type}
                        </span>
                      )}
                      {a.category && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                          {DIMENSIONS.find(d => d.value === a.category)?.label || a.category}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${a.priority === 'high' ? 'bg-destructive/10 text-destructive' : a.priority === 'medium' ? 'bg-[hsl(var(--warning-amber))]/10 text-[hsl(var(--warning-amber))]' : 'bg-muted text-muted-foreground'}`}>
                        {a.priority}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap ${statusColors[isOverdue ? 'overdue' : a.status] || 'bg-muted text-muted-foreground'}`}>
                      {isOverdue ? 'Overdue' : a.status.replace('_', ' ')}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                    {a.description && <p className="text-sm text-muted-foreground">{a.description}</p>}
                    <p className="text-xs text-muted-foreground">📅 Due: {format(parseISO(a.due_date), 'MMMM dd, yyyy')}</p>

                    {/* Existing feedback */}
                    {a.feedback && (
                      <div className="bg-primary/5 rounded-lg p-3">
                        <p className="text-xs font-semibold text-primary mb-1 flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" /> Your Feedback
                        </p>
                        <p className="text-sm text-foreground">{a.feedback}</p>
                        {a.score != null && <p className="text-xs text-muted-foreground mt-1">Score: {a.score}/10</p>}
                      </div>
                    )}

                    {/* Feedback form for completed/in_progress */}
                    {(a.status === 'completed' || a.status === 'in_progress') && (
                      <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                        <p className="text-xs font-semibold text-foreground">📝 Add Feedback & Score</p>
                        <Textarea
                          value={feedbackText}
                          onChange={e => setFeedbackText(e.target.value)}
                          placeholder="Write feedback for seeker..."
                          className="text-sm"
                        />
                        <div className="flex items-center gap-3">
                          <label className="text-xs text-muted-foreground">Score:</label>
                          <input type="range" min={1} max={10} value={feedbackScore}
                            onChange={e => setFeedbackScore(Number(e.target.value))}
                            className="flex-1" />
                          <span className="text-sm font-bold text-foreground w-8">{feedbackScore}/10</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateMutation.mutate({ id: a.id, updates: { feedback: feedbackText, score: feedbackScore } })}
                            className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium flex items-center gap-1">
                            <Send className="w-3 h-3" /> Submit Feedback
                          </button>
                          {a.status !== 'completed' && (
                            <button
                              onClick={() => updateMutation.mutate({ id: a.id, updates: { status: 'completed', feedback: feedbackText, score: feedbackScore } })}
                              className="px-3 py-1.5 rounded-lg bg-[hsl(var(--dharma-green))]/10 text-[hsl(var(--dharma-green))] text-xs font-medium flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> Approve
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Assignment Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>📝 Create Assignment</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground">Seeker *</label>
              <select value={newAssignment.seeker_id} onChange={e => setNewAssignment(p => ({ ...p, seeker_id: e.target.value }))}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm">
                <option value="">Select Seeker</option>
                {seekers.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Title *</label>
              <input value={newAssignment.title} onChange={e => setNewAssignment(p => ({ ...p, title: e.target.value }))}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" placeholder="Assignment title" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Description</label>
              <Textarea value={newAssignment.description} onChange={e => setNewAssignment(p => ({ ...p, description: e.target.value }))}
                className="mt-1" placeholder="Instructions for the seeker..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground">Category</label>
                <select value={newAssignment.type} onChange={e => setNewAssignment(p => ({ ...p, type: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm">
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Dimension</label>
                <select value={newAssignment.category} onChange={e => setNewAssignment(p => ({ ...p, category: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm">
                  <option value="">Select</option>
                  {DIMENSIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground">Due Date *</label>
                <input type="date" value={newAssignment.due_date} onChange={e => setNewAssignment(p => ({ ...p, due_date: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Priority</label>
                <select value={newAssignment.priority} onChange={e => setNewAssignment(p => ({ ...p, priority: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Course (optional)</label>
              <select value={newAssignment.course_id} onChange={e => setNewAssignment(p => ({ ...p, course_id: e.target.value }))}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm">
                <option value="">No Course</option>
                {courses.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <button onClick={handleCreate} disabled={createAssignment.isPending}
              className="w-full py-2.5 rounded-xl gradient-saffron text-primary-foreground font-medium text-sm">
              {createAssignment.isPending ? 'Creating...' : 'Create Assignment'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssignmentsPage;
