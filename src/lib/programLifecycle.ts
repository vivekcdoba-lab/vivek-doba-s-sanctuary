export type LifecycleStatus = 'active' | 'upcoming' | 'completed' | 'deactivated';

export const LIFECYCLE_STATUSES: LifecycleStatus[] = ['active', 'upcoming', 'completed', 'deactivated'];

export const LIFECYCLE_LABELS: Record<LifecycleStatus, string> = {
  active: 'Active',
  upcoming: 'Upcoming',
  completed: 'Completed',
  deactivated: 'Deactivated',
};

// Tailwind classes using semantic-ish utility colors. Avoid raw white/black.
export const LIFECYCLE_BADGE_CLASSES: Record<LifecycleStatus, string> = {
  active: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30',
  upcoming: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30',
  completed: 'bg-muted text-muted-foreground border border-border',
  deactivated: 'bg-destructive/15 text-destructive border border-destructive/30',
};

export const isActiveFlagFor = (status: LifecycleStatus): boolean => status !== 'deactivated';
