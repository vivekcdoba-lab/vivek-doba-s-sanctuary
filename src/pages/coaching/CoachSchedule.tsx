import { useState, useMemo, useCallback } from 'react';
import { useCoachingLang } from '@/components/CoachingLayout';
import { useDbSessions, useCreateSession, useUpdateSession, useCoaches, useDeleteSession, useCreateRecurringSessions, buildRecurrenceDates, type RecurrenceFrequency } from '@/hooks/useDbSessions';
import { useAuthStore } from '@/store/authStore';
import { useScopedSeekers } from '@/hooks/useScopedSeekers';
import { useDbCourses } from '@/hooks/useDbCourses';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays, subDays, startOfWeek, endOfWeek, addWeeks, subWeeks, addMonths, subMonths, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, X, Loader2, Lock, CalendarDays, Trash2, CalendarClock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import DateTimeTzInput, { toUtcIso } from '@/components/common/DateTimeTzInput';
import { detectBrowserTz } from '@/lib/timezones';
import { formatDateDMY, toIsoDate } from "@/lib/dateFormat";
import { todayInTz, nowRoundedHHMM, addOneHourHHMM, isFutureLocal } from '@/lib/scheduleTime';

const DEFAULT_ZOOM_LINK = 'https://us06web.zoom.us/j/86310221885?pwd=LdIaVqMxx7tbavIqggTVegh01kL8HB.1';

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
  const { data: seekers = [] } = useScopedSeekers();
  const { data: courses = [] } = useDbCourses();
  const { data: coaches = [] } = useCoaches();
  const createSession = useCreateSession();
  const createRecurring = useCreateRecurringSessions();
  const updateSession = useUpdateSession();
  const deleteSession = useDeleteSession();
  const queryClient = useQueryClient();

  const isAdmin = profile?.role === 'admin';
  const myCoachId = profile?.id || '';

  const [view, setView] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showNewSession, setShowNewSession] = useState(false);
  const [showBlockTime, setShowBlockTime] = useState(false);
  const [dragSession, setDragSession] = useState<string | null>(null);

  const defaultTz = useMemo(() => detectBrowserTz(), []);
  const [editSession, setEditSession] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ date: '', start_time: '10:00', end_time: '11:00', timezone: defaultTz, reason: '' });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [newForm, setNewForm] = useState({ seeker_id: '', course_id: '', coach_id: myCoachId, date: '', start_time: '10:00', end_time: '11:00', session_type: 'individual' as 'individual' | 'couple', partner_seeker_id: '', timezone: defaultTz, location_type: 'in_person' as 'online' | 'in_person', meeting_link: '', repeat: false, frequency: 'weekly' as RecurrenceFrequency, repeat_count: 4 });
  const [linkMode, setLinkMode] = useState<'default' | 'custom'>('default');
  const [blockForm, setBlockForm] = useState({ title: '', date: '', start_time: '12:00', end_time: '13:00', timezone: defaultTz });

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
      const startAt = toUtcIso(evt.date, evt.start_time, evt.timezone);
      const endAt = toUtcIso(evt.date, evt.end_time, evt.timezone);
      const { error } = await supabase.from('calendar_events').insert({
        title: evt.title || 'Blocked',
        type: 'blocked',
        date: evt.date,
        start_time: evt.start_time,
        end_time: evt.end_time,
        start_at: startAt,
        end_at: endAt,
        timezone: evt.timezone,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-cal-events'] });
      setShowBlockTime(false);
      setBlockForm({ title: '', date: '', start_time: '12:00', end_time: '13:00', timezone: defaultTz });
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
    const ds = toIsoDate(day);
    return sessions.filter(s => {
      // Prefer start_at so the session falls into the viewer's local day.
      if (s.start_at) return toIsoDate(new Date(s.start_at)) === ds;
      return s.date === ds;
    });
  }, [sessions]);

  const blockedForDay = useCallback((day: Date) => {
    const ds = toIsoDate(day);
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
    const ds = toIsoDate(date);
    const start = `${String(hour).padStart(2, '0')}:00`;
    const end = `${String(hour + 1).padStart(2, '0')}:00`;
    updateSession.mutate({ id: dragSession, date: ds, start_time: start, end_time: end }, {
      onSuccess: () => toast.success('Session rescheduled'),
    });
    setDragSession(null);
  };

  const handleCreateSession = () => {
    const hi = lang === 'hi';
    if (!newForm.session_type) {
      toast.error(hi ? 'कृपया सत्र प्रकार चुनें' : 'Please select a session type');
      return;
    }
    if (!newForm.seeker_id) {
      toast.error(hi ? 'कृपया साधक चुनें' : 'Please select a seeker');
      return;
    }
    if (!newForm.coach_id) {
      toast.error(hi ? 'कृपया कोच चुनें' : 'Please select a coach');
      return;
    }
    if (!newForm.location_type) {
      toast.error(hi ? 'कृपया मोड चुनें' : 'Please select a mode (Online or In-Person)');
      return;
    }
    if (newForm.location_type === 'online' && !newForm.meeting_link) {
      toast.error(hi ? 'कृपया मीटिंग लिंक जोड़ें' : 'Please provide a meeting link');
      return;
    }
    if (!newForm.date) {
      toast.error(hi ? 'कृपया तिथि चुनें' : 'Please select a date');
      return;
    }
    if (!newForm.start_time) {
      toast.error(hi ? 'कृपया प्रारंभ समय चुनें' : 'Please select a start time');
      return;
    }
    if (!newForm.end_time) {
      toast.error(hi ? 'कृपया समाप्ति समय चुनें' : 'Please select an end time');
      return;
    }
    if (!newForm.timezone) {
      toast.error(hi ? 'कृपया समय क्षेत्र चुनें' : 'Please select a timezone');
      return;
    }
    if (newForm.session_type === 'couple' && !newForm.partner_seeker_id) {
      toast.error(hi ? 'कृपया साथी चुनें' : 'Please select a partner seeker');
      return;
    }
    if (newForm.session_type === 'couple' && newForm.partner_seeker_id === newForm.seeker_id) {
      toast.error(hi ? 'साथी अलग होना चाहिए' : 'Partner must be a different seeker');
      return;
    }
    const commonPayload = {
      seeker_id: newForm.seeker_id,
      date: newForm.date,
      start_time: newForm.start_time,
      end_time: newForm.end_time,
      course_id: newForm.course_id || undefined,
      coach_id: newForm.coach_id,
      status: 'scheduled',
      session_type: newForm.session_type,
      partner_seeker_id: newForm.session_type === 'couple' ? newForm.partner_seeker_id : undefined,
      location_type: newForm.location_type,
      meeting_link: newForm.location_type === 'online' && newForm.meeting_link ? newForm.meeting_link : undefined,
      timezone: newForm.timezone,
    } as any;

    const resetForm = () => {
      setShowNewSession(false);
      setNewForm({ seeker_id: '', course_id: '', coach_id: myCoachId, date: '', start_time: '10:00', end_time: '11:00', session_type: 'individual', partner_seeker_id: '', timezone: defaultTz, location_type: 'in_person', meeting_link: '', repeat: false, frequency: 'weekly', repeat_count: 4 });
      setLinkMode('default');
    };

    if (newForm.repeat) {
      const count = Math.min(24, Math.max(2, Number(newForm.repeat_count) || 2));
      createRecurring.mutate({
        ...commonPayload,
        frequency: newForm.frequency,
        count,
        buildStartAt: (d: string) => toUtcIso(d, newForm.start_time, newForm.timezone),
        buildEndAt: (d: string) => toUtcIso(d, newForm.end_time, newForm.timezone),
      }, {
        onSuccess: () => {
          resetForm();
          toast.success(`${count} sessions scheduled — invites sent`);
        },
      });
    } else {
      createSession.mutate({
        ...commonPayload,
        start_at: toUtcIso(newForm.date, newForm.start_time, newForm.timezone),
        end_at: toUtcIso(newForm.date, newForm.end_time, newForm.timezone),
      }, {
        onSuccess: () => {
          resetForm();
          toast.success(newForm.session_type === 'couple' ? 'Couple session scheduled — invites sent' : 'Session scheduled — invite sent');
        },
      });
    }
  };

  // ---- Reschedule / Delete handlers ----
  const openSessionEditor = (s: any) => {
    setEditSession(s);
    setConfirmDelete(false);
    const initialDate = s.start_at
      ? toIsoDate(new Date(s.start_at))
      : s.date || toIsoDate(new Date());
    setEditForm({
      date: initialDate,
      start_time: (s.start_time || '10:00').slice(0, 5),
      end_time: (s.end_time || '11:00').slice(0, 5),
      timezone: s.timezone || defaultTz,
      reason: '',
    });
  };

  const handleReschedule = () => {
    if (!editSession) return;
    if (!editForm.date || !editForm.start_time || !editForm.end_time) {
      toast.error(lang === 'hi' ? 'कृपया तारीख और समय भरें' : 'Please fill date & time');
      return;
    }
    updateSession.mutate(
      {
        id: editSession.id,
        date: editForm.date,
        start_time: editForm.start_time,
        end_time: editForm.end_time,
        timezone: editForm.timezone,
        start_at: toUtcIso(editForm.date, editForm.start_time, editForm.timezone),
        end_at: toUtcIso(editForm.date, editForm.end_time, editForm.timezone),
        status: 'rescheduled',
        reschedule_reason: editForm.reason || null,
      } as any,
      {
        onSuccess: () => {
          toast.success(lang === 'hi' ? 'सत्र पुनर्निर्धारित — अपडेट भेजा गया' : 'Session rescheduled — update sent');
          setEditSession(null);
        },
        onError: (e: any) => toast.error(e?.message || 'Failed to reschedule'),
      },
    );
  };

  const handleDelete = () => {
    if (!editSession) return;
    deleteSession.mutate(editSession.id, {
      onSuccess: () => {
        toast.success(lang === 'hi' ? 'सत्र हटा दिया गया — सूचना भेजी गई' : 'Session deleted — attendees notified');
        setEditSession(null);
        setConfirmDelete(false);
      },
      onError: (e: any) => toast.error(e?.message || 'Failed to delete'),
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
          {view === 'week' && `${format(visibleDays[0], 'MMM d')} — ${formatDateDMY(visibleDays[6] || visibleDays[visibleDays.length - 1])}`}
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
                        onClick={(e) => { e.stopPropagation(); openSessionEditor(s); }}
                        title={lang === 'hi' ? 'पुनर्निर्धारित या हटाएं' : 'Reschedule or delete'}
                        className={`text-[10px] rounded px-1 py-0.5 truncate cursor-pointer hover:ring-2 hover:ring-primary/40 border ${STATUS_COLORS[s.status] || 'bg-muted border-border'}`}>
                        {s.start_at
                          ? new Date(s.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
                          : s.start_time?.slice(0, 5)}{' '}
                        {seekerName(s.seeker_id)}
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
                      const h = s.start_at
                        ? new Date(s.start_at).getHours()
                        : parseInt(s.start_time?.split(':')[0] || '0');
                      return h === hour;
                    });
                    const dayB = blockedForDay(day).filter((e: any) => {
                      const h = e.start_at
                        ? new Date(e.start_at).getHours()
                        : parseInt(e.start_time?.split(':')[0] || '0');
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
                            onClick={(e) => { e.stopPropagation(); openSessionEditor(s); }}
                            title={lang === 'hi' ? 'पुनर्निर्धारित या हटाएं' : 'Reschedule or delete'}
                            className={`absolute inset-x-0.5 top-0.5 rounded text-[10px] p-1 cursor-pointer hover:ring-2 hover:ring-primary/40 border ${STATUS_COLORS[s.status] || 'bg-muted border-border'}`}
                            style={{ minHeight: 24 }}>
                            <div className="font-medium truncate">{seekerName(s.seeker_id)}</div>
                            <div className="opacity-75">
                              {s.start_at
                                ? `${new Date(s.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}-${s.end_at ? new Date(s.end_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : ''}`
                                : `${s.start_time?.slice(0, 5)}-${s.end_time?.slice(0, 5)}`}
                            </div>
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
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{t('newSession')}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Session Type *</label>
              <div className="mt-1 grid grid-cols-2 gap-2">
                <button type="button"
                  onClick={() => setNewForm(p => ({ ...p, session_type: 'individual', partner_seeker_id: '' }))}
                  className={`px-3 py-2 rounded-lg text-sm border transition ${newForm.session_type === 'individual' ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-input bg-background text-muted-foreground'}`}>
                  👤 Individual
                </button>
                <button type="button"
                  onClick={() => setNewForm(p => ({ ...p, session_type: 'couple' }))}
                  className={`px-3 py-2 rounded-lg text-sm border transition ${newForm.session_type === 'couple' ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-input bg-background text-muted-foreground'}`}>
                  💑 Couple
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">{newForm.session_type === 'couple' ? 'Primary Seeker *' : `${t('seeker')} *`}</label>
              <select value={newForm.seeker_id} onChange={e => setNewForm(p => ({ ...p, seeker_id: e.target.value }))}
                className="w-full mt-1 border border-input rounded-lg px-3 py-2 text-sm bg-background">
                <option value="">Select seeker</option>
                {seekers.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
              </select>
              {seekers.length === 0 && !isAdmin && (
                <p className="text-[11px] text-warning-amber mt-1">
                  No seekers assigned to you yet. Ask an admin to assign seekers via <strong>Admin → Coach ↔ Seeker</strong>.
                </p>
              )}
            </div>
            {newForm.session_type === 'couple' && (
              <div>
                <label className="text-xs font-medium text-muted-foreground">Partner Seeker *</label>
                <select value={newForm.partner_seeker_id} onChange={e => setNewForm(p => ({ ...p, partner_seeker_id: e.target.value }))}
                  className="w-full mt-1 border border-input rounded-lg px-3 py-2 text-sm bg-background">
                  <option value="">Select partner</option>
                  {seekers.filter(s => s.id !== newForm.seeker_id).map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                </select>
              </div>
            )}
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
              <label className="text-xs font-medium text-muted-foreground">{t('course')} <span className="text-muted-foreground/70">({lang === 'hi' ? 'वैकल्पिक' : 'Optional'})</span></label>
              <select value={newForm.course_id} onChange={e => setNewForm(p => ({ ...p, course_id: e.target.value }))}
                className="w-full mt-1 border border-input rounded-lg px-3 py-2 text-sm bg-background">
                <option value="">{lang === 'hi' ? 'वैकल्पिक' : 'Optional'}</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">{lang === 'hi' ? 'मोड *' : 'Mode *'}</label>
              <div className="mt-1 grid grid-cols-2 gap-2">
                <button type="button"
                  onClick={() => setNewForm(p => ({ ...p, location_type: 'online', meeting_link: linkMode === 'default' ? DEFAULT_ZOOM_LINK : p.meeting_link }))}
                  className={`px-3 py-2 rounded-lg text-sm border transition ${newForm.location_type === 'online' ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-input bg-background text-muted-foreground'}`}>
                  🎥 {lang === 'hi' ? 'ऑनलाइन' : 'Online'}
                </button>
                <button type="button"
                  onClick={() => setNewForm(p => ({ ...p, location_type: 'in_person', meeting_link: '' }))}
                  className={`px-3 py-2 rounded-lg text-sm border transition ${newForm.location_type === 'in_person' ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-input bg-background text-muted-foreground'}`}>
                  📍 {lang === 'hi' ? 'व्यक्तिगत' : 'In-Person'}
                </button>
              </div>
            </div>
            {newForm.location_type === 'online' && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">{lang === 'hi' ? 'मीटिंग लिंक *' : 'Meeting Link *'}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button"
                    onClick={() => { setLinkMode('default'); setNewForm(p => ({ ...p, meeting_link: DEFAULT_ZOOM_LINK })); }}
                    className={`px-3 py-2 rounded-lg text-xs border transition ${linkMode === 'default' ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-input bg-background text-muted-foreground'}`}>
                    {lang === 'hi' ? 'डिफ़ॉल्ट ज़ूम लिंक' : 'Use default Zoom link'}
                  </button>
                  <button type="button"
                    onClick={() => { setLinkMode('custom'); setNewForm(p => ({ ...p, meeting_link: '' })); }}
                    className={`px-3 py-2 rounded-lg text-xs border transition ${linkMode === 'custom' ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-input bg-background text-muted-foreground'}`}>
                    {lang === 'hi' ? 'कस्टम लिंक' : 'Use custom link'}
                  </button>
                </div>
                {linkMode === 'default' ? (
                  <div className="space-y-2">
                    <textarea
                      readOnly
                      rows={3}
                      value={DEFAULT_ZOOM_LINK}
                      wrap="soft"
                      onFocus={(e) => e.currentTarget.select()}
                      className="w-full resize-none rounded-lg border border-input bg-muted/40 px-3 py-2 text-xs text-muted-foreground break-all font-mono leading-relaxed"
                    />
                    <div className="flex justify-end">
                      <button type="button"
                        onClick={() => { navigator.clipboard?.writeText(DEFAULT_ZOOM_LINK); toast.success(lang === 'hi' ? 'लिंक कॉपी किया गया' : 'Link copied'); }}
                        className="px-3 py-1 rounded border border-primary/40 text-primary text-xs hover:bg-primary/10">
                        {lang === 'hi' ? 'कॉपी' : 'Copy'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <input type="url" value={newForm.meeting_link}
                    onChange={e => setNewForm(p => ({ ...p, meeting_link: e.target.value }))}
                    placeholder="https://meet.google.com/… or Zoom link"
                    className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background" />
                )}
              </div>
            )}
            <DateTimeTzInput
              date={newForm.date}
              startTime={newForm.start_time}
              endTime={newForm.end_time}
              timezone={newForm.timezone}
              onChange={(v) =>
                setNewForm((p) => ({
                  ...p,
                  date: v.date,
                  start_time: v.startTime,
                  end_time: v.endTime,
                  timezone: v.timezone,
                }))
              }
            />
            {/* Recurring meeting */}
            <div className="rounded-lg border border-input p-3 space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={newForm.repeat}
                  onChange={(e) => setNewForm(p => ({ ...p, repeat: e.target.checked }))}
                  className="h-4 w-4 rounded border-input"
                />
                🔁 {lang === 'hi' ? 'दोहराने वाली बैठक' : 'Recurring meeting'}
              </label>
              {newForm.repeat && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">{lang === 'hi' ? 'आवृत्ति' : 'Frequency'}</label>
                    <select
                      value={newForm.frequency}
                      onChange={(e) => setNewForm(p => ({ ...p, frequency: e.target.value as RecurrenceFrequency }))}
                      className="w-full mt-1 border border-input rounded-lg px-3 py-2 text-sm bg-background"
                    >
                      <option value="daily">{lang === 'hi' ? 'दैनिक' : 'Daily'}</option>
                      <option value="weekly">{lang === 'hi' ? 'साप्ताहिक' : 'Weekly'}</option>
                      <option value="biweekly">{lang === 'hi' ? 'द्वि-साप्ताहिक' : 'Bi-weekly'}</option>
                      <option value="monthly">{lang === 'hi' ? 'मासिक' : 'Monthly'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">{lang === 'hi' ? 'कुल बैठकें' : 'Occurrences'}</label>
                    <input
                      type="number"
                      min={2}
                      max={24}
                      value={newForm.repeat_count}
                      onChange={(e) => setNewForm(p => ({ ...p, repeat_count: Math.min(24, Math.max(2, Number(e.target.value) || 2)) }))}
                      className="w-full mt-1 border border-input rounded-lg px-3 py-2 text-sm bg-background"
                    />
                  </div>
                  {newForm.date && (() => {
                    const dates = buildRecurrenceDates(newForm.date, newForm.frequency, Math.min(24, Math.max(2, Number(newForm.repeat_count) || 2)));
                    if (dates.length === 0) return null;
                    return (
                      <div className="col-span-2 text-[11px] text-muted-foreground bg-muted/40 rounded-lg px-2 py-1.5">
                        {dates.length} {lang === 'hi' ? 'सत्र' : 'sessions'}: {formatDateDMY(dates[0])} → {formatDateDMY(dates[dates.length - 1])}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
            <Button className="w-full" onClick={handleCreateSession} disabled={createSession.isPending || createRecurring.isPending}>
              {(createSession.isPending || createRecurring.isPending) ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {newForm.repeat ? `${t('save')} (${Math.min(24, Math.max(2, Number(newForm.repeat_count) || 2))})` : t('save')}
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
            <DateTimeTzInput
              date={blockForm.date}
              startTime={blockForm.start_time}
              endTime={blockForm.end_time}
              timezone={blockForm.timezone}
              onChange={(v) =>
                setBlockForm((p) => ({
                  ...p,
                  date: v.date,
                  start_time: v.startTime,
                  end_time: v.endTime,
                  timezone: v.timezone,
                }))
              }
            />
            <Button className="w-full" onClick={() => blockForm.date && createBlockedTime.mutate(blockForm)}>
              {t('save')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reschedule / Delete Session Dialog */}
      <Dialog open={!!editSession} onOpenChange={(o) => { if (!o) { setEditSession(null); setConfirmDelete(false); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-primary" />
              {lang === 'hi' ? 'सत्र प्रबंधित करें' : 'Manage Session'}
            </DialogTitle>
          </DialogHeader>
          {editSession && (
            <div className="space-y-3">
              <div className="rounded-lg bg-muted/40 p-3 text-sm">
                <div className="font-semibold text-foreground">{seekerName(editSession.seeker_id)}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {formatDateDMY(editSession.start_at || editSession.date)} • {(editSession.start_time || '').slice(0, 5)}–{(editSession.end_time || '').slice(0, 5)}
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">Status: <span className="font-medium">{editSession.status}</span></div>
              </div>

              {!confirmDelete && (
                <>
                  <p className="text-xs font-semibold text-foreground">
                    {lang === 'hi' ? 'नई तारीख और समय' : 'New date & time'}
                  </p>
                  <DateTimeTzInput
                    date={editForm.date}
                    startTime={editForm.start_time}
                    endTime={editForm.end_time}
                    timezone={editForm.timezone}
                    onChange={(v) => setEditForm(p => ({ ...p, date: v.date, start_time: v.startTime, end_time: v.endTime, timezone: v.timezone }))}
                  />
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      {lang === 'hi' ? 'पुनर्निर्धारण का कारण (वैकल्पिक)' : 'Reschedule reason (optional)'}
                    </label>
                    <input
                      type="text"
                      value={editForm.reason}
                      onChange={e => setEditForm(p => ({ ...p, reason: e.target.value }))}
                      placeholder={lang === 'hi' ? 'जैसे, साधक की उपलब्धता' : 'e.g., seeker availability'}
                      className="w-full mt-1 border border-input rounded-lg px-3 py-2 text-sm bg-background"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      onClick={handleReschedule}
                      disabled={updateSession.isPending}
                      className="flex-1"
                    >
                      {updateSession.isPending
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : (lang === 'hi' ? 'पुनर्निर्धारित करें और भेजें' : 'Reschedule & Notify')}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => setConfirmDelete(true)}
                      disabled={deleteSession.isPending}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      {lang === 'hi' ? 'हटाएं' : 'Delete'}
                    </Button>
                  </div>
                </>
              )}

              {confirmDelete && (
                <div className="space-y-3">
                  <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                    {lang === 'hi'
                      ? 'क्या आप वाकई इस सत्र को हटाना चाहते हैं? सभी प्रतिभागियों को रद्दीकरण ईमेल भेजा जाएगा।'
                      : 'Are you sure you want to delete this session? All attendees will receive a cancellation email.'}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => setConfirmDelete(false)} disabled={deleteSession.isPending}>
                      {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
                    </Button>
                    <Button variant="destructive" className="flex-1" onClick={handleDelete} disabled={deleteSession.isPending}>
                      {deleteSession.isPending
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : (lang === 'hi' ? 'हाँ, हटाएं' : 'Yes, Delete')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
