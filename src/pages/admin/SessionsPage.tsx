import { SESSIONS, SEEKERS, COURSES } from '@/data/mockData';
import { Plus, Video, MapPin, Bell } from 'lucide-react';
import { useState } from 'react';
import SendReminderModal from '@/components/SendReminderModal';

const statusColors: Record<string, string> = {
  scheduled: 'bg-sky-blue/10 text-sky-blue',
  completed: 'bg-dharma-green/10 text-dharma-green',
  cancelled: 'bg-destructive/10 text-destructive',
  in_progress: 'bg-saffron/10 text-saffron',
};

const SessionsPage = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const filtered = SESSIONS.filter((s) => statusFilter === 'all' || s.status === statusFilter);
  const [reminder, setReminder] = useState<{ seeker: typeof SEEKERS[0]; session: typeof SESSIONS[0] } | null>(null);

  const isTomorrow = (dateStr: string) => {
    const d = new Date(dateStr);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return d.toDateString() === tomorrow.toDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Sessions</h1>
        <button className="gradient-sacred text-primary-foreground px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2 hover:opacity-90">
          <Plus className="w-4 h-4" /> Schedule Session
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'scheduled', 'completed', 'cancelled'].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border">
            <th className="text-left p-3 font-medium text-muted-foreground">Date/Time</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Seeker</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Course</th>
            <th className="text-left p-3 font-medium text-muted-foreground">#</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Type</th>
            <th className="text-left p-3 font-medium text-muted-foreground"></th>
          </tr></thead>
          <tbody>
            {filtered.map((session) => {
              const seeker = SEEKERS.find((s) => s.id === session.seeker_id);
              const course = COURSES.find((c) => c.id === session.course_id);
              const showRemind = session.status === 'scheduled' && (isTomorrow(session.date) || session.date >= new Date().toISOString().split('T')[0]);
              return (
                <tr key={session.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="p-3"><p className="font-medium text-foreground">{session.date}</p><p className="text-xs text-muted-foreground">{session.start_time} - {session.end_time}</p></td>
                  <td className="p-3 font-medium text-foreground">{seeker?.full_name}</td>
                  <td className="p-3 text-muted-foreground text-xs">{course?.name?.slice(0, 25)}</td>
                  <td className="p-3 text-foreground">#{session.session_number}</td>
                  <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${statusColors[session.status] || 'bg-muted text-muted-foreground'}`}>{session.status}</span></td>
                  <td className="p-3">{session.location_type === 'online' ? <Video className="w-4 h-4 text-sky-blue" /> : <MapPin className="w-4 h-4 text-dharma-green" />}</td>
                  <td className="p-3">
                    {showRemind && seeker && (
                      <button onClick={() => setReminder({ seeker, session })}
                        className="px-2 py-1 rounded-lg text-[10px] font-medium bg-sky-blue/10 text-sky-blue hover:bg-sky-blue/20 flex items-center gap-1">
                        <Bell className="w-3 h-3" /> Remind
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {reminder && (
        <SendReminderModal
          open={!!reminder}
          onClose={() => setReminder(null)}
          seekerName={reminder.seeker.full_name}
          seekerPhone={reminder.seeker.phone}
          seekerEmail={reminder.seeker.email}
          context="session"
          contextData={{
            sessionNumber: reminder.session.session_number,
            sessionDate: reminder.session.date,
            sessionTime: reminder.session.start_time,
          }}
        />
      )}
    </div>
  );
};

export default SessionsPage;
