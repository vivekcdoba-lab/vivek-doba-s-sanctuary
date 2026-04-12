interface ProgressCardProps {
  current: number;
  total: number;
  label: string;
  emoji: string;
}

const ProgressCard = ({ current, total, label, emoji }: ProgressCardProps) => {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  const circumference = 2 * Math.PI * 22;
  const offset = circumference - (circumference * pct) / 100;

  return (
    <div className="bg-card rounded-2xl shadow-md border border-border overflow-hidden">
      <div className="h-1.5 gradient-sacred" />
      <div className="p-4 text-center">
        <svg className="w-12 h-12 mx-auto mb-1" viewBox="0 0 50 50">
          <circle cx="25" cy="25" r="22" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
          <circle cx="25" cy="25" r="22" fill="none" stroke="hsl(var(--primary))" strokeWidth="4"
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round" transform="rotate(-90 25 25)" className="transition-all duration-1000" />
          <text x="25" y="25" textAnchor="middle" dominantBaseline="middle" className="fill-foreground font-bold" style={{ fontSize: '10px' }}>
            {pct}%
          </text>
        </svg>
        <p className="text-sm font-semibold text-foreground">{emoji} Day {current}/{total}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
};

export default ProgressCard;
