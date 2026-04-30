import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { PurusharthasAssessment } from '@/hooks/usePurusharthasAssessment';
import { PURUSHARTHAS_DIMENSIONS } from './purusharthasData';
import { formatDateDMY } from "@/lib/dateFormat";

interface Props {
  history: PurusharthasAssessment[];
  onViewDetails: (assessment: PurusharthasAssessment) => void;
}

const PurusharthasHistory = ({ history, onViewDetails }: Props) => {
  if (history.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-4xl mb-4">🕉️</p>
        <p className="text-muted-foreground">No assessments yet. Take your first Purusharthas assessment!</p>
      </Card>
    );
  }

  const chartData = [...history].reverse().map(a => ({
    date: format(new Date(a.created_at), 'MMM d'),
    Dharma: a.dharma_score,
    Artha: a.artha_score,
    Kama: a.kama_score,
    Moksha: a.moksha_score,
    Average: a.average_score,
  }));

  const latest = history[0];
  const oldest = history[history.length - 1];
  const change = latest.average_score && oldest.average_score ? (latest.average_score - oldest.average_score).toFixed(1) : '0';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-primary">{history.length}</p>
          <p className="text-xs text-muted-foreground">Total Assessments</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-primary">{latest.average_score?.toFixed(1)}</p>
          <p className="text-xs text-muted-foreground">Latest Score</p>
        </Card>
        <Card className="p-3 text-center">
          <p className={`text-2xl font-bold ${parseFloat(change) >= 0 ? 'text-green-600' : 'text-red-500'}`}>{parseFloat(change) >= 0 ? '+' : ''}{change}</p>
          <p className="text-xs text-muted-foreground">Overall Change</p>
        </Card>
      </div>

      {chartData.length > 1 && (
        <Card className="p-4">
          <h3 className="font-semibold text-sm mb-3">Score Trends</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Legend />
              {PURUSHARTHAS_DIMENSIONS.map(d => (
                <Line key={d.id} type="monotone" dataKey={d.name.split(' ')[0].replace('(', '').replace(')', '')} stroke={d.color} strokeWidth={2} dot={{ r: 3 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3">Assessment History</h3>
        <div className="space-y-2">
          {history.map((a) => {
            const scores = [a.dharma_score, a.artha_score, a.kama_score, a.moksha_score];
            const highest = Math.max(...scores);
            const lowest = Math.min(...scores);
            return (
              <div key={a.id} className="flex items-center justify-between p-2 rounded bg-muted/50">
                <div>
                  <p className="text-xs font-medium">{formatDateDMY(new Date(a.created_at))}</p>
                  <p className="text-xs text-muted-foreground">Avg: {a.average_score?.toFixed(1)} | High: {highest} | Low: {lowest}</p>
                </div>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => onViewDetails(a)}>View</Button>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default PurusharthasHistory;
