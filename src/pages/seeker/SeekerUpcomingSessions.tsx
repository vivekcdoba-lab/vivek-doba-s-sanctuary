import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import BackToHome from '@/components/BackToHome';
import { CalendarDays, Clock, Video, MapPin, User, ChevronRight } from 'lucide-react';
import { format, isFuture, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';

export default function SeekerUpcomingSessions() {
  const { profile } = useAuthStore();

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['seeker-upcoming-sessions', profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('sessions')
        .select('*, courses(name)')
        .eq('seeker_id', profile!.id)
        .in('status', ['scheduled', 'in_progress'])
        .gte('date', format(new Date(), 'yyyy-MM-dd'))
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });
      return data || [];
    },
  });

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <BackToHome />
      <h1 className="text-2xl font-bold text-foreground">📅 Upcoming Sessions</h1>
      <p className="text-sm text-muted-foreground">Your scheduled coaching sessions</p>

      {isLoading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : sessions.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No upcoming sessions scheduled</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session: any) => (
            <Link key={session.id} to={`/seeker/sessions/${session.id}`}
              className="block bg-card rounded-xl border border-border p-4 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">{session.session_name || `Session #${session.session_number}`}</h3>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{format(parseISO(session.date), 'MMM dd, yyyy')}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{session.start_time} - {session.end_time}</span>
                    {session.location_type && <span className="flex items-center gap-1">{session.location_type === 'online' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}{session.location_type}</span>}
                  </div>
                  {session.pillar && (
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary">{session.pillar}</span>
                  )}
                  {(session.courses as any)?.name && (
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground ml-1">{(session.courses as any).name}</span>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground mt-1" />
              </div>
              {session.meeting_link && (
                <div className="mt-3 pt-3 border-t border-border">
                  <a href={session.meeting_link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20">
                    <Video className="w-3 h-3" /> Join Session
                  </a>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
