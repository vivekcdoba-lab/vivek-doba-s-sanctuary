import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Lock, Loader2, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { validatePassword, PASSWORD_HELP } from '@/lib/passwordValidation';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const forced = searchParams.get('forced') === '1';

  useEffect(() => {
    // Forced flow uses the user's existing logged-in session (no recovery token).
    if (forced) {
      supabase.auth.getSession().then(({ data }) => {
        setHasSession(!!data.session);
      });
      return;
    }

    // Standard recovery via emailed reset link
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) setIsRecovery(true);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setIsRecovery(true);
    });
    return () => subscription.unsubscribe();
  }, [forced]);

  const handleReset = async () => {
    const err = validatePassword(password);
    if (err) { toast.error(err); return; }
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast.error(error.message);
        return;
      }

      // Clear the must_change_password / password_change_prompted flags so the
      // user is not bounced back here on next login.
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ must_change_password: false, password_change_prompted: true })
          .eq('user_id', user.id);
      }

      toast.success('Password updated successfully! 🙏');

      if (forced && user) {
        // Route to the user's home based on role
        const { data: prof } = await supabase
          .from('profiles').select('role').eq('user_id', user.id).maybeSingle();
        const role = prof?.role || 'seeker';
        if (role === 'admin') navigate('/dashboard', { replace: true });
        else if (role === 'coach') navigate('/coaching', { replace: true });
        else navigate('/seeker/home', { replace: true });
      } else {
        navigate('/login');
      }
    } catch {
      toast.error('Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  // Forced first-login flow: use the live auth session, not the recovery token
  if (forced) {
    if (!hasSession) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="bg-card rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-border">
            <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Please sign in first</h2>
            <p className="text-muted-foreground text-sm mb-6">You need to be logged in to set your new password.</p>
            <button onClick={() => navigate('/login')} className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90">
              Go to Login
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="bg-card rounded-2xl shadow-xl p-8 max-w-md w-full border border-border">
          <div className="text-center mb-4">
            <Lock className="w-10 h-10 text-primary mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-foreground">Set Your Password</h2>
            <p className="text-muted-foreground text-sm mt-1">Welcome 🙏 — please choose a personal password to continue.</p>
          </div>

          <div className="rounded-lg border border-primary/40 bg-primary/10 p-3 mb-5 flex items-start gap-2 text-sm">
            <AlertTriangle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <span className="text-foreground">You must set a new password to access your account. The temporary password we emailed you will no longer work.</span>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">{PASSWORD_HELP}</p>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Confirm new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <button onClick={handleReset} disabled={loading}
            className="w-full mt-6 py-3 rounded-xl font-semibold text-primary-foreground gradient-saffron hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '🔐'} Set Password & Continue
          </button>
        </div>
      </div>
    );
  }

  // Standard email-recovery flow (existing behavior)
  if (!isRecovery) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="bg-card rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-border">
          <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Invalid Reset Link</h2>
          <p className="text-muted-foreground text-sm mb-6">This password reset link is invalid or has expired.</p>
          <button onClick={() => navigate('/login')} className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90">
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="bg-card rounded-2xl shadow-xl p-8 max-w-md w-full border border-border">
        <div className="text-center mb-6">
          <Lock className="w-10 h-10 text-primary mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-foreground">Set New Password</h2>
          <p className="text-muted-foreground text-sm mt-1">Enter your new password below</p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">{PASSWORD_HELP}</p>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Confirm new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <button onClick={handleReset} disabled={loading}
          className="w-full mt-6 py-3 rounded-xl font-semibold text-primary-foreground gradient-saffron hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '🔐'} Update Password
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;
