import { useState, useMemo } from 'react';
import { useCoachingLang } from '@/components/CoachingLayout';
import { useDbSessions } from '@/hooks/useDbSessions';
import { useSeekerProfiles } from '@/hooks/useSeekerProfiles';
import { format, parseISO, isBefore, startOfToday } from 'date-fns';
import { Search, Download, ChevronDown, ChevronUp, Clock, User, Loader2, FileText, BookOpen, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const L = {
  title: { en: 'Past Sessions', hi: 'पिछले सत्र' },
  search: { en: 'Search notes, insights, seeker...', hi: 'नोट्स, अंतर्दृष्टि, साधक खोजें...' },
  export: { en: 'Export CSV', hi: 'CSV निर्यात करें' },
  noResults: { en: 'No sessions found', hi: 'कोई सत्र नहीं मिला' },
  notes: { en: 'Notes', hi: 'नोट्स' },
  insights: { en: 'Key Insights', hi: 'मुख्य अंतर्दृष्टि' },
  breakthroughs: { en: 'Breakthroughs', hi: 'सफलताएं' },
  allSeekers: { en: 'All Seekers', hi: 'सभी साधक' },
  allStatus: { en: 'All Status', hi: 'सभी स्थिति' },
  allPillars: { en: 'All Pillars', hi: 'सभी स्तंभ' },
  loadMore: { en: 'Load More', hi: 'और लोड करें' },
};

const STATUS_BADGE: Record<string, string> = {
  completed: 'bg-dharma-green/10 text-dharma-green',
  approved: 'bg-dharma-green/10 text-dharma-green',
  missed: 'bg-destructive/10 text-destructive',
  cancelled: 'bg-muted text-muted-foreground',
  rescheduled: 'bg-warning-amber/10 text-warning-amber',
};

const PAGE_SIZE = 20;

export default function CoachPastSessions() {
  const { lang } = useCoachingLang();
  const t = (key: keyof typeof L) => L[key][lang];
  const { data: allSessions = [], isLoading } = useDbSessions();
  const { data: seekers = [] } = useSeekerProfiles();

  const [search, setSearch] = useState('');
  const [seekerFilter, setSeekerFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pillarFilter, setPillarFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [limit, setLimit] = useState(PAGE_SIZE);

  const today = format(startOfToday(), 'yyyy-MM-dd');

  const seekerName = (id: string) => seekers.find(s => s.id === id)?.full_name || 'Unknown';

  const pastSessions = useMemo(() => {
    let result = allSessions.filter(s => s.date < today);

    if (seekerFilter) result = result.filter(s => s.seeker_id === seekerFilter);
    if (statusFilter) result = result.filter(s => s.status === statusFilter);
    if (pillarFilter) result = result.filter(s => s.pillar === pillarFilter);
    if (dateFrom) result = result.filter(s => s.date >= dateFrom);
    if (dateTo) result = result.filter(s => s.date <= dateTo);

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(s =>
        seekerName(s.seeker_id).toLowerCase().includes(q) ||
        (s.session_notes || '').toLowerCase().includes(q) ||
        (s.key_insights || '').toLowerCase().includes(q) ||
        (s.breakthroughs || '').toLowerCase().includes(q) ||
        (s.session_name || '').toLowerCase().includes(q)
      );
    }

    return result.sort((a, b) => b.date.localeCompare(a.date) || (b.start_time || '').localeCompare(a.start_time || ''));
  }, [allSessions, today, search, seekerFilter, statusFilter, pillarFilter, dateFrom, dateTo, seekers]);

  // Group by month
  const grouped = useMemo(() => {
    const groups: Record<string, typeof pastSessions> = {};
    pastSessions.slice(0, limit).forEach(s => {
      const key = s.date.slice(0, 7); // yyyy-MM
      if (!groups[key]) groups[key] = [];
      groups[key].push(s);
    });
    return groups;
  }, [pastSessions, limit]);

  const uniquePillars = useMemo(() => [...new Set(allSessions.map(s => s.pillar).filter(Boolean))], [allSessions]);
  const uniqueStatuses = useMemo(() => [...new Set(allSessions.map(s => s.status).filter(Boolean))], [allSessions]);

  const formatTime = (time: string) => {
    if (!time) return '';
    const [h, m] = time.split(':').map(Number);
    return `${h > 12 ? h - 12 : h || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
  };

  const exportCSV = () => {
    const headers = ['Date', 'Seeker', 'Start', 'End', 'Status', 'Pillar', 'Duration', 'Notes', 'Insights', 'Breakthroughs'];
    const rows = pastSessions.map(s => [
      s.date, seekerName(s.seeker_id), s.start_time, s.end_time, s.status,
      s.pillar || '', s.duration_minutes || '', (s.session_notes || '').replace(/,/g, ';'),
      (s.key_insights || '').replace(/,/g, ';'), (s.breakthroughs || '').replace(/,/g, ';'),
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `past-sessions-${today}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-saffron" /> {t('title')}
        </h1>
        <Button variant="outline" size="sm" onClick={exportCSV}>
          <Download className="w-3.5 h-3.5 mr-1" /> {t('export')}
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-3 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('search')} className="pl-9" />
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={seekerFilter} onChange={e => setSeekerFilter(e.target.value)}
            className="border border-input rounded-lg px-3 py-1.5 text-sm bg-background">
            <option value="">{t('allSeekers')}</option>
            {seekers.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="border border-input rounded-lg px-3 py-1.5 text-sm bg-background">
            <option value="">{t('allStatus')}</option>
            {uniqueStatuses.map(st => <option key={st} value={st}>{st}</option>)}
          </select>
          <select value={pillarFilter} onChange={e => setPillarFilter(e.target.value)}
            className="border border-input rounded-lg px-3 py-1.5 text-sm bg-background">
            <option value="">{t('allPillars')}</option>
            {uniquePillars.map(p => <option key={p} value={p!}>{p}</option>)}
          </select>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className="border border-input rounded-lg px-3 py-1.5 text-sm bg-background" placeholder="From" />
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            className="border border-input rounded-lg px-3 py-1.5 text-sm bg-background" placeholder="To" />
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">{pastSessions.length} session{pastSessions.length !== 1 ? 's' : ''} found</p>

      {/* Timeline */}
      {Object.keys(grouped).length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">{t('noResults')}</CardContent></Card>
      ) : (
        <div className="relative pl-6">
          {/* Timeline line */}
          <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />

          {Object.entries(grouped).map(([month, sessions]) => (
            <div key={month} className="mb-6">
              {/* Month marker */}
              <div className="flex items-center gap-2 mb-3 -ml-6">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center z-10">
                  <span className="text-[10px] text-primary-foreground font-bold">{sessions.length}</span>
                </div>
                <h3 className="font-semibold text-foreground">{format(parseISO(`${month}-01`), 'MMMM yyyy')}</h3>
              </div>

              <div className="space-y-3">
                {sessions.map(session => {
                  const isExpanded = expanded[session.id] ?? false;
                  const topics = Array.isArray(session.topics_covered) ? session.topics_covered : [];
                  return (
                    <div key={session.id} className="relative">
                      {/* Timeline dot */}
                      <div className="absolute -left-6 top-4 w-2.5 h-2.5 rounded-full bg-border z-10" />
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-semibold text-foreground">{seekerName(session.seeker_id)}</span>
                                <Badge variant="outline" className={STATUS_BADGE[session.status] || 'bg-muted text-muted-foreground'}>
                                  {session.status}
                                </Badge>
                                {session.pillar && <Badge variant="secondary" className="text-[10px]">{session.pillar}</Badge>}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span>{format(parseISO(session.date), 'MMM d, yyyy')}</span>
                                <span>{formatTime(session.start_time)} — {formatTime(session.end_time)}</span>
                                {session.duration_minutes && <span>{session.duration_minutes} min</span>}
                              </div>
                              {topics.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {topics.map((tp: string, i: number) => (
                                    <Badge key={i} variant="outline" className="text-[10px]">{tp}</Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            <button onClick={() => setExpanded(p => ({ ...p, [session.id]: !isExpanded }))}
                              className="p-1 hover:bg-muted rounded">
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>

                          {isExpanded && (
                            <div className="mt-3 pt-3 border-t border-border space-y-2">
                              {session.session_notes && (
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-1">{t('notes')}</p>
                                  <p className="text-sm text-foreground whitespace-pre-wrap">{session.session_notes}</p>
                                </div>
                              )}
                              {session.key_insights && (
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-1">{t('insights')}</p>
                                  <p className="text-sm text-foreground whitespace-pre-wrap">{session.key_insights}</p>
                                </div>
                              )}
                              {session.breakthroughs && (
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-1">{t('breakthroughs')}</p>
                                  <p className="text-sm text-foreground whitespace-pre-wrap">{session.breakthroughs}</p>
                                </div>
                              )}
                              {session.engagement_score != null && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">Engagement:</span>
                                  <Badge variant="outline">{session.engagement_score}/10</Badge>
                                </div>
                              )}
                              {!session.session_notes && !session.key_insights && !session.breakthroughs && (
                                <p className="text-sm text-muted-foreground italic">No detailed notes recorded</p>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {pastSessions.length > limit && (
            <div className="text-center pt-4">
              <Button variant="outline" onClick={() => setLimit(l => l + PAGE_SIZE)}>{t('loadMore')}</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
