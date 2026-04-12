import { Link } from 'react-router-dom';
import { useDbSessions } from '@/hooks/useDbSessions';
import { useDbAssignments } from '@/hooks/useDbAssignments';

const QUICK_MESSAGES = [
  '🎉 Great job on your streak!',
  '💪 Keep going, you\'ve got this!',
  '📝 Don\'t forget today\'s worksheet',
  '📅 Looking forward to our session',
];

export default function CoachActionCenter() {
  const { data: sessions = [] } = useDbSessions();
  const { data: assignments = [] } = useDbAssignments();

  const todayStr = new Date().toISOString().split('T')[0];
  const todaySessions = sessions.filter(s => s.date === todayStr);
  const pendingAssignments = assignments.filter(a => a.status === 'in_progress').length;

  return (
    <div className="bg-card rounded-2xl shadow-md border border-border p-5">
      <h3 className="font-semibold text-foreground mb-4">⚡ Quick Actions (आज का कार्य)</h3>

      <div className="space-y-3">
        {/* Pending Reviews */}
        <div className="p-3 rounded-xl bg-muted/30 border border-border">
          <p className="text-xs font-semibold text-foreground mb-2">📝 PENDING REVIEWS:</p>
          <div className="space-y-1.5">
            <Link to="/coaching/worksheet-pending" className="flex justify-between text-sm text-foreground hover:text-primary">
              <span>Worksheets: 8 pending</span><span className="text-primary">Review All →</span>
            </Link>
            <Link to="/coaching/pending-submissions" className="flex justify-between text-sm text-foreground hover:text-primary">
              <span>Assignments: {pendingAssignments} pending</span><span className="text-primary">Review All →</span>
            </Link>
          </div>
        </div>

        {/* Today's Sessions */}
        <div className="p-3 rounded-xl bg-muted/30 border border-border">
          <p className="text-xs font-semibold text-foreground mb-2">📅 TODAY'S SESSIONS ({todaySessions.length}):</p>
          {todaySessions.length > 0 ? todaySessions.map(s => (
            <div key={s.id} className="flex items-center justify-between py-1.5 text-sm">
              <span className="text-foreground">{s.start_time} - Session #{s.session_number}</span>
              {s.meeting_link && (
                <a href={s.meeting_link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary font-medium">🎥 Join</a>
              )}
            </div>
          )) : (
            <p className="text-xs text-muted-foreground">No sessions today 🧘</p>
          )}
        </div>

        {/* Quick Messages */}
        <div className="p-3 rounded-xl bg-muted/30 border border-border">
          <p className="text-xs font-semibold text-foreground mb-2">💬 QUICK MESSAGES:</p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_MESSAGES.map((msg, i) => (
              <button key={i} className="px-2.5 py-1 rounded-lg text-[10px] bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                {msg}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
