import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PurusharthasScores, PURUSHARTHAS_DIMENSIONS, getScoreZone, getZoneColor, DANGER_MESSAGES } from './purusharthasData';
import { PurusharthasAssessment } from '@/hooks/usePurusharthasAssessment';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';

interface Props {
  scores: PurusharthasScores;
  previousAssessment: PurusharthasAssessment | null;
}

const PurusharthasResults = ({ scores, previousAssessment }: Props) => {
  const values = Object.entries(scores);
  const avg = (values.reduce((a, b) => a + b[1], 0) / values.length).toFixed(1);
  const sorted = [...values].sort((a, b) => b[1] - a[1]);
  const highest = sorted[0];
  const lowest = sorted[sorted.length - 1];
  const gap = highest[1] - lowest[1];

  const radarData = PURUSHARTHAS_DIMENSIONS.map(d => ({ subject: d.emoji + ' ' + d.name.split(' ')[0], score: scores[d.id], fullMark: 10 }));
  const barData = PURUSHARTHAS_DIMENSIONS.map(d => ({ name: d.emoji + ' ' + d.name.split('(')[1]?.replace(')', '') || d.name, score: scores[d.id], fill: d.color }));
  
  const zones = values.map(([, v]) => getScoreZone(v));
  const pieData = [
    { name: 'Danger (1-3)', value: zones.filter(z => z === 'danger').length, color: '#EF4444' },
    { name: 'Warning (4-5)', value: zones.filter(z => z === 'warning').length, color: '#F59E0B' },
    { name: 'Good (6-7)', value: zones.filter(z => z === 'good').length, color: '#10B981' },
    { name: 'Excellent (8-10)', value: zones.filter(z => z === 'excellent').length, color: '#8B5CF6' },
  ].filter(d => d.value > 0);

  const dangerDims = PURUSHARTHAS_DIMENSIONS.filter(d => scores[d.id] <= 4);

  return (
    <div className="space-y-4">
      <Card className="p-4 text-center bg-primary/5 border-primary/20">
        <p className="text-sm text-muted-foreground">Overall Purusharthas Balance</p>
        <p className="text-4xl font-bold text-primary">{avg}<span className="text-lg text-muted-foreground">/10</span></p>
        {previousAssessment && (
          <p className="text-xs mt-1">
            Previous: {previousAssessment.average_score?.toFixed(1)} | Change: {(parseFloat(avg) - (previousAssessment.average_score || 0)).toFixed(1)}
          </p>
        )}
      </Card>

      {dangerDims.length > 0 && (
        <Card className="p-4 border-destructive/30 bg-destructive/5">
          <h3 className="font-semibold text-sm text-destructive mb-2">⚠️ Imbalance Zones</h3>
          {dangerDims.map(d => (
            <p key={d.id} className="text-xs text-muted-foreground">{DANGER_MESSAGES[d.id]}</p>
          ))}
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold text-sm mb-3">Purusharthas Radar</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" className="text-xs" />
              <PolarRadiusAxis domain={[0, 10]} />
              <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold text-sm mb-3">Pillar Scores</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3">Balance Analysis</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-2 rounded bg-muted/50">
            <p className="text-xs text-muted-foreground">Strongest</p>
            <p className="font-bold text-foreground">{PURUSHARTHAS_DIMENSIONS.find(d => d.id === highest[0])?.emoji} {highest[0]}: {highest[1]}/10</p>
          </div>
          <div className="text-center p-2 rounded bg-muted/50">
            <p className="text-xs text-muted-foreground">Needs Focus</p>
            <p className="font-bold text-foreground">{PURUSHARTHAS_DIMENSIONS.find(d => d.id === lowest[0])?.emoji} {lowest[0]}: {lowest[1]}/10</p>
          </div>
          <div className="text-center p-2 rounded bg-muted/50">
            <p className="text-xs text-muted-foreground">Gap</p>
            <p className="font-bold text-foreground">{gap} points</p>
          </div>
          <div className="text-center p-2 rounded bg-muted/50">
            <p className="text-xs text-muted-foreground">Distribution</p>
            <div className="flex justify-center gap-1 mt-1">
              {pieData.map((d, i) => (
                <Badge key={i} variant="outline" className="text-[10px]" style={{ borderColor: d.color, color: d.color }}>{d.value}</Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PurusharthasResults;
