import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const HEARTBEAT_INTERVAL = 3 * 60 * 1000; // 3 minutes
const INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 60 minutes
const INACTIVITY_CHECK_INTERVAL = 30 * 1000; // 30 seconds

export function useSessionHeartbeat() {
  const { sessionId, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inactivityRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastActivityRef = useRef(Date.now());

  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  const forceLogout = useCallback(async (message: string) => {
    await logout();
    toast.error(message);
    navigate('/login');
  }, [logout, navigate]);

  const sendHeartbeat = async () => {
    if (!sessionId || !user) return;
    try {
      // Get fresh access token — if expired, force logout
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      if (!accessToken) {
        await forceLogout('Session expired. Please log in again.');
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/session-heartbeat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ action: 'heartbeat', session_id: sessionId }),
        }
      );

      if (response.status === 401) {
        await forceLogout('Session expired. Please log in again.');
        return;
      }

      const data = await response.json();
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
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

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
      events.forEach(e => window.removeEventListener(e, updateActivity));
    };
  }, [sessionId, user?.id]);
}
