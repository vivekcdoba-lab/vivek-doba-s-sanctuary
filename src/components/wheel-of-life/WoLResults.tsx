import { useMemo } from 'react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Cell, ReferenceLine, PieChart, Pie,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { WOL_SPOKES, WoLScores, getScoreZone, getBalanceMessage, DANGER_MESSAGES } from './wolData';
import type { WoLAssessment } from '@/hooks/useWheelOfLife';

interface Props {
  scores: WoLScores;
  previousAssessment?: WoLAssessment | null;
}

function getColorByScore(score: number) {
  if (score <= 4) return '#EF4444';
  if (score <= 6) return '#F59E0B';
  return '#22C55E';
}

const WoLResults = ({ scores, previousAssessment }: Props) => {
  const analysis = useMemo(() => {
    const values = WOL_SPOKES.map(s => ({ spoke: s, score: scores[s.id] }));
    const total = values.reduce((sum, v) => sum + v.score, 0);
    const avg = total / 8;
    const sorted = [...values].sort((a, b) => b.score - a.score);
    const top3 = sorted.slice(0, 3);
    const bottom3 = sorted.slice(-3).reverse();
    const highest = sorted[0];
    const lowest = sorted[sorted.length - 1];
    const gap = highest.score - lowest.score;
    const variance = values.reduce((sum, v) => sum + Math.pow(v.score - avg, 2), 0) / 8;
    const dangerZones = values.filter(v => v.score <= 4);
    return { total, avg, top3, bottom3, highest, lowest, gap, variance, dangerZones };
  }, [scores]);

  const balanceMsg = getBalanceMessage(analysis.avg);

  const radarData = WOL_SPOKES.map(s => ({
    name: `${s.emoji} ${s.name}`,
    shortName: s.emoji,
    current: scores[s.id],
    ideal: 8,
    previous: previousAssessment ? (previousAssessment as any)[`${s.id}_score`] : undefined,
    fullMark: 10,
  }));

  const barData = WOL_SPOKES.map(s => ({
    name: s.name.split(' ').slice(0, 2).join(' '),
    score: scores[s.id],
    color: getColorByScore(scores[s.id]),
  }));

  const pieData = [
    { range: 'Danger (1-4)', count: WOL_SPOKES.filter(s => scores[s.id] <= 4).length, color: '#EF4444' },
    { range: 'Needs Work (5-6)', count: WOL_SPOKES.filter(s => scores[s.id] >= 5 && scores[s.id] <= 6).length, color: '#F59E0B' },
    { range: 'Thriving (7-10)', count: WOL_SPOKES.filter(s => scores[s.id] >= 7).length, color: '#22C55E' },
  ].filter(d => d.count > 0);

  return (
    <div className="space-y-4 animate-fade-up">
      {/* Overall Balance Score */}
      <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="p-6 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Your Life Balance Score</p>
          <p className="text-5xl font-bold text-primary mt-2">{analysis.avg.toFixed(1)}<span className="text-lg text-muted-foreground">/10</span></p>
          <p className="text-sm text-muted-foreground mt-1">{analysis.total}/80 Total • {((analysis.total / 80) * 100).toFixed(0)}% Life Fulfilment</p>
          <Badge variant="outline" className="mt-3 text-sm px-4 py-1">
            {balanceMsg.emoji} {balanceMsg.message}
          </Badge>
        </CardContent>
      </Card>

      {/* Danger Zones */}
      {analysis.dangerZones.length > 0 && (
        <Card className="border-red-500/30">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Danger Zones Identified
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            <p className="text-xs text-muted-foreground mb-2">Areas scoring 4 or below need immediate attention</p>
            {analysis.dangerZones.map(zone => (
              <Alert key={zone.spoke.id} variant="destructive" className="bg-red-500/5">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{zone.spoke.emoji} {zone.spoke.name}</span>
                    <Badge variant="destructive">{zone.score}/10</Badge>
                  </div>
                  <p className="text-xs mt-1 opacity-80">{DANGER_MESSAGES[zone.spoke.name]}</p>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Radar Chart */}
        <Card>
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm">🎡 Your Wheel of Life</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="shortName" tick={{ fontSize: 16 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fontSize: 9 }} tickCount={6} />
                  <Radar name="Ideal Balance" dataKey="ideal" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted-foreground))" fillOpacity={0.05} strokeDasharray="5 5" strokeWidth={1} />
                  <Radar name="Your Score" dataKey="current" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2.5} animationDuration={1200} />
                  <Tooltip content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-card border border-border rounded-lg p-2 shadow-lg text-xs">
                        <p className="font-semibold">{d.name}</p>
                        <p>Score: <span className="font-bold text-primary">{d.current}</span>/10</p>
                      </div>
                    );
                  }} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card>
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm">📊 Score Comparison</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 8 }} angle={-30} textAnchor="end" height={60} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <ReferenceLine y={7} stroke="#22C55E" strokeDasharray="3 3" label="Target" />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Score Distribution Pie */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm">🥧 Score Distribution</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="count" nameKey="range" cx="50%" cy="50%" outerRadius={70} label={({ range, count }) => `${range}: ${count}`}>
                  {pieData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Balance Analysis */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm">⚖️ Balance Analysis</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground">Highest</p>
              <p className="text-lg font-bold text-green-600">{analysis.highest.score}</p>
              <p className="text-xs">{analysis.highest.spoke.emoji} {analysis.highest.spoke.name}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground">Lowest</p>
              <p className="text-lg font-bold text-red-500">{analysis.lowest.score}</p>
              <p className="text-xs">{analysis.lowest.spoke.emoji} {analysis.lowest.spoke.name}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground">Score Gap</p>
              <p className={`text-lg font-bold ${analysis.gap >= 5 ? 'text-red-500' : 'text-foreground'}`}>{analysis.gap} pts</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground">Variance</p>
              <p className="text-lg font-bold text-foreground">{analysis.variance.toFixed(1)}</p>
            </div>
          </div>

          {analysis.gap >= 5 && (
            <Alert className="mt-3 bg-yellow-500/10 border-yellow-500/30">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-sm">
                <strong>High Imbalance Detected!</strong> A {analysis.gap}-point gap between your highest and lowest areas indicates significant life imbalance. You're likely over-investing in {analysis.highest.spoke.name} while neglecting {analysis.lowest.spoke.name}.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Strengths & Growth Areas */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-green-500/30">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm text-green-600">🌟 Top 3 Strengths</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            {analysis.top3.map(item => (
              <div key={item.spoke.id} className="flex items-center justify-between">
                <span className="text-sm">{item.spoke.emoji} {item.spoke.name}</span>
                <Badge className="bg-green-500/15 text-green-600 border-green-500/30">{item.score}/10</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-red-500/30">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm text-red-500">⚠️ Growth Areas</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            {analysis.bottom3.map(item => (
              <div key={item.spoke.id} className="flex items-center justify-between">
                <span className="text-sm">{item.spoke.emoji} {item.spoke.name}</span>
                <Badge className="bg-red-500/15 text-red-500 border-red-500/30">{item.score}/10</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* All Areas Breakdown */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm">📋 All Areas Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-2">
          {WOL_SPOKES.map(spoke => {
            const score = scores[spoke.id];
            const pct = (score / 10) * 100;
            return (
              <div key={spoke.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{spoke.emoji} {spoke.name}</span>
                  <span className="font-bold text-sm" style={{ color: spoke.color }}>{score}/10</span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${pct}%`, backgroundColor: spoke.color }} />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default WoLResults;
