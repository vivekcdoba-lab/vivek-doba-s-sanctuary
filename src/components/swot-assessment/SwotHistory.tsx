import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';
import { Eye } from 'lucide-react';
import type { SwotAssessment } from '@/hooks/useSwotAssessment';

interface Props {
  history: SwotAssessment[];
  onViewDetails: (assessment: SwotAssessment) => void;
}

const SwotHistory = ({ history, onViewDetails }: Props) => {
  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <p className="text-3xl mb-2">📋</p>
          <p className="font-medium">No SWOT assessments yet</p>
          <p className="text-sm">Complete your first SWOT analysis to start tracking your growth!</p>
        </CardContent>
      </Card>
    );
  }

  const trendData = [...history].reverse().map((a) => ({
    date: format(new Date(a.created_at), 'MMM d'),
    Strengths: a.strength_count,
    Weaknesses: a.weakness_count,
    Opportunities: a.opportunity_count,
    Threats: a.threat_count,
    Balance: a.balance_score,
  }));

  return (
    <div className="space-y-4">
      {/* Trend Chart */}
      {history.length > 1 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">📈 Quadrant Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="Strengths" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Weaknesses" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Opportunities" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Threats" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* History List */}
      <div className="space-y-2">
        {history.map((assessment) => {
          const total = assessment.strength_count + assessment.weakness_count + assessment.opportunity_count + assessment.threat_count;
          return (
            <Card key={assessment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      {format(new Date(assessment.created_at), 'MMMM d, yyyy')}
                    </p>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <Badge variant="outline" className="text-[10px] text-green-600">S: {assessment.strength_count}</Badge>
                      <Badge variant="outline" className="text-[10px] text-red-500">W: {assessment.weakness_count}</Badge>
                      <Badge variant="outline" className="text-[10px] text-blue-600">O: {assessment.opportunity_count}</Badge>
                      <Badge variant="outline" className="text-[10px] text-orange-500">T: {assessment.threat_count}</Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        Balance: {assessment.balance_score?.toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => onViewDetails(assessment)}>
                    <Eye className="h-4 w-4 mr-1" /> View
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SwotHistory;
