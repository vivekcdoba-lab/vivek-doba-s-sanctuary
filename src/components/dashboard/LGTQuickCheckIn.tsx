import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';

const DIMENSIONS = [
  { key: 'dharma', emoji: '🕉️', label: 'धर्म (Purpose & Values)', question: 'क्या आज मैं अपने purpose के साथ aligned हूं?', color: 'hsl(282, 68%, 38%)' },
  { key: 'artha', emoji: '💰', label: 'अर्थ (Wealth & Business)', question: 'क्या आज मेरा काम productive था?', color: 'hsl(51, 100%, 50%)' },
  { key: 'kama', emoji: '❤️', label: 'काम (Relationships & Desires)', question: 'क्या आज मेरे relationships में love था?', color: 'hsl(340, 82%, 52%)' },
  { key: 'moksha', emoji: '☀️', label: 'मोक्ष (Peace & Spiritual Growth)', question: 'क्या आज मुझे inner peace मिली?', color: 'hsl(27, 100%, 60%)' },
];

const FOCUS_RECOMMENDATIONS: Record<string, string> = {
  dharma: 'थोड़ा meditation करो और अपने values reflect करो',
  artha: 'अपने business priorities review करो आज',
  kama: 'किसी loved one को call करो या quality time दो',
  moksha: 'थोड़ा meditation करो आज, inner peace ज़रूरी है',
};

export default function LGTQuickCheckIn() {
  const { profile } = useAuthStore();
  const profileId = profile?.id;
  const queryClient = useQueryClient();
  const [scores, setScores] = useState({ dharma: 5, artha: 5, kama: 5, moksha: 5 });
  const [saved, setSaved] = useState(false);

  const overall = ((scores.dharma + scores.artha + scores.kama + scores.moksha) / 4).toFixed(1);
  const lowestKey = Object.entries(scores).reduce((a, b) => (b[1] < a[1] ? b : a))[0];

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!profileId) return;
      const { error } = await supabase.from('daily_lgt_checkins' as any).upsert({
        seeker_id: profileId,
        checkin_date: new Date().toISOString().split('T')[0],
        dharma_score: scores.dharma,
        artha_score: scores.artha,
        kama_score: scores.kama,
        moksha_score: scores.moksha,
        overall_balance: parseFloat(overall),
        focus_recommendation: FOCUS_RECOMMENDATIONS[lowestKey],
      }, { onConflict: 'seeker_id,checkin_date' });
      if (error) throw error;
    },
    onSuccess: () => {
      setSaved(true);
      toast({ title: '⚡ LGT Check-In saved!' });
      queryClient.invalidateQueries({ queryKey: ['lgt-checkins'] });
    },
  });

  return (
    <div className="bg-card rounded-2xl shadow-md border border-border overflow-hidden">
      <div className="h-1.5 gradient-saffron" />
      <div className="p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1">⚡ LGT Quick Check-In</h3>
        <p className="text-[10px] text-muted-foreground mb-4">1 मिनट में अपना Balance जानो</p>

        <div className="space-y-4">
          {DIMENSIONS.map(dim => (
            <div key={dim.key} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">{dim.emoji} {dim.label}</span>
                <span className="text-xs font-bold text-foreground" style={{ color: dim.color }}>{scores[dim.key as keyof typeof scores]}</span>
              </div>
              <p className="text-[10px] text-muted-foreground italic">{dim.question}</p>
              <Slider
                value={[scores[dim.key as keyof typeof scores]]}
                onValueChange={v => setScores(p => ({ ...p, [dim.key]: v[0] }))}
                min={1}
                max={10}
                step={1}
                className="py-1"
              />
              <div className="flex justify-between text-[9px] text-muted-foreground">
                <span>😫 1</span><span>🌟 10</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 rounded-xl bg-muted/30 border border-border">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-foreground">📊 Today's Balance:</span>
            <span className="text-lg font-bold text-primary">{overall}/10</span>
          </div>
          <p className="text-[10px] text-muted-foreground">
            ⚠️ Focus Area: {DIMENSIONS.find(d => d.key === lowestKey)?.emoji} {DIMENSIONS.find(d => d.key === lowestKey)?.label.split('(')[0]} - {FOCUS_RECOMMENDATIONS[lowestKey]}
          </p>
        </div>

        {!saved ? (
          <button
            onClick={() => saveMutation.mutate()}
            className="w-full mt-3 py-2 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            💾 Save Check-In
          </button>
        ) : (
          <p className="text-center text-xs text-green-600 mt-3">✅ Saved for today!</p>
        )}
      </div>
    </div>
  );
}
