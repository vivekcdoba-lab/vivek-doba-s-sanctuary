import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MoochScores, MOOCH_PATTERNS, getIntensityZone, getIntensityColor } from './moochData';
import { MoochAssessment } from '@/hooks/useMoochAssessment';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

interface Props { scores: MoochScores; previousAssessment: MoochAssessment | null; }

const MoochResults = ({ scores, previousAssessment }: Props) => {
  const entries = Object.entries(scores) as [keyof MoochScores, number][];
  const avg = (entries.reduce((a, [, v]) => a + v, 0) / entries.length).toFixed(1);
  const sorted = [...entries].sort((a, b) => b[1] - a[1]);
  const strongest = sorted[0]; const weakest = sorted[sorted.length - 1];

  const radarData = MOOCH_PATTERNS.map(p => ({ subject: p.emoji + ' ' + p.name, score: scores[p.id], fullMark: 10 }));
  const barData = MOOCH_PATTERNS.map(p => ({ name: p.emoji + ' ' + p.name, score: scores[p.id], fill: getIntensityColor(getIntensityZone(scores[p.id])) }));

  const criticalPatterns = MOOCH_PATTERNS.filter(p => scores[p.id] >= 8);

  return (
    <div className="space-y-4">
      <Card className="p-4 text-center bg-primary/5 border-primary/20">
        <p className="text-sm text-muted-foreground">Average Pattern Intensity</p>
        <p className="text-4xl font-bold text-primary">{avg}<span className="text-lg text-muted-foreground">/10</span></p>
        <p className="text-xs text-muted-foreground mt-1">Lower = Healthier Mind</p>
        {previousAssessment && <p className="text-xs mt-1">Previous: {previousAssessment.average_score?.toFixed(1)} | Change: {(parseFloat(avg) - (previousAssessment.average_score || 0)).toFixed(1)}</p>}
      </Card>

      {criticalPatterns.length > 0 && (
        <Card className="p-4 border-destructive/30 bg-destructive/5">
          <h3 className="font-semibold text-sm text-destructive mb-2">🚨 Critical Patterns (8+)</h3>
          {criticalPatterns.map(p => <p key={p.id} className="text-xs text-muted-foreground">{p.emoji} {p.name} intensity is critically high ({scores[p.id]}/10) — immediate attention needed</p>)}
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold text-sm mb-3">Pattern Intensity Radar</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}><PolarGrid /><PolarAngleAxis dataKey="subject" className="text-xs" /><PolarRadiusAxis domain={[0, 10]} /><Radar name="Intensity" dataKey="score" stroke="#EF4444" fill="#EF4444" fillOpacity={0.2} /></RadarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold text-sm mb-3">Pattern Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" className="text-[10px]" /><YAxis domain={[0, 10]} /><Tooltip /><Bar dataKey="score" radius={[4, 4, 0, 0]}>{barData.map((e, i) => <Cell key={i} fill={e.fill} />)}</Bar></BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3">Mind Pattern Analysis</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-2 rounded bg-destructive/10"><p className="text-xs text-muted-foreground">Strongest Pattern</p><p className="font-bold text-foreground">{MOOCH_PATTERNS.find(p => p.id === strongest[0])?.emoji} {strongest[0]}: {strongest[1]}/10</p></div>
          <div className="text-center p-2 rounded bg-green-500/10"><p className="text-xs text-muted-foreground">Most Managed</p><p className="font-bold text-foreground">{MOOCH_PATTERNS.find(p => p.id === weakest[0])?.emoji} {weakest[0]}: {weakest[1]}/10</p></div>
        </div>
      </Card>
    </div>
  );
};

export default MoochResults;
