import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  emoji: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionPath?: string;
  onAction?: () => void;
}

export default function EmptyState({ emoji, title, description, actionLabel, actionPath, onAction }: EmptyStateProps) {
  return (
    <div className="bg-card rounded-2xl border border-border p-10 text-center animate-fade-in">
      <span className="text-5xl block mb-4">{emoji}</span>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-5 max-w-xs mx-auto">{description}</p>
      {actionLabel && actionPath && (
        <Button asChild className="btn-press">
          <Link to={actionPath}>{actionLabel}</Link>
        </Button>
      )}
      {actionLabel && onAction && !actionPath && (
        <Button onClick={onAction} className="btn-press">{actionLabel}</Button>
      )}
    </div>
  );
}
