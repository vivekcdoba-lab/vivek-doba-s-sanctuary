import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { TrendingUp, TrendingDown, Minus, Eye } from 'lucide-react';
import { WOL_SPOKES } from './wolData';
import type { WoLAssessment } from '@/hooks/useWheelOfLife';

interface Props {
  history: WoLAssessment[];
  onViewDetails?: (assessment: WoLAssessment) => void;
}

const SPOKE_COLORS: Record<string, string> = {
  career: '#17A2B8', finance: '#FFD700', health: '#E53E3E', family: '#FF6B00',
  romance: '#ED64A6', growth: '#6B46C1', fun: '#F6AD55', environment: '#38B2AC',
};

const WoLHistory = ({ history, onViewDetails }: Props) => {
  const trendData = useMemo(() => {
    return history.slice(0, 12).reverse().map(h => ({
      date: format(new Date(h.created_at), 'dd MMM'),
      average: h.average_score || 0,
      career: h.career_score,
      finance: h.finance_score,
      health: h.health_score,
      family: h.family_score,
      romance: h.romance_score,
      growth: h.growth_score,
      fun: h.fun_score,
      environment: h.environment_score,
    }));
  }, [history]);

  const improvement = useMemo(() => {
    if (history.length < 2) return null;
    const latest = history[0].average_score || 0;
    const earliest = history[history.length - 1].average_score || 0;
    return latest - earliest;
  }, [history]);

  if (history.length === 0) {
    return (
      <div className="text-center py-12 animate-fade-up">
        <p className="text-4xl mb-3">📈</p>
        <h3 className="text-lg font-semibold text-foreground">No History Yet</h3>
        <p className="text-sm text-muted-foreground mt-1">Complete your first Wheel of Life assessment to start tracking your journey</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-up">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Total Assessments</p>
            <p className="text-2xl font-bold text-foreground">{history.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Latest Score</p>
            <p className="text-2xl font-bold text-primary">{(history[0].average_score || 0).toFixed(1)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Overall Change</p>
            {improvement !== null ? (
              <p className={`text-2xl font-bold flex items-center justify-center gap-1 ${improvement >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {improvement >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {improvement >= 0 ? '+' : ''}{improvement.toFixed(1)}
              </p>
            ) : (
              <p className="text-2xl font-bold text-muted-foreground flex items-center justify-center gap-1">
                <Minus className="h-4 w-4" /> —
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      {trendData.length > 1 && (
        <Card>
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm">📈 Score Trends Over Time</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="average" stroke="hsl(var(--primary))" strokeWidth={3} name="Average" dot />
                  {WOL_SPOKES.map(spoke => (
                    <Line key={spoke.id} type="monotone" dataKey={spoke.id} stroke={SPOKE_COLORS[spoke.id]} strokeWidth={1} strokeDasharray="3 3" name={spoke.name} dot={false} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* History Table */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm">📋 Assessment History</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs text-center">Average</TableHead>
                  <TableHead className="text-xs">Highest</TableHead>
                  <TableHead className="text-xs">Lowest</TableHead>
                  <TableHead className="text-xs text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((assessment, idx) => {
                  const spokeScores = WOL_SPOKES.map(s => ({ spoke: s, score: (assessment as any)[`${s.id}_score`] as number }));
                  const sorted = [...spokeScores].sort((a, b) => b.score - a.score);
                  const highest = sorted[0];
                  const lowest = sorted[sorted.length - 1];
                  const prevAssessment = history[idx + 1];
                  const change = prevAssessment ? (assessment.average_score || 0) - (prevAssessment.average_score || 0) : 0;

                  return (
                    <TableRow key={assessment.id}>
                      <TableCell className="text-xs">{format(new Date(assessment.created_at), 'dd MMM yyyy')}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="font-bold text-sm">{(assessment.average_score || 0).toFixed(1)}</span>
                          {idx < history.length - 1 && (
                            <span className={`text-[10px] ${change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                              {change >= 0 ? '+' : ''}{change.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        {highest.spoke.emoji} {highest.spoke.name.split(' ')[0]} ({highest.score})
                      </TableCell>
                      <TableCell className="text-xs">
                        {lowest.spoke.emoji} {lowest.spoke.name.split(' ')[0]} ({lowest.score})
                      </TableCell>
                      <TableCell className="text-center">
                        {onViewDetails && (
                          <Button variant="ghost" size="sm" onClick={() => onViewDetails(assessment)}>
                            <Eye className="h-3 w-3" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WoLHistory;
