import { ASSIGNMENTS, SEEKERS, COURSES } from '@/data/mockData';
import { Plus, Filter } from 'lucide-react';
import { useState } from 'react';

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
  const filtered = ASSIGNMENTS.filter((a) => statusFilter === 'all' || a.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Assignments</h1>
        <button className="gradient-saffron text-primary-foreground px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2 hover:opacity-90">
          <Plus className="w-4 h-4" /> Create Assignment
        </button>
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
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap ${statusColors[a.status] || 'bg-muted text-muted-foreground'}`}>{a.status.replace('_', ' ')}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AssignmentsPage;
