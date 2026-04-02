import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BadgeNotification {
  id: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

export function useBadgeNotifications(seekerId: string | null) {
  const [notifications, setNotifications] = useState<BadgeNotification[]>([]);

  const fetchUnread = useCallback(async () => {
    if (!seekerId) return;
    const { data } = await supabase
      .from('worksheet_notifications')
      .select('id, message, created_at, is_read')
      .eq('seeker_id', seekerId)
      .eq('notification_type', 'badge_earned')
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(5);
    setNotifications((data || []) as BadgeNotification[]);
  }, [seekerId]);

  const dismiss = useCallback(async (id: string) => {
    await supabase
      .from('worksheet_notifications')
      .update({ is_read: true })
      .eq('id', id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const dismissAll = useCallback(async () => {
    if (!notifications.length) return;
    const ids = notifications.map(n => n.id);
    await supabase
      .from('worksheet_notifications')
      .update({ is_read: true })
      .in('id', ids);
    setNotifications([]);
  }, [notifications]);

  useEffect(() => {
    fetchUnread();
  }, [fetchUnread]);

  return { notifications, dismiss, dismissAll, refresh: fetchUnread };
}
