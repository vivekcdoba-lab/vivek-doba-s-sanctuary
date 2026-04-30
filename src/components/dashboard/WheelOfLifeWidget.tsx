import { Link } from 'react-router-dom';
import { useWheelOfLife } from '@/hooks/useWheelOfLife';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { formatDateDMY } from "@/lib/dateFormat";

const DIMENSIONS = [
  { key: 'career_score', label: '💼 Career' },
  { key: 'finance_score', label: '💰 Finance' },
  { key: 'health_score', label: '🏃 Health' },
  { key: 'family_score', label: '👨‍👩‍👧 Family' },
  { key: 'romance_score', label: '❤️ Romance' },
  { key: 'growth_score', label: '📚 Growth' },
  { key: 'fun_score', label: '🎉 Fun' },
  { key: 'environment_score', label: '🌿 Environ' },
];

const WheelOfLifeWidget = () => {
  const { history, isLoading } = useWheelOfLife();
  const latest = history[0];

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl shadow-md border border-border p-5 animate-pulse">
        <div className="h-4 w-1/2 bg-muted rounded mb-4" />
        <div className="h-40 bg-muted rounded" />
      </div>
    );
  }

  if (!latest) {
    return (
      <div className="bg-card rounded-2xl shadow-md border border-border p-5 text-center">
        <h3 className="text-sm font-semibold text-foreground mb-3">🎡 Wheel of Life</h3>
        <p className="text-3xl mb-2">🎯</p>
        <p className="text-sm text-muted-foreground mb-3">Take your first assessment to see your life balance</p>
        <Link to="/seeker/assessments/wheel-of-life" className="text-xs text-primary hover:underline font-medium">
          Take Assessment →
        </Link>
      </div>
    );
  }

  const radarData = DIMENSIONS.map(d => ({
    subject: d.label.split(' ')[0],
    score: (latest as any)[d.key] || 0,
    fullMark: 10,
  }));

  return (
    <div className="bg-card rounded-2xl shadow-md border border-border p-5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-foreground">🎡 Wheel of Life</h3>
        <Link to="/seeker/assessments/wheel-of-life" className="text-xs text-primary hover:underline">
          Details →
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <ResponsiveContainer width="100%" height={160}>
          <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
            <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
            <Radar dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.25} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-between mt-1">
        <p className="text-xs text-muted-foreground">Avg: <span className="font-semibold text-foreground">{latest.average_score?.toFixed(1) ?? '—'}/10</span></p>
        <p className="text-[10px] text-muted-foreground">{formatDateDMY(latest.created_at)}</p>
      </div>
    </div>
  );
};

export default WheelOfLifeWidget;
