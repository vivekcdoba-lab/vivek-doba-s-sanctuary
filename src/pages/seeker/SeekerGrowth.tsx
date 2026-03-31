import { Link } from 'react-router-dom';
import { SEEKERS } from '@/data/mockData';
import { TrendingUp, Award, Target, Zap, Star } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const seeker = SEEKERS[0];

const GROWTH_DATA = [
  { month: 'M1', score: 45 }, { month: 'M2', score: 55 }, { month: 'M3', score: 72 },
];

const WHEEL_SELF = [
  { dim: '💼 Career', score: 5 }, { dim: '💰 Finance', score: 3 }, { dim: '❤️ Health', score: 7 },
  { dim: '🏠 Family', score: 8 }, { dim: '💕 Relations', score: 4 }, { dim: '📚 Growth', score: 6 },
  { dim: '🎯 Fun', score: 5 }, { dim: '🌿 Environ', score: 6 }, { dim: '🕉️ Spiritual', score: 8 }, { dim: '🙏 Service', score: 5 },
];

const BADGES = [
  { name: '7-Day Streak', emoji: '🔥', earned: true },
  { name: 'First Assessment', emoji: '📊', earned: true },
  { name: '30-Day Warrior', emoji: '⚔️', earned: false },
  { name: 'Perfect Week', emoji: '🌟', earned: true },
  { name: 'Gratitude Master', emoji: '🙏', earned: false },
  { name: 'Session 10', emoji: '🎯', earned: false },
];

const selfOverall = (WHEEL_SELF.reduce((a, w) => a + w.score, 0) / WHEEL_SELF.length).toFixed(1);

const SeekerGrowth = () => {
  return (
    <div className="p-4 space-y-5 max-w-lg mx-auto animate-fade-up">
      <h1 className="text-xl font-bold text-foreground">My Growth Dashboard</h1>

      {/* Overall Score */}
      <div className="bg-card rounded-2xl p-6 border border-border text-center shadow-sm">
        <p className="text-xs text-muted-foreground mb-1">Overall Growth Score</p>
        <p className="text-5xl font-bold text-primary">{seeker.growth_score}%</p>
        <p className="text-sm text-dharma-green mt-1">↑ +27% since start</p>
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

      {/* Wheel of Life Summary */}
      <div className="bg-card rounded-xl p-5 border-2 border-primary/20 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-foreground text-sm">⭐ Wheel of Life</h3>
          <span className="text-xs text-muted-foreground">{selfOverall}/10</span>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={WHEEL_SELF}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="dim" tick={{ fontSize: 8 }} />
              <Radar dataKey="score" stroke="#3F51B5" fill="#3F51B5" fillOpacity={0.2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-destructive mt-1">Focus: Fun (5), Finance (3)</p>
        <div className="flex gap-2 mt-3">
          <Link to="/seeker/assessments" className="flex-1 text-center px-3 py-2 rounded-xl gradient-chakravartin text-primary-foreground text-xs font-medium">Take Self-Assessment</Link>
          <Link to="/seeker/assessments" className="flex-1 text-center px-3 py-2 rounded-xl border border-border text-foreground text-xs font-medium hover:bg-muted">View Full Results</Link>
        </div>
      </div>

      {/* Assessment Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-xs text-muted-foreground">🔺 LGT Balance</p>
          <p className="text-xl font-bold text-foreground">68%</p>
          <p className="text-xs text-dharma-green">↑ +23%</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-xs text-muted-foreground">😊 Happiness</p>
          <p className="text-xl font-bold text-foreground">7.2</p>
          <p className="text-xs text-dharma-green">↑ +1.7</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-xs text-muted-foreground">🕉️ Purushartha</p>
          <p className="text-xl font-bold text-foreground">65%</p>
          <p className="text-xs text-dharma-green">↑ +15%</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-xs text-muted-foreground">🧠 Awareness</p>
          <p className="text-xl font-bold text-foreground">6.5</p>
          <p className="text-xs text-muted-foreground">MOOCH Score</p>
        </div>
      </div>

      {/* Strengths & Growth Areas */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-dharma-green/5 rounded-xl p-4 border border-dharma-green/20">
          <h4 className="text-xs font-semibold text-dharma-green mb-2">Top Strengths</h4>
          <p className="text-xs text-foreground">Spirituality (9)</p>
          <p className="text-xs text-foreground">Health (8)</p>
          <p className="text-xs text-foreground">Career (7)</p>
        </div>
        <div className="bg-destructive/5 rounded-xl p-4 border border-destructive/20">
          <h4 className="text-xs font-semibold text-destructive mb-2">Growth Areas</h4>
          <p className="text-xs text-foreground">Fun (3)</p>
          <p className="text-xs text-foreground">Finance (4)</p>
          <p className="text-xs text-foreground">Relations (5)</p>
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
              {b.earned && <p className="text-[9px] text-dharma-green">Earned ✓</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeekerGrowth;
