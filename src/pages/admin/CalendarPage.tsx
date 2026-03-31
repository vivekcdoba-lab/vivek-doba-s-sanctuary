import { useState } from 'react';
import { CALENDAR_EVENTS, SEEKERS } from '@/data/mockData';
import { CalendarEvent } from '@/types';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';

const eventTypeColors: Record<string, string> = {
  session: 'bg-blue-500', follow_up: 'bg-green-500', discovery: 'bg-purple-500', blocked: 'bg-gray-400', event: 'bg-orange-500',
};

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 2, 1)); // March 2025
  const [selectedDay, setSelectedDay] = useState<number | null>(31);
  const [events, setEvents] = useState(CALENDAR_EVENTS);
  const [showAdd, setShowAdd] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', type: 'session' as CalendarEvent['type'], date: '', start_time: '10:00', end_time: '11:00', seeker_id: '' });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const selectedDateStr = selectedDay ? `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}` : '';
  const selectedEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  const today = new Date();
  const isToday = (day: number) => today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  const addEvent = () => {
    if (!newEvent.title || !newEvent.date) return;
    setEvents(prev => [...prev, { id: `ce${Date.now()}`, ...newEvent, color: eventTypeColors[newEvent.type]?.replace('bg-', '#') || '#B8860B' }]);
    setShowAdd(false);
    setNewEvent({ title: '', type: 'session', date: '', start_time: '10:00', end_time: '11:00', seeker_id: '' });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Sacred Calendar</h1>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium text-sm">
          <Plus className="w-4 h-4" /> Add Event
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Calendar Grid */}
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

        {/* Side Panel */}
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

          {/* Upcoming This Week */}
          <div className="mt-6 pt-4 border-t border-border">
            <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">📅 Upcoming This Week</h4>
            {events.filter(e => {
              const d = new Date(e.date);
              const now = new Date(2025, 2, 31);
              return d >= now && d <= new Date(now.getTime() + 7 * 86400000);
            }).slice(0, 5).map(e => (
              <div key={e.id} className="flex items-center gap-2 py-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${eventTypeColors[e.type] || 'bg-primary'}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-foreground truncate">{e.title}</p>
                  <p className="text-[10px] text-muted-foreground">{e.date} {e.start_time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm" onClick={() => setShowAdd(false)}>
          <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-md p-6 m-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">➕ Add Event</h3>
              <button onClick={() => setShowAdd(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="space-y-3">
              <input placeholder="Title *" value={newEvent.title} onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" />
              <select value={newEvent.type} onChange={e => setNewEvent(p => ({ ...p, type: e.target.value as CalendarEvent['type'] }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm">
                <option value="session">🔵 Session</option><option value="follow_up">🟢 Follow-up</option><option value="discovery">🟣 Discovery</option><option value="blocked">⬛ Blocked</option><option value="event">🟠 Workshop</option>
              </select>
              <select value={newEvent.seeker_id} onChange={e => setNewEvent(p => ({ ...p, seeker_id: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm">
                <option value="">No seeker</option>
                {SEEKERS.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
              </select>
              <input type="date" value={newEvent.date} onChange={e => setNewEvent(p => ({ ...p, date: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" />
              <div className="flex gap-2">
                <input type="time" value={newEvent.start_time} onChange={e => setNewEvent(p => ({ ...p, start_time: e.target.value }))} className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" />
                <input type="time" value={newEvent.end_time} onChange={e => setNewEvent(p => ({ ...p, end_time: e.target.value }))} className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" />
              </div>
              <button onClick={addEvent} className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm">Save Event</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
