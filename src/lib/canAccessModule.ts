import { KEY_TO_MODULE } from '@/config/seekerModules';

export function canAccessModule(
  moduleKey: string | undefined | null,
  accessMap: Record<string, boolean> | undefined,
): boolean {
  if (!moduleKey) return true; // unknown modules are not gated by this system
  const m = KEY_TO_MODULE[moduleKey];
  if (m?.alwaysOn) return true;
  if (!accessMap) return false;
  return accessMap[moduleKey] === true;
}
