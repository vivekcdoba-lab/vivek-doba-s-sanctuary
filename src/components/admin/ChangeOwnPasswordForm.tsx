import { useState } from 'react';
import { Eye, EyeOff, Save, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { validatePassword, PASSWORD_HELP } from '@/lib/passwordValidation';

const ChangeOwnPasswordForm = () => {
  const { toast } = useToast();
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPwd) {
      toast({ title: 'Current password required', variant: 'destructive' });
      return;
    }
    const err = validatePassword(newPwd);
    if (err) {
      toast({ title: 'Invalid new password', description: err, variant: 'destructive' });
      return;
    }
    if (newPwd !== confirmPwd) {
      toast({ title: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    if (newPwd === currentPwd) {
      toast({ title: 'New password must differ from current password', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('super-admin-change-own-password', {
        body: { current_password: currentPwd, new_password: newPwd },
      });
      if (error) {
        // Try to surface server message
        let msg = error.message || 'Failed to change password';
        try {
          const ctx: any = (error as any).context;
          if (ctx?.body) {
            const parsed = typeof ctx.body === 'string' ? JSON.parse(ctx.body) : ctx.body;
            if (parsed?.error) msg = parsed.error;
          }
        } catch { /* ignore */ }
        toast({ title: 'Could not change password', description: msg, variant: 'destructive' });
        return;
      }
      if (data?.error) {
        toast({ title: 'Could not change password', description: data.error, variant: 'destructive' });
        return;
      }
      toast({
        title: '✅ Password changed',
        description: `${data?.notified ?? 0} admin(s) notified, ${data?.emailed ?? 0} email(s) sent.`,
      });
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
    } catch (e) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-border max-w-2xl">
      <div className="flex items-center gap-3 mb-2">
        <Shield className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Change Your Password</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        As Super Admin, you can change your own password here. All other administrators will be
        notified by email and in-app notification for security audit purposes.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="current_pwd">Current Password</Label>
          <div className="relative">
            <Input
              id="current_pwd"
              type={showCurrent ? 'text' : 'password'}
              value={currentPwd}
              onChange={(e) => setCurrentPwd(e.target.value)}
              autoComplete="current-password"
              disabled={submitting}
            />
            <button
              type="button"
              onClick={() => setShowCurrent(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="new_pwd">New Password</Label>
          <div className="relative">
            <Input
              id="new_pwd"
              type={showNew ? 'text' : 'password'}
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              autoComplete="new-password"
              disabled={submitting}
            />
            <button
              type="button"
              onClick={() => setShowNew(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">{PASSWORD_HELP}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm_pwd">Confirm New Password</Label>
          <div className="relative">
            <Input
              id="confirm_pwd"
              type={showConfirm ? 'text' : 'password'}
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              autoComplete="new-password"
              disabled={submitting}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="pt-2 flex items-center gap-3">
          <Button type="submit" disabled={submitting} className="gap-2">
            <Save className="w-4 h-4" /> {submitting ? 'Changing…' : 'Change Password'}
          </Button>
          <span className="text-xs text-muted-foreground">
            All admins will receive a security notice email.
          </span>
        </div>
      </form>
    </div>
  );
};

export default ChangeOwnPasswordForm;
