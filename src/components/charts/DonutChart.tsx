import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { CHART_PALETTE } from './chartColors';
import ChartWrapper from './ChartWrapper';

interface DonutChartProps {
  title: string;
  emoji?: string;
  data: { name: string; value: number }[];
  isLoading?: boolean;
  centerLabel?: string;
  centerValue?: string | number;
}

const DonutChart = ({ title, emoji, data, isLoading, centerLabel, centerValue }: DonutChartProps) => (
  <ChartWrapper title={title} emoji={emoji} isLoading={isLoading} isEmpty={data.length === 0}>
    <div className="relative">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
            {data.map((_, i) => <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />)}
          </Pie>
          <Tooltip formatter={(v: number) => v.toLocaleString('en-IN')} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
        </PieChart>
      </ResponsiveContainer>
      {centerLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-2xl font-bold text-foreground">{centerValue}</p>
          <p className="text-[10px] text-muted-foreground">{centerLabel}</p>
        </div>
      )}
    </div>
  </ChartWrapper>
);

export default DonutChart;
