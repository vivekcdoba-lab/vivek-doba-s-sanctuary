import { Link } from 'react-router-dom';
import { getGreeting, AFFIRMATIONS, MOTIVATIONAL_QUOTES } from '@/data/mockData';
import { Flame, Heart, CalendarDays, ClipboardList, MessageSquare, Sparkles, LogOut as AlertCircle, BookOpen, Award, ScrollText, X } from 'lucide-react';
import OnboardingTour from '@/components/OnboardingTour';
import { useBadgeNotifications } from '@/hooks/useBadgeNotifications';
import { useAuthStore } from '@/store/authStore';
import { useDbSessions } from '@/hooks/useDbSessions';
import { useDbAssignments } from '@/hooks/useDbAssignments';
import { useStreakCount } from '@/hooks/useStreakCount';

const SeekerHome = () => {
  const { profile, logout } = useAuthStore();
  const profileId = profile?.id || null;
  const displayName = profile?.full_name?.split(' ')[0] || 'Seeker';

  const { data: sessions = [] } = useDbSessions(profileId ?? undefined);
  const { data: assignments = [] } = useDbAssignments(profileId ?? undefined);
  const { data: streak = 0 } = useStreakCount(profileId);
  const { notifications, dismiss, dismissAll } = useBadgeNotifications(profileId);

  const affirmation = AFFIRMATIONS[0];
  const quote = MOTIVATIONAL_QUOTES[3];
  const nextSession = sessions.find(s => s.status === 'scheduled');
  const completedSessions = sessions.filter(s => s.status === 'completed' || s.status === 'approved').length;
  const totalSessions = sessions.length || 1;
  const pendingAssignments = assignments.filter(a => ['assigned', 'in_progress', 'overdue'].includes(a.status)).length;

  const streaks = [
    { label: 'Worksheet', emoji: '📝', count: streak },
    { label: 'Sessions', emoji: '📅', count: completedSessions },
    { label: 'Tasks', emoji: '✅', count: assignments.filter(a => a.status === 'reviewed').length },
  ];

  return (
    <div className="p-4 space-y-5 max-w-lg mx-auto stagger-children">
      {/* Greeting Banner */}
      <OnboardingTour />
      <div data-tour="greeting" className="gradient-saffron rounded-2xl p-5 text-primary-foreground relative overflow-hidden">
        <div className="absolute top-2 right-4 text-4xl opacity-10">✿</div>
        <h1 className="text-xl font-bold">{getGreeting()}, {displayName}!</h1>
        <p className="text-sm text-primary-foreground/80 mt-1">🔥 {streak} day worksheet streak</p>
      </div>

      {/* 🎉 Badge Congratulations */}
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

      {/* Streak Dashboard */}
      <div data-tour="progress">
        <h3 className="text-sm font-semibold text-foreground mb-2">🔥 Your Progress</h3>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {streaks.map((s) => (
            <div key={s.label} className="bg-card rounded-xl p-3 shadow-sm border border-border text-center min-w-[72px] flex-shrink-0">
              <span className="text-xl">{s.emoji}</span>
              <p className="text-lg font-bold text-foreground mt-1">{s.count}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Worksheet Quick Card */}
      <Link data-tour="worksheet" to="/seeker/worksheet" className="block bg-card rounded-xl p-4 shadow-sm border-2 border-orange-200 dark:border-orange-800 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F97316' }}>
              <ScrollText className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Today's Dharmic Worksheet</p>
              <p className="text-xs text-muted-foreground">🔥 {streak} day streak • Fill your sacred planner</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-600 dark:bg-orange-900/30">Open →</span>
        </div>
      </Link>

      {/* Next Session */}
      {nextSession && (
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Next Session</p>
              <p className="font-semibold text-foreground">{nextSession.date} at {nextSession.start_time}</p>
              <p className="text-xs text-muted-foreground">Session #{nextSession.session_number}</p>
            </div>
            <Link to="/seeker/tasks" className="px-3 py-1.5 rounded-lg text-xs font-medium bg-chakra-indigo text-primary-foreground">Prepare</Link>
          </div>
        </div>
      )}

      {/* Pending Items */}
      <div className="flex gap-2">
        {[
          { label: `${pendingAssignments} assignments pending`, color: 'bg-saffron/10 text-saffron', icon: '📝' },
          { label: 'Daily log pending', color: 'bg-lotus-pink/10 text-lotus-pink', icon: '🌅' },
        ].map((item) => (
          <div key={item.label} className={`flex-1 rounded-xl p-3 text-center text-xs font-medium ${item.color}`}>
            <span className="block text-lg mb-1">{item.icon}</span>{item.label}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div data-tour="quick-actions" className="grid grid-cols-3 gap-3">
        {[
          { label: 'Daily Check-in', icon: Sparkles, path: '/seeker/daily-log', gradient: 'gradient-saffron' },
          { label: 'Submit Task', icon: ClipboardList, path: '/seeker/tasks', gradient: 'gradient-sacred' },
          { label: 'Connect with Coach', icon: MessageSquare, path: '/seeker/messages', gradient: 'gradient-growth' },
          { label: 'Meditate Now', icon: Sparkles, path: '/seeker/sacred-space', gradient: 'gradient-hero' },
          { label: 'Assessments', icon: BookOpen, path: '/seeker/assessments', gradient: 'gradient-chakravartin' },
          { label: 'Log Out', icon: AlertCircle, path: '#logout', gradient: 'bg-lotus-pink' },
        ].map((a) => (
          <Link
            key={a.label}
            to={a.path === '#logout' ? '#' : a.path}
            onClick={a.path === '#logout' ? (e) => { e.preventDefault(); logout(); window.location.href = '/'; } : undefined}
            className={`${a.gradient} rounded-xl p-3 text-center text-primary-foreground card-hover`}
          >
            <a.icon className="w-5 h-5 mx-auto mb-1" />
            <p className="text-[10px] font-medium">{a.label}</p>
          </Link>
        ))}
      </div>

      {/* Progress Ring */}
      <div data-tour="session-progress" className="bg-card rounded-xl p-5 shadow-sm border border-border text-center">
        <svg className="w-24 h-24 mx-auto" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
          <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--primary))" strokeWidth="6"
            strokeDasharray="283" strokeDashoffset={283 - (283 * completedSessions / totalSessions)}
            strokeLinecap="round" transform="rotate(-90 50 50)" className="progress-ring" />
          <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-xl font-bold" style={{ fontSize: '18px' }}>
            {Math.round((completedSessions / totalSessions) * 100)}%
          </text>
        </svg>
        <p className="text-sm text-muted-foreground mt-2">{completedSessions}/{totalSessions} sessions completed</p>
      </div>

      {/* Quote */}
      <div className="text-center py-4">
        <p className="text-sm italic text-muted-foreground">"{quote.text}"</p>
        <p className="text-xs text-primary mt-1">— {quote.author}</p>
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
