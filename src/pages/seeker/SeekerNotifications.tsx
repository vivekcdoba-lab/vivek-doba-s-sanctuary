import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { formatDistanceToNow, isToday, isYesterday, subDays, isAfter } from 'date-fns';
import { Bell, CheckCheck, Trash2, Filter, Settings, Calendar, FileText, Trophy, MessageSquare, Megaphone, Flame, CreditCard, Cog, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BackToHome from '@/components/BackToHome';

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  action_url: string | null;
  is_read: boolean;
  created_at: string;
}

const TYPE_CONFIG: Record<string, { emoji: string; icon: typeof Bell; color: string; label: string }> = {
  session_reminder: { emoji: '📅', icon: Calendar, color: 'bg-primary/10 text-primary', label: 'Session' },
  assignment_due: { emoji: '📝', icon: FileText, color: 'bg-amber-500/10 text-amber-600', label: 'Assignment' },
  badge_earned: { emoji: '🏆', icon: Trophy, color: 'bg-yellow-500/10 text-yellow-600', label: 'Badge' },
  coach_message: { emoji: '💬', icon: MessageSquare, color: 'bg-blue-500/10 text-blue-600', label: 'Coach' },
  announcement: { emoji: '📢', icon: Megaphone, color: 'bg-purple-500/10 text-purple-600', label: 'Announcement' },
  streak_warning: { emoji: '🔥', icon: Flame, color: 'bg-orange-500/10 text-orange-600', label: 'Streak' },
  payment_reminder: { emoji: '💳', icon: CreditCard, color: 'bg-green-500/10 text-green-600', label: 'Payment' },
  system: { emoji: '⚙️', icon: Cog, color: 'bg-muted text-muted-foreground', label: 'System' },
};

const groupByDate = (items: Notification[]) => {
  const groups: { label: string; items: Notification[] }[] = [];
  const today: Notification[] = [];
  const yesterday: Notification[] = [];
  const thisWeek: Notification[] = [];
  const earlier: Notification[] = [];
  const weekAgo = subDays(new Date(), 7);

  items.forEach(n => {
    const d = new Date(n.created_at);
    if (isToday(d)) today.push(n);
    else if (isYesterday(d)) yesterday.push(n);
    else if (isAfter(d, weekAgo)) thisWeek.push(n);
    else earlier.push(n);
  });

  if (today.length) groups.push({ label: 'Today', items: today });
  if (yesterday.length) groups.push({ label: 'Yesterday', items: yesterday });
  if (thisWeek.length) groups.push({ label: 'This Week', items: thisWeek });
  if (earlier.length) groups.push({ label: 'Earlier', items: earlier });
  return groups;
};

const SeekerNotifications = () => {
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [typeFilter, setTypeFilter] = useState('all');

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(100);
      return (data || []) as Notification[];
    },
    enabled: !!profile?.id,
  });

  // Realtime
  useEffect(() => {
    if (!profile?.id) return;
    const channel = supabase
      .channel(`notif-page-${profile.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${profile.id}`,
      }, (payload) => {
        const n = payload.new as Notification;
        toast(n.title, { description: n.message });
        qc.invalidateQueries({ queryKey: ['notifications'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [profile?.id, qc]);

  const markAllRead = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter(n => !n.is_read).map(n => n.id);
      if (!unread.length) return;
      await supabase.from('notifications').update({ is_read: true }).in('id', unread);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    },
  });

  const clearAll = useMutation({
    mutationFn: async () => {
      if (!profile?.id) return;
      const readIds = notifications.filter(n => n.is_read).map(n => n.id);
      if (!readIds.length) return;
      await supabase.from('notifications').delete().in('id', readIds);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Read notifications cleared');
    },
  });

  const markOne = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const filtered = useMemo(() => {
    if (typeFilter === 'all') return notifications;
    return notifications.filter(n => n.type === typeFilter);
  }, [notifications, typeFilter]);

  const groups = useMemo(() => groupByDate(filtered), [filtered]);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleClick = (n: Notification) => {
    if (!n.is_read) markOne.mutate(n.id);
    if (n.action_url) navigate(n.action_url);
  };

  const typeOptions = [
    { value: 'all', label: 'All' },
    ...Object.entries(TYPE_CONFIG).map(([k, v]) => ({ value: k, label: v.label })),
  ];

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <BackToHome />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            🔔 Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">{unreadCount} unread</Badge>
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Stay updated on your journey</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => markAllRead.mutate()} disabled={unreadCount === 0}>
            <CheckCheck className="w-4 h-4 mr-1" /> Mark all read
          </Button>
          <Button variant="ghost" size="sm" onClick={() => clearAll.mutate()}>
            <Trash2 className="w-4 h-4 mr-1" /> Clear read
          </Button>
        </div>
      </div>

      {/* Type filter */}
      <Tabs value={typeFilter} onValueChange={setTypeFilter}>
        <TabsList className="flex-wrap h-auto gap-1 bg-transparent p-0">
          {typeOptions.map(o => (
            <TabsTrigger key={o.value} value={o.value} className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              {o.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Notification list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-16">
          <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
          <p className="text-muted-foreground">No notifications yet</p>
          <p className="text-xs text-muted-foreground mt-1">We'll notify you about important updates</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map(group => (
            <div key={group.label}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{group.label}</h3>
              <div className="space-y-2">
                {group.items.map(n => {
                  const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.system;
                  const Icon = cfg.icon;
                  return (
                    <button
                      key={n.id}
                      onClick={() => handleClick(n)}
                      className={`w-full text-left rounded-xl border transition-all duration-200 hover:shadow-md group ${
                        !n.is_read
                          ? 'bg-card border-l-4 border-l-primary border-border shadow-sm'
                          : 'bg-card/50 border-border hover:bg-card'
                      }`}
                    >
                      <div className="flex items-start gap-3 p-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${cfg.color}`}>
                          <span className="text-lg">{cfg.emoji}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`text-sm ${!n.is_read ? 'font-semibold text-foreground' : 'text-foreground/80'}`}>
                              {n.title}
                            </p>
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${cfg.color} border-0`}>
                              {cfg.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <p className="text-[10px] text-muted-foreground">
                              {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                            </p>
                            {n.action_url && (
                              <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </div>
                        </div>
                        {!n.is_read && (
                          <span className="w-2.5 h-2.5 rounded-full bg-primary mt-1.5 shrink-0 animate-pulse" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SeekerNotifications;
