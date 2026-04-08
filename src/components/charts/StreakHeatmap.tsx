import ChartWrapper from './ChartWrapper';

interface StreakDay {
  date: string;
  completed: boolean;
}

interface StreakHeatmapProps {
  title?: string;
  days: StreakDay[];
  isLoading?: boolean;
}

const StreakHeatmap = ({ title = 'Worksheet Streak', days, isLoading }: StreakHeatmapProps) => {
  // Show last 12 weeks (84 days)
  const grid = days.slice(-84);
  const weeks: StreakDay[][] = [];
  for (let i = 0; i < grid.length; i += 7) {
    weeks.push(grid.slice(i, i + 7));
  }

  return (
    <ChartWrapper title={title} emoji="📅" isLoading={isLoading} isEmpty={days.length === 0} emptyMessage="Complete worksheets to build your streak!">
      <div className="flex gap-1 overflow-x-auto pb-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day, di) => (
              <div
                key={di}
                className="w-3.5 h-3.5 rounded-sm transition-colors"
                style={{
                  backgroundColor: day.completed ? 'hsl(27, 100%, 60%)' : 'hsl(var(--muted))',
                  opacity: day.completed ? 1 : 0.4,
                }}
                title={`${day.date}: ${day.completed ? '✅ Completed' : '❌ Missed'}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
        <span>Less</span>
        <div className="w-3 h-3 rounded-sm bg-muted/40" />
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(27, 100%, 60%)', opacity: 0.4 }} />
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(27, 100%, 60%)', opacity: 0.7 }} />
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(27, 100%, 60%)' }} />
        <span>More</span>
      </div>
    </ChartWrapper>
  );
};

export default StreakHeatmap;
