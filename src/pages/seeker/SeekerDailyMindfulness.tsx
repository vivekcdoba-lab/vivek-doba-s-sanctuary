import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import BackToHome from '@/components/BackToHome';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ResourcePreviewModal } from '@/components/ResourcePreviewModal';
import {
import { formatDateDMY } from "@/lib/dateFormat";
  Sunrise, Play, Search, CheckCircle2, Bookmark, BookmarkCheck,
  Clock, Flame, Sparkles, Calendar, Headphones, Video as VideoIcon, FileText,
} from 'lucide-react';
import { format, isToday, isSameDay, parseISO, startOfWeek, addDays, differenceInCalendarDays } from 'date-fns';

const CATEGORY = 'Daily Live Mindfulness Session';

interface Item {
  id: string;
  title: string;
  description: string | null;
  type: string;
  category: string | null;
  url: string;
  thumbnail_url: string | null;
  duration_minutes: number | null;
  language: string;
  created_at: string;
  is_active: boolean;
}

interface Progress {
  id: string;
  content_id: string;
  progress_percent: number;
  is_completed: boolean;
  is_bookmarked: boolean;
}

type Filter = 'all' | 'not_practiced' | 'completed' | 'bookmarked';

const typeIcon = (t: string) => t === 'audio' ? Headphones : t === 'pdf' ? FileText : VideoIcon;

export default function SeekerDailyMindfulness() {
  const { profile } = useAuthStore();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [active, setActive] = useState<Item | null>(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['daily-mindfulness'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_content')
        .select('*')
        .eq('is_active', true)
        .eq('category', CATEGORY)
        .order('created_at', { ascending: false })
        .limit(60);
      if (error) throw error;
      return (data || []) as Item[];
    },
  });

  const { data: progressMap = {} } = useQuery({
    queryKey: ['daily-mindfulness-progress', profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const ids = items.map(i => i.id);
      if (ids.length === 0) return {} as Record<string, Progress>;
      const { data, error } = await supabase
        .from('user_content_progress')
        .select('*')
        .eq('seeker_id', profile!.id)
        .in('content_id', ids);
      if (error) throw error;
      const m: Record<string, Progress> = {};
      (data || []).forEach((p: any) => { m[p.content_id] = p as Progress; });
      return m;
    },
  });

  const upsert = useMutation({
    mutationFn: async (params: { contentId: string; updates: Partial<Progress> }) => {
      const existing = progressMap[params.contentId];
      if (existing) {
        await supabase.from('user_content_progress').update({ ...params.updates, last_watched_at: new Date().toISOString() } as any).eq('id', existing.id);
      } else {
        await supabase.from('user_content_progress').insert({
          content_id: params.contentId,
          seeker_id: profile!.id,
          ...params.updates,
          last_watched_at: new Date().toISOString(),
        } as any);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['daily-mindfulness-progress'] }),
  });

  const todays = useMemo(() => items.find(i => isToday(parseISO(i.created_at))), [items]);

  // Streak: count consecutive days (ending today or yesterday) with a completed practice
  const streak = useMemo(() => {
    const days = new Set<string>();
    items.forEach(i => {
      const p = progressMap[i.id];
      if (p?.is_completed) days.add(formatDateDMY(parseISO(i.created_at)));
    });
    let s = 0;
    let cursor = new Date();
    if (!days.has(formatDateDMY(cursor))) cursor = addDays(cursor, -1);
    while (days.has(formatDateDMY(cursor))) { s++; cursor = addDays(cursor, -1); }
    return s;
  }, [items, progressMap]);

  // This week (Mon-Sun)
  const weekStart = useMemo(() => startOfWeek(new Date(), { weekStartsOn: 1 }), []);
  const weekDays = useMemo(() => Array.from({ length: 7 }).map((_, i) => {
    const d = addDays(weekStart, i);
    const item = items.find(it => isSameDay(parseISO(it.created_at), d));
    const completed = item ? !!progressMap[item.id]?.is_completed : false;
    return { date: d, item, completed, isToday: isToday(d), isFuture: d > new Date() };
  }), [weekStart, items, progressMap]);

  const monthStart = useMemo(() => { const d = new Date(); d.setDate(1); d.setHours(0,0,0,0); return d; }, []);
  const monthCount = items.filter(i => parseISO(i.created_at) >= monthStart && progressMap[i.id]?.is_completed).length;
  const monthMinutes = items.reduce((acc, i) => parseISO(i.created_at) >= monthStart && progressMap[i.id]?.is_completed ? acc + (i.duration_minutes || 0) : acc, 0);

  const filtered = useMemo(() => items.filter(i => {
    if (search && !i.title.toLowerCase().includes(search.toLowerCase())) return false;
    const p = progressMap[i.id];
    if (filter === 'completed' && !p?.is_completed) return false;
    if (filter === 'not_practiced' && p?.is_completed) return false;
    if (filter === 'bookmarked' && !p?.is_bookmarked) return false;
    return true;
  }), [items, search, filter, progressMap]);

  const openPlayer = (item: Item) => {
    setActive(item);
    if (!progressMap[item.id]) upsert.mutate({ contentId: item.id, updates: { progress_percent: 5 } });
  };

  const markComplete = (item: Item) => upsert.mutate({ contentId: item.id, updates: { progress_percent: 100, is_completed: true } });
  const toggleBookmark = (item: Item) => upsert.mutate({ contentId: item.id, updates: { is_bookmarked: !progressMap[item.id]?.is_bookmarked } });

  return (
    <div className="space-y-6 p-1">
      <BackToHome />

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl gradient-saffron p-6 sm:p-8 text-primary-foreground">
        <div className="absolute -top-10 -right-10 text-[160px] opacity-15 select-none">🪷</div>
        <div className="relative space-y-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider opacity-90">
            <Sunrise className="h-4 w-4" /> {format(new Date(), 'EEEE, d MMM')}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">Daily Mindfulness Practice</h1>
          <p className="text-sm sm:text-base opacity-90">Missed Guruji's live session? Practice anytime — your inner stillness awaits. 🧘</p>
          <div className="flex items-center gap-3 pt-2">
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm gap-1">
              <Flame className="h-3.5 w-3.5" /> {streak} day streak
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm gap-1">
              <Sparkles className="h-3.5 w-3.5" /> {monthCount} this month
            </Badge>
          </div>
        </div>
      </div>

      {/* Today's session */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" /> Today's Session
        </h2>
        {todays ? (
          <Card className="overflow-hidden border-primary/30 card-hover">
            <CardContent className="p-0 grid sm:grid-cols-[280px_1fr]">
              <div className="relative aspect-video sm:aspect-auto bg-muted flex items-center justify-center cursor-pointer group" onClick={() => openPlayer(todays)}>
                {todays.thumbnail_url ? (
                  <img src={todays.thumbnail_url} alt={todays.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full gradient-sacred flex items-center justify-center">
                    {(() => { const Icon = typeIcon(todays.type); return <Icon className="h-12 w-12 text-white/80" />; })()}
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all">
                  <div className="h-14 w-14 rounded-full bg-white/95 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                    <Play className="h-6 w-6 text-primary ml-0.5" />
                  </div>
                </div>
              </div>
              <div className="p-5 flex flex-col justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">🌅 Today</Badge>
                    <Badge variant="outline" className="text-[10px]">{todays.language}</Badge>
                    {todays.duration_minutes && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{todays.duration_minutes} min</span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-foreground leading-tight">{todays.title}</h3>
                  {todays.description && <p className="text-sm text-muted-foreground line-clamp-3">{todays.description}</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => openPlayer(todays)} className="gap-1.5 btn-press">
                    <Play className="h-4 w-4" /> Practice Now
                  </Button>
                  <Button variant="outline" onClick={() => toggleBookmark(todays)} className="gap-1.5">
                    {progressMap[todays.id]?.is_bookmarked ? <BookmarkCheck className="h-4 w-4 text-[hsl(var(--gold-bright))]" /> : <Bookmark className="h-4 w-4" />}
                    {progressMap[todays.id]?.is_bookmarked ? 'Saved' : 'Save'}
                  </Button>
                  {!progressMap[todays.id]?.is_completed && (
                    <Button variant="ghost" onClick={() => markComplete(todays)} className="gap-1.5">
                      <CheckCircle2 className="h-4 w-4" /> Mark Done
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed">
            <CardContent className="py-10 text-center space-y-2">
              <div className="text-4xl">🪷</div>
              <p className="font-medium text-foreground">Today's session is on its way</p>
              <p className="text-sm text-muted-foreground">Guruji will share today's mindfulness practice soon. Meanwhile, explore recent recordings below.</p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* This week */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-foreground">This Week</h2>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((d, i) => {
            const status = d.completed ? 'done' : d.item ? 'available' : d.isFuture ? 'future' : 'missed';
            return (
              <button
                key={i}
                disabled={!d.item}
                onClick={() => d.item && openPlayer(d.item)}
                className={`rounded-xl p-2 flex flex-col items-center gap-1 border transition-all ${
                  d.isToday ? 'border-primary ring-2 ring-primary/30' : 'border-border'
                } ${
                  status === 'done' ? 'bg-[hsl(var(--dharma-green))]/15' :
                  status === 'available' ? 'bg-card hover:bg-muted card-hover cursor-pointer' :
                  status === 'missed' ? 'bg-muted/40 opacity-60' :
                  'bg-muted/20 opacity-50'
                }`}
              >
                <span className="text-[10px] uppercase font-semibold text-muted-foreground">{format(d.date, 'EEE')}</span>
                <span className="text-base font-bold text-foreground">{format(d.date, 'd')}</span>
                <span className="text-[14px] leading-none">
                  {status === 'done' ? '✅' : status === 'available' ? '▶️' : status === 'missed' ? '·' : '–'}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Stats strip */}
      <section className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-3 text-center">
          <div className="text-xl font-bold text-foreground">{monthCount}</div>
          <div className="text-[11px] text-muted-foreground">Practiced this month</div>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <div className="text-xl font-bold text-foreground">{monthMinutes}</div>
          <div className="text-[11px] text-muted-foreground">Minutes meditated</div>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <div className="text-xl font-bold text-foreground flex items-center justify-center gap-1"><Flame className="h-4 w-4 text-[hsl(var(--saffron))]" />{streak}</div>
          <div className="text-[11px] text-muted-foreground">Day streak</div>
        </CardContent></Card>
      </section>

      {/* Recent recordings */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-base font-bold text-foreground">Recent Recordings</h2>
          <div className="flex gap-2 flex-wrap">
            {(['all','not_practiced','completed','bookmarked'] as Filter[]).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${filter === f ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground hover:bg-muted'}`}>
                {f === 'all' ? 'All' : f === 'not_practiced' ? 'Not Practiced' : f === 'completed' ? 'Completed' : 'Bookmarked'}
              </button>
            ))}
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search recordings..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}><CardContent className="p-4 h-32 animate-pulse bg-muted/40" /></Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="py-12 text-center">
            <CardContent className="space-y-2">
              <div className="text-3xl">🧘</div>
              <p className="text-muted-foreground">No recordings match your filter yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(item => {
              const p = progressMap[item.id];
              const Icon = typeIcon(item.type);
              const daysAgo = differenceInCalendarDays(new Date(), parseISO(item.created_at));
              return (
                <Card key={item.id} className="overflow-hidden card-hover cursor-pointer" onClick={() => openPlayer(item)}>
                  <div className="relative aspect-video bg-muted">
                    {item.thumbnail_url ? (
                      <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full gradient-sacred flex items-center justify-center">
                        <Icon className="h-9 w-9 text-white/80" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-black/60 text-white text-[10px] backdrop-blur-sm">
                        {daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo}d ago`}
                      </Badge>
                    </div>
                    {p?.is_completed && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle2 className="h-5 w-5 text-[hsl(var(--dharma-green))] bg-white rounded-full" />
                      </div>
                    )}
                    {item.duration_minutes && (
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">{item.duration_minutes} min</div>
                    )}
                    {p && p.progress_percent > 0 && !p.is_completed && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
                        <div className="h-full bg-primary" style={{ width: `${p.progress_percent}%` }} />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3 space-y-1.5">
                    <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-tight">{item.title}</h3>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>{format(parseISO(item.created_at), 'd MMM')}</span>
                      <button onClick={(e) => { e.stopPropagation(); toggleBookmark(item); }} className="p-1">
                        {p?.is_bookmarked ? <BookmarkCheck className="h-3.5 w-3.5 text-[hsl(var(--gold-bright))]" /> : <Bookmark className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <ResourcePreviewModal
        open={!!active}
        onOpenChange={(o) => { if (!o) setActive(null); }}
        title={active?.title || ''}
        type={active?.type || 'video'}
        url={active?.url}
      />
    </div>
  );
}
