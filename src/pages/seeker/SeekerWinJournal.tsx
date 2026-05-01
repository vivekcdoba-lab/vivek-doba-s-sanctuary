import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { formatDateDMY } from "@/lib/dateFormat";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Plus, Loader2 } from 'lucide-react';

const WIN_SIZES = [
  { key: 'small', label: '🔥', desc: 'Small Win' },
  { key: 'medium', label: '🔥🔥', desc: 'Medium Win' },
  { key: 'big', label: '🔥🔥🔥', desc: 'Big Win!' },
];

const DIM_EMOJIS: Record<string, string> = { dharma: '🕉️', artha: '💰', kama: '❤️', moksha: '☀️' };
const DIMENSIONS = [
  { key: 'dharma', label: '🕉️ Dharma' },
  { key: 'artha', label: '💰 Artha' },
  { key: 'kama', label: '❤️ Kama' },
  { key: 'moksha', label: '☀️ Moksha' },
];

export default function SeekerWinJournal() {
  const { profile } = useAuthStore();
  const profileId = profile?.id;
  const [filter, setFilter] = useState('all');
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [size, setSize] = useState('small');
  const [dimension, setDimension] = useState('dharma');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: worksheets = [] } = useQuery({
    queryKey: ['win-journal', profileId],
    queryFn: async () => {
      if (!profileId) return [];
      const { data } = await supabase
        .from('daily_worksheets')
        .select('id, worksheet_date, todays_win_1, todays_win_2, todays_win_3')
        .eq('seeker_id', profileId)
        .order('worksheet_date', { ascending: false })
        .limit(90);
      return data || [];
    },
    enabled: !!profileId,
  });

  const logWin = useMutation({
    mutationFn: async () => {
      if (!profileId) throw new Error('Not signed in');
      if (!text.trim()) throw new Error('Win text required');

      const { data: existing } = await supabase
        .from('daily_worksheets')
        .select('id, todays_win_1, todays_win_2, todays_win_3')
        .eq('seeker_id', profileId)
        .eq('worksheet_date', date)
        .maybeSingle();

      const slot = !existing?.todays_win_1 ? 'todays_win_1'
        : !existing?.todays_win_2 ? 'todays_win_2'
        : !existing?.todays_win_3 ? 'todays_win_3'
        : null;
      if (!slot) throw new Error('All 3 win slots are filled for this date');

      if (existing?.id) {
        const { error } = await supabase
          .from('daily_worksheets')
          .update({ [slot]: text.trim() } as any)
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('daily_worksheets')
          .insert({ seeker_id: profileId, worksheet_date: date, [slot]: text.trim() } as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({ title: 'Win logged 🏆', description: 'Celebrate your progress!' });
      setOpen(false);
      setText('');
      setSize('small');
      setDimension('dharma');
      setDate(new Date().toISOString().slice(0, 10));
      qc.invalidateQueries({ queryKey: ['win-journal'] });
      qc.invalidateQueries({ queryKey: ['streak-count'] });
    },
    onError: (e: any) => toast({ title: 'Could not save', description: e.message, variant: 'destructive' }),
  });

  const wins = worksheets.flatMap(w => {
    const items: { text: string; date: string; dimension: string; size: string }[] = [];
    [w.todays_win_1, w.todays_win_2, w.todays_win_3].forEach(win => {
      if (win) {
        const dim = win.toLowerCase().includes('business') || win.toLowerCase().includes('client') || win.toLowerCase().includes('₹') ? 'artha'
          : win.toLowerCase().includes('family') || win.toLowerCase().includes('love') ? 'kama'
          : win.toLowerCase().includes('meditat') || win.toLowerCase().includes('peace') ? 'moksha' : 'dharma';
        const size = win.includes('₹') || win.length > 50 ? 'big' : win.length > 25 ? 'medium' : 'small';
        items.push({ text: win, date: w.worksheet_date, dimension: dim, size });
      }
    });
    return items;
  });

  const totalWins = wins.length;
  const thisMonth = wins.filter(w => w.date.startsWith(new Date().toISOString().slice(0, 7))).length;

  return (
    <div className="p-4 space-y-5 max-w-4xl mx-auto">
      <div className="gradient-hero rounded-2xl p-5 text-primary-foreground flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold">🏆 जीत का जश्न (Win Celebration Journal)</h1>
          <p className="text-sm text-primary-foreground/80 mt-1">"हर छोटी जीत बड़ी सफलता की नींव है"</p>
        </div>
        <Button onClick={() => setOpen(true)} size="sm" variant="secondary" className="gap-1.5">
          <Plus className="w-4 h-4" /> Log a Win
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="px-3 py-1.5 rounded-full bg-muted text-foreground font-medium">Total Wins: {totalWins}</div>
        <div className="px-3 py-1.5 rounded-full bg-muted text-foreground font-medium">This Month: {thisMonth}</div>
      </div>

      <div className="flex flex-wrap gap-2">
        {['all', 'big', 'medium', 'small'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground'}`}>
            {f === 'all' ? 'All' : WIN_SIZES.find(s => s.key === f)?.desc}
          </button>
        ))}
      </div>

      {wins.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-2xl border border-border">
          <p className="text-4xl mb-3">🏆</p>
          <p className="text-muted-foreground">Start recording your wins — click "Log a Win" above!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {wins.filter(w => filter === 'all' || w.size === filter).map((w, i) => (
            <div key={i} className="bg-card rounded-xl p-4 border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <span className="text-xl">{DIM_EMOJIS[w.dimension]}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">"{w.text}"</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                    <span>Size: {WIN_SIZES.find(s => s.key === w.size)?.label} {WIN_SIZES.find(s => s.key === w.size)?.desc}</span>
                    <span>|</span>
                    <span>Dimension: {w.dimension.charAt(0).toUpperCase() + w.dimension.slice(1)}</span>
                    <span>|</span>
                    <span>{formatDateDMY(w.date)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>🏆 Log a Win</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="win-text">What's your win?</Label>
              <Textarea id="win-text" value={text} onChange={e => setText(e.target.value)} placeholder="e.g. Closed a ₹50k client deal" rows={3} />
            </div>
            <div className="space-y-1.5">
              <Label>Size</Label>
              <RadioGroup value={size} onValueChange={setSize} className="flex gap-3">
                {WIN_SIZES.map(s => (
                  <label key={s.key} className="flex items-center gap-2 cursor-pointer text-sm">
                    <RadioGroupItem value={s.key} /> {s.label} {s.desc}
                  </label>
                ))}
              </RadioGroup>
            </div>
            <div className="space-y-1.5">
              <Label>Dimension</Label>
              <RadioGroup value={dimension} onValueChange={setDimension} className="grid grid-cols-2 gap-2">
                {DIMENSIONS.map(d => (
                  <label key={d.key} className="flex items-center gap-2 cursor-pointer text-sm">
                    <RadioGroupItem value={d.key} /> {d.label}
                  </label>
                ))}
              </RadioGroup>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="win-date">Date</Label>
              <Input id="win-date" type="date" value={date} onChange={e => setDate(e.target.value)} max={new Date().toISOString().slice(0, 10)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => logWin.mutate()} disabled={logWin.isPending || !text.trim()}>
              {logWin.isPending && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />} Save Win
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
