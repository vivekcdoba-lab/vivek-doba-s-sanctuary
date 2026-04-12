import { useAuthStore } from '@/store/authStore';
import { useStreakCount } from '@/hooks/useStreakCount';
import { useDbSessions } from '@/hooks/useDbSessions';
import { useDbAssignments } from '@/hooks/useDbAssignments';
import { useBadges } from '@/hooks/useBadges';

const STAGES = [
  { day: 0, label: '🌱 Start', hindi: 'शुरुआत' },
  { day: 45, label: '🌿 Growth', hindi: 'विकास' },
  { day: 90, label: '🌳 Strength', hindi: 'शक्ति' },
  { day: 135, label: '🏔️ Mastery', hindi: 'विशेषज्ञता' },
  { day: 180, label: '☀️ Siddhi', hindi: 'सिद्धि' },
];

const MILESTONES = [
  { day: 1, label: 'पहला कदम - First Worksheet', emoji: '📝', badge: 'First Step', points: 50, status: 'done' },
  { day: 7, label: 'सप्ताह योद्धा - 7-Day Streak', emoji: '🏅', badge: 'Week Warrior', points: 100, status: 'done' },
  { day: 21, label: 'आदत निर्माता - 21-Day Habit', emoji: '🏅', badge: 'Habit Builder', points: 200, status: 'done' },
  { day: 30, label: 'धर्म स्पष्टता - Dharma Clarity', emoji: '🕉️', badge: 'Dharma Seeker', points: 150, status: 'done' },
  { day: 45, label: 'Quarter Complete', emoji: '🏅', badge: 'Quarter Champion', points: 250, status: 'done' },
  { day: 60, label: 'SWOT Champion - Business SWOT', emoji: '💰', badge: 'Artha Analyst', points: 150, status: 'current' },
  { day: 90, label: 'अर्धयात्री - Halfway', emoji: '🎉', badge: 'Half Journey', points: 500, status: 'locked' },
  { day: 120, label: 'विशेषज्ञ - Expert Level', emoji: '⭐', badge: 'Expert', points: 300, status: 'locked' },
  { day: 150, label: 'मास्टर - Master Level', emoji: '🏔️', badge: 'Master', points: 400, status: 'locked' },
  { day: 180, label: '🏆 सम्पूर्ण - LGT Graduate', emoji: '🏆', badge: 'Graduate', points: 1000, status: 'locked' },
];

export default function SeekerTransformationTimeline() {
  const { profile } = useAuthStore();
  const profileId = profile?.id;
  const { data: streak = 0 } = useStreakCount(profileId || null);
  const { data: sessions = [] } = useDbSessions(profileId ?? undefined);
  const { data: assignments = [] } = useDbAssignments(profileId ?? undefined);

  const currentDay = 88; // Would come from enrollment date calculation
  const progress = Math.round((currentDay / 180) * 100);

  return (
    <div className="p-4 space-y-5 max-w-4xl mx-auto">
      <div className="gradient-chakravartin rounded-2xl p-5 text-primary-foreground relative overflow-hidden">
        <div className="absolute top-2 right-4 text-5xl opacity-10">🌱</div>
        <h1 className="text-xl font-bold">🌱 मेरी परिवर्तन यात्रा (My Transformation Journey)</h1>
        <p className="text-sm text-primary-foreground/80 mt-1">"Balance your Triangle, Everything changes"</p>
        <div className="flex items-center gap-4 mt-3 text-xs">
          <span>📅 Day {currentDay} of 180</span>
          <span>🏆 LGT Platinum</span>
          <span>🔥 {streak} Day Streak</span>
        </div>
      </div>

      {/* Journey Progress Bar */}
      <div className="bg-card rounded-2xl shadow-md border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Journey Progress</h3>
        <div className="flex items-center justify-between mb-2">
          {STAGES.map((stage, i) => (
            <div key={i} className="text-center flex-1">
              <div className={`text-lg ${currentDay >= stage.day ? '' : 'opacity-30'}`}>{stage.label.split(' ')[0]}</div>
              <p className="text-[9px] text-muted-foreground mt-0.5">{stage.hindi}</p>
              <p className="text-[8px] text-muted-foreground">Day {stage.day}</p>
            </div>
          ))}
        </div>
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
          <div className="h-full gradient-saffron rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-center text-xs text-muted-foreground mt-2">{progress}% Complete</p>
      </div>

      {/* Milestones */}
      <div className="bg-card rounded-2xl shadow-md border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">🏆 Milestones</h3>
        <div className="space-y-3">
          {MILESTONES.map((m, i) => (
            <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
              m.status === 'done' ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
              : m.status === 'current' ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 ring-2 ring-blue-300/50'
              : 'bg-muted/20 border-border opacity-60'
            }`}>
              <span className="text-xl">
                {m.status === 'done' ? '✅' : m.status === 'current' ? '🔵' : '⚪'}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Day {m.day}: {m.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {m.emoji} Badge: {m.badge} | +{m.points} Points
                </p>
                {m.status === 'current' && (
                  <button className="mt-1 text-xs text-primary font-medium hover:underline">📋 Complete Now to Unlock</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Sessions', value: sessions.filter(s => s.status === 'completed').length, emoji: '📅' },
          { label: 'Assignments', value: assignments.filter(a => a.status === 'completed').length, emoji: '✅' },
          { label: 'Streak', value: `${streak} days`, emoji: '🔥' },
          { label: 'Points', value: '2,150', emoji: '⭐' },
        ].map((stat, i) => (
          <div key={i} className="bg-card rounded-xl p-4 border border-border text-center">
            <span className="text-xl">{stat.emoji}</span>
            <p className="text-lg font-bold text-foreground mt-1">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
