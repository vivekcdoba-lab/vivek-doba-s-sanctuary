import { Card } from '@/components/ui/card';
import { FiroBScores, FIRO_B_DIMENSIONS, getLevel, getLevelColor, INTERPERSONAL_INSIGHTS } from './firoBData';
import { FiroBAssessment } from '@/hooks/useFiroBAssessment';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Props { scores: FiroBScores; previousAssessment: FiroBAssessment | null; }

const FiroBResults = ({ scores, previousAssessment }: Props) => {
  const totalE = scores.eI + scores.eC + scores.eA;
  const totalW = scores.wI + scores.wC + scores.wA;

  const barData = FIRO_B_DIMENSIONS.map(d => ({ name: d.label, score: scores[d.code], fill: d.color }));
  const comparisonData = [
    { name: 'Inclusion', Expressed: scores.eI, Wanted: scores.wI },
    { name: 'Control', Expressed: scores.eC, Wanted: scores.wC },
    { name: 'Affection', Expressed: scores.eA, Wanted: scores.wA },
  ];

  return (
    <div className="space-y-4">
      <Card className="p-4 text-center bg-primary/5 border-primary/20">
        <p className="text-sm text-muted-foreground">Your FIRO-B Profile</p>
        <div className="flex justify-center gap-8 mt-2">
          <div><p className="text-3xl font-bold text-primary">{totalE}</p><p className="text-xs text-muted-foreground">Total Expressed</p></div>
          <div><p className="text-3xl font-bold text-primary">{totalW}</p><p className="text-xs text-muted-foreground">Total Wanted</p></div>
        </div>
        {previousAssessment && <p className="text-xs mt-2">Previous: E={previousAssessment.total_expressed} W={previousAssessment.total_wanted}</p>}
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3">Dimension Scores</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" className="text-[10px]" /><YAxis domain={[0, 9]} /><Tooltip />
            <Bar dataKey="score" radius={[4, 4, 0, 0]}>{barData.map((e, i) => <Cell key={i} fill={e.fill} />)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3">Expressed vs Wanted</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={comparisonData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis domain={[0, 9]} /><Tooltip />
            <Bar dataKey="Expressed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Wanted" fill="hsl(var(--primary) / 0.5)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3">Personalized Analysis</h3>
        <div className="space-y-3">
          {FIRO_B_DIMENSIONS.map(d => {
            const score = scores[d.code];
            const level = getLevel(score);
            const insight = INTERPERSONAL_INSIGHTS[d.code];
            const text = level === 'Low' ? insight.low : level === 'Medium' ? insight.mid : insight.high;
            return (
              <div key={d.code} className="p-2 rounded bg-muted/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">{d.emoji} {d.label}</span>
                  <span className="text-xs font-bold" style={{ color: getLevelColor(level) }}>{level} ({score}/9)</span>
                </div>
                <p className="text-xs text-muted-foreground">{text}</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default FiroBResults;
