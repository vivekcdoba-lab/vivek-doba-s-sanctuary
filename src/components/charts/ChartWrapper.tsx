import { ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChartWrapperProps {
  title: string;
  emoji?: string;
  children: ReactNode;
  isEmpty?: boolean;
  isLoading?: boolean;
  emptyMessage?: string;
  emptyEmoji?: string;
  onRefresh?: () => void;
  className?: string;
  action?: ReactNode;
}

const ChartWrapper = ({
  title, emoji, children, isEmpty, isLoading, emptyMessage, emptyEmoji = '📊',
  onRefresh, className = '', action,
}: ChartWrapperProps) => (
  <div className={`bg-card rounded-xl border border-border shadow-sm overflow-hidden animate-fade-in ${className}`}>
    <div className="flex items-center justify-between px-4 pt-4 pb-2">
      <h3 className="font-semibold text-foreground text-sm flex items-center gap-1.5">
        {emoji && <span>{emoji}</span>} {title}
      </h3>
      <div className="flex items-center gap-2">
        {action}
        {onRefresh && (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onRefresh}>
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </div>
    <div className="px-4 pb-4">
      {isLoading ? (
        <div className="space-y-3 py-4">
          <div className="skeleton h-4 w-3/4" />
          <div className="skeleton h-32 rounded-lg" />
        </div>
      ) : isEmpty ? (
        <div className="text-center py-8">
          <p className="text-3xl mb-2">{emptyEmoji}</p>
          <p className="text-sm text-muted-foreground">{emptyMessage || 'No data available yet.'}</p>
        </div>
      ) : children}
    </div>
  </div>
);

export default ChartWrapper;
