import { Link } from 'react-router-dom';

const RECOMMENDATIONS = [
  {
    type: '📖',
    label: 'RECOMMENDED READING',
    title: 'Artha Mastery - Chapter 5: SWOT Analysis',
    time: '15 min read',
    action: 'Start Reading',
    path: '/seeker/learning/pdfs',
  },
  {
    type: '🎬',
    label: 'WATCH THIS',
    title: 'Department Health Assessment - How to Score',
    time: '12 min video',
    action: 'Watch Now',
    path: '/seeker/learning/videos',
  },
  {
    type: '✅',
    label: 'DO THIS TODAY',
    title: 'Complete your Business SWOT Analysis',
    time: '🏅 +25 Points',
    action: 'Start Now',
    path: '/seeker/artha/swot',
  },
];

export default function SmartRecommendations({ lgtScores }: { lgtScores?: { dharma: number; artha: number; kama: number; moksha: number } }) {
  const scores = lgtScores || { dharma: 72, artha: 45, kama: 68, moksha: 55 };
  const lowest = Object.entries(scores).reduce((a, b) => (b[1] < a[1] ? b : a));
  const focusDim = lowest[0];
  const focusPercent = lowest[1];

  const dimNames: Record<string, string> = { dharma: 'DHARMA', artha: 'ARTHA', kama: 'KAMA', moksha: 'MOKSHA' };
  const dimEmojis: Record<string, string> = { dharma: '🕉️', artha: '💰', kama: '❤️', moksha: '☀️' };

  return (
    <div className="bg-card rounded-2xl shadow-md border border-border overflow-hidden">
      <div className="h-1.5 gradient-growth" />
      <div className="p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1">💡 आपके लिए सुझाव (Recommended for You)</h3>
        <p className="text-[10px] text-muted-foreground mb-3">Based on your LGT scores</p>

        <div className="p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 mb-3">
          <p className="text-xs text-foreground">
            ⚠️ Your <strong>{dimEmojis[focusDim]} {dimNames[focusDim]}</strong> score is {focusPercent}% - Focus on growth here
          </p>
        </div>

        <div className="space-y-2">
          {RECOMMENDATIONS.map((rec, i) => (
            <Link key={i} to={rec.path} className="block p-3 rounded-xl bg-muted/30 border border-border hover:bg-muted/50 transition-colors">
              <p className="text-[10px] text-muted-foreground font-semibold">{rec.type} {rec.label}</p>
              <p className="text-sm font-medium text-foreground mt-0.5">{rec.title}</p>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[10px] text-muted-foreground">⏱️ {rec.time}</span>
                <span className="text-xs text-primary font-medium">{rec.action} →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
