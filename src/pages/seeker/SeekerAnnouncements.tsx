import { useState, useMemo, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { formatDistanceToNow, format } from 'date-fns';
import {
  Megaphone, Pin, Search, CheckCheck, ChevronDown, ChevronUp,
  Share2, Calendar, BookOpen, PartyPopper, Wrench, Globe,
  AlertTriangle, Flame,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BackToHome from '@/components/BackToHome';

const TYPE_CONFIG: Record<string, { emoji: string; icon: typeof Globe; label: string; color: string }> = {
  general: { emoji: '📢', icon: Globe, label: 'General', color: 'bg-primary/10 text-primary' },
  workshop: { emoji: '🎓', icon: Calendar, label: 'Workshop', color: 'bg-blue-500/10 text-blue-600' },
  course_update: { emoji: '📚', icon: BookOpen, label: 'Course Update', color: 'bg-indigo-500/10 text-indigo-600' },
  celebration: { emoji: '🎉', icon: PartyPopper, label: 'Celebration', color: 'bg-yellow-500/10 text-yellow-600' },
  maintenance: { emoji: '🔧', icon: Wrench, label: 'Maintenance', color: 'bg-muted text-muted-foreground' },
};

const PRIORITY_CONFIG: Record<string, { label: string; badgeClass: string; borderClass: string }> = {
  urgent: { label: 'Urgent', badgeClass: 'bg-destructive text-destructive-foreground', borderClass: 'border-l-destructive' },
  high: { label: 'High', badgeClass: 'bg-orange-500 text-white', borderClass: 'border-l-orange-500' },
  normal: { label: '', badgeClass: '', borderClass: 'border-l-transparent' },
  low: { label: '', badgeClass: '', borderClass: 'border-l-transparent' },
};

const SeekerAnnouncements = () => {
  const { profile } = useAuthStore();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const { data } = await supabase
        .from('announcements')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(200);
      return data || [];
    },
  });

  const { data: readIds = [] } = useQuery({
    queryKey: ['announcement-reads', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data } = await supabase
        .from('announcement_reads')
        .select('announcement_id')
        .eq('user_id', profile.id);
      return (data || []).map((r: any) => r.announcement_id as string);
    },
    enabled: !!profile?.id,
  });

  const readSet = useMemo(() => new Set(readIds), [readIds]);

  const markRead = useMutation({
    mutationFn: async (announcementId: string) => {
      if (!profile?.id || readSet.has(announcementId)) return;
      await supabase.from('announcement_reads').insert({ announcement_id: announcementId, user_id: profile.id });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['announcement-reads'] }),
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      if (!profile?.id) return;
      const unread = announcements.filter(a => !readSet.has(a.id));
      if (!unread.length) return;
      const rows = unread.map(a => ({ announcement_id: a.id, user_id: profile.id }));
      await supabase.from('announcement_reads').upsert(rows, { onConflict: 'announcement_id,user_id' });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['announcement-reads'] });
      toast.success('All announcements marked as read');
    },
  });

  const filtered = useMemo(() => {
    let list = announcements;
    if (tab === 'unread') list = list.filter(a => !readSet.has(a.id));
    if (tab === 'pinned') list = list.filter(a => a.is_pinned);
    if (typeFilter !== 'all') list = list.filter(a => a.type === typeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(a => a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q));
    }
    return list;
  }, [announcements, tab, typeFilter, search, readSet]);

  const unreadCount = announcements.filter(a => !readSet.has(a.id)).length;

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        next.add(id);
        markRead.mutate(id);
      }
      return next;
    });
  };

  const shareAnnouncement = (a: any) => {
    const text = `${a.title}\n\n${a.content.slice(0, 200)}...`;
    if (navigator.share) {
      navigator.share({ title: a.title, text });
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <BackToHome />

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            📢 Announcements
            {unreadCount > 0 && <Badge variant="destructive" className="text-xs">{unreadCount} new</Badge>}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Important updates from your coach</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => markAllRead.mutate()} disabled={unreadCount === 0}>
          <CheckCheck className="w-4 h-4 mr-1" /> Mark all read
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search announcements..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3 items-center">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread {unreadCount > 0 && `(${unreadCount})`}</TabsTrigger>
            <TabsTrigger value="pinned">📌 Pinned</TabsTrigger>
          </TabsList>
        </Tabs>

        <Tabs value={typeFilter} onValueChange={setTypeFilter}>
          <TabsList className="bg-transparent p-0 gap-1 h-auto flex-wrap">
            <TabsTrigger value="all" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">All Types</TabsTrigger>
            {Object.entries(TYPE_CONFIG).map(([k, v]) => (
              <TabsTrigger key={k} value={k} className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                {v.emoji} {v.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Announcements List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
          <p className="text-muted-foreground">No announcements found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(a => {
            const typeCfg = TYPE_CONFIG[a.type] || TYPE_CONFIG.general;
            const prioCfg = PRIORITY_CONFIG[a.priority] || PRIORITY_CONFIG.normal;
            const isRead = readSet.has(a.id);
            const isExpanded = expandedIds.has(a.id);
            const isLong = a.content.length > 200;
            const isCelebration = a.type === 'celebration';

            return (
              <div
                key={a.id}
                className={`rounded-xl border border-l-4 transition-all duration-200 hover:shadow-md ${prioCfg.borderClass} ${
                  !isRead ? 'bg-card shadow-sm' : 'bg-card/50'
                } ${isCelebration ? 'ring-1 ring-yellow-400/30' : ''}`}
              >
                <button
                  onClick={() => toggleExpand(a.id)}
                  className="w-full text-left p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${typeCfg.color}`}>
                      <span className="text-lg">{typeCfg.emoji}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {a.is_pinned && (
                          <Pin className="w-3.5 h-3.5 text-primary shrink-0" />
                        )}
                        <h3 className={`text-sm font-semibold ${!isRead ? 'text-foreground' : 'text-foreground/80'}`}>
                          {a.title}
                        </h3>
                        {!isRead && (
                          <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0">New</Badge>
                        )}
                        {prioCfg.label && (
                          <Badge className={`text-[10px] px-1.5 py-0 ${prioCfg.badgeClass}`}>
                            {a.priority === 'urgent' && <AlertTriangle className="w-2.5 h-2.5 mr-0.5" />}
                            {prioCfg.label}
                          </Badge>
                        )}
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 border-0 ${typeCfg.color}`}>
                          {typeCfg.label}
                        </Badge>
                      </div>

                      <p className={`text-xs text-muted-foreground mt-1 ${isExpanded ? '' : 'line-clamp-2'}`}>
                        {a.content}
                      </p>

                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                        </span>
                        {a.starts_at && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                            <Calendar className="w-2.5 h-2.5" />
                            {format(new Date(a.starts_at), 'MMM d, yyyy')}
                          </span>
                        )}
                        {isLong && (
                          <span className="text-[10px] text-primary flex items-center gap-0.5">
                            {isExpanded ? <><ChevronUp className="w-3 h-3" /> Less</> : <><ChevronDown className="w-3 h-3" /> Read more</>}
                          </span>
                        )}
                      </div>
                    </div>

                    {!isRead && (
                      <span className="w-2.5 h-2.5 rounded-full bg-primary mt-1.5 shrink-0 animate-pulse" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-3 flex gap-2 border-t border-border pt-2">
                    <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => shareAnnouncement(a)}>
                      <Share2 className="w-3 h-3 mr-1" /> Share
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SeekerAnnouncements;
