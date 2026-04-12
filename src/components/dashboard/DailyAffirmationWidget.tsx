import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Heart, Volume2, Share2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const dimensionColors: Record<string, string> = {
  dharma: 'from-purple-500/20 to-indigo-500/20 border-purple-300',
  artha: 'from-amber-500/20 to-yellow-500/20 border-amber-300',
  kama: 'from-pink-500/20 to-rose-500/20 border-pink-300',
  moksha: 'from-cyan-500/20 to-teal-500/20 border-cyan-300',
  general: 'from-orange-500/20 to-amber-500/20 border-orange-300',
};

const dimensionEmoji: Record<string, string> = {
  dharma: '🕉️', artha: '💰', kama: '❤️', moksha: '☀️', general: '🌟',
};

const DailyAffirmationWidget = () => {
  const [randomOffset, setRandomOffset] = useState(0);

  const { data: affirmations = [] } = useQuery({
    queryKey: ['daily-affirmations'],
    queryFn: async () => {
      const { data } = await supabase
        .from('daily_affirmations')
        .select('*')
        .eq('is_active', true)
        .order('created_at');
      return data || [];
    },
  });

  if (affirmations.length === 0) return null;

  // Pick based on day of year + random offset
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const idx = (dayOfYear + randomOffset) % affirmations.length;
  const aff = affirmations[idx];
  const cat = aff.category || 'general';
  const gradient = dimensionColors[cat] || dimensionColors.general;

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(aff.affirmation_text);
      u.rate = 0.85;
      u.pitch = 1;
      speechSynthesis.speak(u);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ text: `${aff.affirmation_text}\n\n${aff.affirmation_hindi || ''}\n\n— VDTS` });
    }
  };

  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-2xl border-2 p-5 relative overflow-hidden`}>
      <div className="absolute top-3 right-4 text-4xl opacity-10">ॐ</div>

      <div className="text-center mb-4">
        <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">🌟 Today's Affirmation 🌟</p>
      </div>

      <div className="text-center space-y-3 py-2">
        <p className="text-base font-medium text-foreground italic leading-relaxed">
          "{aff.affirmation_text}"
        </p>
        {aff.affirmation_hindi && (
          <p className="text-sm text-muted-foreground font-devanagari leading-relaxed">
            "{aff.affirmation_hindi}"
          </p>
        )}
      </div>

      <div className="flex items-center justify-center gap-1 my-3 text-muted-foreground">
        <span>─── 🌸 ───</span>
      </div>

      <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground mb-3">
        <span>{dimensionEmoji[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
        {aff.source && <span>• 📖 {aff.source}</span>}
      </div>

      <div className="flex items-center justify-center gap-2">
        <Button variant="outline" size="sm" onClick={handleSpeak} className="h-8 text-xs gap-1">
          <Volume2 className="w-3 h-3" /> Listen
        </Button>
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
          <Heart className="w-3 h-3" /> Save
        </Button>
        <Button variant="outline" size="sm" onClick={handleShare} className="h-8 text-xs gap-1">
          <Share2 className="w-3 h-3" /> Share
        </Button>
        <Button variant="outline" size="sm" onClick={() => setRandomOffset(p => p + 1)} className="h-8 text-xs gap-1">
          <RefreshCw className="w-3 h-3" /> Next
        </Button>
      </div>
    </div>
  );
};

export default DailyAffirmationWidget;
