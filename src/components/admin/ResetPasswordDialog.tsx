import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Eye, EyeOff, AlertTriangle, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { PASSWORD_HELP, validatePassword } from '@/lib/passwordValidation';

interface TargetUser {
  user_id: string;
  full_name: string;
  email: string;
  role: string;
}

interface Props {
  user: TargetUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ResetPasswordDialog = ({ user, open, onOpenChange }: Props) => {
  const [pwd, setPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setPwd('');
    setConfirm('');
    setShow(false);
  };

  const handleClose = (o: boolean) => {
    if (!o) reset();
    onOpenChange(o);
  };

  const handleSubmit = async () => {
    if (!user) return;
    const err = validatePassword(pwd);
    if (err) { toast.error(err); return; }
    if (pwd !== confirm) { toast.error('Passwords do not match'); return; }

    setSubmitting(true);
    const { data, error } = await supabase.functions.invoke('admin-reset-password', {
      body: { target_user_id: user.user_id, new_password: pwd },
    });
    setSubmitting(false);

    if (error || (data as any)?.error) {
      toast.error(`Reset failed: ${error?.message || (data as any)?.error}`);
      return;
    }
    if ((data as any)?.email_sent) {
      toast.success(`Password reset for ${user.full_name}. Email notification sent.`);
    } else {
      toast.success(`Password reset for ${user.full_name}. (Email not sent: ${(data as any)?.email_error || 'unknown'})`);
    }
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" />
            Reset Password
          </DialogTitle>
          <DialogDescription>
            Set a new password for this user. They will use it on their next login.
          </DialogDescription>
        </DialogHeader>

        {user && (
          <div className="rounded-md border bg-muted/40 p-3 space-y-1 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium">{user.full_name}</span>
              <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'coach' ? 'default' : 'secondary'}>
                {user.role}
              </Badge>
            </div>
            <div className="text-muted-foreground text-xs">{user.email}</div>
          </div>
        )}

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="new-pwd">New Password</Label>
            <div className="relative">
              <Input
                id="new-pwd"
                type={show ? 'text' : 'password'}
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                placeholder="Enter new password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShow(s => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">{PASSWORD_HELP}</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm-pwd">Confirm Password</Label>
            <Input
              id="confirm-pwd"
              type={show ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter new password"
            />
          </div>

          <div className="flex gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Communicate the new password to the user securely (in person, phone, or encrypted channel).
              An email notification will be sent to the user about this change.
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting || !pwd || !confirm}>
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Reset Password
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
