import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { Bell, CheckCheck, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface BellNotification {
  id: string;
  source: 'session' | 'general';
  type: string;
  title: string;
  body: string | null;
  is_read: boolean;
  created_at: string;
  action_url: string | null;
  session_id: string | null;
}

const TYPE_CONFIG: Record<string, { emoji: string }> = {
  session_assigned: { emoji: '📋' },
  session_submitted: { emoji: '📤' },
  session_approved: { emoji: '✅' },
  revision_requested: { emoji: '🔄' },
  assignment_due: { emoji: '⏰' },
  comment_added: { emoji: '💬' },
  session_reminder: { emoji: '📅' },
  badge_earned: { emoji: '🏆' },
  coach_message: { emoji: '💬' },
  announcement: { emoji: '📢' },
  streak_warning: { emoji: '🔥' },
  payment_reminder: { emoji: '💳' },
  system: { emoji: '⚙️' },
};

const NotificationBell = () => {
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<BellNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!profile?.id) return;
    loadNotifications();

    // Realtime for session_notifications
    const ch1 = supabase
      .channel(`bell-session-${profile.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'session_notifications' }, (payload) => {
        const n = payload.new as any;
        const mapped: BellNotification = {
          id: n.id, source: 'session', type: n.type, title: n.title,
          body: n.body, is_read: false, created_at: n.created_at,
          action_url: null, session_id: n.session_id,
        };
        setNotifications(prev => [mapped, ...prev].slice(0, 20));
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();

    // Realtime for notifications
    const ch2 = supabase
      .channel(`bell-general-${profile.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${profile.id}` }, (payload) => {
        const n = payload.new as any;
        const mapped: BellNotification = {
          id: n.id, source: 'general', type: n.type, title: n.title,
          body: n.message, is_read: false, created_at: n.created_at,
          action_url: n.action_url, session_id: null,
        };
        setNotifications(prev => [mapped, ...prev].slice(0, 20));
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ch1);
      supabase.removeChannel(ch2);
    };
  }, [profile?.id]);

  const loadNotifications = async () => {
    if (!profile?.id) return;

    const [sessionRes, generalRes] = await Promise.all([
      supabase.from('session_notifications').select('*').eq('recipient_id', profile.id).order('created_at', { ascending: false }).limit(10),
      supabase.from('notifications').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(10),
    ]);

    const sessionNotifs: BellNotification[] = (sessionRes.data || []).map((n: any) => ({
      id: n.id, source: 'session' as const, type: n.type, title: n.title,
      body: n.body, is_read: n.is_read, created_at: n.created_at,
      action_url: null, session_id: n.session_id,
    }));

    const generalNotifs: BellNotification[] = (generalRes.data || []).map((n: any) => ({
      id: n.id, source: 'general' as const, type: n.type, title: n.title,
      body: n.message, is_read: n.is_read, created_at: n.created_at,
      action_url: n.action_url, session_id: null,
    }));

    const merged = [...sessionNotifs, ...generalNotifs]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 20);

    setNotifications(merged);
    setUnreadCount(merged.filter(n => !n.is_read).length);
  };

  const markAllRead = async () => {
    const unreadSession = notifications.filter(n => !n.is_read && n.source === 'session');
    const unreadGeneral = notifications.filter(n => !n.is_read && n.source === 'general');

    const promises: PromiseLike<any>[] = [];
    if (unreadSession.length) {
      promises.push(supabase.from('session_notifications').update({ is_read: true }).in('id', unreadSession.map(n => n.id)));
    }
    if (unreadGeneral.length) {
      promises.push(supabase.from('notifications').update({ is_read: true }).in('id', unreadGeneral.map(n => n.id)));
    }
    await Promise.all(promises);

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const handleClick = async (n: BellNotification) => {
    if (!n.is_read) {
      const table = n.source === 'session' ? 'session_notifications' : 'notifications';
      await supabase.from(table).update({ is_read: true }).eq('id', n.id);
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, is_read: true } : x));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setIsOpen(false);

    if (n.action_url) {
      navigate(n.action_url);
    } else if (n.session_id) {
      const isAdmin = profile?.role === 'admin';
      navigate(isAdmin ? `/sessions/${n.session_id}/review` : `/seeker/sessions/${n.session_id}/certify`);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-muted relative"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
      >
        <Bell className="w-5 h-5 text-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-destructive text-[10px] text-destructive-foreground flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-12 z-50 w-80 bg-card border border-border rounded-xl shadow-xl">
            <div className="flex items-center justify-between p-3 border-b border-border">
              <h4 className="text-sm font-semibold text-foreground">Notifications</h4>
              <div className="flex gap-1">
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-[10px] text-primary hover:underline flex items-center gap-1" aria-label="Mark all as read">
                    <CheckCheck className="w-3 h-3" /> Mark all read
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="p-1 rounded hover:bg-muted ml-2" aria-label="Close">
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-30" />
                  <p className="text-xs text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                <>
                  {notifications.slice(0, 5).map(n => {
                    const cfg = TYPE_CONFIG[n.type] || { emoji: '📋' };
                    return (
                      <button
                        key={n.id}
                        onClick={() => handleClick(n)}
                        className={`w-full text-left p-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors ${
                          !n.is_read ? 'bg-primary/5' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-sm mt-0.5">{cfg.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs ${!n.is_read ? 'font-semibold text-foreground' : 'text-foreground/80'}`}>
                              {n.title}
                            </p>
                            {n.body && (
                              <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{n.body}</p>
                            )}
                            <p className="text-[10px] text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                            </p>
                          </div>
                          {!n.is_read && (
                            <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                  <button
                    onClick={() => { setIsOpen(false); navigate('/seeker/notifications'); }}
                    className="w-full text-center p-2.5 text-xs text-primary hover:underline font-medium border-t border-border"
                  >
                    See all notifications
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
