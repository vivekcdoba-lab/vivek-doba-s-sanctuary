import ChartWrapper from './ChartWrapper';
import { PILLAR_COLORS } from './chartColors';

interface LGTQuadrantProps {
  dharma: number;
  artha: number;
  kama: number;
  moksha: number;
  isLoading?: boolean;
}

const LGTQuadrant = ({ dharma, artha, kama, moksha, isLoading }: LGTQuadrantProps) => {
  const pillars = [
    { name: 'Dharma', emoji: '🕉️', subtitle: 'Purpose', score: dharma, color: PILLAR_COLORS.dharma },
    { name: 'Artha', emoji: '💰', subtitle: 'Wealth', score: artha, color: PILLAR_COLORS.artha },
    { name: 'Kama', emoji: '❤️', subtitle: 'Desire', score: kama, color: PILLAR_COLORS.kama },
    { name: 'Moksha', emoji: '☀️', subtitle: 'Liberation', score: moksha, color: PILLAR_COLORS.moksha },
  ];

  const avg = Math.round((dharma + artha + kama + moksha) / 4);

  return (
    <ChartWrapper title="LGT Balance" emoji="🔷" isLoading={isLoading} isEmpty={false}>
      <div className="grid grid-cols-2 gap-3">
        {pillars.map(p => (
          <div key={p.name} className="relative rounded-xl p-4 border border-border text-center overflow-hidden">
            <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundColor: p.color }} />
            <span className="text-2xl">{p.emoji}</span>
            <p className="text-xs text-muted-foreground mt-1">{p.subtitle}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: p.color }}>{p.score}</p>
            <div className="mt-2 h-1.5 rounded-full bg-muted/30 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${p.score}%`, backgroundColor: p.color }} />
            </div>
          </div>
        ))}
      </div>
      <div className="text-center mt-3">
        <span className="text-xs text-muted-foreground">LGT Balance: </span>
        <span className="text-sm font-bold text-primary">{avg}%</span>
      </div>
    </ChartWrapper>
  );
};

export default LGTQuadrant;
