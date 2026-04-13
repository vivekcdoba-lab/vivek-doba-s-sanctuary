import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FiroBAssessment } from '@/hooks/useFiroBAssessment';

interface Props { history: FiroBAssessment[]; onViewDetails: (a: FiroBAssessment) => void; }

const FiroBHistory = ({ history, onViewDetails }: Props) => {
  if (history.length === 0) return <Card className="p-8 text-center"><p className="text-4xl mb-4">👥</p><p className="text-muted-foreground">No assessments yet. Take your first FIRO-B assessment!</p></Card>;

  const chartData = [...history].reverse().map(a => ({ date: format(new Date(a.created_at), 'MMM d'), Expressed: a.total_expressed, Wanted: a.total_wanted }));
  const latest = history[0];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center"><p className="text-2xl font-bold text-primary">{history.length}</p><p className="text-xs text-muted-foreground">Total</p></Card>
        <Card className="p-3 text-center"><p className="text-2xl font-bold text-primary">{latest.total_expressed}</p><p className="text-xs text-muted-foreground">Latest Expressed</p></Card>
        <Card className="p-3 text-center"><p className="text-2xl font-bold text-primary">{latest.total_wanted}</p><p className="text-xs text-muted-foreground">Latest Wanted</p></Card>
      </div>
      {chartData.length > 1 && <Card className="p-4"><h3 className="font-semibold text-sm mb-3">Trends</h3><ResponsiveContainer width="100%" height={200}><LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" className="text-xs" /><YAxis /><Tooltip /><Legend /><Line type="monotone" dataKey="Expressed" stroke="hsl(var(--primary))" strokeWidth={2} /><Line type="monotone" dataKey="Wanted" stroke="#EC4899" strokeWidth={2} /></LineChart></ResponsiveContainer></Card>}
      <Card className="p-4"><h3 className="font-semibold text-sm mb-3">History</h3><div className="space-y-2">{history.map(a => (<div key={a.id} className="flex items-center justify-between p-2 rounded bg-muted/50"><div><p className="text-xs font-medium">{format(new Date(a.created_at), 'MMM d, yyyy')}</p><p className="text-xs text-muted-foreground">E={a.total_expressed} W={a.total_wanted}</p></div><Button variant="ghost" size="sm" className="text-xs" onClick={() => onViewDetails(a)}>View</Button></div>))}</div></Card>
    </div>
  );
};

export default FiroBHistory;
