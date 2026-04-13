import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { LGT_DIMENSIONS } from './lgtData';
import type { LgtAssessment } from '@/hooks/useLgtAssessment';

interface Props {
  history: LgtAssessment[];
  onViewDetails: (assessment: LgtAssessment) => void;
}

const LgtHistory = ({ history, onViewDetails }: Props) => {
  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <p className="text-3xl mb-2">📊</p>
          <p className="text-sm">No assessments yet. Take your first LGT assessment to start tracking!</p>
        </CardContent>
      </Card>
    );
  }

  const latest = history[0];
  const oldest = history[history.length - 1];
  const change = (latest.average_score || 0) - (oldest.average_score || 0);

  const trendData = [...history].reverse().map(h => ({
    date: format(new Date(h.created_at), 'MMM d'),
    Dharma: h.dharma_score,
    Artha: h.artha_score,
    Kama: h.kama_score,
    Moksha: h.moksha_score,
    Average: h.average_score,
  }));

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{history.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Latest Avg</p>
            <p className="text-2xl font-bold">{latest.average_score?.toFixed(1)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Change</p>
            <p className={`text-2xl font-bold ${change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : ''}`}>
              {change > 0 ? '+' : ''}{change.toFixed(1)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      {history.length > 1 && (
        <Card>
          <CardHeader className="p-3 pb-0"><CardTitle className="text-sm">📈 Score Trends</CardTitle></CardHeader>
          <CardContent className="p-2">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                {LGT_DIMENSIONS.map(d => (
                  <Line key={d.id} type="monotone" dataKey={d.name} stroke={d.color} strokeWidth={2} dot={{ r: 3 }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* History Table */}
      <Card>
        <CardHeader className="p-3 pb-1"><CardTitle className="text-sm">📋 Assessment History</CardTitle></CardHeader>
        <CardContent className="p-3 pt-0 space-y-2">
          {history.map(h => {
            const scores = [h.dharma_score, h.artha_score, h.kama_score, h.moksha_score];
            const highest = Math.max(...scores);
            const lowest = Math.min(...scores);
            return (
              <div key={h.id} className="flex items-center justify-between p-2 rounded border text-sm">
                <div>
                  <p className="font-medium">{format(new Date(h.created_at), 'MMM d, yyyy')}</p>
                  <p className="text-xs text-muted-foreground">
                    Avg: {h.average_score?.toFixed(1)} | High: {highest} | Low: {lowest}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {LGT_DIMENSIONS.map(d => (
                      <Badge key={d.id} variant="outline" className="text-xs px-1" style={{ borderColor: d.color }}>
                        {d.emoji}{String(h[`${d.id}_score` as keyof LgtAssessment])}
                      </Badge>
                    ))}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => onViewDetails(h)}>View</Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default LgtHistory;
