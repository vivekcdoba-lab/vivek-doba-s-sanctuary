import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const HEARTBEAT_INTERVAL = 3 * 60 * 1000; // 3 minutes

export function useSessionHeartbeat() {
  const { sessionId, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sendHeartbeat = async () => {
    if (!sessionId || !user) return;
    try {
      const { data, error } = await supabase.functions.invoke('session-heartbeat', {
        body: { action: 'heartbeat', session_id: sessionId },
      });

      if (error) return;

      if (data && !data.active) {
        // Session was closed (forced or auto)
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

    // Initial heartbeat
    sendHeartbeat();

    intervalRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

    // Visibility change handler
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        sendHeartbeat();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [sessionId, user?.id]);
}
