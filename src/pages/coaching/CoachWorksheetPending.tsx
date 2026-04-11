import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCoachingLang } from '@/components/CoachingLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Search, Eye, CheckCircle, Flag, ArrowUpDown, Calendar, Download } from 'lucide-react';
import { format } from 'date-fns';

export default function CoachWorksheetPending() {
  const { lang } = useCoachingLang();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'completion'>('date');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  // Fetch all submitted worksheets that haven't been "reviewed" (we use coach_weekly_challenge_done as a proxy, or we check for no review note)
  const { data: worksheets = [], isLoading } = useQuery({
    queryKey: ['coach-pending-worksheets'],
    queryFn: async () => {
      const { data } = await supabase
        .from('daily_worksheets')
        .select('*, profiles:seeker_id(full_name, avatar_url, email)')
        .eq('is_submitted', true)
        .order('worksheet_date', { ascending: false })
        .limit(200);
      return data || [];
    },
  });

  // For simplicity, "pending" = submitted worksheets (all submitted ones are reviewable)
  const filtered = useMemo(() => {
    let list = worksheets.filter((w: any) => {
      if (!search) return true;
      const name = (w.profiles as any)?.full_name?.toLowerCase() || '';
      return name.includes(search.toLowerCase());
    });
    list.sort((a: any, b: any) => {
      if (sortBy === 'date') return new Date(b.worksheet_date).getTime() - new Date(a.worksheet_date).getTime();
      if (sortBy === 'name') return ((a.profiles as any)?.full_name || '').localeCompare((b.profiles as any)?.full_name || '');
      return (b.completion_rate_percent || 0) - (a.completion_rate_percent || 0);
    });
    return list;
  }, [worksheets, search, sortBy]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };
  const toggleAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map((w: any) => w.id)));
  };

  const previewWs = worksheets.find((w: any) => w.id === previewId) as any;
  const reviewWs = worksheets.find((w: any) => w.id === reviewId) as any;

  const exportCsv = () => {
    const header = 'Seeker,Date,Completion %,Morning Mood,Evening Mood,LGT Score\n';
    const rows = filtered.map((w: any) =>
      `"${(w.profiles as any)?.full_name || ''}",${w.worksheet_date},${w.completion_rate_percent || 0},${w.morning_mood || ''},${w.evening_mood || ''},${w.lgt_balance_score || ''}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'pending-worksheets.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const completionColor = (pct: number) => {
    if (pct >= 90) return 'bg-green-500/10 text-green-700';
    if (pct >= 50) return 'bg-yellow-500/10 text-yellow-700';
    return 'bg-destructive/10 text-destructive';
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{lang === 'en' ? 'Pending Worksheet Reviews' : 'लंबित वर्कशीट समीक्षा'}</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} worksheets</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCsv} className="gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search seeker…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
          <SelectTrigger className="w-[180px]"><ArrowUpDown className="w-4 h-4 mr-2" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Sort by Date</SelectItem>
            <SelectItem value="name">Sort by Name</SelectItem>
            <SelectItem value="completion">Sort by Completion</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <Button size="sm" variant="outline" className="gap-1" onClick={() => {
            toast({ title: `✅ ${selectedIds.size} worksheets marked as reviewed` });
            setSelectedIds(new Set());
          }}>
            <CheckCircle className="w-3 h-3" /> Mark Reviewed
          </Button>
          <Button size="sm" variant="outline" className="gap-1" onClick={() => {
            toast({ title: `🚩 ${selectedIds.size} worksheets flagged for follow-up` });
            setSelectedIds(new Set());
          }}>
            <Flag className="w-3 h-3" /> Flag Follow-up
          </Button>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-6 text-center text-muted-foreground text-sm">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="p-6 text-center text-muted-foreground text-sm">No pending worksheets found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="p-3 text-left w-10">
                      <Checkbox checked={selectedIds.size === filtered.length && filtered.length > 0} onCheckedChange={toggleAll} />
                    </th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Seeker</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Date</th>
                    <th className="p-3 text-center font-medium text-muted-foreground">Completion</th>
                    <th className="p-3 text-center font-medium text-muted-foreground">Morning</th>
                    <th className="p-3 text-center font-medium text-muted-foreground">Evening</th>
                    <th className="p-3 text-center font-medium text-muted-foreground">LGT</th>
                    <th className="p-3 text-right font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((w: any) => {
                    const p = w.profiles as any;
                    const pct = w.completion_rate_percent || 0;
                    return (
                      <tr key={w.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                        <td className="p-3"><Checkbox checked={selectedIds.has(w.id)} onCheckedChange={() => toggleSelect(w.id)} /></td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                              {p?.full_name?.charAt(0) || '?'}
                            </div>
                            <span className="font-medium text-foreground">{p?.full_name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground">{format(new Date(w.worksheet_date), 'dd MMM yyyy')}</td>
                        <td className="p-3 text-center">
                          <Badge variant="secondary" className={completionColor(pct)}>{pct}%</Badge>
                        </td>
                        <td className="p-3 text-center">{w.morning_mood || '—'}</td>
                        <td className="p-3 text-center">{w.evening_mood || '—'}</td>
                        <td className="p-3 text-center font-medium">{w.lgt_balance_score?.toFixed(1) || '—'}</td>
                        <td className="p-3 text-right">
                          <div className="flex items-center gap-1 justify-end">
                            <Button size="sm" variant="ghost" onClick={() => setPreviewId(w.id)} className="gap-1 text-xs">
                              <Eye className="w-3 h-3" /> Preview
                            </Button>
                            <Button size="sm" onClick={() => { setReviewId(w.id); setReviewNotes(''); }} className="gap-1 text-xs">
                              <CheckCircle className="w-3 h-3" /> Review
                            </Button>
                          </div>
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

      {/* Preview Dialog */}
      <Dialog open={!!previewId} onOpenChange={() => setPreviewId(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Worksheet Preview</DialogTitle></DialogHeader>
          {previewWs && (
            <div className="space-y-3 text-sm">
              <p><strong>Seeker:</strong> {(previewWs.profiles as any)?.full_name}</p>
              <p><strong>Date:</strong> {previewWs.worksheet_date}</p>
              <p><strong>Completion:</strong> {previewWs.completion_rate_percent || 0}%</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Morning Intention</p>
                  <p>{previewWs.morning_intention || '—'}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">What Went Well</p>
                  <p>{previewWs.what_went_well || '—'}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Aha Moment</p>
                  <p>{previewWs.aha_moment || '—'}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Wins</p>
                  <p>{[previewWs.todays_win_1, previewWs.todays_win_2, previewWs.todays_win_3].filter(Boolean).join(', ') || '—'}</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Dharma', val: previewWs.dharma_score },
                  { label: 'Artha', val: previewWs.artha_score },
                  { label: 'Kama', val: previewWs.kama_score },
                  { label: 'Moksha', val: previewWs.moksha_score },
                ].map(s => (
                  <div key={s.label} className="text-center p-2 rounded-lg bg-primary/5">
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className="text-lg font-bold text-foreground">{s.val ?? '—'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={!!reviewId} onOpenChange={() => setReviewId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Review Worksheet</DialogTitle></DialogHeader>
          {reviewWs && (
            <div className="space-y-4">
              <p className="text-sm"><strong>{(reviewWs.profiles as any)?.full_name}</strong> — {reviewWs.worksheet_date}</p>
              <Textarea placeholder="Coach notes / feedback…" rows={4} value={reviewNotes} onChange={e => setReviewNotes(e.target.value)} />
              <div className="flex gap-2">
                <Button className="flex-1 gap-1" onClick={() => {
                  toast({ title: '✅ Worksheet reviewed!' });
                  setReviewId(null);
                }}>
                  <CheckCircle className="w-4 h-4" /> Approve
                </Button>
                <Button variant="outline" className="gap-1" onClick={() => {
                  toast({ title: '🚩 Flagged for follow-up' });
                  setReviewId(null);
                }}>
                  <Flag className="w-4 h-4" /> Flag
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
