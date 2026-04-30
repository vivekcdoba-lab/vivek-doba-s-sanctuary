import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { formatDateDMY } from "@/lib/dateFormat";

const WIN_SIZES = [
  { key: 'small', label: '🔥', desc: 'Small Win' },
  { key: 'medium', label: '🔥🔥', desc: 'Medium Win' },
  { key: 'big', label: '🔥🔥🔥', desc: 'Big Win!' },
];

const DIM_EMOJIS: Record<string, string> = { dharma: '🕉️', artha: '💰', kama: '❤️', moksha: '☀️' };

export default function SeekerWinJournal() {
  const { profile } = useAuthStore();
  const profileId = profile?.id;
  const [filter, setFilter] = useState('all');

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
      <div className="gradient-hero rounded-2xl p-5 text-primary-foreground">
        <h1 className="text-xl font-bold">🏆 जीत का जश्न (Win Celebration Journal)</h1>
        <p className="text-sm text-primary-foreground/80 mt-1">"हर छोटी जीत बड़ी सफलता की नींव है"</p>
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
          <p className="text-muted-foreground">Start recording your wins in daily worksheets!</p>
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
    </div>
  );
}
