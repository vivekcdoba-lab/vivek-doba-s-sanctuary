import { PILLAR_COLORS } from '@/components/charts/chartColors';

interface LGTBalanceWheelProps {
  dharma: number;
  artha: number;
  kama: number;
  moksha: number;
}

const LGTBalanceWheel = ({ dharma, artha, kama, moksha }: LGTBalanceWheelProps) => {
  const pillars = [
    { label: 'Dharma', emoji: '🕉️', value: dharma, color: PILLAR_COLORS.dharma },
    { label: 'Artha', emoji: '💰', value: artha, color: PILLAR_COLORS.artha },
    { label: 'Kama', emoji: '❤️', value: kama, color: PILLAR_COLORS.kama },
    { label: 'Moksha', emoji: '☀️', value: moksha, color: PILLAR_COLORS.moksha },
  ];

  const allZero = pillars.every(p => p.value === 0);
  const lowest = pillars.reduce((a, b) => (a.value < b.value ? a : b));

  return (
    <div className="bg-card rounded-2xl shadow-md border border-border p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">🔷 LGT Balance Wheel</h3>
      {allZero ? (
        <div className="text-center py-6">
          <p className="text-3xl mb-2">📊</p>
          <p className="text-sm text-muted-foreground">No LGT data yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Fill your daily worksheet or take an LGT assessment to see your balance.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            {pillars.map((p) => (
              <div key={p.label} className="rounded-xl border border-border p-3 text-center">
                <span className="text-lg">{p.emoji}</span>
                <p className="text-xs text-muted-foreground mt-1">{p.label}</p>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div className="h-2 rounded-full transition-all duration-1000" style={{ width: `${p.value}%`, backgroundColor: p.color }} />
                </div>
                <p className="text-sm font-bold text-foreground mt-1">{p.value}%</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">⚠️ Focus on <span className="font-semibold text-foreground">{lowest.label}</span></p>
        </>
      )}
    </div>
  );
};

export default LGTBalanceWheel;
