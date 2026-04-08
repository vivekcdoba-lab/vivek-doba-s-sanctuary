import { useState } from 'react';
import { Plus, Bell } from 'lucide-react';
import SendReminderModal from '@/components/SendReminderModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useDbAssignments, useCreateAssignment } from '@/hooks/useDbAssignments';
import { useSeekerProfiles } from '@/hooks/useSeekerProfiles';
import { useDbCourses } from '@/hooks/useDbCourses';
import { Loader2 } from 'lucide-react';

const statusColors: Record<string, string> = {
  assigned: 'bg-sky-blue/10 text-sky-blue',
  in_progress: 'bg-saffron/10 text-saffron',
  submitted: 'bg-chakra-indigo/10 text-chakra-indigo',
  under_review: 'bg-wisdom-purple/10 text-wisdom-purple',
  reviewed: 'bg-dharma-green/10 text-dharma-green',
  overdue: 'bg-destructive/10 text-destructive',
};

const AssignmentsPage = () => {
  const { data: assignments = [], isLoading } = useDbAssignments();
  const { data: seekers = [] } = useSeekerProfiles();
  const { data: courses = [] } = useDbCourses();
  const createAssignment = useCreateAssignment();
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [newAssignment, setNewAssignment] = useState({ seeker_id: '', course_id: '', title: '', description: '', type: 'one_time', due_date: '', priority: 'medium' });

  const filtered = assignments.filter(a => statusFilter === 'all' || a.status === statusFilter);

  const handleCreate = async () => {
    if (!newAssignment.seeker_id || !newAssignment.title || !newAssignment.due_date) { toast.error('Please fill Seeker, Title and Due Date'); return; }
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
      setNewAssignment({ seeker_id: '', course_id: '', title: '', description: '', type: 'one_time', due_date: '', priority: 'medium' });
    } catch (e: any) { toast.error(e.message || 'Failed'); }
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Assignments</h1>
        <button onClick={() => setShowCreate(true)} className="gradient-saffron text-primary-foreground px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2 hover:opacity-90">
          <Plus className="w-4 h-4" /> Create Assignment
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'assigned', 'in_progress', 'submitted', 'overdue', 'reviewed'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16"><span className="text-5xl block mb-4">📋</span><p className="text-muted-foreground">No assignments found.</p></div>
      ) : (
        <div className="space-y-3 stagger-children">
          {filtered.map(a => {
            const seeker = seekers.find(s => s.id === a.seeker_id);
            return (
              <div key={a.id} className="bg-card rounded-xl p-4 shadow-sm border border-border card-hover">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{a.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{a.description}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-xs text-muted-foreground">{seeker?.full_name || 'Unknown'}</span>
                      <span className="text-xs text-muted-foreground">Due: {a.due_date}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${a.priority === 'high' ? 'bg-destructive/10 text-destructive' : a.priority === 'medium' ? 'bg-warning-amber/10 text-warning-amber' : 'bg-muted text-muted-foreground'}`}>{a.priority}</span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap ${statusColors[a.status] || 'bg-muted text-muted-foreground'}`}>{a.status.replace('_', ' ')}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>📝 Create Assignment</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground">Seeker *</label>
              <select value={newAssignment.seeker_id} onChange={e => setNewAssignment(p => ({ ...p, seeker_id: e.target.value }))} className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm">
                <option value="">Select Seeker</option>
                {seekers.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Title *</label>
              <input value={newAssignment.title} onChange={e => setNewAssignment(p => ({ ...p, title: e.target.value }))} className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" placeholder="Assignment title" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Description</label>
              <textarea value={newAssignment.description} onChange={e => setNewAssignment(p => ({ ...p, description: e.target.value }))} className="mt-1 w-full min-h-[60px] rounded-lg border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Due Date *</label>
              <input type="date" value={newAssignment.due_date} onChange={e => setNewAssignment(p => ({ ...p, due_date: e.target.value }))} className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
            </div>
            <button onClick={handleCreate} disabled={createAssignment.isPending} className="w-full py-2.5 rounded-xl gradient-saffron text-primary-foreground font-medium text-sm">
              {createAssignment.isPending ? 'Creating...' : 'Create Assignment'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssignmentsPage;
