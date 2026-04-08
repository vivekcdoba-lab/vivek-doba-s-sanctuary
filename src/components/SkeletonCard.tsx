const SkeletonCard = ({ lines = 3 }: { lines?: number }) => (
  <div className="bg-card rounded-xl p-5 border border-border space-y-3 animate-fade-in">
    <div className="skeleton h-4 w-2/3" />
    {Array.from({ length: lines - 1 }).map((_, i) => (
      <div key={i} className="skeleton h-3" style={{ width: `${70 + Math.random() * 30}%` }} />
    ))}
    <div className="skeleton h-8 w-1/3 mt-2" />
  </div>
);

export const SkeletonList = ({ count = 4, lines = 3 }: { count?: number; lines?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} lines={lines} />
    ))}
  </div>
);

export const SkeletonDashboard = () => (
  <div className="space-y-5">
    <div className="skeleton h-24 rounded-2xl" />
    <div className="grid grid-cols-3 gap-3">
      {[1, 2, 3].map(i => <div key={i} className="skeleton h-20 rounded-xl" />)}
    </div>
    <div className="skeleton h-16 rounded-xl" />
    <div className="grid grid-cols-3 gap-3">
      {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton h-20 rounded-xl" />)}
    </div>
    <div className="skeleton h-40 rounded-xl" />
  </div>
);

export default SkeletonCard;
