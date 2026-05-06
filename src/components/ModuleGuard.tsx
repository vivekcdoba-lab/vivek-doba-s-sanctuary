import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useMyModuleAccess } from '@/hooks/useSeekerModuleAccess';
import { canAccessModule } from '@/lib/canAccessModule';
import { moduleForPath, KEY_TO_MODULE } from '@/config/seekerModules';

interface Props {
  moduleKey?: string;
  children: ReactNode;
}

function ModuleDisabled({ label }: { label?: string }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md text-center bg-card border border-border rounded-2xl p-8 shadow-sm">
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-2">
          {label ? `${label} is locked` : 'This feature is locked'}
        </h2>
        <p className="text-sm text-muted-foreground">
          This module isn’t enabled for your account yet. Please contact your coach to request access.
        </p>
      </div>
    </div>
  );
}

export default function ModuleGuard({ moduleKey, children }: Props) {
  const location = useLocation();
  const { accessMap, isLoading, isSeeker } = useMyModuleAccess();

  // Non-seekers (admin, coach impersonation) bypass entirely
  if (!isSeeker) return <>{children}</>;

  const resolvedKey = moduleKey || moduleForPath(location.pathname)?.key;
  const mod = resolvedKey ? KEY_TO_MODULE[resolvedKey] : undefined;

  if (mod?.alwaysOn) return <>{children}</>;
  if (isLoading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (canAccessModule(resolvedKey, accessMap)) return <>{children}</>;
  return <ModuleDisabled label={mod?.label} />;
}
