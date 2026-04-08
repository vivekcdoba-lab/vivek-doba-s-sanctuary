import ChartWrapper from './ChartWrapper';

interface FunnelStage {
  name: string;
  value: number;
  emoji?: string;
}

interface FunnelChartProps {
  title: string;
  emoji?: string;
  stages: FunnelStage[];
  isLoading?: boolean;
}

const FunnelChart = ({ title, emoji, stages, isLoading }: FunnelChartProps) => {
  const maxValue = stages.length > 0 ? stages[0].value : 1;

  return (
    <ChartWrapper title={title} emoji={emoji} isLoading={isLoading} isEmpty={stages.length === 0}>
      <div className="space-y-2">
        {stages.map((stage, i) => {
          const widthPct = Math.max(20, (stage.value / maxValue) * 100);
          const convRate = i > 0 && stages[i - 1].value > 0
            ? Math.round((stage.value / stages[i - 1].value) * 100)
            : null;
          const colors = [
            'bg-saffron', 'bg-gold-bright', 'bg-warning-amber', 'bg-dharma-green', 'bg-sky-blue', 'bg-chakra-indigo',
          ];

          return (
            <div key={stage.name}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-foreground font-medium">{stage.emoji || ''} {stage.name}</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">{stage.value}</span>
                  {convRate !== null && (
                    <span className="text-muted-foreground text-[10px]">({convRate}%)</span>
                  )}
                </div>
              </div>
              <div className="h-7 rounded-lg bg-muted/30 overflow-hidden flex justify-center">
                <div
                  className={`h-full rounded-lg ${colors[i % colors.length]} transition-all duration-700`}
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </ChartWrapper>
  );
};

export default FunnelChart;
