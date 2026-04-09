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
      const { data, error } = await supabase.functions.invoke('session-heartbeat', {
        body: { action: 'heartbeat', session_id: sessionId },
      });

      if (error) return;

      if (data && !data.active) {
        const reason = data.reason;
        await logout();
        if (reason === 'forced') {
          toast.error('You have been logged in from another device');
        } else {
          toast.error('Session expired due to inactivity');
        }
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
