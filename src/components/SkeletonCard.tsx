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

export const SkeletonAvatar = ({ size = 48 }: { size?: number }) => (
  <div className="skeleton rounded-full animate-pulse" style={{ width: size, height: size }} />
);

export const SkeletonTable = ({ rows = 5 }: { rows?: number }) => (
  <div className="bg-card rounded-xl border border-border overflow-hidden">
    <div className="flex gap-4 p-3 border-b border-border">
      {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-3 flex-1" />)}
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 p-3 border-b border-border last:border-b-0">
        {[1, 2, 3, 4].map(j => (
          <div key={j} className="skeleton h-3 flex-1" style={{ width: `${50 + Math.random() * 50}%` }} />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonCalendar = () => (
  <div className="bg-card rounded-xl border border-border p-4 space-y-3">
    <div className="flex justify-between items-center">
      <div className="skeleton h-4 w-24" />
      <div className="flex gap-2">
        <div className="skeleton h-8 w-8 rounded-lg" />
        <div className="skeleton h-8 w-8 rounded-lg" />
      </div>
    </div>
    <div className="grid grid-cols-7 gap-2">
      {Array.from({ length: 7 }).map((_, i) => <div key={i} className="skeleton h-3 w-8 mx-auto" />)}
      {Array.from({ length: 35 }).map((_, i) => <div key={i} className="skeleton h-8 rounded-lg" />)}
    </div>
  </div>
);

export default SkeletonCard;
