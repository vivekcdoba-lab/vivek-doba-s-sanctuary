import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { Bell, Check, CheckCheck, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  message: string | null;
  session_id: string | null;
  action_url: string | null;
  is_read: boolean;
  created_at: string;
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!profile?.id) return;
    loadNotifications();

    // Realtime subscription
    const channel = supabase
      .channel(`notifications-${profile.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'session_notifications',
      }, (payload) => {
        const n = payload.new as Notification;
        setNotifications(prev => [n, ...prev]);
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [profile?.id]);

  const loadNotifications = async () => {
    if (!profile?.id) return;
    const { data } = await supabase
      .from('session_notifications')
      .select('*')
      .eq('recipient_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    }
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    if (unread.length === 0) return;
    
    await supabase
      .from('session_notifications')
      .update({ is_read: true })
      .in('id', unread.map(n => n.id));

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const handleClick = async (n: Notification) => {
    if (!n.is_read) {
      await supabase.from('session_notifications').update({ is_read: true }).eq('id', n.id);
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, is_read: true } : x));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setIsOpen(false);
    if (n.session_id) {
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
                notifications.map(n => {
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
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
