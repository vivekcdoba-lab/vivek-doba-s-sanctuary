import { useState, useMemo } from 'react';
import { useCoachingLang } from '@/components/CoachingLayout';
import { useDbAssignments } from '@/hooks/useDbAssignments';
import { useSeekerProfiles } from '@/hooks/useSeekerProfiles';
import { format, parseISO } from 'date-fns';
import { CheckCircle, Loader2, Search, Download, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const L = {
  title: { en: 'Reviewed Assignments', hi: 'समीक्षित कार्य' },
  noItems: { en: 'No reviewed assignments found', hi: 'कोई समीक्षित कार्य नहीं' },
  search: { en: 'Search by title, seeker...', hi: 'शीर्षक, साधक से खोजें...' },
  export: { en: 'Export', hi: 'निर्यात' },
  feedback: { en: 'Feedback', hi: 'प्रतिक्रिया' },
  score: { en: 'Score', hi: 'अंक' },
  allSeekers: { en: 'All Seekers', hi: 'सभी साधक' },
  avgScore: { en: 'Avg Score', hi: 'औसत अंक' },
  total: { en: 'Total Reviewed', hi: 'कुल समीक्षित' },
  highScorers: { en: 'High Scorers', hi: 'उच्च अंक' },
};

export default function CoachReviewedAssignments() {
  const { lang } = useCoachingLang();
  const t = (key: keyof typeof L) => L[key][lang];
  const { data: assignments = [], isLoading } = useDbAssignments();
  const { data: seekers = [] } = useSeekerProfiles();

  const [search, setSearch] = useState('');
  const [seekerFilter, setSeekerFilter] = useState('');
  const [scoreMin, setScoreMin] = useState('');
  const [scoreMax, setScoreMax] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const seekerName = (id: string) => seekers.find(s => s.id === id)?.full_name || 'Unknown';

  const reviewed = useMemo(() => {
    let result = assignments.filter(a => ['reviewed', 'completed'].includes(a.status) && (a.score != null || a.feedback));

    if (seekerFilter) result = result.filter(a => a.seeker_id === seekerFilter);
    if (scoreMin) result = result.filter(a => (a.score || 0) >= Number(scoreMin));
    if (scoreMax) result = result.filter(a => (a.score || 0) <= Number(scoreMax));
    if (dateFrom) result = result.filter(a => a.due_date >= dateFrom);
    if (dateTo) result = result.filter(a => a.due_date <= dateTo);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(a =>
        a.title.toLowerCase().includes(q) ||
        seekerName(a.seeker_id).toLowerCase().includes(q) ||
        (a.feedback || '').toLowerCase().includes(q)
      );
    }

    return result.sort((a, b) => b.due_date.localeCompare(a.due_date));
  }, [assignments, seekerFilter, scoreMin, scoreMax, dateFrom, dateTo, search, seekers]);

  // Stats
  const avgScore = useMemo(() => {
    const scores = reviewed.filter(a => a.score != null).map(a => a.score!);
    return scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '—';
  }, [reviewed]);

  const highScorers = useMemo(() => reviewed.filter(a => (a.score || 0) >= 8).length, [reviewed]);

  const exportCSV = () => {
    const headers = ['Title', 'Seeker', 'Due Date', 'Score', 'Feedback', 'Category', 'Type'];
    const rows = reviewed.map(a => [
      a.title, seekerName(a.seeker_id), a.due_date, a.score || '',
      (a.feedback || '').replace(/,/g, ';'), a.category || '', a.type,
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `reviewed-assignments.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const renderScoreStars = (score: number | null) => {
    if (score == null) return <span className="text-xs text-muted-foreground">—</span>;
    const filled = Math.round(score / 2);
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} className={`w-3.5 h-3.5 ${i < filled ? 'fill-saffron text-saffron' : 'text-muted-foreground'}`} />
        ))}
        <span className="text-xs font-medium text-foreground ml-1">{score}/10</span>
      </div>
    );
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <CheckCircle className="w-6 h-6 text-dharma-green" /> {t('title')}
        </h1>
        <Button variant="outline" size="sm" onClick={exportCSV}>
          <Download className="w-3.5 h-3.5 mr-1" /> {t('export')}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: t('total'), value: reviewed.length, emoji: '📋' },
          { label: t('avgScore'), value: avgScore, emoji: '⭐' },
          { label: t('highScorers'), value: highScorers, emoji: '🏆' },
        ].map((s, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-3 text-center">
            <div className="text-xl mb-1">{s.emoji}</div>
            <div className="text-xl font-bold text-foreground">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
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
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">{t('score')}:</span>
            <input type="number" min="0" max="10" value={scoreMin} onChange={e => setScoreMin(e.target.value)}
              className="w-14 border border-input rounded-lg px-2 py-1.5 text-sm bg-background" placeholder="Min" />
            <span className="text-xs text-muted-foreground">-</span>
            <input type="number" min="0" max="10" value={scoreMax} onChange={e => setScoreMax(e.target.value)}
              className="w-14 border border-input rounded-lg px-2 py-1.5 text-sm bg-background" placeholder="Max" />
          </div>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className="border border-input rounded-lg px-3 py-1.5 text-sm bg-background" />
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            className="border border-input rounded-lg px-3 py-1.5 text-sm bg-background" />
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{reviewed.length} result{reviewed.length !== 1 ? 's' : ''}</p>

      {reviewed.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">{t('noItems')}</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {reviewed.map(a => {
            const isExp = expanded[a.id] ?? false;
            return (
              <Card key={a.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-1">
                      <h3 className="font-semibold text-foreground">{a.title}</h3>
                      <p className="text-sm text-muted-foreground">{seekerName(a.seeker_id)}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{format(parseISO(a.due_date), 'MMM d, yyyy')}</span>
                        {a.category && <Badge variant="secondary" className="text-[10px]">{a.category}</Badge>}
                        {a.type && <Badge variant="outline" className="text-[10px]">{a.type}</Badge>}
                      </div>
                      {renderScoreStars(a.score)}
                    </div>
                    <button onClick={() => setExpanded(p => ({ ...p, [a.id]: !isExp }))} className="p-1 hover:bg-muted rounded">
                      {isExp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {isExp && a.feedback && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs font-medium text-muted-foreground mb-1">{t('feedback')}</p>
                      <p className="text-sm text-foreground whitespace-pre-wrap">{a.feedback}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
