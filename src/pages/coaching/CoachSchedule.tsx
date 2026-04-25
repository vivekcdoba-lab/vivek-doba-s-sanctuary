import { useState, useMemo, useCallback } from 'react';
import { useCoachingLang } from '@/components/CoachingLayout';
import { useDbSessions, useCreateSession, useUpdateSession, useCoaches } from '@/hooks/useDbSessions';
import { useAuthStore } from '@/store/authStore';
import { useSeekerProfiles } from '@/hooks/useSeekerProfiles';
import { useDbCourses } from '@/hooks/useDbCourses';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays, subDays, startOfWeek, endOfWeek, addWeeks, subWeeks, addMonths, subMonths, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, X, Loader2, Lock, CalendarDays } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const L = {
  title: { en: 'Schedule', hi: 'अनुसूची' },
  day: { en: 'Day', hi: 'दिन' },
  week: { en: 'Week', hi: 'सप्ताह' },
  month: { en: 'Month', hi: 'महीना' },
  today: { en: 'Today', hi: 'आज' },
  newSession: { en: 'New Session', hi: 'नया सत्र' },
  blockTime: { en: 'Block Time', hi: 'समय अवरोधित करें' },
  seeker: { en: 'Seeker', hi: 'साधक' },
  course: { en: 'Course', hi: 'कोर्स' },
  date: { en: 'Date', hi: 'तारीख' },
  start: { en: 'Start', hi: 'शुरू' },
  end: { en: 'End', hi: 'समाप्त' },
  save: { en: 'Save', hi: 'सहेजें' },
  reason: { en: 'Reason', hi: 'कारण' },
};

type ViewMode = 'day' | 'week' | 'month';

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-sky-blue/20 border-sky-blue text-sky-blue',
  confirmed: 'bg-chakra-indigo/20 border-chakra-indigo text-chakra-indigo',
  in_progress: 'bg-saffron/20 border-saffron text-saffron',
  completed: 'bg-dharma-green/20 border-dharma-green text-dharma-green',
  missed: 'bg-destructive/20 border-destructive text-destructive',
  rescheduled: 'bg-warning-amber/20 border-warning-amber text-warning-amber',
  cancelled: 'bg-muted border-border text-muted-foreground',
};

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6AM-10PM

export default function CoachSchedule() {
  const { lang } = useCoachingLang();
  const t = (key: keyof typeof L) => L[key][lang];
  const { profile } = useAuthStore();
  const { data: sessions = [], isLoading } = useDbSessions();
  const { data: seekers = [] } = useSeekerProfiles();
  const { data: courses = [] } = useDbCourses();
  const { data: coaches = [] } = useCoaches();
  const createSession = useCreateSession();
  const updateSession = useUpdateSession();
  const queryClient = useQueryClient();

  const isAdmin = profile?.role === 'admin';
  const myCoachId = profile?.id || '';

  const [view, setView] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showNewSession, setShowNewSession] = useState(false);
  const [showBlockTime, setShowBlockTime] = useState(false);
  const [dragSession, setDragSession] = useState<string | null>(null);

  const [newForm, setNewForm] = useState({ seeker_id: '', course_id: '', coach_id: myCoachId, date: '', start_time: '10:00', end_time: '11:00', session_type: 'individual' as 'individual' | 'couple', partner_seeker_id: '' });
  const [blockForm, setBlockForm] = useState({ title: '', date: '', start_time: '12:00', end_time: '13:00' });

  // Calendar events for blocked time
  const { data: calEvents = [] } = useQuery({
    queryKey: ['coach-cal-events'],
    queryFn: async () => {
      const { data } = await supabase.from('calendar_events').select('*').eq('type', 'blocked').order('date');
      return (data || []) as any[];
    },
  });

  const createBlockedTime = useMutation({
    mutationFn: async (evt: typeof blockForm) => {
      const { error } = await supabase.from('calendar_events').insert({
        title: evt.title || 'Blocked',
        type: 'blocked',
        date: evt.date,
        start_time: evt.start_time,
        end_time: evt.end_time,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-cal-events'] });
      setShowBlockTime(false);
      setBlockForm({ title: '', date: '', start_time: '12:00', end_time: '13:00' });
      toast.success('Time blocked');
    },
  });

  // Navigation
  const navigate = (dir: 1 | -1) => {
    if (view === 'day') setCurrentDate(d => dir === 1 ? addDays(d, 1) : subDays(d, 1));
    else if (view === 'week') setCurrentDate(d => dir === 1 ? addWeeks(d, 1) : subWeeks(d, 1));
    else setCurrentDate(d => dir === 1 ? addMonths(d, 1) : subMonths(d, 1));
  };

  // Dates to show
  const visibleDays = useMemo(() => {
    if (view === 'day') return [currentDate];
    if (view === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      return Array.from({ length: 7 }, (_, i) => addDays(start, i));
    }
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate, view]);

  const sessionsForDay = useCallback((day: Date) => {
    const ds = format(day, 'yyyy-MM-dd');
    return sessions.filter(s => s.date === ds);
  }, [sessions]);

  const blockedForDay = useCallback((day: Date) => {
    const ds = format(day, 'yyyy-MM-dd');
    return calEvents.filter((e: any) => e.date === ds);
  }, [calEvents]);

  const seekerName = (id: string) => seekers.find(s => s.id === id)?.full_name || 'Unknown';
  const formatHour = (h: number) => h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`;

  const timeToRow = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return (h - 6) * 2 + (m >= 30 ? 1 : 0);
  };

  const handleDrop = (date: Date, hour: number) => {
    if (!dragSession) return;
    const ds = format(date, 'yyyy-MM-dd');
    const start = `${String(hour).padStart(2, '0')}:00`;
    const end = `${String(hour + 1).padStart(2, '0')}:00`;
    updateSession.mutate({ id: dragSession, date: ds, start_time: start, end_time: end }, {
      onSuccess: () => toast.success('Session rescheduled'),
    });
    setDragSession(null);
  };

  const handleCreateSession = () => {
    if (!newForm.seeker_id || !newForm.date) return;
    if (!newForm.coach_id) {
      toast.error(lang === 'hi' ? 'कृपया कोच चुनें' : 'Please select a coach');
      return;
    }
    createSession.mutate({
      seeker_id: newForm.seeker_id,
      date: newForm.date,
      start_time: newForm.start_time,
      end_time: newForm.end_time,
      course_id: newForm.course_id || undefined,
      coach_id: newForm.coach_id,
      status: 'scheduled',
    }, {
      onSuccess: () => {
        setShowNewSession(false);
        setNewForm({ seeker_id: '', course_id: '', coach_id: myCoachId, date: '', start_time: '10:00', end_time: '11:00' });
        toast.success('Session scheduled');
      },
    });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-saffron" /> {t('title')}
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          {/* View Toggle */}
          <div className="flex rounded-lg overflow-hidden border border-border">
            {(['day', 'week', 'month'] as ViewMode[]).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === v ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted'}`}>
                {t(v)}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>{t('today')}</Button>
          <Button variant="outline" size="sm" onClick={() => setShowBlockTime(true)}>
            <Lock className="w-3.5 h-3.5 mr-1" /> {t('blockTime')}
          </Button>
          <Button size="sm" onClick={() => setShowNewSession(true)}>
            <Plus className="w-3.5 h-3.5 mr-1" /> {t('newSession')}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between bg-card rounded-xl border border-border p-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-muted"><ChevronLeft className="w-5 h-5" /></button>
        <span className="font-semibold text-foreground">
          {view === 'day' && format(currentDate, 'EEEE, MMMM d, yyyy')}
          {view === 'week' && `${format(visibleDays[0], 'MMM d')} — ${format(visibleDays[6] || visibleDays[visibleDays.length - 1], 'MMM d, yyyy')}`}
          {view === 'month' && format(currentDate, 'MMMM yyyy')}
        </span>
        <button onClick={() => navigate(1)} className="p-1.5 rounded-lg hover:bg-muted"><ChevronRight className="w-5 h-5" /></button>
      </div>

      {/* Calendar Grid */}
      {view === 'month' ? (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="grid grid-cols-7 border-b border-border">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
              <div key={d} className="p-2 text-center text-xs font-medium text-muted-foreground">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {/* padding for first day */}
            {Array.from({ length: (getDay(visibleDays[0]) + 6) % 7 }).map((_, i) => (
              <div key={`pad-${i}`} className="min-h-[80px] border-b border-r border-border bg-muted/30" />
            ))}
            {visibleDays.map(day => {
              const daySessions = sessionsForDay(day);
              const isToday = isSameDay(day, new Date());
              return (
                <div key={day.toISOString()} className={`min-h-[80px] border-b border-r border-border p-1 ${isToday ? 'bg-primary/5' : ''}`}
                  onDragOver={e => e.preventDefault()} onDrop={() => dragSession && handleDrop(day, 10)}>
                  <span className={`text-xs font-medium ${isToday ? 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center' : 'text-muted-foreground'}`}>
                    {format(day, 'd')}
                  </span>
                  <div className="space-y-0.5 mt-1">
                    {daySessions.slice(0, 3).map(s => (
                      <div key={s.id} draggable onDragStart={() => setDragSession(s.id)}
                        className={`text-[10px] rounded px-1 py-0.5 truncate cursor-move border ${STATUS_COLORS[s.status] || 'bg-muted border-border'}`}>
                        {s.start_time?.slice(0, 5)} {seekerName(s.seeker_id)}
                      </div>
                    ))}
                    {daySessions.length > 3 && (
                      <span className="text-[10px] text-muted-foreground">+{daySessions.length - 3} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Day / Week view */
        <div className="bg-card rounded-xl border border-border overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Day headers */}
            <div className="grid border-b border-border" style={{ gridTemplateColumns: `60px repeat(${visibleDays.length}, 1fr)` }}>
              <div className="p-2" />
              {visibleDays.map(day => {
                const isToday = isSameDay(day, new Date());
                return (
                  <div key={day.toISOString()} className={`p-2 text-center border-l border-border ${isToday ? 'bg-primary/5' : ''}`}>
                    <div className="text-[10px] uppercase text-muted-foreground">{format(day, 'EEE')}</div>
                    <div className={`text-sm font-semibold ${isToday ? 'text-primary' : 'text-foreground'}`}>{format(day, 'd')}</div>
                  </div>
                );
              })}
            </div>
            {/* Hour rows */}
            <div className="relative">
              {HOURS.map(hour => (
                <div key={hour} className="grid border-b border-border" style={{ gridTemplateColumns: `60px repeat(${visibleDays.length}, 1fr)`, height: 60 }}>
                  <div className="p-1 text-[10px] text-muted-foreground text-right pr-2 pt-0">{formatHour(hour)}</div>
                  {visibleDays.map(day => {
                    const dayS = sessionsForDay(day).filter(s => {
                      const h = parseInt(s.start_time?.split(':')[0] || '0');
                      return h === hour;
                    });
                    const dayB = blockedForDay(day).filter((e: any) => {
                      const h = parseInt(e.start_time?.split(':')[0] || '0');
                      return h === hour;
                    });
                    const isToday = isSameDay(day, new Date());
                    return (
                      <div key={`${day.toISOString()}-${hour}`}
                        className={`border-l border-border relative ${isToday ? 'bg-primary/5' : ''}`}
                        onDragOver={e => e.preventDefault()} onDrop={() => handleDrop(day, hour)}>
                        {dayB.map((b: any) => (
                          <div key={b.id} className="absolute inset-x-0.5 top-0.5 bottom-0.5 bg-muted/60 rounded text-[10px] p-1 flex items-center gap-1 text-muted-foreground">
                            <Lock className="w-3 h-3" /> {b.title}
                          </div>
                        ))}
                        {dayS.map(s => (
                          <div key={s.id} draggable onDragStart={() => setDragSession(s.id)}
                            className={`absolute inset-x-0.5 top-0.5 rounded text-[10px] p-1 cursor-move border ${STATUS_COLORS[s.status] || 'bg-muted border-border'}`}
                            style={{ minHeight: 24 }}>
                            <div className="font-medium truncate">{seekerName(s.seeker_id)}</div>
                            <div className="opacity-75">{s.start_time?.slice(0, 5)}-{s.end_time?.slice(0, 5)}</div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* New Session Dialog */}
      <Dialog open={showNewSession} onOpenChange={setShowNewSession}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{t('newSession')}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">{t('seeker')}</label>
              <select value={newForm.seeker_id} onChange={e => setNewForm(p => ({ ...p, seeker_id: e.target.value }))}
                className="w-full mt-1 border border-input rounded-lg px-3 py-2 text-sm bg-background">
                <option value="">Select seeker</option>
                {seekers.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">{lang === 'hi' ? 'कोच *' : 'Coach *'}</label>
              {isAdmin ? (
                <select value={newForm.coach_id} onChange={e => setNewForm(p => ({ ...p, coach_id: e.target.value }))}
                  className="w-full mt-1 border border-input rounded-lg px-3 py-2 text-sm bg-background">
                  <option value="">Select Coach</option>
                  {coaches.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                </select>
              ) : (
                <div className="w-full mt-1 border border-input rounded-lg px-3 py-2 text-sm bg-muted/40 text-foreground">
                  {profile?.full_name || '—'}
                </div>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">{t('course')}</label>
              <select value={newForm.course_id} onChange={e => setNewForm(p => ({ ...p, course_id: e.target.value }))}
                className="w-full mt-1 border border-input rounded-lg px-3 py-2 text-sm bg-background">
                <option value="">Optional</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">{t('date')}</label>
              <input type="date" value={newForm.date} onChange={e => setNewForm(p => ({ ...p, date: e.target.value }))}
                className="w-full mt-1 border border-input rounded-lg px-3 py-2 text-sm bg-background" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">{t('start')}</label>
                <input type="time" value={newForm.start_time} onChange={e => setNewForm(p => ({ ...p, start_time: e.target.value }))}
                  className="w-full mt-1 border border-input rounded-lg px-3 py-2 text-sm bg-background" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">{t('end')}</label>
                <input type="time" value={newForm.end_time} onChange={e => setNewForm(p => ({ ...p, end_time: e.target.value }))}
                  className="w-full mt-1 border border-input rounded-lg px-3 py-2 text-sm bg-background" />
              </div>
            </div>
            <Button className="w-full" onClick={handleCreateSession} disabled={createSession.isPending}>
              {createSession.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {t('save')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Block Time Dialog */}
      <Dialog open={showBlockTime} onOpenChange={setShowBlockTime}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{t('blockTime')}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">{t('reason')}</label>
              <input type="text" value={blockForm.title} onChange={e => setBlockForm(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g., Lunch break" className="w-full mt-1 border border-input rounded-lg px-3 py-2 text-sm bg-background" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">{t('date')}</label>
              <input type="date" value={blockForm.date} onChange={e => setBlockForm(p => ({ ...p, date: e.target.value }))}
                className="w-full mt-1 border border-input rounded-lg px-3 py-2 text-sm bg-background" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">{t('start')}</label>
                <input type="time" value={blockForm.start_time} onChange={e => setBlockForm(p => ({ ...p, start_time: e.target.value }))}
                  className="w-full mt-1 border border-input rounded-lg px-3 py-2 text-sm bg-background" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">{t('end')}</label>
                <input type="time" value={blockForm.end_time} onChange={e => setBlockForm(p => ({ ...p, end_time: e.target.value }))}
                  className="w-full mt-1 border border-input rounded-lg px-3 py-2 text-sm bg-background" />
              </div>
            </div>
            <Button className="w-full" onClick={() => blockForm.date && createBlockedTime.mutate(blockForm)}>
              {t('save')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
