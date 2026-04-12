import { Link } from 'react-router-dom';
import { getGreeting, AFFIRMATIONS, MOTIVATIONAL_QUOTES } from '@/data/mockData';
import { Flame, Heart, X } from 'lucide-react';
import OnboardingTour from '@/components/OnboardingTour';
import { useBadgeNotifications } from '@/hooks/useBadgeNotifications';
import { useAuthStore } from '@/store/authStore';
import { useDbSessions } from '@/hooks/useDbSessions';
import { useDbAssignments } from '@/hooks/useDbAssignments';
import { useStreakCount } from '@/hooks/useStreakCount';
import StreakCard from '@/components/dashboard/StreakCard';
import ProgressCard from '@/components/dashboard/ProgressCard';
import PointsCard from '@/components/dashboard/PointsCard';
import WorksheetStatusCard from '@/components/dashboard/WorksheetStatusCard';
import LGTBalanceWheel from '@/components/dashboard/LGTBalanceWheel';
import UpcomingSessionsWidget from '@/components/dashboard/UpcomingSessionsWidget';
import AssignmentsWidget from '@/components/dashboard/AssignmentsWidget';
import WisdomQuote from '@/components/dashboard/WisdomQuote';
import QuickActionsBar from '@/components/dashboard/QuickActionsBar';

const SeekerHome = () => {
  const { profile, logout } = useAuthStore();
  const profileId = profile?.id || null;
  const displayName = profile?.full_name?.split(' ')[0] || 'Seeker';

  const { data: sessions = [] } = useDbSessions(profileId ?? undefined);
  const { data: assignments = [] } = useDbAssignments(profileId ?? undefined);
  const { data: streak = 0 } = useStreakCount(profileId);
  const { notifications, dismiss, dismissAll } = useBadgeNotifications(profileId);

  const affirmation = AFFIRMATIONS[0];
  const completedSessions = sessions.filter(s => s.status === 'completed' || s.status === 'approved').length;
  const totalSessions = sessions.length || 1;

  // Mock LGT scores - would come from DB in production
  const lgtScores = { dharma: 72, artha: 45, kama: 68, moksha: 55 };

  return (
    <div className="p-4 space-y-5 max-w-3xl mx-auto stagger-children">
      <OnboardingTour />

      {/* Hero Banner */}
      <div data-tour="greeting" className="gradient-saffron rounded-2xl p-5 text-primary-foreground relative overflow-hidden">
        <div className="absolute top-2 right-4 text-5xl opacity-10">ॐ</div>
        <h1 className="text-xl font-bold">🌅 {getGreeting()}, {displayName}!</h1>
        <p className="text-sm text-primary-foreground/80 mt-1">"Balance your Triangle, Everything changes"</p>
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
        <PointsCard points={1250} level={2} />
        <WorksheetStatusCard hasFilledToday={false} streak={streak} />
      </div>

      {/* Today's Affirmation */}
      <div className="glass-card p-5 border-2 border-primary/20 relative">
        <div className="absolute top-2 right-3 text-xs text-primary">✦</div>
        <p className="text-sm font-semibold text-primary mb-1">Today's Affirmation</p>
        <p className="text-foreground italic">"{affirmation.en}"</p>
        <p className="text-sm text-muted-foreground font-devanagari mt-1">"{affirmation.mr}"</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-muted-foreground">🔊 Speak 3 times</span>
          <button className="text-lotus-pink hover:scale-110 transition-transform"><Heart className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Main Widgets Row */}
      <div className="grid md:grid-cols-2 gap-4">
        <LGTBalanceWheel {...lgtScores} />
        <UpcomingSessionsWidget sessions={sessions} />
      </div>

      {/* Secondary Widgets Row */}
      <div className="grid md:grid-cols-2 gap-4">
        <AssignmentsWidget assignments={assignments} />
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

      {/* Wisdom Quote */}
      <WisdomQuote />

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
