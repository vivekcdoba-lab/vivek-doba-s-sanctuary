import { Link } from 'react-router-dom';

interface Assignment {
  id: string;
  title: string;
  status: string;
  due_date: string;
}

interface AssignmentsWidgetProps {
  assignments: Assignment[];
  basePath?: string;
}

const AssignmentsWidget = ({ assignments, basePath = '/seeker/tasks' }: AssignmentsWidgetProps) => {
  const pending = assignments.filter(a => ['assigned', 'in_progress'].includes(a.status));
  const overdue = assignments.filter(a => a.status === 'overdue');

  return (
    <div className="bg-card rounded-2xl shadow-md border border-border p-5">
      <h3 className="text-sm font-semibold text-foreground mb-1">✅ Assignments</h3>
      <p className="text-xs text-muted-foreground mb-3">📋 {pending.length} Pending | ⚠️ {overdue.length} Overdue</p>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {[...overdue, ...pending].slice(0, 4).map((a) => (
          <div key={a.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
            <span className="text-xs">{a.status === 'overdue' ? '🔴' : '🔵'}</span>
            <p className="text-sm text-foreground flex-1 truncate">{a.title}</p>
            <span className="text-[10px] text-muted-foreground">{a.due_date}</span>
          </div>
        ))}
        {pending.length === 0 && overdue.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-2">All caught up! 🎉</p>
        )}
      </div>
      <Link to={basePath} className="block text-center text-xs text-primary mt-3 hover:underline">View All →</Link>
    </div>
  );
};

export default AssignmentsWidget;
