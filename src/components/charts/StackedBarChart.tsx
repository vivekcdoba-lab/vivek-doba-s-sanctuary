import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import { CHART_PALETTE } from './chartColors';
import ChartWrapper from './ChartWrapper';

interface BarChartItem {
  name: string;
  [key: string]: string | number;
}

interface StackedBarChartProps {
  title: string;
  emoji?: string;
  data: BarChartItem[];
  bars: { dataKey: string; color?: string; stackId?: string }[];
  isLoading?: boolean;
  layout?: 'horizontal' | 'vertical';
}

const StackedBarChart = ({ title, emoji, data, bars, isLoading, layout = 'horizontal' }: StackedBarChartProps) => (
  <ChartWrapper title={title} emoji={emoji} isLoading={isLoading} isEmpty={data.length === 0}>
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} layout={layout === 'vertical' ? 'vertical' : 'horizontal'}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        {layout === 'vertical' ? (
          <>
            <XAxis type="number" tick={{ fontSize: 10 }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} />
          </>
        ) : (
          <>
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
          </>
        )}
        <Tooltip />
        <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
        {bars.map((bar, i) => (
          <Bar key={bar.dataKey} dataKey={bar.dataKey} fill={bar.color || CHART_PALETTE[i]} stackId={bar.stackId} radius={bar.stackId ? 0 : [4, 4, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  </ChartWrapper>
);

export default StackedBarChart;
