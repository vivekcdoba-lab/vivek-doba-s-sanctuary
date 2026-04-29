import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const HEARTBEAT_INTERVAL = 2 * 60 * 1000; // 2 minutes
const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const INACTIVITY_CHECK_INTERVAL = 15 * 1000; // 15 seconds

export function useSessionHeartbeat() {
  const { sessionId, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inactivityRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastActivityRef = useRef(Date.now());

  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  const forceLogout = useCallback(async (message: string, silent = false) => {
    await logout();
    if (!silent) toast.error(message);
    if (window.location.pathname !== '/login') navigate('/login');
  }, [logout, navigate]);

  const sendHeartbeat = async () => {
    if (!sessionId || !user) return;
    // Skip on auth pages
    if (window.location.pathname === '/login' || window.location.pathname === '/reset-password') return;
    try {
      // Helper: get a fresh access token, refreshing if expiring within 60s
      const getFreshToken = async (forceRefresh = false): Promise<string | null> => {
        if (forceRefresh) {
          const { data } = await supabase.auth.refreshSession();
          return data?.session?.access_token || null;
        }
        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData?.session;
        if (!session?.access_token) return null;
        const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
        if (expiresAt && expiresAt - Date.now() < 60_000) {
          const { data } = await supabase.auth.refreshSession();
          return data?.session?.access_token || session.access_token;
        }
        return session.access_token;
      };

      const callHeartbeat = async (token: string) =>
        fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/session-heartbeat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ action: 'heartbeat', session_id: sessionId }),
        });

      let accessToken = await getFreshToken();
      if (!accessToken) {
        await forceLogout('Session expired. Please log in again.', true);
        return;
      }

      let response = await callHeartbeat(accessToken);

      // One-shot retry on 401 (token may have just rotated)
      if (response.status === 401) {
        if (window.location.pathname === '/reset-password') return;
        const refreshed = await getFreshToken(true);
        if (refreshed) {
          response = await callHeartbeat(refreshed);
        }
      }

      if (response.status === 401) {
        // Still 401 after refresh attempt — really expired
        if (window.location.pathname === '/reset-password') return;
        await forceLogout('Session expired. Please log in again.', true);
        return;
      }

      // 5xx = transient edge runtime error → ignore this tick
      if (response.status >= 500) return;

      const data = await response.json().catch(() => null);
      if (data && !data.active) {
        await logout();
        toast.error(data.reason === 'forced'
          ? 'You have been logged in from another device'
          : 'Session expired due to inactivity');
        navigate('/login');
      }
    } catch {
      // Silently fail heartbeat
    }
  };

  useEffect(() => {
    if (!sessionId || !user) return;
    // Don't run heartbeat / inactivity on auth pages
    if (window.location.pathname === '/login' || window.location.pathname === '/reset-password') return;

    // Reset activity on mount
    lastActivityRef.current = Date.now();

    // Initial heartbeat
    sendHeartbeat();

    intervalRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

    // Visibility change handler
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        updateActivity();
        sendHeartbeat();
      } else if (document.visibilityState === 'hidden') {
        // Tab/browser is being hidden — fire a best-effort end beacon
        // so the server-side session is closed promptly. The browser
        // may or may not be coming back; if it does, the next heartbeat
        // will re-establish status.
        endViaBeacon();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Browser/tab close — sendBeacon is the only delivery the browser
    // guarantees during unload. Closes the session immediately so the
    // user is forced to re-login when they return.
    const handlePageHide = () => endViaBeacon();
    window.addEventListener('pagehide', handlePageHide);

    // Activity listeners
    const events = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'];
    events.forEach(e => window.addEventListener(e, updateActivity, { passive: true }));

    // Inactivity check
    inactivityRef.current = setInterval(() => {
      if (Date.now() - lastActivityRef.current > INACTIVITY_TIMEOUT) {
        forceLogout('Session expired due to inactivity');
      }
    }, INACTIVITY_CHECK_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (inactivityRef.current) clearInterval(inactivityRef.current);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('pagehide', handlePageHide);
      events.forEach(e => window.removeEventListener(e, updateActivity));
    };
  }, [sessionId, user?.id]);
}

// Best-effort session close on tab/browser hide. Uses sendBeacon (which
// can't set Authorization headers) so we hit a public endpoint that only
// closes the matching active session — never elevates privileges.
function endViaBeacon() {
  try {
    const sessionId = (typeof window !== 'undefined')
      ? (window.sessionStorage.getItem('vdts_session_id') ||
         window.localStorage.getItem('vdts_session_id'))
      : null;
    if (!sessionId) return;
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/session-heartbeat`;
    const payload = JSON.stringify({ action: 'end_beacon', session_id: sessionId });
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon(url, blob);
    } else {
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  } catch { /* ignore */ }
}
