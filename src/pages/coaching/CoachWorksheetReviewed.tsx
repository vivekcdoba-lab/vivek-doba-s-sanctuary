import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCoachingLang } from '@/components/CoachingLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Download, CheckCircle, Star } from 'lucide-react';
import { format } from 'date-fns';

export default function CoachWorksheetReviewed() {
  const { lang } = useCoachingLang();
  const [search, setSearch] = useState('');
  const [filterSeeker, setFilterSeeker] = useState('all');

  const { data: worksheets = [], isLoading } = useQuery({
    queryKey: ['coach-reviewed-worksheets'],
    queryFn: async () => {
      const { data } = await supabase
        .from('daily_worksheets')
        .select('*, profiles:seeker_id(full_name, avatar_url)')
        .eq('is_submitted', true)
        .order('worksheet_date', { ascending: false })
        .limit(300);
      return data || [];
    },
  });

  const seekerNames = useMemo(() => {
    const names = new Set<string>();
    worksheets.forEach((w: any) => {
      const n = (w.profiles as any)?.full_name;
      if (n) names.add(n);
    });
    return Array.from(names).sort();
  }, [worksheets]);

  const filtered = useMemo(() => {
    let list = worksheets;
    if (filterSeeker !== 'all') list = list.filter((w: any) => (w.profiles as any)?.full_name === filterSeeker);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((w: any) => (w.profiles as any)?.full_name?.toLowerCase().includes(q));
    }
    return list;
  }, [worksheets, filterSeeker, search]);

  const exportCsv = () => {
    const header = 'Seeker,Date,Completion %,LGT Score,Sampoorna Din\n';
    const rows = filtered.map((w: any) =>
      `"${(w.profiles as any)?.full_name || ''}",${w.worksheet_date},${w.completion_rate_percent || 0},${w.lgt_balance_score || ''},${w.sampoorna_din_score || ''}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'reviewed-worksheets.csv'; a.click();
  };

  const ratingStars = (score: number | null) => {
    if (!score) return '—';
    const stars = Math.round(score / 2);
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-3 h-3 inline ${i < stars ? 'text-primary fill-primary' : 'text-muted-foreground/30'}`} />
    ));
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{lang === 'en' ? 'Reviewed Worksheets' : 'समीक्षित वर्कशीट'}</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} worksheets reviewed</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCsv} className="gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search seeker…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterSeeker} onValueChange={setFilterSeeker}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="All Seekers" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Seekers</SelectItem>
            {seekerNames.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-6 text-center text-muted-foreground text-sm">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="p-6 text-center text-muted-foreground text-sm">No reviewed worksheets found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="p-3 text-left font-medium text-muted-foreground">Seeker</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Date</th>
                    <th className="p-3 text-center font-medium text-muted-foreground">Completion</th>
                    <th className="p-3 text-center font-medium text-muted-foreground">LGT Score</th>
                    <th className="p-3 text-center font-medium text-muted-foreground">Sampoorna Din</th>
                    <th className="p-3 text-center font-medium text-muted-foreground">Rating</th>
                    <th className="p-3 text-center font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((w: any) => {
                    const p = w.profiles as any;
                    return (
                      <tr key={w.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                              {p?.full_name?.charAt(0) || '?'}
                            </div>
                            <span className="font-medium text-foreground">{p?.full_name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground">{format(new Date(w.worksheet_date), 'dd MMM yyyy')}</td>
                        <td className="p-3 text-center">
                          <Badge variant="secondary" className={`${(w.completion_rate_percent || 0) >= 80 ? 'bg-green-500/10 text-green-700' : 'bg-yellow-500/10 text-yellow-700'}`}>
                            {w.completion_rate_percent || 0}%
                          </Badge>
                        </td>
                        <td className="p-3 text-center font-medium">{w.lgt_balance_score?.toFixed(1) || '—'}</td>
                        <td className="p-3 text-center font-medium">{w.sampoorna_din_score?.toFixed(1) || '—'}</td>
                        <td className="p-3 text-center">{ratingStars(w.sampoorna_din_score)}</td>
                        <td className="p-3 text-center">
                          <Badge className="bg-green-500/10 text-green-700 gap-1"><CheckCircle className="w-3 h-3" /> Reviewed</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
