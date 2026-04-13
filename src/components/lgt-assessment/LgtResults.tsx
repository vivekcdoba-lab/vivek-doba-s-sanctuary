import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LGT_DIMENSIONS, LgtScores, getScoreZone, getBalanceAnalysis } from './lgtData';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, PieChart, Pie } from 'recharts';
import type { LgtAssessment } from '@/hooks/useLgtAssessment';

interface Props {
  scores: LgtScores;
  previousAssessment?: LgtAssessment | null;
}

const LgtResults = ({ scores, previousAssessment }: Props) => {
  const analysis = getBalanceAnalysis(scores);

  const radarData = LGT_DIMENSIONS.map(d => ({
    dimension: d.name,
    score: scores[d.id],
    fullMark: 10,
  }));

  const barData = LGT_DIMENSIONS.map(d => ({
    name: d.emoji + ' ' + d.name,
    score: scores[d.id],
    color: d.color,
  }));

  const dangerDims = LGT_DIMENSIONS.filter(d => scores[d.id] <= 4);
  const warningDims = LGT_DIMENSIONS.filter(d => scores[d.id] >= 5 && scores[d.id] <= 6);
  const thrivingDims = LGT_DIMENSIONS.filter(d => scores[d.id] >= 7);

  const pieData = [
    { name: 'Danger (1-4)', value: dangerDims.length, fill: 'hsl(0, 69%, 50%)' },
    { name: 'Growth (5-6)', value: warningDims.length, fill: 'hsl(33, 100%, 50%)' },
    { name: 'Thriving (7-10)', value: thrivingDims.length, fill: 'hsl(122, 46%, 33%)' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-4">
      {/* Overall Score */}
      <Card className="border-primary/30">
        <CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground">LGT Balance Score</p>
          <p className="text-4xl font-bold text-primary">{analysis.avg.toFixed(1)}<span className="text-lg text-muted-foreground">/10</span></p>
          <Badge variant="outline" className="mt-1">{analysis.balanceLevel} (Gap: {analysis.gap})</Badge>
          {previousAssessment && (
            <p className="text-xs text-muted-foreground mt-1">
              Previous: {previousAssessment.average_score?.toFixed(1)} →
              Change: {((analysis.avg) - (previousAssessment.average_score || 0)).toFixed(1)}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Danger Zones */}
      {dangerDims.length > 0 && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-sm text-destructive">🚨 Danger Zones</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            {dangerDims.map(d => (
              <div key={d.id} className="flex items-center gap-2 text-sm">
                <span>{d.emoji}</span>
                <span className="font-medium">{d.name}:</span>
                <span className="text-destructive font-bold">{scores[d.id]}/10</span>
                <span className="text-xs text-muted-foreground">— Needs urgent attention</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Radar Chart */}
      <Card>
        <CardHeader className="p-3 pb-0">
          <CardTitle className="text-sm">Balance Radar</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fontSize: 9 }} />
              <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bar + Pie */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="p-3 pb-0"><CardTitle className="text-sm">Dimension Scores</CardTitle></CardHeader>
          <CardContent className="p-2">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3 pb-0"><CardTitle className="text-sm">Zone Distribution</CardTitle></CardHeader>
          <CardContent className="p-2">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Analysis */}
      <Card>
        <CardHeader className="p-3 pb-1"><CardTitle className="text-sm">📊 Balance Analysis</CardTitle></CardHeader>
        <CardContent className="p-3 pt-0 space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div><span className="text-muted-foreground">Strongest:</span> {analysis.highest.emoji} {analysis.highest.name} ({analysis.max}/10)</div>
            <div><span className="text-muted-foreground">Weakest:</span> {analysis.lowest.emoji} {analysis.lowest.name} ({analysis.min}/10)</div>
            <div><span className="text-muted-foreground">Score Gap:</span> {analysis.gap} points</div>
            <div><span className="text-muted-foreground">Std Dev:</span> {analysis.variance.toFixed(1)}</div>
          </div>
          {analysis.gap >= 5 && (
            <div className="p-2 rounded bg-destructive/10 text-destructive text-xs">
              ⚠️ High imbalance detected between {analysis.highest.name} and {analysis.lowest.name}. Focus on lifting {analysis.lowest.name} for more balanced growth.
            </div>
          )}
          {thrivingDims.length > 0 && (
            <div className="text-xs text-muted-foreground">
              🌟 <strong>Strengths:</strong> {thrivingDims.map(d => d.name).join(', ')}
            </div>
          )}
          {(dangerDims.length > 0 || warningDims.length > 0) && (
            <div className="text-xs text-muted-foreground">
              🎯 <strong>Growth Areas:</strong> {[...dangerDims, ...warningDims].map(d => d.name).join(', ')}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LgtResults;
