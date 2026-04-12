import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

const PILLAR_OPTIONS = [
  { key: 'dharma', emoji: '🕉️', label: 'Dharma' },
  { key: 'artha', emoji: '💰', label: 'Artha' },
  { key: 'kama', emoji: '❤️', label: 'Kama' },
  { key: 'moksha', emoji: '☀️', label: 'Moksha' },
];

export default function DailySankalpWidget() {
  const { profile } = useAuthStore();
  const profileId = profile?.id;
  const today = new Date().toISOString().split('T')[0];
  const queryClient = useQueryClient();

  const [editMode, setEditMode] = useState(false);
  const [sankalpText, setSankalpText] = useState('');
  const [pillar, setPillar] = useState('dharma');
  const [review, setReview] = useState<string | null>(null);

  const { data: todayWorksheet } = useQuery({
    queryKey: ['sankalp-worksheet', profileId, today],
    queryFn: async () => {
      if (!profileId) return null;
      const { data } = await supabase
        .from('daily_worksheets')
        .select('id, morning_intention, worksheet_date')
        .eq('seeker_id', profileId)
        .eq('worksheet_date', today)
        .maybeSingle();
      return data;
    },
    enabled: !!profileId,
  });

  const currentSankalp = todayWorksheet?.morning_intention;
  const showInput = editMode || !currentSankalp;

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!profileId) return;
      if (todayWorksheet) {
        await supabase.from('daily_worksheets').update({ morning_intention: sankalpText }).eq('id', todayWorksheet.id);
      } else {
        await supabase.from('daily_worksheets').insert({ seeker_id: profileId, worksheet_date: today, morning_intention: sankalpText });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sankalp-worksheet'] });
      setEditMode(false);
      toast({ title: '🎯 संकल्प saved!' });
    },
  });

  return (
    <div className="bg-card rounded-2xl shadow-md border border-border overflow-hidden">
      <div className="h-1.5 gradient-sacred" />
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">🎯 आज का संकल्प (Today's Sankalp)</h3>
          {currentSankalp && !editMode && (
            <button onClick={() => { setSankalpText(currentSankalp); setEditMode(true); }} className="text-xs text-primary hover:underline">✏️ Edit</button>
          )}
        </div>

        {showInput ? (
          <div className="space-y-3">
            <Textarea
              value={sankalpText}
              onChange={e => setSankalpText(e.target.value)}
              placeholder="आज मैं... (Today I will...)"
              className="min-h-[60px] text-sm"
            />
            <div className="flex gap-2 flex-wrap">
              {PILLAR_OPTIONS.map(p => (
                <button
                  key={p.key}
                  onClick={() => setPillar(p.key)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${pillar === p.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                >
                  {p.emoji} {p.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => saveMutation.mutate()}
              disabled={!sankalpText.trim()}
              className="w-full py-2 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              💾 Save Sankalp
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-muted/30 border border-border">
              <p className="text-sm text-foreground italic">📿 "{currentSankalp}"</p>
              <p className="text-[10px] text-muted-foreground mt-2">
                🏷️ {PILLAR_OPTIONS.find(p => p.key === pillar)?.emoji} {PILLAR_OPTIONS.find(p => p.key === pillar)?.label} Focus | ⏰ Set today
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Evening Check: Did you honor your Sankalp?</p>
              <div className="flex gap-2">
                {[
                  { val: 'yes', label: 'हाँ, पूरा किया ✅', color: 'bg-green-100 dark:bg-green-900/30 border-green-300' },
                  { val: 'partial', label: 'आंशिक 🟡', color: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300' },
                  { val: 'no', label: 'नहीं ❌', color: 'bg-red-100 dark:bg-red-900/30 border-red-300' },
                ].map(opt => (
                  <button
                    key={opt.val}
                    onClick={() => setReview(opt.val)}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium border transition-all ${review === opt.val ? opt.color + ' ring-2 ring-primary/30' : 'bg-muted/30 border-border text-muted-foreground hover:bg-muted/50'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
