import { Link } from 'react-router-dom';
import { getGreeting, AFFIRMATIONS, MOTIVATIONAL_QUOTES } from '@/data/mockData';
import { Flame, Heart, X } from 'lucide-react';
import OnboardingTour from '@/components/OnboardingTour';
import { useBadgeNotifications } from '@/hooks/useBadgeNotifications';
import { useAuthStore } from '@/store/authStore';
import { useDbSessions } from '@/hooks/useDbSessions';
import { useDbAssignments } from '@/hooks/useDbAssignments';
import { useStreakCount } from '@/hooks/useStreakCount';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import StreakCard from '@/components/dashboard/StreakCard';
import ProgressCard from '@/components/dashboard/ProgressCard';
import PointsCard from '@/components/dashboard/PointsCard';
import WorksheetStatusCard from '@/components/dashboard/WorksheetStatusCard';
import LGTBalanceWheel from '@/components/dashboard/LGTBalanceWheel';
import UpcomingSessionsWidget from '@/components/dashboard/UpcomingSessionsWidget';
import AssignmentsWidget from '@/components/dashboard/AssignmentsWidget';
import WisdomQuote from '@/components/dashboard/WisdomQuote';
import QuickActionsBar from '@/components/dashboard/QuickActionsBar';
import DailyAffirmationWidget from '@/components/dashboard/DailyAffirmationWidget';
import DailySankalpWidget from '@/components/dashboard/DailySankalpWidget';
import LGTQuickCheckIn from '@/components/dashboard/LGTQuickCheckIn';
import SmartRecommendations from '@/components/dashboard/SmartRecommendations';
import WheelOfLifeWidget from '@/components/dashboard/WheelOfLifeWidget';

const SeekerHome = () => {
  const { profile, logout } = useAuthStore();
  const profileId = profile?.id || null;
  const displayName = profile?.full_name?.split(' ')[0] || 'Seeker';

  const { data: sessions = [] } = useDbSessions(profileId ?? undefined);
  const { data: assignments = [] } = useDbAssignments(profileId ?? undefined);
  const { data: streak = 0 } = useStreakCount(profileId);
  const { notifications, dismiss, dismissAll } = useBadgeNotifications(profileId);

  const completedSessions = sessions.filter(s => s.status === 'completed' || s.status === 'approved').length;
  const totalSessions = Math.max(sessions.length, 24);

  // Avatar (not present in local Profile type — fetch directly)
  const { data: avatarUrl } = useQuery({
    queryKey: ['seeker-home-avatar', profileId],
    enabled: !!profileId,
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', profileId!)
        .maybeSingle();
      return (data?.avatar_url as string | null) ?? null;
    },
  });

  // Query latest LGT assessment scores from DB
  const { data: latestLgt } = useQuery({
    queryKey: ['latest-lgt', profileId],
    enabled: !!profileId,
    queryFn: async () => {
      const { data } = await supabase
        .from('lgt_assessments')
        .select('dharma_score, artha_score, kama_score, moksha_score')
        .eq('seeker_id', profileId!)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  // Fallback: latest submitted worksheet LGT scores
  const { data: latestWsLgt } = useQuery({
    queryKey: ['latest-ws-lgt', profileId],
    enabled: !!profileId && !latestLgt,
    queryFn: async () => {
      const { data } = await supabase
        .from('daily_worksheets')
        .select('dharma_score, artha_score, kama_score, moksha_score')
        .eq('seeker_id', profileId!)
        .eq('is_submitted', true)
        .order('worksheet_date', { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  const lgtScores = latestLgt
    ? { dharma: latestLgt.dharma_score * 10, artha: latestLgt.artha_score * 10, kama: latestLgt.kama_score * 10, moksha: latestLgt.moksha_score * 10 }
    : latestWsLgt
      ? { dharma: (latestWsLgt.dharma_score || 0) * 10, artha: (latestWsLgt.artha_score || 0) * 10, kama: (latestWsLgt.kama_score || 0) * 10, moksha: (latestWsLgt.moksha_score || 0) * 10 }
      : { dharma: 0, artha: 0, kama: 0, moksha: 0 };

  // Query today's worksheet status
  const today = new Date().toISOString().split('T')[0];
  const { data: todayWorksheet } = useQuery({
    queryKey: ['worksheet-today', profileId, today],
    enabled: !!profileId,
    staleTime: 0,
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const { data } = await supabase
        .from('daily_worksheets')
        .select('id')
        .eq('seeker_id', profileId!)
        .eq('worksheet_date', today)
        .eq('is_submitted', true)
        .maybeSingle();
      return data;
    },
  });
  const hasFilledToday = !!todayWorksheet;

  return (
    <div className="p-4 space-y-5 max-w-3xl mx-auto stagger-children">
      <OnboardingTour />

      {/* Hero Banner */}
      <div data-tour="greeting" className="gradient-saffron rounded-2xl p-5 text-primary-foreground relative overflow-hidden">
        <div className="absolute top-2 right-4 text-5xl opacity-10 pointer-events-none">ॐ</div>
        <div className="flex items-center gap-4 relative">
          <Link
            to="/seeker/profile"
            className="flex-shrink-0 w-14 h-14 rounded-full overflow-hidden border-2 border-primary-foreground/40 bg-primary-foreground/10 flex items-center justify-center hover:border-primary-foreground/80 transition-colors"
            aria-label="View profile"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-bold text-primary-foreground">
                {displayName.charAt(0).toUpperCase()}
              </span>
            )}
          </Link>
          <div className="min-w-0">
            <h1 className="text-xl font-bold truncate">🌅 {getGreeting()}, {displayName}!</h1>
            <p className="text-sm text-primary-foreground/80 mt-1">"Balance your Triangle, Everything changes"</p>
          </div>
        </div>
      </div>

      {/* Badge Notifications */}
      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div key={n.id} className="relative bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-2xl p-4 animate-in slide-in-from-top">
              <button onClick={() => dismiss(n.id)} className="absolute top-2 right-2 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-200 dark:bg-yellow-800 flex items-center justify-center text-xl">🏆</div>
                <p className="text-sm font-medium text-foreground pr-5">{n.message}</p>
              </div>
            </div>
          ))}
          {notifications.length > 1 && (
            <button onClick={dismissAll} className="text-xs text-muted-foreground hover:text-foreground underline w-full text-center">
              Dismiss all
            </button>
          )}
        </div>
      )}

      {/* KPI Cards Row */}
      <div data-tour="progress" className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StreakCard streak={streak} />
        <ProgressCard current={completedSessions} total={totalSessions} label="Journey Progress" emoji="📅" />
        {/* TODO: Points from DB when points system is built */}
        <PointsCard points={0} level={1} />
        <WorksheetStatusCard hasFilledToday={hasFilledToday} streak={streak} />
      </div>

      {/* Daily Affirmation from DB */}
      <DailyAffirmationWidget />


      {/* Main Widgets Row */}
      <div className="grid md:grid-cols-2 gap-4">
        <DailySankalpWidget />
        <LGTQuickCheckIn />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <LGTBalanceWheel {...lgtScores} />
        <WheelOfLifeWidget />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <UpcomingSessionsWidget sessions={sessions} />
        {/* Artha Health placeholder */}
        <div className="bg-card rounded-2xl shadow-md border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">📊 Artha Health</h3>
          <div className="flex items-center justify-center py-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">6.2<span className="text-sm text-muted-foreground">/10</span></p>
              <p className="text-xs text-muted-foreground mt-1">Business Score</p>
              <Link to="/seeker/artha" className="text-xs text-primary mt-2 inline-block hover:underline">View Details →</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Widgets Row */}
      <div className="grid md:grid-cols-2 gap-4">
        <AssignmentsWidget assignments={assignments} />
      </div>

      {/* Wisdom Quote */}
      <WisdomQuote />

      {/* Smart Recommendations */}
      <SmartRecommendations lgtScores={lgtScores} />

      {/* Quick Actions */}
      <div data-tour="quick-actions">
        <h3 className="text-sm font-semibold text-foreground mb-2">Quick Actions</h3>
        <QuickActionsBar />
      </div>

      {/* Footer */}
      <footer className="text-center py-6 border-t border-border">
        <p className="text-xs text-muted-foreground">Vivek Doba Training Solutions</p>
        <p className="text-[10px] text-muted-foreground mt-1">Spiritual Business Coach | Founder of Life's Golden Triangle</p>
        <p className="text-[10px] text-muted-foreground mt-2">Made with 🙏 for seekers of transformation</p>
      </footer>
    </div>
  );
};

export default SeekerHome;
