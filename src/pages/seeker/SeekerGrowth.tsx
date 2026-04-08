import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useBadges } from '@/hooks/useBadges';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Loader2 } from 'lucide-react';

const ZONE_COLORS = { red: '#E63946', yellow: '#F4A61C', white: '#BDC3C7', blue: '#3498DB', green: '#2ECC71' };

function getZone(score: number) {
  if (score <= 2) return { name: 'Red', color: ZONE_COLORS.red, emoji: '🔴' };
  if (score <= 4) return { name: 'Yellow', color: ZONE_COLORS.yellow, emoji: '🟡' };
  if (score <= 6) return { name: 'Average', color: ZONE_COLORS.white, emoji: '⚪' };
  if (score <= 8) return { name: 'Good', color: ZONE_COLORS.blue, emoji: '🔵' };
  return { name: 'Excellent', color: ZONE_COLORS.green, emoji: '🟢' };
}

const WHEEL_DEFAULTS = [
  { name: '🕉️ Spiritual', score: 0 },
  { name: '📚 Learnings', score: 0 },
  { name: '💼 Work', score: 0 },
  { name: '💰 Money', score: 0 },
  { name: '❤️ Love', score: 0 },
  { name: '🙏 Service', score: 0 },
  { name: '👨‍👩‍👧‍👦 Relations', score: 0 },
  { name: '🏃 Health', score: 0 },
  { name: '🎉 Fun', score: 0 },
];

const SeekerGrowth = () => {
  const { profile } = useAuthStore();
  const profileId = profile?.id;

  const { data: assessments = [], isLoading } = useQuery({
    queryKey: ['my-assessments', profileId],
    queryFn: async () => {
      if (!profileId) return [];
      const { data, error } = await supabase
        .from('seeker_assessments')
        .select('*')
        .eq('seeker_id', profileId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!profileId,
  });

  const { earnedBadges, definitions } = useBadges(profileId);

  // Build wheel data from latest assessment
  const latest = assessments[assessments.length - 1];
  const latestScores = latest?.scores_json as Record<string, number> | null;
  const wheelAreas = latestScores
    ? Object.entries(latestScores).map(([name, score]) => ({ name, score: Number(score) }))
    : WHEEL_DEFAULTS;

  // Growth trend from assessments
  const growthData = assessments.map((a: any, i: number) => {
    const scores = a.scores_json as Record<string, number> | null;
    const avg = scores ? Object.values(scores).reduce((s, v) => s + Number(v), 0) / Object.values(scores).length : 0;
    return { month: `A${i + 1}`, score: Math.round(avg * 10) };
  });

  const selfOverall = wheelAreas.length > 0 ? (wheelAreas.reduce((a, w) => a + w.score, 0) / wheelAreas.length).toFixed(1) : '0';
  const totalScore = wheelAreas.reduce((a, w) => a + w.score, 0);
  const strongest = wheelAreas.length > 0 ? wheelAreas.reduce((max, w) => w.score > max.score ? w : max) : { name: '—', score: 0 };
  const weakest = wheelAreas.length > 0 ? wheelAreas.reduce((min, w) => w.score < min.score ? w : min) : { name: '—', score: 0 };

  const badgeList = definitions.map(d => ({
    name: d.name,
    emoji: d.emoji,
    earned: earnedBadges.some(eb => eb.badge_id === d.id),
  }));

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-4 space-y-5 max-w-lg mx-auto animate-fade-up">
      <h1 className="text-xl font-bold text-foreground">My Growth Dashboard</h1>

      {/* Overall Score */}
      <div className="bg-card rounded-2xl p-6 border border-border text-center shadow-sm">
        <p className="text-xs text-muted-foreground mb-1">Overall Growth Score</p>
        <p className="text-5xl font-bold text-primary">{selfOverall}</p>
        <p className="text-sm text-muted-foreground mt-1">{assessments.length} assessment(s) recorded</p>
      </div>

      {/* Growth Chart */}
      {growthData.length > 0 && (
        <div className="bg-card rounded-xl p-4 border border-border">
          <h3 className="font-semibold text-foreground text-sm mb-3">Growth Trend</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#B8860B" strokeWidth={3} dot={{ fill: '#B8860B', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Wheel of Life */}
      <div className="rounded-2xl overflow-hidden border border-border shadow-sm">
        <div className="p-4 text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #080F24, #0D1B3E, #162758)' }}>
          <h3 className="text-base font-bold relative z-10" style={{ color: '#D4A843', fontFamily: 'serif' }}>☸ WHEEL OF LIFE ☸</h3>
          <p className="text-[10px] relative z-10" style={{ color: '#F2D88A', opacity: 0.8 }}>Jeevan Chakra — Your Life Balance Assessment</p>
        </div>

        <div className="bg-card p-4 space-y-4">
          {wheelAreas.some(w => w.score > 0) ? (
            <>
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center p-2 rounded-lg bg-muted/30">
                  <p className="text-[8px] text-muted-foreground uppercase tracking-wider">Total</p>
                  <p className="text-lg font-bold text-foreground">{totalScore}<span className="text-[9px] text-muted-foreground">/{wheelAreas.length * 10}</span></p>
                </div>
                <div className="text-center p-2 rounded-lg bg-muted/30">
                  <p className="text-[8px] text-muted-foreground uppercase tracking-wider">Average</p>
                  <p className="text-lg font-bold" style={{ color: getZone(Number(selfOverall)).color }}>{selfOverall}</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-muted/30">
                  <p className="text-[8px] text-muted-foreground uppercase tracking-wider">Best</p>
                  <p className="text-lg font-bold" style={{ color: ZONE_COLORS.green }}>{strongest.score}</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-muted/30">
                  <p className="text-[8px] text-muted-foreground uppercase tracking-wider">Focus</p>
                  <p className="text-lg font-bold" style={{ color: ZONE_COLORS.red }}>{weakest.score}</p>
                </div>
              </div>

              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={wheelAreas}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="name" tick={{ fontSize: 8 }} />
                    <Radar dataKey="score" stroke="#D4A843" fill="#D4A843" fillOpacity={0.2} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1">
                {wheelAreas.map(w => {
                  const zone = getZone(w.score);
                  return (
                    <div key={w.name} className="flex items-center gap-2">
                      <span className="text-[10px] text-foreground w-24 truncate">{w.name}</span>
                      <div className="flex-1 h-3 rounded-full bg-muted/30 overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${(w.score / 10) * 100}%`, backgroundColor: zone.color }} />
                      </div>
                      <span className="text-[10px] font-bold w-4 text-right" style={{ color: zone.color }}>{w.score}</span>
                      <span className="text-[10px] w-3">{zone.emoji}</span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-4xl mb-2">📊</p>
              <p className="text-sm text-muted-foreground">No assessment data yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Take your first self-assessment to see your Wheel of Life.</p>
            </div>
          )}

          <div className="flex gap-2">
            <Link to="/seeker/assessments" className="flex-1 text-center px-3 py-2.5 rounded-xl text-xs font-bold transition-all hover:opacity-90" style={{ background: 'linear-gradient(135deg, #0D1B3E, #162758)', border: '1px solid #D4A843', color: '#D4A843' }}>
              🎯 Take Self-Assessment
            </Link>
          </div>
        </div>
      </div>

      {/* Achievement Badges */}
      {badgeList.length > 0 && (
        <div className="bg-card rounded-xl p-5 border border-border">
          <h3 className="font-semibold text-foreground text-sm mb-3">🏆 Achievements</h3>
          <div className="grid grid-cols-3 gap-3">
            {badgeList.slice(0, 9).map(b => (
              <div key={b.name} className={`text-center p-3 rounded-xl border ${b.earned ? 'bg-primary/5 border-primary/20' : 'bg-muted/30 border-border opacity-40'}`}>
                <p className="text-2xl mb-1">{b.emoji}</p>
                <p className="text-[10px] text-foreground font-medium">{b.name}</p>
                {b.earned && <p className="text-[9px] text-dharma-green">Earned ✓</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SeekerGrowth;
