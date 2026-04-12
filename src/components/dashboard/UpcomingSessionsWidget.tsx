import { Link } from 'react-router-dom';
import { Video, MapPin } from 'lucide-react';

interface Session {
  id: string;
  date: string;
  start_time: string;
  session_number: number;
  location_type: string;
  meeting_link?: string;
  status: string;
}

interface UpcomingSessionsWidgetProps {
  sessions: Session[];
  basePath?: string;
}

const UpcomingSessionsWidget = ({ sessions, basePath = '/seeker/upcoming-sessions' }: UpcomingSessionsWidgetProps) => {
  const upcoming = sessions.filter(s => s.status === 'scheduled').slice(0, 3);

  return (
    <div className="bg-card rounded-2xl shadow-md border border-border p-5">
      <h3 className="text-sm font-semibold text-foreground mb-3">📅 Upcoming Sessions</h3>
      {upcoming.length > 0 ? (
        <div className="space-y-3">
          {upcoming.map((s) => (
            <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
              <div className="text-center min-w-[50px]">
                <p className="text-sm font-bold text-foreground">{s.start_time}</p>
                <p className="text-[10px] text-muted-foreground">{s.date}</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">Session #{s.session_number}</p>
              </div>
              <span className={`px-2 py-1 rounded-lg text-[10px] font-medium text-primary-foreground ${s.location_type === 'online' ? 'bg-sky-blue' : 'bg-dharma-green'}`}>
                {s.location_type === 'online' ? <><Video className="w-3 h-3 inline mr-0.5" />Join</> : <><MapPin className="w-3 h-3 inline mr-0.5" />In-Person</>}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">No upcoming sessions</p>
      )}
      <Link to={basePath} className="block text-center text-xs text-primary mt-3 hover:underline">View All →</Link>
    </div>
  );
};

export default UpcomingSessionsWidget;
