import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSeekerProfiles } from '@/hooks/useSeekerProfiles';
import { ChevronLeft, ChevronRight, Plus, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const eventTypeColors: Record<string, string> = {
  session: 'bg-blue-500', follow_up: 'bg-green-500', discovery: 'bg-purple-500', blocked: 'bg-gray-400', event: 'bg-orange-500',
};

interface CalendarEvent {
  id: string;
  title: string;
  type: string;
  date: string;
  start_time: string;
  end_time: string;
  seeker_id: string | null;
  notes: string | null;
  color: string | null;
}

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());
  const [showAdd, setShowAdd] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', type: 'session', date: '', start_time: '10:00', end_time: '11:00', seeker_id: '' });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: seekers = [] } = useSeekerProfiles();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['calendar-events', year, month],
    queryFn: async (): Promise<CalendarEvent[]> => {
      const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const endDate = `${year}-${String(month + 2 > 12 ? 1 : month + 2).padStart(2, '0')}-01`;
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .gte('date', startDate)
        .lt('date', endDate)
        .order('start_time');
      if (error) throw error;
      return (data || []) as CalendarEvent[];
    },
  });

  const createEvent = useMutation({
    mutationFn: async (evt: typeof newEvent) => {
      const { error } = await supabase.from('calendar_events').insert({
        title: evt.title,
        type: evt.type,
        date: evt.date,
        start_time: evt.start_time,
        end_time: evt.end_time,
        seeker_id: evt.seeker_id || null,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      setShowAdd(false);
      setNewEvent({ title: '', type: 'session', date: '', start_time: '10:00', end_time: '11:00', seeker_id: '' });
      toast({ title: '✅ Event added!' });
    },
  });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const selectedEvents = selectedDay ? getEventsForDay(selectedDay) : [];
  const today = new Date();
  const isToday = (day: number) => today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Sacred Calendar</h1>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium text-sm">
          <Plus className="w-4 h-4" /> Add Event
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 bg-card rounded-2xl border border-border shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 rounded-lg hover:bg-muted"><ChevronLeft className="w-5 h-5" /></button>
            <h2 className="text-lg font-bold text-foreground">{monthNames[month]} {year}</h2>
            <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 rounded-lg hover:bg-muted"><ChevronRight className="w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">{d}</div>
            ))}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = getEventsForDay(day);
              return (
                <button key={day} onClick={() => setSelectedDay(day)}
                  className={`relative p-1 min-h-[60px] rounded-lg border text-left transition-all ${
                    selectedDay === day ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-muted/50'
                  } ${isToday(day) ? 'ring-2 ring-primary' : ''}`}>
                  <span className={`text-xs font-medium ${isToday(day) ? 'text-primary font-bold' : 'text-foreground'}`}>{day}</span>
                  {isToday(day) && <span className="text-[8px] text-primary block">TODAY</span>}
                  <div className="flex flex-wrap gap-0.5 mt-0.5">
                    {dayEvents.slice(0, 3).map(e => (
                      <div key={e.id} className={`w-1.5 h-1.5 rounded-full ${eventTypeColors[e.type] || 'bg-primary'}`} />
                    ))}
                    {dayEvents.length > 3 && <span className="text-[8px] text-muted-foreground">+{dayEvents.length - 3}</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-sm p-4">
          <h3 className="font-semibold text-foreground mb-3">
            {selectedDay ? `${selectedDay}/${month + 1}/${year}` : 'Select a day'}
          </h3>
          {selectedEvents.length === 0 && <p className="text-sm text-muted-foreground italic">No events</p>}
          <div className="space-y-2">
            {selectedEvents.map(e => (
              <div key={e.id} className="p-3 rounded-xl border border-border bg-background">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${eventTypeColors[e.type] || 'bg-primary'}`} />
                  <span className="text-xs font-medium text-muted-foreground capitalize">{e.type.replace('_', ' ')}</span>
                </div>
                <p className="text-sm font-medium text-foreground mt-1">{e.title}</p>
                <p className="text-xs text-muted-foreground">{e.start_time} — {e.end_time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm" onClick={() => setShowAdd(false)}>
          <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-md p-6 m-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">➕ Add Event</h3>
              <button onClick={() => setShowAdd(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="space-y-3">
              <input placeholder="Title *" value={newEvent.title} onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" />
              <select value={newEvent.type} onChange={e => setNewEvent(p => ({ ...p, type: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm">
                <option value="session">🔵 Session</option><option value="follow_up">🟢 Follow-up</option><option value="discovery">🟣 Discovery</option><option value="blocked">⬛ Blocked</option><option value="event">🟠 Workshop</option>
              </select>
              <select value={newEvent.seeker_id} onChange={e => setNewEvent(p => ({ ...p, seeker_id: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm">
                <option value="">No seeker</option>
                {seekers.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
              </select>
              <input type="date" value={newEvent.date} onChange={e => setNewEvent(p => ({ ...p, date: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" />
              <div className="flex gap-2">
                <input type="time" value={newEvent.start_time} onChange={e => setNewEvent(p => ({ ...p, start_time: e.target.value }))} className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" />
                <input type="time" value={newEvent.end_time} onChange={e => setNewEvent(p => ({ ...p, end_time: e.target.value }))} className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" />
              </div>
              <button onClick={() => { if (!newEvent.title || !newEvent.date) return; createEvent.mutate(newEvent); }} disabled={createEvent.isPending} className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm disabled:opacity-50">
                {createEvent.isPending ? 'Saving...' : 'Save Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
