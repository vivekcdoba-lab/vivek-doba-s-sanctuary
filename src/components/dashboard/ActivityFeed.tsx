interface ActivityItem {
  id: string;
  emoji: string;
  text: string;
  time: string;
}

interface ActivityFeedProps {
  items: ActivityItem[];
}

const ActivityFeed = ({ items }: ActivityFeedProps) => (
  <div className="bg-card rounded-2xl shadow-md border border-border p-5">
    <h3 className="text-sm font-semibold text-foreground mb-3">📋 Recent Activity</h3>
    <div className="space-y-2 max-h-60 overflow-y-auto">
      {items.map((item) => (
        <div key={item.id} className="flex items-start gap-2 p-2 rounded-lg bg-muted/30">
          <span className="text-sm">{item.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground truncate">{item.text}</p>
            <p className="text-[10px] text-muted-foreground">{item.time}</p>
          </div>
        </div>
      ))}
      {items.length === 0 && <p className="text-sm text-muted-foreground text-center">No recent activity</p>}
    </div>
  </div>
);

export default ActivityFeed;
