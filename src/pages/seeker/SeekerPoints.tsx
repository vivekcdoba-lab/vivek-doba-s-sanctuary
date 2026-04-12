import BackToHome from '@/components/BackToHome';
import { Star, Flame, Award, TrendingUp } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useStreakCount } from '@/hooks/useStreakCount';

const LEVELS = [
  { name: 'Seeker', min: 0, max: 500, emoji: '🌱', color: 'hsl(var(--dharma-green))' },
  { name: 'Practitioner', min: 500, max: 1500, emoji: '🌿', color: 'hsl(var(--saffron))' },
  { name: 'Achiever', min: 1500, max: 3000, emoji: '🌳', color: 'hsl(var(--gold))' },
  { name: 'Master', min: 3000, max: 5000, emoji: '🏔️', color: 'hsl(var(--lotus-pink))' },
  { name: 'Guru', min: 5000, max: 99999, emoji: '☀️', color: 'hsl(var(--wisdom-purple))' },
];

export default function SeekerPoints() {
  const { profile } = useAuthStore();
  const { data: streak = 0 } = useStreakCount(profile?.id || null);

  // Simple points calculation based on available data
  const points = streak * 50; // 50 points per streak day as base
  const level = LEVELS.find(l => points >= l.min && points < l.max) || LEVELS[0];
  const nextLevel = LEVELS[LEVELS.indexOf(level) + 1];
  const progressInLevel = points - level.min;
  const levelRange = level.max - level.min;
  const pct = Math.min(Math.round((progressInLevel / levelRange) * 100), 100);

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <BackToHome />
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">⭐ Sampoorna Points</h1>
        <p className="text-sm text-muted-foreground">Your transformation score</p>
      </div>

      {/* Current level */}
      <div className="bg-card rounded-xl border border-border p-6 text-center">
        <div className="text-5xl mb-3">{level.emoji}</div>
        <h2 className="text-xl font-bold text-foreground">{level.name}</h2>
        <p className="text-3xl font-bold mt-2" style={{ color: level.color }}>{points} pts</p>

        {nextLevel && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{level.name}</span>
              <span>{nextLevel.name}</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: level.color }} />
            </div>
            <p className="text-xs text-muted-foreground">{nextLevel.min - points} points to {nextLevel.name} {nextLevel.emoji}</p>
          </div>
        )}
      </div>

      {/* Points breakdown */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">How You Earn Points</h3>
        <div className="space-y-3">
          {[
            { icon: Flame, label: 'Worksheet Morning', value: '+10', desc: 'Complete morning intention' },
            { icon: Flame, label: 'Worksheet Evening', value: '+10', desc: 'Complete evening reflection' },
            { icon: Star, label: 'Both Same Day Bonus', value: '+5', desc: 'Complete morning & evening' },
            { icon: Award, label: 'Assessment Completed', value: '+50', desc: 'Complete any assessment' },
            { icon: TrendingUp, label: 'Session Attended', value: '+30', desc: 'Attend a coaching session' },
            { icon: Award, label: 'Assignment', value: '+10-50', desc: 'Complete assignments' },
            { icon: Star, label: 'Streak Milestone', value: '+100', desc: 'Hit 7, 21, 30, 60, 90, 180 days' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-[10px] text-muted-foreground">{item.desc}</p>
              </div>
              <span className="text-xs font-semibold text-primary">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Level roadmap */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Level Roadmap</h3>
        <div className="space-y-3">
          {LEVELS.map((l, i) => {
            const isCurrent = l.name === level.name;
            const isPast = points >= l.max;
            return (
              <div key={l.name} className={`flex items-center gap-3 p-2 rounded-lg ${isCurrent ? 'bg-primary/5 border border-primary/20' : ''}`}>
                <span className={`text-2xl ${!isPast && !isCurrent ? 'grayscale opacity-40' : ''}`}>{l.emoji}</span>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${isCurrent ? 'text-primary' : 'text-foreground'}`}>{l.name}</p>
                  <p className="text-[10px] text-muted-foreground">{l.min} - {l.max} pts</p>
                </div>
                {isPast && <span className="text-[10px] text-[hsl(var(--dharma-green))] font-medium">✅ Achieved</span>}
                {isCurrent && <span className="text-[10px] text-primary font-medium">← You are here</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
