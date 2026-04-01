import { ASSIGNMENTS, SEEKERS, COURSES } from '@/data/mockData';
import { Plus, Bell } from 'lucide-react';
import { useState } from 'react';
import SendReminderModal from '@/components/SendReminderModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Assignment } from '@/types';

const statusColors: Record<string, string> = {
  assigned: 'bg-sky-blue/10 text-sky-blue',
  in_progress: 'bg-saffron/10 text-saffron',
  submitted: 'bg-chakra-indigo/10 text-chakra-indigo',
  under_review: 'bg-wisdom-purple/10 text-wisdom-purple',
  reviewed: 'bg-dharma-green/10 text-dharma-green',
  overdue: 'bg-destructive/10 text-destructive',
};

const AssignmentsPage = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [assignments, setAssignments] = useState<Assignment[]>(ASSIGNMENTS);
  const filtered = assignments.filter((a) => statusFilter === 'all' || a.status === statusFilter);
  const [reminder, setReminder] = useState<{ seeker: typeof SEEKERS[0]; assignment: typeof ASSIGNMENTS[0] } | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    seeker_id: '', course_id: '', title: '', description: '', type: 'one_time' as Assignment['type'],
    due_date: '', priority: 'medium' as Assignment['priority'],
  });

  const overdueCount = assignments.filter(a => a.status === 'overdue').length;

  const handleCreate = () => {
    if (!newAssignment.seeker_id || !newAssignment.title || !newAssignment.due_date) {
      toast.error('Please fill Seeker, Title and Due Date');
      return;
    }
    const seeker = SEEKERS.find(s => s.id === newAssignment.seeker_id);
    setAssignments(prev => [...prev, {
      id: `asgn_${Date.now()}`,
      seeker_id: newAssignment.seeker_id,
      course_id: newAssignment.course_id,
      title: newAssignment.title,
      description: newAssignment.description,
      type: newAssignment.type,
      due_date: newAssignment.due_date,
      priority: newAssignment.priority,
      status: 'assigned',
    }]);
    toast.success(`Assignment created for ${seeker?.full_name}`);
    setShowCreate(false);
    setNewAssignment({ seeker_id: '', course_id: '', title: '', description: '', type: 'one_time', due_date: '', priority: 'medium' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Assignments</h1>
        <div className="flex gap-2">
          {overdueCount > 0 && (
            <button className="bg-destructive/10 text-destructive px-3 py-2 rounded-xl font-medium text-sm flex items-center gap-2 hover:bg-destructive/20"
              onClick={() => {
                const firstOverdue = assignments.find(a => a.status === 'overdue');
                const seeker = firstOverdue ? SEEKERS.find(s => s.id === firstOverdue.seeker_id) : null;
                if (firstOverdue && seeker) {
                  setReminder({ seeker, assignment: firstOverdue });
                }
              }}>
              <Bell className="w-4 h-4" /> Remind All Overdue ({overdueCount})
            </button>
          )}
          <button onClick={() => setShowCreate(true)} className="gradient-saffron text-primary-foreground px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2 hover:opacity-90">
            <Plus className="w-4 h-4" /> Create Assignment
          </button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'assigned', 'in_progress', 'submitted', 'overdue', 'reviewed'].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {s.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
          </button>
        ))}
      </div>

      <div className="space-y-3 stagger-children">
        {filtered.map((a) => {
          const seeker = SEEKERS.find((s) => s.id === a.seeker_id);
          const daysOverdue = a.status === 'overdue' ? Math.max(1, Math.floor((Date.now() - new Date(a.due_date).getTime()) / 86400000)) : 0;
          return (
            <div key={a.id} className="bg-card rounded-xl p-4 shadow-sm border border-border card-hover">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{a.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{a.description}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs text-muted-foreground">{seeker?.full_name}</span>
                    <span className="text-xs text-muted-foreground">Due: {a.due_date}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${a.priority === 'high' ? 'bg-destructive/10 text-destructive' : a.priority === 'medium' ? 'bg-warning-amber/10 text-warning-amber' : 'bg-muted text-muted-foreground'}`}>{a.priority}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {a.status === 'overdue' && seeker && (
                    <button onClick={() => setReminder({ seeker, assignment: a })}
                      className="px-2 py-1 rounded-lg text-[10px] font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 flex items-center gap-1">
                      <Bell className="w-3 h-3" /> Remind
                    </button>
                  )}
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap ${statusColors[a.status] || 'bg-muted text-muted-foreground'}`}>{a.status.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {reminder && (
        <SendReminderModal
          open={!!reminder}
          onClose={() => setReminder(null)}
          seekerName={reminder.seeker.full_name}
          seekerPhone={reminder.seeker.phone}
          seekerEmail={reminder.seeker.email}
          context="assignment"
          contextData={{
            assignmentTitle: reminder.assignment.title,
            dueDate: reminder.assignment.due_date,
            daysOverdue: Math.max(1, Math.floor((Date.now() - new Date(reminder.assignment.due_date).getTime()) / 86400000)),
          }}
        />
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>📝 Create Assignment</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground">Seeker *</label>
              <select value={newAssignment.seeker_id} onChange={e => setNewAssignment(p => ({ ...p, seeker_id: e.target.value }))} className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm">
                <option value="">Select Seeker</option>
                {SEEKERS.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Course</label>
              <select value={newAssignment.course_id} onChange={e => setNewAssignment(p => ({ ...p, course_id: e.target.value }))} className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm">
                <option value="">Select Course</option>
                {COURSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Title *</label>
              <input value={newAssignment.title} onChange={e => setNewAssignment(p => ({ ...p, title: e.target.value }))} className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" placeholder="Assignment title" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Description</label>
              <textarea value={newAssignment.description} onChange={e => setNewAssignment(p => ({ ...p, description: e.target.value }))} className="mt-1 w-full min-h-[60px] rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Details..." />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-sm font-medium text-foreground">Type</label>
                <select value={newAssignment.type} onChange={e => setNewAssignment(p => ({ ...p, type: e.target.value as Assignment['type'] }))} className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm">
                  <option value="one_time">One Time</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="ongoing">Ongoing</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-foreground">Priority</label>
                <select value={newAssignment.priority} onChange={e => setNewAssignment(p => ({ ...p, priority: e.target.value as Assignment['priority'] }))} className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Due Date *</label>
              <input type="date" value={newAssignment.due_date} onChange={e => setNewAssignment(p => ({ ...p, due_date: e.target.value }))} className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
            </div>
            <button onClick={handleCreate} className="w-full py-2.5 rounded-xl gradient-saffron text-primary-foreground font-medium text-sm">
              Create Assignment
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssignmentsPage;
