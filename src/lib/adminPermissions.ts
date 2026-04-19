export const PERMISSION_KEYS = [
  'manage_users',
  'manage_coaches',
  'manage_seekers',
  'manage_courses',
  'manage_payments',
  'manage_content',
  'view_analytics',
  'manage_settings',
] as const;

export type PermissionKey = typeof PERMISSION_KEYS[number];

export const PERMISSION_LABELS: Record<PermissionKey, string> = {
  manage_users: 'Manage Users',
  manage_coaches: 'Manage Coaches',
  manage_seekers: 'Manage Seekers',
  manage_courses: 'Manage Courses',
  manage_payments: 'Manage Payments',
  manage_content: 'Manage Content',
  view_analytics: 'View Analytics',
  manage_settings: 'Manage Settings',
};

export type AdminLevel = 'admin' | 'super_admin';

export interface AdminProfileLike {
  role?: string | null;
  admin_level?: string | null;
  admin_permissions?: Record<string, boolean> | null;
}

export function hasPermission(profile: AdminProfileLike | null | undefined, key: PermissionKey): boolean {
  if (!profile || profile.role !== 'admin') return false;
  if (profile.admin_level === 'super_admin') return true;
  return !!profile.admin_permissions?.[key];
}

export function permissionCount(perms: Record<string, boolean> | null | undefined): number {
  if (!perms) return 0;
  return PERMISSION_KEYS.filter(k => perms[k]).length;
}

export function allPermissionsTrue(): Record<PermissionKey, boolean> {
  return PERMISSION_KEYS.reduce((acc, k) => { acc[k] = true; return acc; }, {} as Record<PermissionKey, boolean>);
}
