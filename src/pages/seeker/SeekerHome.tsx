import { Link } from 'react-router-dom';
import { getGreeting, SEEKERS, SESSIONS, AFFIRMATIONS, MOTIVATIONAL_QUOTES } from '@/data/mockData';
import { Flame, Heart, CalendarDays, ClipboardList, MessageSquare, Sparkles, LogOut as AlertCircle, BookOpen, Award, ScrollText, X } from 'lucide-react';
import { useBadgeNotifications } from '@/hooks/useBadgeNotifications';
import { useAuthStore } from '@/store/authStore';

const SeekerHome = () => {
  const { profile, logout } = useAuthStore();
  const seeker = SEEKERS[0];
  const affirmation = AFFIRMATIONS[0];
  const quote = MOTIVATIONAL_QUOTES[3];
  const nextSession = SESSIONS.find((s) => s.seeker_id === seeker.id && s.status === 'scheduled');
  const displayName = profile?.full_name?.split(' ')[0] || seeker.full_name.split(' ')[0];

  // Use profile ID directly for notifications
  const { notifications, dismiss, dismissAll } = useBadgeNotifications(profile?.id || null);

  const streaks = [
    { label: 'Meditation', emoji: '🧘', count: 15 },
    { label: 'Journal', emoji: '📝', count: 12 },
    { label: 'Exercise', emoji: '💪', count: 8 },
    { label: 'Gratitude', emoji: '🙏', count: 15 },
    { label: 'Reading', emoji: '📖', count: 10 },
  ];

  return (
    <div className="p-4 space-y-5 max-w-lg mx-auto stagger-children">
      {/* Greeting Banner */}
      <div className="gradient-saffron rounded-2xl p-5 text-primary-foreground relative overflow-hidden">
        <div className="absolute top-2 right-4 text-4xl opacity-10">✿</div>
        <h1 className="text-xl font-bold">{getGreeting()}, {displayName}!</h1>
        <p className="text-sm text-primary-foreground/80 mt-1">Day 168 of your {seeker.course?.name?.split('—')[0]} journey</p>
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
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2">🔥 Your Streaks</h3>
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
      <Link to="/seeker/worksheet" className="block bg-card rounded-xl p-4 shadow-sm border-2 border-orange-200 dark:border-orange-800 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F97316' }}>
              <ScrollText className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Today's Dharmic Worksheet</p>
              <p className="text-xs text-muted-foreground">🔥 15 day streak • Fill your sacred planner</p>
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
            <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-chakra-indigo text-primary-foreground">Prepare</button>
          </div>
        </div>
      )}

      {/* Pending Items */}
      <div className="flex gap-2">
        {[
          { label: '2 assignments due', color: 'bg-saffron/10 text-saffron', icon: '📝' },
          { label: 'Daily log pending', color: 'bg-lotus-pink/10 text-lotus-pink', icon: '🌅' },
        ].map((item) => (
          <div key={item.label} className={`flex-1 rounded-xl p-3 text-center text-xs font-medium ${item.color}`}>
            <span className="block text-lg mb-1">{item.icon}</span>{item.label}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
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
      <div className="bg-card rounded-xl p-5 shadow-sm border border-border text-center">
        <svg className="w-24 h-24 mx-auto" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
          <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--primary))" strokeWidth="6"
            strokeDasharray="283" strokeDashoffset={283 - (283 * seeker.sessions_completed / seeker.total_sessions)}
            strokeLinecap="round" transform="rotate(-90 50 50)" className="progress-ring" />
          <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-xl font-bold" style={{ fontSize: '18px' }}>
            {Math.round((seeker.sessions_completed / seeker.total_sessions) * 100)}%
          </text>
        </svg>
        <p className="text-sm text-muted-foreground mt-2">{seeker.sessions_completed}/{seeker.total_sessions} sessions completed</p>
      </div>

      {/* Achievements */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2">🏆 Achievements</h3>
        <div className="flex gap-2 flex-wrap">
          {['7-Day Streak 🔥', 'First Assessment ✅', '30-Day Warrior 💪', 'Perfect Attendance ⭐'].map((b) => (
            <span key={b} className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-medium">{b}</span>
          ))}
        </div>
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
