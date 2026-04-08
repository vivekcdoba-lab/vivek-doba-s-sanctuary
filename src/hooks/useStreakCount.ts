import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useStreakCount(profileId: string | null) {
  return useQuery({
    queryKey: ['streak-count', profileId],
    enabled: !!profileId,
    queryFn: async (): Promise<number> => {
      if (!profileId) return 0;
      // Get submitted worksheets ordered by date descending
      const { data, error } = await supabase
        .from('daily_worksheets')
        .select('worksheet_date')
        .eq('seeker_id', profileId)
        .eq('is_submitted', true)
        .order('worksheet_date', { ascending: false })
        .limit(100);
      if (error || !data || data.length === 0) return 0;

      // Calculate consecutive day streak from today backwards
      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const dates = new Set(data.map(d => d.worksheet_date));
      
      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];
        if (dates.has(dateStr)) {
          streak++;
        } else {
          // Allow skipping today if it hasn't been filled yet
          if (i === 0) continue;
          break;
        }
      }
      return streak;
    },
  });
}
