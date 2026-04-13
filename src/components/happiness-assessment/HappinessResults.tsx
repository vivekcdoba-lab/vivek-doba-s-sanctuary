import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HappinessScores, HAPPINESS_DIMENSIONS, getScoreZone, getZoneColor } from './happinessData';
import { HappinessAssessment } from '@/hooks/useHappinessAssessment';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

interface Props { scores: HappinessScores; previousAssessment: HappinessAssessment | null; }

const HappinessResults = ({ scores, previousAssessment }: Props) => {
  const entries = Object.entries(scores) as [keyof HappinessScores, number][];
  const avg = (entries.reduce((a, [, v]) => a + v, 0) / entries.length).toFixed(1);
  const sorted = [...entries].sort((a, b) => b[1] - a[1]);
  const highest = sorted[0]; const lowest = sorted[sorted.length - 1];

  const radarData = HAPPINESS_DIMENSIONS.map(d => ({ subject: d.emoji + ' ' + d.name.split(' ')[0], score: scores[d.id], fullMark: 10 }));
  const barData = HAPPINESS_DIMENSIONS.map(d => ({ name: d.emoji, score: scores[d.id], fill: d.color }));

  const dangerDims = HAPPINESS_DIMENSIONS.filter(d => scores[d.id] <= 3);

  return (
    <div className="space-y-4">
      <Card className="p-4 text-center bg-primary/5 border-primary/20">
        <p className="text-sm text-muted-foreground">Overall Happiness Index</p>
        <p className="text-4xl font-bold text-primary">{avg}<span className="text-lg text-muted-foreground">/10</span></p>
        {previousAssessment && <p className="text-xs mt-1">Previous: {previousAssessment.average_score?.toFixed(1)} | Change: {(parseFloat(avg) - (previousAssessment.average_score || 0)).toFixed(1)}</p>}
      </Card>

      {dangerDims.length > 0 && (
        <Card className="p-4 border-destructive/30 bg-destructive/5">
          <h3 className="font-semibold text-sm text-destructive mb-2">⚠️ Areas Needing Attention</h3>
          {dangerDims.map(d => <p key={d.id} className="text-xs text-muted-foreground">{d.emoji} {d.name} is critically low ({scores[d.id]}/10)</p>)}
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold text-sm mb-3">Happiness Radar</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid /><PolarAngleAxis dataKey="subject" className="text-xs" /><PolarRadiusAxis domain={[0, 10]} />
              <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold text-sm mb-3">Dimension Scores</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis domain={[0, 10]} /><Tooltip />
              <Bar dataKey="score" radius={[4, 4, 0, 0]}>{barData.map((e, i) => <Cell key={i} fill={e.fill} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3">Balance Analysis</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-2 rounded bg-muted/50"><p className="text-xs text-muted-foreground">Strongest</p><p className="font-bold text-foreground">{HAPPINESS_DIMENSIONS.find(d => d.id === highest[0])?.emoji} {highest[0].replace('_', ' ')}: {highest[1]}/10</p></div>
          <div className="text-center p-2 rounded bg-muted/50"><p className="text-xs text-muted-foreground">Needs Focus</p><p className="font-bold text-foreground">{HAPPINESS_DIMENSIONS.find(d => d.id === lowest[0])?.emoji} {lowest[0].replace('_', ' ')}: {lowest[1]}/10</p></div>
        </div>
      </Card>
    </div>
  );
};

export default HappinessResults;
