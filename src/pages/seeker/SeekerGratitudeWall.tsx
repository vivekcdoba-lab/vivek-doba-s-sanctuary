import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useStreakCount } from '@/hooks/useStreakCount';

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
      <div className="gradient-sacred rounded-2xl p-5 text-primary-foreground">
        <h1 className="text-xl font-bold">🙏 कृतज्ञता की दीवार (Gratitude Wall)</h1>
        <p className="text-sm text-primary-foreground/80 mt-1">"जो आभारी है, वो खुशहाल है"</p>
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
          <p className="text-muted-foreground">Start filling your daily worksheet gratitudes!</p>
          <p className="text-xs text-muted-foreground mt-1">They'll appear here as beautiful cards</p>
        </div>
      ) : view === 'grid' ? (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
          {gratitudes.map((g, i) => (
            <div key={i} className="break-inside-avoid bg-card rounded-xl p-4 border border-border shadow-sm hover:shadow-md transition-shadow">
              <span className="text-2xl">{g.emoji}</span>
              <p className="text-sm text-foreground mt-2">"{g.text}"</p>
              <p className="text-[10px] text-muted-foreground mt-2">{new Date(g.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</p>
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
                <p className="text-[10px] text-muted-foreground mt-1">{new Date(g.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
