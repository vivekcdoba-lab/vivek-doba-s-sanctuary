import { useState, useMemo } from 'react';
import { useCoachingLang } from '@/components/CoachingLayout';
import { useDbSessions, useUpdateSession } from '@/hooks/useDbSessions';
import { useSeekerProfiles } from '@/hooks/useSeekerProfiles';
import { format } from 'date-fns';
import { Play, CheckCircle, Clock, User, Loader2, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { formatDateDMY } from "@/lib/dateFormat";

const L = {
  title: { en: "Today's Sessions", hi: 'आज के सत्र' },
  noSessions: { en: 'No sessions scheduled for today', hi: 'आज कोई सत्र नियोजित नहीं' },
  start: { en: 'Start Session', hi: 'सत्र शुरू करें' },
  complete: { en: 'Mark Complete', hi: 'पूर्ण करें' },
  notes: { en: 'Quick Notes', hi: 'त्वरित नोट्स' },
  save: { en: 'Save Notes', hi: 'नोट्स सहेजें' },
  prep: { en: 'Session Prep', hi: 'सत्र की तैयारी' },
  current: { en: 'CURRENT', hi: 'वर्तमान' },
  next: { en: 'NEXT', hi: 'अगला' },
  upcoming: { en: 'Upcoming', hi: 'आगामी' },
  completed: { en: 'Completed', hi: 'पूर्ण' },
};

const PREP_CHECKLIST = [
  { en: 'Review last session notes', hi: 'पिछले सत्र के नोट्स देखें' },
  { en: 'Check pending assignments', hi: 'लंबित कार्य जांचें' },
  { en: 'Review worksheet trends', hi: 'वर्कशीट ट्रेंड देखें' },
  { en: 'Prepare topics for today', hi: 'आज के विषय तैयार करें' },
];

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-sky-blue/10 text-sky-blue border-sky-blue/30',
  confirmed: 'bg-chakra-indigo/10 text-chakra-indigo border-chakra-indigo/30',
  in_progress: 'bg-saffron/10 text-saffron border-saffron/30',
  completed: 'bg-dharma-green/10 text-dharma-green border-dharma-green/30',
  missed: 'bg-destructive/10 text-destructive border-destructive/30',
};

export default function CoachTodaySessions() {
  const { lang } = useCoachingLang();
  const t = (key: keyof typeof L) => L[key][lang];
  const today = formatDateDMY(new Date());
  const now = format(new Date(), 'HH:mm');

  const { data: allSessions = [], isLoading } = useDbSessions();
  const { data: seekers = [] } = useSeekerProfiles();
  const updateSession = useUpdateSession();

  const [notes, setNotes] = useState<Record<string, string>>({});
  const [checkedPrep, setCheckedPrep] = useState<Record<string, boolean>>({});

  const todaySessions = useMemo(() =>
    allSessions.filter(s => s.date === today).sort((a, b) => (a.start_time || '').localeCompare(b.start_time || '')),
    [allSessions, today]
  );

  const seekerName = (id: string) => seekers.find(s => s.id === id)?.full_name || 'Unknown';
  const seekerAvatar = (id: string) => {
    const s = seekers.find(p => p.id === id);
    return s?.avatar_url || null;
  };

  const getSessionTag = (session: any, index: number) => {
    if (session.status === 'in_progress') return 'current';
    if (session.status === 'completed') return null;
    // Find first non-completed session
    const firstUpcoming = todaySessions.findIndex(s => s.status !== 'completed' && s.status !== 'in_progress');
    if (index === firstUpcoming && session.start_time >= now) return 'next';
    return null;
  };

  const handleStart = (id: string) => {
    updateSession.mutate({ id, status: 'in_progress' }, {
      onSuccess: () => toast.success('Session started!'),
    });
  };

  const handleComplete = (id: string) => {
    updateSession.mutate({ id, status: 'completed' }, {
      onSuccess: () => toast.success('Session completed!'),
    });
  };

  const handleSaveNotes = (id: string) => {
    if (!notes[id]) return;
    updateSession.mutate({ id, session_notes: notes[id] }, {
      onSuccess: () => toast.success('Notes saved'),
    });
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    const [h, m] = time.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h > 12 ? h - 12 : h || 12}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Clock className="w-6 h-6 text-saffron" /> {t('title')}
        </h1>
        <Badge variant="outline" className="text-sm">{format(new Date(), 'EEEE, MMMM d')}</Badge>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: todaySessions.length, icon: '📅' },
          { label: t('completed'), value: todaySessions.filter(s => s.status === 'completed').length, icon: '✅' },
          { label: t('upcoming'), value: todaySessions.filter(s => ['scheduled', 'confirmed'].includes(s.status)).length, icon: '⏳' },
          { label: 'In Progress', value: todaySessions.filter(s => s.status === 'in_progress').length, icon: '▶️' },
        ].map((stat, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-3 text-center">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-xl font-bold text-foreground">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {todaySessions.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">{t('noSessions')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {todaySessions.map((session, idx) => {
            const tag = getSessionTag(session, idx);
            const isCurrent = tag === 'current';
            const isNext = tag === 'next';
            return (
              <Card key={session.id} className={`transition-all ${isCurrent ? 'ring-2 ring-saffron shadow-lg' : isNext ? 'ring-1 ring-sky-blue' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Left: Session info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        {tag && (
                          <Badge className={isCurrent ? 'bg-saffron text-primary-foreground animate-pulse' : 'bg-sky-blue text-primary-foreground'}>
                            {isCurrent ? t('current') : t('next')}
                          </Badge>
                        )}
                        <Badge variant="outline" className={STATUS_COLORS[session.status] || ''}>
                          {session.status}
                        </Badge>
                        {session.pillar && <Badge variant="secondary">{session.pillar}</Badge>}
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          {seekerAvatar(session.seeker_id) ? (
                            <img src={seekerAvatar(session.seeker_id)!} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{seekerName(session.seeker_id)}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" />
                            {formatTime(session.start_time)} — {formatTime(session.end_time)}
                            {session.duration_minutes && <span className="text-xs">({session.duration_minutes} min)</span>}
                          </p>
                        </div>
                      </div>

                      {session.session_name && (
                        <p className="text-sm text-muted-foreground"><FileText className="w-3.5 h-3.5 inline mr-1" />{session.session_name}</p>
                      )}

                      {/* Action buttons */}
                      <div className="flex gap-2 pt-1">
                        {['scheduled', 'confirmed'].includes(session.status) && (
                          <Button size="sm" onClick={() => handleStart(session.id)} className="bg-saffron hover:bg-saffron/90">
                            <Play className="w-3.5 h-3.5 mr-1" /> {t('start')}
                          </Button>
                        )}
                        {session.status === 'in_progress' && (
                          <Button size="sm" onClick={() => handleComplete(session.id)} className="bg-dharma-green hover:bg-dharma-green/90">
                            <CheckCircle className="w-3.5 h-3.5 mr-1" /> {t('complete')}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Right: Quick notes */}
                    <div className="md:w-72 space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">{t('notes')}</label>
                      <Textarea
                        placeholder="Add session notes..."
                        value={notes[session.id] ?? session.session_notes ?? ''}
                        onChange={e => setNotes(p => ({ ...p, [session.id]: e.target.value }))}
                        className="min-h-[80px] text-sm"
                      />
                      <Button size="sm" variant="outline" className="w-full" onClick={() => handleSaveNotes(session.id)}>
                        {t('save')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Session Prep Checklist */}
      {todaySessions.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">{t('prep')}</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {PREP_CHECKLIST.map((item, i) => (
                <label key={i} className="flex items-center gap-3 cursor-pointer">
                  <Checkbox checked={checkedPrep[String(i)] || false}
                    onCheckedChange={v => setCheckedPrep(p => ({ ...p, [String(i)]: !!v }))} />
                  <span className={`text-sm ${checkedPrep[String(i)] ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {item[lang]}
                  </span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
