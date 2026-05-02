import { useState } from 'react';
import EmptyState from '@/components/EmptyState';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import BackToHome from '@/components/BackToHome';
import { Calendar } from '@/components/ui/calendar';
import { CalendarDays, Clock, Video, MapPin, ChevronRight, List, LayoutGrid, BookOpen, CheckCircle2 } from 'lucide-react';
import { format, parseISO, isSameDay } from 'date-fns';
import { Link } from 'react-router-dom';
import { formatDateDMY } from "@/lib/dateFormat";

export default function SeekerUpcomingSessions() {
  const { profile } = useAuthStore();
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['seeker-upcoming-sessions', profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('sessions')
        .select('*, courses(name)')
        .eq('seeker_id', profile!.id)
        .in('status', ['scheduled', 'confirmed', 'in_progress'])
        .gte('date', formatDateDMY(new Date()))
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });
      return data || [];
    },
  });

  const sessionDates = sessions.map((s: any) => parseISO(s.date));
  const filteredSessions = selectedDate
    ? sessions.filter((s: any) => isSameDay(parseISO(s.date), selectedDate))
    : sessions;

  const prepTasks: Record<string, string[]> = {
    artha: ['Update department health scores', 'Review SWOT analysis', 'List top 3 business challenges'],
    dharma: ['Complete daily practices log', 'Review values alignment', 'Journal reflection entry'],
    kama: ['Update relationship goals', 'Family harmony check-in', 'Desires journal entry'],
    moksha: ['Complete meditation log', 'Spiritual practices review', 'Inner peace journal entry'],
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <BackToHome />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">📅 Upcoming Sessions</h1>
          <p className="text-sm text-muted-foreground">Your scheduled coaching sessions</p>
        </div>
        <div className="flex bg-muted rounded-lg p-0.5">
          <button onClick={() => setView('list')} className={`p-2 rounded-md ${view === 'list' ? 'bg-background shadow-sm' : ''}`}>
            <List className="w-4 h-4 text-foreground" />
          </button>
          <button onClick={() => setView('calendar')} className={`p-2 rounded-md ${view === 'calendar' ? 'bg-background shadow-sm' : ''}`}>
            <LayoutGrid className="w-4 h-4 text-foreground" />
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card rounded-xl border border-border p-3 text-center">
          <p className="text-2xl font-bold text-foreground">{sessions.length}</p>
          <p className="text-[10px] text-muted-foreground">Upcoming</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-3 text-center">
          <p className="text-2xl font-bold text-foreground">
            {sessions.length > 0 ? format(parseISO((sessions[0] as any).date), 'MMM dd') : '—'}
          </p>
          <p className="text-[10px] text-muted-foreground">Next Session</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-3 text-center">
          <p className="text-2xl font-bold text-foreground">
            {sessions.filter((s: any) => s.location_type === 'online').length}
          </p>
          <p className="text-[10px] text-muted-foreground">Online</p>
        </div>
      </div>

      {/* Calendar View */}
      {view === 'calendar' && (
        <div className="bg-card rounded-xl border border-border p-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            modifiers={{ hasSession: sessionDates }}
            modifiersClassNames={{ hasSession: 'bg-primary/20 text-primary font-bold' }}
            className="mx-auto"
          />
          {selectedDate && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              {filteredSessions.length} session(s) on {formatDateDMY(selectedDate)}
              <button onClick={() => setSelectedDate(undefined)} className="ml-2 text-primary underline">Clear</button>
            </p>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : filteredSessions.length === 0 ? (
        selectedDate ? (
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No sessions on this date</p>
          </div>
        ) : (
          <EmptyState
            emoji="📅"
            title="Your schedule is clear!"
            description="Your coach will schedule your next session. You will be notified by email once it is booked."
          />
        )
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((session: any) => {
            const pillar = session.pillar?.toLowerCase() || '';
            const preps = prepTasks[pillar] || ['Review your daily worksheet', 'Prepare questions for coach', 'Update your goals'];

            return (
              <div key={session.id} className="bg-card rounded-xl border border-border overflow-hidden hover:border-primary/30 hover:shadow-md transition-all">
                {/* Header */}
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CalendarDays className="w-3 h-3" />
                        {format(parseISO(session.date), 'EEEE, MMMM dd, yyyy')}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {session.start_time} - {session.end_time}
                        {session.duration_minutes && ` (${session.duration_minutes} min)`}
                      </div>
                    </div>
                    {session.status === 'in_progress' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary animate-pulse">
                        ▶️ In Progress
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-foreground text-base">
                    {session.session_name || `Session #${session.session_number}`}
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      🎯 1-on-1 Coaching
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      🎓 Coach: Vivek Doba
                    </span>
                    {session.location_type && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        {session.location_type === 'online' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                        {session.location_type}
                      </span>
                    )}
                  </div>

                  {session.pillar && (
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary">
                      📋 Focus: {session.pillar.charAt(0).toUpperCase() + session.pillar.slice(1)} Review
                    </span>
                  )}

                  {(session.courses as any)?.name && (
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground ml-1">
                      {(session.courses as any).name}
                    </span>
                  )}

                  {/* Preparation */}
                  <div className="bg-muted/50 rounded-lg p-3 space-y-1.5">
                    <p className="text-[10px] font-semibold text-foreground flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-primary" /> Preparation
                    </p>
                    {preps.map((task, i) => (
                      <p key={i} className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-muted-foreground flex-shrink-0" /> {task}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-border flex items-center gap-2">
                  {session.meeting_link && (
                    <a
                      href={session.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90"
                    >
                      <Video className="w-3 h-3" /> Join Video Call
                    </a>
                  )}
                  <Link
                    to={`/seeker/sessions/${session.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted text-foreground text-xs font-medium hover:bg-muted/80"
                  >
                    <BookOpen className="w-3 h-3" /> View Details
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
