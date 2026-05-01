import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useStreakCount } from '@/hooks/useStreakCount';
import { formatDateDMY } from "@/lib/dateFormat";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Loader2 } from 'lucide-react';

const PILLAR_COLORS: Record<string, string> = {
  all: 'bg-primary/10 text-primary',
  dharma: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  artha: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  kama: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  moksha: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
};

const EMOJIS = ['🙏', '💕', '🌅', '💰', '🏠', '🌟', '🎉', '💪', '🧘', '📚', '❤️', '☀️'];

export default function SeekerGratitudeWall() {
  const { profile } = useAuthStore();
  const profileId = profile?.id;
  const { data: streak = 0 } = useStreakCount(profileId || null);
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [emoji, setEmoji] = useState('🙏');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: worksheets = [] } = useQuery({
    queryKey: ['gratitude-wall', profileId],
    queryFn: async () => {
      if (!profileId) return [];
      const { data } = await supabase
        .from('daily_worksheets')
        .select('id, worksheet_date, gratitude_1, gratitude_2, gratitude_3, gratitude_4, gratitude_5')
        .eq('seeker_id', profileId)
        .order('worksheet_date', { ascending: false })
        .limit(60);
      return data || [];
    },
    enabled: !!profileId,
  });

  const addGratitude = useMutation({
    mutationFn: async () => {
      if (!profileId) throw new Error('Not signed in');
      if (!text.trim()) throw new Error('Gratitude text required');

      const { data: existing } = await supabase
        .from('daily_worksheets')
        .select('id, gratitude_1, gratitude_2, gratitude_3, gratitude_4, gratitude_5')
        .eq('seeker_id', profileId)
        .eq('worksheet_date', date)
        .maybeSingle();

      const slot = !existing?.gratitude_1 ? 'gratitude_1'
        : !existing?.gratitude_2 ? 'gratitude_2'
        : !existing?.gratitude_3 ? 'gratitude_3'
        : !existing?.gratitude_4 ? 'gratitude_4'
        : !existing?.gratitude_5 ? 'gratitude_5'
        : null;
      if (!slot) throw new Error('All 5 gratitude slots are filled for this date');

      const value = `${emoji} ${text.trim()}`;
      if (existing?.id) {
        const { error } = await supabase
          .from('daily_worksheets')
          .update({ [slot]: value } as any)
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('daily_worksheets')
          .insert({ seeker_id: profileId, worksheet_date: date, [slot]: value } as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({ title: 'Gratitude added 🙏' });
      setOpen(false);
      setText('');
      setEmoji('🙏');
      setDate(new Date().toISOString().slice(0, 10));
      qc.invalidateQueries({ queryKey: ['gratitude-wall'] });
      qc.invalidateQueries({ queryKey: ['streak-count'] });
    },
    onError: (e: any) => toast({ title: 'Could not save', description: e.message, variant: 'destructive' }),
  });

  const gratitudes = worksheets.flatMap(w => {
    const items: { text: string; date: string; emoji: string }[] = [];
    [w.gratitude_1, w.gratitude_2, w.gratitude_3, w.gratitude_4, w.gratitude_5].forEach((g, i) => {
      if (g) items.push({ text: g, date: w.worksheet_date, emoji: EMOJIS[i % EMOJIS.length] });
    });
    return items;
  });

  const totalGratitudes = gratitudes.length;
  const thisMonth = gratitudes.filter(g => g.date.startsWith(new Date().toISOString().slice(0, 7))).length;

  return (
    <div className="p-4 space-y-5 max-w-4xl mx-auto">
      <div className="gradient-sacred rounded-2xl p-5 text-primary-foreground flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold">🙏 कृतज्ञता की दीवार (Gratitude Wall)</h1>
          <p className="text-sm text-primary-foreground/80 mt-1">"जो आभारी है, वो खुशहाल है"</p>
        </div>
        <Button onClick={() => setOpen(true)} size="sm" variant="secondary" className="gap-1.5">
          <Plus className="w-4 h-4" /> Add Gratitude
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="px-3 py-1.5 rounded-full bg-muted text-foreground font-medium">Total: {totalGratitudes}</div>
        <div className="px-3 py-1.5 rounded-full bg-muted text-foreground font-medium">This Month: {thisMonth}</div>
        <div className="px-3 py-1.5 rounded-full bg-muted text-foreground font-medium">🔥 Streak: {streak} days</div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'All' },
          { key: 'dharma', label: '🕉️ Dharma' },
          { key: 'artha', label: '💰 Artha' },
          { key: 'kama', label: '❤️ Kama' },
          { key: 'moksha', label: '☀️ Moksha' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === f.key ? PILLAR_COLORS[f.key] : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}>
            {f.label}
          </button>
        ))}
        <div className="ml-auto flex gap-1">
          <button onClick={() => setView('grid')} className={`px-2 py-1 rounded text-xs ${view === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>🖼️ Grid</button>
          <button onClick={() => setView('list')} className={`px-2 py-1 rounded text-xs ${view === 'list' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>📋 List</button>
        </div>
      </div>

      {gratitudes.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-2xl border border-border">
          <p className="text-4xl mb-3">🙏</p>
          <p className="text-muted-foreground">No gratitudes yet — click "Add Gratitude" above!</p>
          <p className="text-xs text-muted-foreground mt-1">They'll appear here as beautiful cards</p>
        </div>
      ) : view === 'grid' ? (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
          {gratitudes.map((g, i) => (
            <div key={i} className="break-inside-avoid bg-card rounded-xl p-4 border border-border shadow-sm hover:shadow-md transition-shadow">
              <span className="text-2xl">{g.emoji}</span>
              <p className="text-sm text-foreground mt-2">"{g.text}"</p>
              <p className="text-[10px] text-muted-foreground mt-2">{formatDateDMY(g.date)}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {gratitudes.map((g, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-card rounded-xl border border-border">
              <span className="text-xl">{g.emoji}</span>
              <div className="flex-1">
                <p className="text-sm text-foreground">"{g.text}"</p>
                <p className="text-[10px] text-muted-foreground mt-1">{formatDateDMY(g.date)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>🙏 Add Gratitude</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="grat-text">I'm grateful for…</Label>
              <Textarea id="grat-text" value={text} onChange={e => setText(e.target.value)} placeholder="e.g. My family's support today" rows={3} />
            </div>
            <div className="space-y-1.5">
              <Label>Pick an emoji</Label>
              <div className="flex flex-wrap gap-1.5">
                {EMOJIS.map(em => (
                  <button key={em} type="button" onClick={() => setEmoji(em)}
                    className={`w-9 h-9 rounded-lg border text-xl transition ${emoji === em ? 'border-primary bg-primary/10 scale-110' : 'border-border hover:bg-muted'}`}>
                    {em}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="grat-date">Date</Label>
              <Input id="grat-date" type="date" value={date} onChange={e => setDate(e.target.value)} max={new Date().toISOString().slice(0, 10)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => addGratitude.mutate()} disabled={addGratitude.isPending || !text.trim()}>
              {addGratitude.isPending && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
