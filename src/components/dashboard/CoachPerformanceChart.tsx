import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import ChartWrapper from '@/components/charts/ChartWrapper';
import { CHART_COLORS } from '@/components/charts/chartColors';

interface CoachData {
  name: string;
  seekers: number;
  rating: number;
}

interface CoachPerformanceChartProps {
  data: CoachData[];
}

const CoachPerformanceChart = ({ data }: CoachPerformanceChartProps) => (
  <ChartWrapper title="Coach Performance" emoji="🎓">
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical" margin={{ left: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis type="number" tick={{ fontSize: 10 }} />
        <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={55} />
        <Tooltip formatter={(v: number, name: string) => name === 'seekers' ? `${v} seekers` : `${v}⭐`} />
        <Bar dataKey="seekers" fill={CHART_COLORS.saffron} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </ChartWrapper>
);

export default CoachPerformanceChart;
