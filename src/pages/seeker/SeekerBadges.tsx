import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { BackToHome } from '@/components/BackToHome';
import { Medal, Star, Trophy, Lock } from 'lucide-react';

export default function SeekerBadges() {
  const { profile } = useAuthStore();

  const { data: definitions = [] } = useQuery({
    queryKey: ['badge-definitions'],
    queryFn: async () => {
      const { data } = await supabase.from('badge_definitions').select('*').eq('is_active', true).order('sort_order');
      return data || [];
    },
  });

  const { data: earned = [] } = useQuery({
    queryKey: ['seeker-badges', profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data } = await supabase.from('seeker_badges').select('*, badge_definitions(*)').eq('seeker_id', profile!.id);
      return data || [];
    },
  });

  const earnedIds = new Set(earned.map((e: any) => e.badge_id));

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <BackToHome />
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">🎖️ My Badges</h1>
        <p className="text-sm text-muted-foreground">{earned.length} of {definitions.length} badges earned</p>
        <div className="w-full max-w-xs mx-auto h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-[hsl(var(--saffron))] rounded-full transition-all" style={{ width: `${definitions.length ? (earned.length / definitions.length) * 100 : 0}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {definitions.map((def: any) => {
          const isEarned = earnedIds.has(def.id);
          return (
            <div key={def.id} className={`bg-card rounded-xl border p-4 text-center transition-all ${isEarned ? 'border-[hsl(var(--saffron))]/30 shadow-md' : 'border-border opacity-60 grayscale'}`}>
              <div className="text-4xl mb-2">{def.emoji}</div>
              <h3 className="text-sm font-semibold text-foreground">{def.name}</h3>
              <p className="text-[10px] text-muted-foreground mt-1">{def.description}</p>
              {isEarned ? (
                <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-[hsl(var(--saffron))]/10 text-[hsl(var(--saffron))] text-[10px] font-medium">
                  <Star className="w-3 h-3" /> Earned
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px]">
                  <Lock className="w-3 h-3" /> Locked
                </span>
              )}
            </div>
          );
        })}
      </div>

      {definitions.length === 0 && (
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <Medal className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Badge system is being set up. Check back soon! 🏆</p>
        </div>
      )}
    </div>
  );
}
