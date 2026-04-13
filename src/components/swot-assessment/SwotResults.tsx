import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { SwotScores, getSwotBalance, getQuadrantHealth, SWOT_QUADRANTS } from './swotData';
import type { SwotAssessment } from '@/hooks/useSwotAssessment';

interface Props {
  scores: SwotScores;
  previousAssessment?: SwotAssessment | null;
}

const COLORS = ['#22c55e', '#ef4444', '#3b82f6', '#f97316'];

const SwotResults = ({ scores, previousAssessment }: Props) => {
  const balance = getSwotBalance(scores);
  const internalHealth = getQuadrantHealth(balance.internalRatio);
  const externalHealth = getQuadrantHealth(balance.externalRatio);
  const overallHealth = getQuadrantHealth(balance.overallBalance);

  const countData = [
    { name: 'Strengths', count: scores.strengths.length, fill: COLORS[0] },
    { name: 'Weaknesses', count: scores.weaknesses.length, fill: COLORS[1] },
    { name: 'Opportunities', count: scores.opportunities.length, fill: COLORS[2] },
    { name: 'Threats', count: scores.threats.length, fill: COLORS[3] },
  ];

  const weightData = SWOT_QUADRANTS.map((q, i) => ({
    name: q.name,
    weight: scores[q.id].reduce((sum, item) => sum + item.importance, 0),
    fill: COLORS[i],
  }));

  const insights: string[] = [];
  if (scores.strengths.length > scores.weaknesses.length) insights.push('✅ You have more strengths than weaknesses — build on them!');
  else if (scores.weaknesses.length > scores.strengths.length) insights.push('⚠️ More weaknesses identified than strengths — focus on building capabilities.');
  if (scores.opportunities.length > scores.threats.length) insights.push('🌟 External environment looks favorable with more opportunities than threats.');
  else if (scores.threats.length > scores.opportunities.length) insights.push('🛡️ More threats than opportunities — develop defensive strategies.');
  if (balance.overallBalance >= 0.6) insights.push('💪 Overall positive outlook — leverage your position!');
  else if (balance.overallBalance < 0.4) insights.push('🔧 Overall outlook needs attention — prioritize improvement actions.');

  const topStrength = scores.strengths.sort((a, b) => b.importance - a.importance)[0];
  const topWeakness = scores.weaknesses.sort((a, b) => b.importance - a.importance)[0];
  if (topStrength) insights.push(`🏆 Top strength: "${topStrength.text}"`);
  if (topWeakness) insights.push(`🎯 Top weakness to address: "${topWeakness.text}"`);

  return (
    <div className="space-y-4">
      {/* Balance Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Internal (S vs W)</p>
            <p className={`text-lg font-bold ${internalHealth.color}`}>
              {(balance.internalRatio * 100).toFixed(0)}%
            </p>
            <Badge variant="outline" className="text-[10px]">{internalHealth.label}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">External (O vs T)</p>
            <p className={`text-lg font-bold ${externalHealth.color}`}>
              {(balance.externalRatio * 100).toFixed(0)}%
            </p>
            <Badge variant="outline" className="text-[10px]">{externalHealth.label}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Overall Balance</p>
            <p className={`text-lg font-bold ${overallHealth.color}`}>
              {(balance.overallBalance * 100).toFixed(0)}%
            </p>
            <Badge variant="outline" className="text-[10px]">{overallHealth.label}</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Item Count by Quadrant</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={countData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {countData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Importance Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={weightData} dataKey="weight" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                  {weightData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Comparison */}
      {previousAssessment && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">📈 Change from Previous Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2 text-center text-sm">
              {(['strengths', 'weaknesses', 'opportunities', 'threats'] as const).map((q) => {
                const prevCount = previousAssessment[`${q.slice(0, -1 === 0 ? undefined : undefined)}_count` as keyof typeof previousAssessment] as number || 
                  (Array.isArray(previousAssessment[q]) ? previousAssessment[q].length : 0);
                const curCount = scores[q].length;
                const diff = curCount - prevCount;
                return (
                  <div key={q}>
                    <p className="text-muted-foreground text-xs capitalize">{q}</p>
                    <p className={`font-bold ${diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                      {diff > 0 ? '+' : ''}{diff}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">💡 Key Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {insights.map((insight, i) => (
            <p key={i} className="text-sm text-muted-foreground">{insight}</p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default SwotResults;
