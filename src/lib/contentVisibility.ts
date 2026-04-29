export type ContentVisibility = 'admin_only' | 'admin_coach' | 'all';

export const VISIBILITY_OPTIONS: { value: ContentVisibility; label: string; description: string }[] = [
  { value: 'admin_only', label: 'Admin only', description: 'Hidden from coaches and seekers. Useful for drafts.' },
  { value: 'admin_coach', label: 'Admin + Coach', description: 'Visible to admins and coaches only. Hidden from seekers.' },
  { value: 'all', label: 'Everyone', description: 'Visible to admins, coaches and all seekers.' },
];

export const visibilityLabel = (v?: string | null): string => {
  switch (v) {
    case 'admin_only': return 'Admin only';
    case 'admin_coach': return 'Admin + Coach';
    case 'all':
    default: return 'Everyone';
  }
};

export const visibilityBadgeClass = (v?: string | null): string => {
  switch (v) {
    case 'admin_only': return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
    case 'admin_coach': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    case 'all':
    default: return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
  }
};
