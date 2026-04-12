import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Heart, Volume2, Share2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

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
  const { profile } = useAuthStore();
  const queryClient = useQueryClient();

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

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorite-affirmations', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data } = await supabase
        .from('favorite_affirmations')
        .select('affirmation_id')
        .eq('user_id', profile.id);
      return (data || []).map(f => f.affirmation_id);
    },
    enabled: !!profile?.id,
  });

  const saveFavorite = useMutation({
    mutationFn: async (affirmationId: string) => {
      if (!profile?.id) throw new Error('Not logged in');
      const isFav = favorites.includes(affirmationId);
      if (isFav) {
        await supabase
          .from('favorite_affirmations')
          .delete()
          .eq('user_id', profile.id)
          .eq('affirmation_id', affirmationId);
      } else {
        await supabase
          .from('favorite_affirmations')
          .insert({ user_id: profile.id, affirmation_id: affirmationId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite-affirmations'] });
      toast.success('Updated favorites');
    },
  });

  if (affirmations.length === 0) return null;

  // Pick based on day of year + random offset
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const idx = (dayOfYear + randomOffset) % affirmations.length;
  const aff = affirmations[idx];
  const cat = aff.category || 'general';
  const gradient = dimensionColors[cat] || dimensionColors.general;
  const isFav = favorites.includes(aff.id);

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(aff.affirmation_text);
      u.rate = 0.85;
      u.pitch = 1;
      speechSynthesis.speak(u);
    }
  };

  const handleShare = () => {
    const text = `${aff.affirmation_text}\n\n${aff.affirmation_hindi || ''}\n\n— VDTS`;
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
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
        <Button
          variant="outline"
          size="sm"
          onClick={() => saveFavorite.mutate(aff.id)}
          className={`h-8 text-xs gap-1 ${isFav ? 'bg-pink-100 border-pink-300 text-pink-600' : ''}`}
        >
          <Heart className={`w-3 h-3 ${isFav ? 'fill-pink-500 text-pink-500' : ''}`} /> {isFav ? 'Saved' : 'Save'}
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
