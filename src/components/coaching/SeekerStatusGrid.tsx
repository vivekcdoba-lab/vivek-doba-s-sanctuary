import { useSeekerProfiles } from '@/hooks/useSeekerProfiles';
import { useDbAssignments } from '@/hooks/useDbAssignments';
import { Link } from 'react-router-dom';

export default function SeekerStatusGrid() {
  const { data: seekers = [] } = useSeekerProfiles();
  const { data: assignments = [] } = useDbAssignments();

  const getStatus = (seekerId: string) => {
    const overdue = assignments.filter(a => a.seeker_id === seekerId && a.status === 'overdue');
    if (overdue.length > 0) return 'red';
    const pending = assignments.filter(a => a.seeker_id === seekerId && a.status === 'in_progress');
    if (pending.length > 2) return 'yellow';
    return 'green';
  };

  const statusCounts = { green: 0, yellow: 0, red: 0 };
  seekers.forEach(s => { statusCounts[getStatus(s.id) as keyof typeof statusCounts]++; });

  return (
    <div className="bg-card rounded-2xl shadow-md border border-border p-5">
      <h3 className="font-semibold text-foreground mb-3">👥 Seeker Status at a Glance</h3>
      <div className="flex gap-4 mb-4 text-sm">
        <span className="text-green-600">🟢 On Track: {statusCounts.green}</span>
        <span className="text-yellow-600">🟡 Attention: {statusCounts.yellow}</span>
        <span className="text-red-600">🔴 At Risk: {statusCounts.red}</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {seekers.slice(0, 8).map(s => {
          const status = getStatus(s.id);
          const statusEmoji = status === 'green' ? '🟢' : status === 'yellow' ? '🟡' : '🔴';
          return (
            <Link key={s.id} to={`/seekers/${s.id}`} className="bg-muted/30 rounded-xl p-3 text-center card-hover border border-border">
              <span className="text-lg">{statusEmoji}</span>
              <p className="text-sm font-medium text-foreground mt-1 truncate">{s.full_name}</p>
              <p className="text-[10px] text-muted-foreground">{s.email?.split('@')[0]}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
