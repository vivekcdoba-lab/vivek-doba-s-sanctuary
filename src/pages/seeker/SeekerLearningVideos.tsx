import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import BackToHome from '@/components/BackToHome';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Play, Search, Bookmark, BookmarkCheck, Clock, Lock, CheckCircle2,
  Filter, Video, ChevronRight, Sparkles, X
} from 'lucide-react';
import { differenceInDays } from 'date-fns';

const CATEGORIES = [
  'Ramayana Teachings',
  'Mahabharata Wisdom',
  'LGT Framework',
  'Sales Sanjivani',
  'Meditation Guides',
  'Success Stories',
];

interface ContentItem {
  id: string;
  title: string;
  description: string | null;
  type: string;
  category: string | null;
  url: string;
  thumbnail_url: string | null;
  duration_minutes: number | null;
  tier: string;
  language: string;
  tags: string[] | null;
  view_count: number;
  is_active: boolean;
  created_at: string;
}

interface ContentProgress {
  id: string;
  content_id: string;
  progress_percent: number;
  last_position_seconds: number;
  is_completed: boolean;
  is_bookmarked: boolean;
}

function extractVideoId(url: string): { type: 'youtube' | 'vimeo' | 'other'; id: string } {
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return { type: 'youtube', id: ytMatch[1] };
  const vmMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vmMatch) return { type: 'vimeo', id: vmMatch[1] };
  return { type: 'other', id: '' };
}

function getThumbnail(item: ContentItem): string {
  if (item.thumbnail_url) return item.thumbnail_url;
  const vid = extractVideoId(item.url);
  if (vid.type === 'youtube') return `https://img.youtube.com/vi/${vid.id}/mqdefault.jpg`;
  return '';
}

export default function SeekerLearningVideos() {
  const { profile } = useAuthStore();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [langFilter, setLangFilter] = useState('all');
  const [activeItem, setActiveItem] = useState<ContentItem | null>(null);

  // Fetch content
  const { data: content = [], isLoading } = useQuery({
    queryKey: ['learning-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_content')
        .select('*')
        .eq('is_active', true)
        .eq('type', 'video')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as ContentItem[];
    },
  });

  // Fetch progress
  const { data: progressMap = {} } = useQuery({
    queryKey: ['content-progress', profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_content_progress')
        .select('*')
        .eq('seeker_id', profile!.id);
      if (error) throw error;
      const map: Record<string, ContentProgress> = {};
      (data || []).forEach((p: any) => { map[p.content_id] = p as ContentProgress; });
      return map;
    },
  });

  // Fetch user enrollment tier
  const { data: userTier } = useQuery({
    queryKey: ['user-tier', profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('enrollments')
        .select('tier')
        .eq('seeker_id', profile!.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      return data?.tier || 'free';
    },
  });

  // Upsert progress
  const upsertProgress = useMutation({
    mutationFn: async (params: { contentId: string; updates: Partial<ContentProgress> }) => {
      const existing = progressMap[params.contentId];
      if (existing) {
        await supabase
          .from('user_content_progress')
          .update({ ...params.updates, last_watched_at: new Date().toISOString() } as any)
          .eq('id', existing.id);
      } else {
        await supabase
          .from('user_content_progress')
          .insert({
            content_id: params.contentId,
            seeker_id: profile!.id,
            ...params.updates,
            last_watched_at: new Date().toISOString(),
          } as any);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['content-progress'] }),
  });

  const toggleBookmark = (contentId: string) => {
    const current = progressMap[contentId]?.is_bookmarked || false;
    upsertProgress.mutate({ contentId, updates: { is_bookmarked: !current } });
  };

  // Filtering
  const filtered = useMemo(() => {
    return content.filter(c => {
      if (search && !c.title.toLowerCase().includes(search.toLowerCase()) &&
          !(c.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase()))) return false;
      if (catFilter !== 'all' && c.category !== catFilter) return false;
      if (langFilter !== 'all' && c.language !== langFilter) return false;
      return true;
    });
  }, [content, search, catFilter, langFilter]);

  // Group by category
  const grouped = useMemo(() => {
    const map: Record<string, ContentItem[]> = {};
    filtered.forEach(c => {
      const cat = c.category || 'Other';
      (map[cat] ??= []).push(c);
    });
    return map;
  }, [filtered]);

  // Continue watching
  const continueWatching = useMemo(() => {
    return content.filter(c => {
      const p = progressMap[c.id];
      return p && p.progress_percent > 0 && !p.is_completed;
    }).slice(0, 10);
  }, [content, progressMap]);

  // Bookmarked
  const bookmarked = useMemo(() => {
    return content.filter(c => progressMap[c.id]?.is_bookmarked);
  }, [content, progressMap]);

  const canAccess = (item: ContentItem) => {
    if (item.tier === 'free' || item.tier === 'standard') return true;
    if (item.tier === 'platinum' && userTier === 'platinum') return true;
    if (userTier === 'platinum') return true;
    return false;
  };

  const isNew = (item: ContentItem) => differenceInDays(new Date(), new Date(item.created_at)) <= 7;

  const openPlayer = (item: ContentItem) => {
    if (!canAccess(item)) return;
    setActiveItem(item);
    // Mark as started
    if (!progressMap[item.id]) {
      upsertProgress.mutate({ contentId: item.id, updates: { progress_percent: 5 } });
    }
  };

  const ContentCard = ({ item }: { item: ContentItem }) => {
    const prog = progressMap[item.id];
    const locked = !canAccess(item);
    const thumb = getThumbnail(item);

    return (
      <div
        className={`group relative min-w-[220px] w-[220px] flex-shrink-0 cursor-pointer rounded-xl overflow-hidden border bg-card transition-all hover:shadow-lg hover:scale-[1.03] ${locked ? 'opacity-70' : ''}`}
        onClick={() => !locked && openPlayer(item)}
      >
        {/* Thumbnail */}
        <div className="relative aspect-video bg-muted overflow-hidden">
          {thumb ? (
            <img src={thumb} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Video className="h-10 w-10 text-muted-foreground" />
            </div>
          )}
          {/* Play overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all">
            {locked ? (
              <Lock className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-primary/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="h-5 w-5 text-primary-foreground ml-0.5" />
              </div>
            )}
          </div>
          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-1">
            {isNew(item) && <Badge className="bg-[hsl(var(--dharma-green))] text-white text-[9px] px-1.5 py-0.5">NEW</Badge>}
            {locked && <Badge className="bg-[hsl(var(--warning-amber))] text-white text-[9px] px-1.5 py-0.5">Premium</Badge>}
          </div>
          {/* Bookmark */}
          <button
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={e => { e.stopPropagation(); toggleBookmark(item.id); }}
          >
            {prog?.is_bookmarked ? (
              <BookmarkCheck className="h-5 w-5 text-[hsl(var(--gold-bright))]" />
            ) : (
              <Bookmark className="h-5 w-5 text-white" />
            )}
          </button>
          {/* Duration */}
          {item.duration_minutes && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
              {item.duration_minutes} min
            </div>
          )}
          {/* Progress bar */}
          {prog && prog.progress_percent > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${prog.progress_percent}%` }}
              />
            </div>
          )}
        </div>
        {/* Info */}
        <div className="p-3">
          <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-tight">{item.title}</h3>
          <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
            {item.category && <span>{item.category}</span>}
            {prog?.is_completed && <CheckCircle2 className="h-3 w-3 text-[hsl(var(--dharma-green))]" />}
          </div>
        </div>
      </div>
    );
  };

  const HorizontalRow = ({ title, items }: { title: string; items: ContentItem[] }) => {
    if (items.length === 0) return null;
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">{title}</h2>
          <span className="text-xs text-muted-foreground">{items.length} videos</span>
        </div>
        <ScrollArea className="w-full">
          <div className="flex gap-3 pb-3">
            {items.map(item => <ContentCard key={item.id} item={item} />)}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <BackToHome />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Video className="h-6 w-6 text-primary" /> Video Learning
          </h1>
          <p className="text-sm text-muted-foreground">{content.length} videos available</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search videos by title or tag..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-1" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={langFilter} onValueChange={setLangFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="HI">Hindi</SelectItem>
            <SelectItem value="EN">English</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : content.length === 0 ? (
        <Card className="py-16 text-center">
          <CardContent>
            <Video className="h-14 w-14 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-bold text-foreground mb-2">Coming Soon</h2>
            <p className="text-muted-foreground">Learning videos are being prepared. Check back soon!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Continue Watching */}
          {continueWatching.length > 0 && (
            <HorizontalRow title="▶️ Continue Watching" items={continueWatching} />
          )}

          {/* Bookmarked */}
          {bookmarked.length > 0 && (
            <HorizontalRow title="⭐ My Bookmarks" items={bookmarked} />
          )}

          {/* By Category */}
          {catFilter === 'all' ? (
            Object.entries(grouped).map(([cat, items]) => (
              <HorizontalRow key={cat} title={cat} items={items} />
            ))
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filtered.map(item => <ContentCard key={item.id} item={item} />)}
            </div>
          )}

          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-10">No videos match your filters.</p>
          )}
        </div>
      )}

      {/* Video Player Modal */}
      <Dialog open={!!activeItem} onOpenChange={open => { if (!open) setActiveItem(null); }}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          {activeItem && (() => {
            const vid = extractVideoId(activeItem.url);
            const prog = progressMap[activeItem.id];
            return (
              <>
                {/* Embedded Player */}
                <div className="aspect-video bg-black">
                  {vid.type === 'youtube' ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${vid.id}?autoplay=1&start=${prog?.last_position_seconds || 0}`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : vid.type === 'vimeo' ? (
                    <iframe
                      src={`https://player.vimeo.com/video/${vid.id}?autoplay=1`}
                      className="w-full h-full"
                      allow="autoplay; fullscreen"
                      allowFullScreen
                    />
                  ) : (
                    <video src={activeItem.url} controls autoPlay className="w-full h-full" />
                  )}
                </div>
                {/* Info */}
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-foreground">{activeItem.title}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        {activeItem.category && <Badge variant="secondary" className="text-[10px]">{activeItem.category}</Badge>}
                        {activeItem.duration_minutes && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {activeItem.duration_minutes} min
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={prog?.is_bookmarked ? 'default' : 'outline'}
                        onClick={() => toggleBookmark(activeItem.id)}
                      >
                        {prog?.is_bookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => upsertProgress.mutate({
                          contentId: activeItem.id,
                          updates: { progress_percent: 100, is_completed: true }
                        })}
                        disabled={prog?.is_completed}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" /> {prog?.is_completed ? 'Completed' : 'Mark Done'}
                      </Button>
                    </div>
                  </div>
                  {activeItem.description && (
                    <p className="text-sm text-muted-foreground">{activeItem.description}</p>
                  )}
                  {prog && (
                    <div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Progress</span>
                        <span>{prog.progress_percent}%</span>
                      </div>
                      <Progress value={prog.progress_percent} className="h-1.5" />
                    </div>
                  )}
                  {(activeItem.tags || []).length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {activeItem.tags!.map(tag => (
                        <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
