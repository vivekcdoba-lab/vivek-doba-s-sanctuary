import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { passwordAgeDays, PASSWORD_AGE_REMINDER_DAYS } from '@/lib/passwordValidation';

/**
 * Non-blocking banner reminding admins/coaches to rotate their password
 * every 90 days. Seekers are exempt.
 */
const DISMISS_KEY = 'pwd-rotation-dismissed-until';

const PasswordRotationBanner = () => {
  const { profile } = useAuthStore();
  const [ageDays, setAgeDays] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!profile?.user_id) return;
    if (profile.role !== 'admin' && profile.role !== 'coach') return;

    // Check dismissal (snooze for 7 days at a time)
    const until = localStorage.getItem(DISMISS_KEY);
    if (until && Date.now() < Number(until)) {
      setDismissed(true);
      return;
    }

    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('password_changed_at')
        .eq('user_id', profile.user_id)
        .maybeSingle();
      const days = passwordAgeDays((data as any)?.password_changed_at ?? null);
      setAgeDays(days);
    })();
  }, [profile?.user_id, profile?.role]);

  if (dismissed || ageDays === null || ageDays < PASSWORD_AGE_REMINDER_DAYS) return null;

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now() + 7 * 24 * 60 * 60 * 1000));
    setDismissed(true);
  };

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 flex items-center gap-3 text-sm">
      <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
      <span className="flex-1 text-amber-900 dark:text-amber-200">
        Your password is <strong>{ageDays} days old</strong>. For security, we recommend updating it every {PASSWORD_AGE_REMINDER_DAYS} days.{' '}
        <Link to="/admin/settings" className="underline font-medium">Update password</Link>
      </span>
      <button
        onClick={handleDismiss}
        aria-label="Dismiss for 7 days"
        className="text-amber-700/70 hover:text-amber-900 transition"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default PasswordRotationBanner;
