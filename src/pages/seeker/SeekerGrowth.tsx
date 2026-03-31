import { Link } from 'react-router-dom';
import { SEEKERS } from '@/data/mockData';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Cell, BarChart, Bar } from 'recharts';

const seeker = SEEKERS[0];

const GROWTH_DATA = [
  { month: 'M1', score: 45 }, { month: 'M2', score: 55 }, { month: 'M3', score: 72 },
];

const ZONE_COLORS = { red: '#E63946', yellow: '#F4A61C', white: '#BDC3C7', blue: '#3498DB', green: '#2ECC71' };

function getZone(score: number) {
  if (score <= 2) return { name: 'Red', color: ZONE_COLORS.red, emoji: '🔴' };
  if (score <= 4) return { name: 'Yellow', color: ZONE_COLORS.yellow, emoji: '🟡' };
  if (score <= 6) return { name: 'Average', color: ZONE_COLORS.white, emoji: '⚪' };
  if (score <= 8) return { name: 'Good', color: ZONE_COLORS.blue, emoji: '🔵' };
  return { name: 'Excellent', color: ZONE_COLORS.green, emoji: '🟢' };
}

// 9 Wheel of Life areas matching Vivek Doba's framework
const WHEEL_AREAS = [
  { name: '🕉️ Spiritual', score: 8 },
  { name: '📚 Learnings', score: 6 },
  { name: '💼 Work', score: 5 },
  { name: '💰 Money', score: 3 },
  { name: '❤️ Love', score: 4 },
  { name: '🙏 Service', score: 5 },
  { name: '👨‍👩‍👧‍👦 Relations', score: 8 },
  { name: '🏃 Health', score: 7 },
  { name: '🎉 Fun', score: 5 },
];

const BADGES = [
  { name: '7-Day Streak', emoji: '🔥', earned: true },
  { name: 'First Assessment', emoji: '📊', earned: true },
  { name: '30-Day Warrior', emoji: '⚔️', earned: false },
  { name: 'Perfect Week', emoji: '🌟', earned: true },
  { name: 'Gratitude Master', emoji: '🙏', earned: false },
  { name: 'Session 10', emoji: '🎯', earned: false },
];

const selfOverall = (WHEEL_AREAS.reduce((a, w) => a + w.score, 0) / WHEEL_AREAS.length).toFixed(1);
const totalScore = WHEEL_AREAS.reduce((a, w) => a + w.score, 0);
const strongest = WHEEL_AREAS.reduce((max, w) => w.score > max.score ? w : max);
const weakest = WHEEL_AREAS.reduce((min, w) => w.score < min.score ? w : min);

const SeekerGrowth = () => {
  return (
    <div className="p-4 space-y-5 max-w-lg mx-auto animate-fade-up">
      <h1 className="text-xl font-bold text-foreground">My Growth Dashboard</h1>

      {/* Overall Score */}
      <div className="bg-card rounded-2xl p-6 border border-border text-center shadow-sm">
        <p className="text-xs text-muted-foreground mb-1">Overall Growth Score</p>
        <p className="text-5xl font-bold text-primary">{seeker.growth_score}%</p>
        <p className="text-sm mt-1" style={{ color: ZONE_COLORS.green }}>↑ +27% since start</p>
      </div>

      {/* Growth Chart */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <h3 className="font-semibold text-foreground text-sm mb-3">Growth Trend</h3>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={GROWTH_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
            <Tooltip />
            <Line type="monotone" dataKey="score" stroke="#B8860B" strokeWidth={3} dot={{ fill: '#B8860B', r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ═══ WHEEL OF LIFE — PREMIUM SECTION ═══ */}
      <div className="rounded-2xl overflow-hidden border border-border shadow-sm">
        {/* Header */}
        <div className="p-4 text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #080F24, #0D1B3E, #162758)' }}>
          <span className="absolute top-[-20px] right-[-10px] text-[100px] opacity-[0.04] pointer-events-none" style={{ color: '#D4A843' }}>☸</span>
          <h3 className="text-base font-bold relative z-10" style={{ color: '#D4A843', fontFamily: 'serif' }}>☸ WHEEL OF LIFE ☸</h3>
          <p className="text-[10px] relative z-10" style={{ color: '#F2D88A', opacity: 0.8 }}>Jeevan Chakra — Your Life Balance Assessment</p>
        </div>

        <div className="bg-card p-4 space-y-4">
          {/* Summary Row */}
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center p-2 rounded-lg bg-muted/30">
              <p className="text-[8px] text-muted-foreground uppercase tracking-wider">Total</p>
              <p className="text-lg font-bold text-foreground">{totalScore}<span className="text-[9px] text-muted-foreground">/90</span></p>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/30">
              <p className="text-[8px] text-muted-foreground uppercase tracking-wider">Average</p>
              <p className="text-lg font-bold" style={{ color: getZone(Number(selfOverall)).color }}>{selfOverall}</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/30">
              <p className="text-[8px] text-muted-foreground uppercase tracking-wider">Best</p>
              <p className="text-lg font-bold" style={{ color: ZONE_COLORS.green }}>{strongest.score}</p>
              <p className="text-[8px] text-muted-foreground">{strongest.name.split(' ')[0]}</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/30">
              <p className="text-[8px] text-muted-foreground uppercase tracking-wider">Focus</p>
              <p className="text-lg font-bold" style={{ color: ZONE_COLORS.red }}>{weakest.score}</p>
              <p className="text-[8px] text-muted-foreground">{weakest.name.split(' ')[0]}</p>
            </div>
          </div>

          {/* Radar Chart */}
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={WHEEL_AREAS}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="name" tick={{ fontSize: 8 }} />
                <Radar dataKey="score" stroke="#D4A843" fill="#D4A843" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Mini Bar */}
          <div className="space-y-1">
            {WHEEL_AREAS.map(w => {
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

          {/* Zone Legend mini */}
          <div className="flex justify-center gap-3 flex-wrap">
            {[
              { emoji: '🔴', label: '0-2' }, { emoji: '🟡', label: '3-4' },
              { emoji: '⚪', label: '5-6' }, { emoji: '🔵', label: '7-8' }, { emoji: '🟢', label: '9-10' },
            ].map(z => (
              <span key={z.emoji} className="text-[9px] text-muted-foreground">{z.emoji} {z.label}</span>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-2">
            <Link to="/seeker/assessments" className="flex-1 text-center px-3 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90" style={{ background: 'linear-gradient(135deg, #0D1B3E, #162758)', border: '1px solid #D4A843', color: '#D4A843' }}>
              🎯 Take Self-Assessment
            </Link>
            <Link to="/seeker/assessments" className="flex-1 text-center px-3 py-2.5 rounded-xl border border-border text-foreground text-xs font-medium hover:bg-muted">
              View Full Results
            </Link>
          </div>
        </div>
      </div>

      {/* Assessment Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-xs text-muted-foreground">🔺 LGT Balance</p>
          <p className="text-xl font-bold text-foreground">68%</p>
          <p className="text-xs" style={{ color: ZONE_COLORS.green }}>↑ +23%</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-xs text-muted-foreground">😊 Happiness</p>
          <p className="text-xl font-bold text-foreground">7.2</p>
          <p className="text-xs" style={{ color: ZONE_COLORS.green }}>↑ +1.7</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-xs text-muted-foreground">🕉️ Purushartha</p>
          <p className="text-xl font-bold text-foreground">65%</p>
          <p className="text-xs" style={{ color: ZONE_COLORS.green }}>↑ +15%</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-xs text-muted-foreground">🧠 Awareness</p>
          <p className="text-xl font-bold text-foreground">6.5</p>
          <p className="text-xs text-muted-foreground">MOOCH Score</p>
        </div>
      </div>

      {/* Strengths & Growth Areas */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl p-4 border" style={{ backgroundColor: `${ZONE_COLORS.green}08`, borderColor: `${ZONE_COLORS.green}30` }}>
          <h4 className="text-xs font-semibold mb-2" style={{ color: ZONE_COLORS.green }}>Top Strengths</h4>
          {WHEEL_AREAS.sort((a, b) => b.score - a.score).slice(0, 3).map(w => (
            <p key={w.name} className="text-xs text-foreground">{w.name} ({w.score})</p>
          ))}
        </div>
        <div className="rounded-xl p-4 border" style={{ backgroundColor: `${ZONE_COLORS.red}08`, borderColor: `${ZONE_COLORS.red}30` }}>
          <h4 className="text-xs font-semibold mb-2" style={{ color: ZONE_COLORS.red }}>Growth Areas</h4>
          {[...WHEEL_AREAS].sort((a, b) => a.score - b.score).slice(0, 3).map(w => (
            <p key={w.name} className="text-xs text-foreground">{w.name} ({w.score})</p>
          ))}
        </div>
      </div>

      {/* Achievement Badges */}
      <div className="bg-card rounded-xl p-5 border border-border">
        <h3 className="font-semibold text-foreground text-sm mb-3">🏆 Achievements</h3>
        <div className="grid grid-cols-3 gap-3">
          {BADGES.map(b => (
            <div key={b.name} className={`text-center p-3 rounded-xl border ${b.earned ? 'bg-primary/5 border-primary/20' : 'bg-muted/30 border-border opacity-40'}`}>
              <p className="text-2xl mb-1">{b.emoji}</p>
              <p className="text-[10px] text-foreground font-medium">{b.name}</p>
              {b.earned && <p className="text-[9px]" style={{ color: ZONE_COLORS.green }}>Earned ✓</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeekerGrowth;
