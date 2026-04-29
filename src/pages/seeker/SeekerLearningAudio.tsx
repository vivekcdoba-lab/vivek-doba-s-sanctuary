import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { useAudioStore } from '@/store/audioStore';
import BackToHome from '@/components/BackToHome';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import {
  Play, Pause, Search, Bookmark, BookmarkCheck, Clock, Heart,
  Filter, Headphones, SkipBack, SkipForward, Volume2, VolumeX,
  Maximize2, Minimize2, Timer, Music, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AUDIO_CATEGORIES = [
  { key: 'Guided Meditations', label: 'Guided Meditations (ध्यान)', emoji: '🧘' },
  { key: 'Mantra Chanting', label: 'Mantra Chanting', emoji: '🕉️' },
  { key: 'Bedtime Stories', label: 'Kathayein (कथाएँ)', emoji: '🌙' },
  { key: 'Affirmations', label: 'Affirmations (प्रतिज्ञान)', emoji: '✨' },
  { key: 'Breathing Exercises', label: 'Pranayama (प्राणायाम)', emoji: '🌬️' },
  { key: 'Morning Rituals', label: 'Morning Rituals', emoji: '🌅' },
];

const SLEEP_OPTIONS = [
  { label: 'Off', value: 0 },
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '60 min', value: 60 },
];

interface AudioItem {
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
  created_at: string;
}

interface AudioProgress {
  id: string;
  content_id: string;
  progress_percent: number;
  last_position_seconds: number;
  is_completed: boolean;
  is_bookmarked: boolean;
}

// Equalizer bars animation component
function EqualizerBars({ active }: { active: boolean }) {
  return (
    <div className="flex items-end gap-[2px] h-4">
      {[1, 2, 3, 4].map(i => (
        <div
          key={i}
          className={`w-[3px] rounded-full bg-primary transition-all ${active ? 'animate-pulse' : ''}`}
          style={{
            height: active ? `${8 + Math.random() * 8}px` : '4px',
            animationDelay: `${i * 0.15}s`,
            animationDuration: `${0.4 + i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function SeekerLearningAudio() {
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [currentTrack, setCurrentTrack] = useState<AudioItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [sleepTimer, setSleepTimer] = useState(0);
  const [sleepTimeLeft, setSleepTimeLeft] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sleepInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch audio content
  const { data: content = [], isLoading } = useQuery({
    queryKey: ['learning-audio'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_content')
        .select('*')
        .eq('is_active', true)
        .eq('type', 'audio')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as AudioItem[];
    },
  });

  // Fetch progress
  const { data: progressMap = {} } = useQuery({
    queryKey: ['audio-progress', profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_content_progress')
        .select('*')
        .eq('seeker_id', profile!.id);
      if (error) throw error;
      const map: Record<string, AudioProgress> = {};
      (data || []).forEach((p: any) => { map[p.content_id] = p as AudioProgress; });
      return map;
    },
  });

  const upsertProgress = useMutation({
    mutationFn: async (params: { contentId: string; updates: Partial<AudioProgress> }) => {
      const existing = progressMap[params.contentId];
      if (existing) {
        await supabase.from('user_content_progress')
          .update({ ...params.updates, last_watched_at: new Date().toISOString() } as any)
          .eq('id', existing.id);
      } else {
        await supabase.from('user_content_progress')
          .insert({ content_id: params.contentId, seeker_id: profile!.id, ...params.updates, last_watched_at: new Date().toISOString() } as any);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['audio-progress'] }),
  });

  const toggleBookmark = (id: string) => {
    const cur = progressMap[id]?.is_bookmarked || false;
    upsertProgress.mutate({ contentId: id, updates: { is_bookmarked: !cur } });
  };

  // Audio controls
  const playTrack = useCallback((item: AudioItem) => {
    if (currentTrack?.id === item.id && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }
    setCurrentTrack(item);
    setIsPlaying(true);
    setExpanded(false);
    if (audioRef.current) {
      audioRef.current.src = item.url;
      const prog = progressMap[item.id];
      if (prog && prog.last_position_seconds > 0 && !prog.is_completed) {
        audioRef.current.currentTime = prog.last_position_seconds;
      }
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [currentTrack, isPlaying, progressMap]);

  const togglePlay = () => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else { audioRef.current.play().catch(() => {}); setIsPlaying(true); }
  };

  const seek = (pct: number) => {
    if (!audioRef.current || !duration) return;
    audioRef.current.currentTime = (pct / 100) * duration;
  };

  const skipBy = (sec: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, Math.min(audioRef.current.currentTime + sec, duration));
  };

  // Update time
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onDur = () => setDuration(audio.duration || 0);
    const onEnd = () => {
      setIsPlaying(false);
      if (currentTrack) {
        upsertProgress.mutate({ contentId: currentTrack.id, updates: { progress_percent: 100, is_completed: true, last_position_seconds: 0 } });
      }
    };
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onDur);
    audio.addEventListener('ended', onEnd);
    return () => { audio.removeEventListener('timeupdate', onTime); audio.removeEventListener('loadedmetadata', onDur); audio.removeEventListener('ended', onEnd); };
  }, [currentTrack]);

  // Save progress periodically
  useEffect(() => {
    if (!currentTrack || !isPlaying || !duration) return;
    const iv = setInterval(() => {
      const pct = Math.round((currentTime / duration) * 100);
      upsertProgress.mutate({ contentId: currentTrack.id, updates: { progress_percent: pct, last_position_seconds: Math.round(currentTime) } });
    }, 15000);
    return () => clearInterval(iv);
  }, [currentTrack, isPlaying, currentTime, duration]);

  // Volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = muted ? 0 : volume;
  }, [volume, muted]);

  // Sleep timer
  useEffect(() => {
    if (sleepInterval.current) clearInterval(sleepInterval.current);
    if (sleepTimer > 0) {
      const end = Date.now() + sleepTimer * 60 * 1000;
      setSleepTimeLeft(sleepTimer * 60);
      sleepInterval.current = setInterval(() => {
        const left = Math.max(0, Math.round((end - Date.now()) / 1000));
        setSleepTimeLeft(left);
        if (left <= 0) {
          audioRef.current?.pause();
          setIsPlaying(false);
          setSleepTimer(0);
          setSleepTimeLeft(null);
          if (sleepInterval.current) clearInterval(sleepInterval.current);
        }
      }, 1000);
    } else {
      setSleepTimeLeft(null);
    }
    return () => { if (sleepInterval.current) clearInterval(sleepInterval.current); };
  }, [sleepTimer]);

  const filtered = useMemo(() =>
    content.filter(c => {
      if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !(c.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase()))) return false;
      if (catFilter !== 'all' && c.category !== catFilter) return false;
      return true;
    }),
  [content, search, catFilter]);

  const grouped = useMemo(() => {
    const map: Record<string, AudioItem[]> = {};
    filtered.forEach(c => { (map[c.category || 'Other'] ??= []).push(c); });
    return map;
  }, [filtered]);

  const favorites = useMemo(() => content.filter(c => progressMap[c.id]?.is_bookmarked), [content, progressMap]);
  const recentlyPlayed = useMemo(() =>
    content.filter(c => progressMap[c.id] && progressMap[c.id].progress_percent > 0)
      .sort((a, b) => (progressMap[b.id]?.last_position_seconds || 0) - (progressMap[a.id]?.last_position_seconds || 0))
      .slice(0, 10),
  [content, progressMap]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const AudioCard = ({ item }: { item: AudioItem }) => {
    const prog = progressMap[item.id];
    const isActive = currentTrack?.id === item.id;
    const catMeta = AUDIO_CATEGORIES.find(c => c.key === item.category);

    return (
      <div
        className={`group relative min-w-[180px] w-[180px] flex-shrink-0 cursor-pointer rounded-2xl overflow-hidden border transition-all hover:shadow-lg hover:scale-[1.03] ${isActive ? 'ring-2 ring-primary shadow-lg' : 'bg-card'}`}
        onClick={() => playTrack(item)}
      >
        {/* Album art */}
        <div className="relative aspect-square bg-gradient-to-br from-[hsl(var(--chakra-indigo)/0.3)] to-[hsl(var(--wisdom-purple)/0.3)] flex items-center justify-center overflow-hidden">
          {item.thumbnail_url ? (
            <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            <span className="text-5xl opacity-60">{catMeta?.emoji || '🎵'}</span>
          )}
          {/* Play overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-all">
            {isActive && isPlaying ? (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <EqualizerBars active />
              </div>
            ) : (
              <div className="h-11 w-11 rounded-full bg-primary/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                <Play className="h-5 w-5 text-primary-foreground ml-0.5" />
              </div>
            )}
          </div>
          {/* Bookmark */}
          <button
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={e => { e.stopPropagation(); toggleBookmark(item.id); }}
          >
            {prog?.is_bookmarked
              ? <BookmarkCheck className="h-5 w-5 text-[hsl(var(--gold-bright))]" />
              : <Bookmark className="h-5 w-5 text-white/80" />}
          </button>
          {/* Duration */}
          {item.duration_minutes && (
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
              {item.duration_minutes} min
            </div>
          )}
          {/* Progress */}
          {prog && prog.progress_percent > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
              <div className="h-full bg-primary" style={{ width: `${prog.progress_percent}%` }} />
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="text-xs font-semibold text-foreground line-clamp-2 leading-tight">{item.title}</h3>
          {catMeta && <p className="text-[10px] text-muted-foreground mt-1">{catMeta.emoji} {catMeta.key}</p>}
          {prog?.is_completed && <Badge className="bg-[hsl(var(--dharma-green))] text-white text-[8px] mt-1 px-1.5">✓ Done</Badge>}
        </div>
      </div>
    );
  };

  const HorizontalRow = ({ title, emoji, items }: { title: string; emoji?: string; items: AudioItem[] }) => {
    if (!items.length) return null;
    return (
      <div className="space-y-2">
        <h2 className="text-base font-bold text-foreground">{emoji && `${emoji} `}{title}</h2>
        <ScrollArea className="w-full">
          <div className="flex gap-3 pb-3">{items.map(i => <AudioCard key={i.id} item={i} />)}</div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${currentTrack ? 'pb-28' : ''}`}>
      <audio ref={audioRef} preload="auto" controlsList="nodownload" onContextMenu={(e) => e.preventDefault()} />
      <BackToHome />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Headphones className="h-6 w-6 text-[hsl(var(--chakra-indigo))]" /> Audio Meditations
          </h1>
          <p className="text-sm text-muted-foreground">{content.length} tracks • Find your inner peace</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/seeker/sacred-space')}>
          🕉️ Sacred Space
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by title or tag..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-[200px]">
            <Filter className="h-4 w-4 mr-1" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {AUDIO_CATEGORIES.map(c => <SelectItem key={c.key} value={c.key}>{c.emoji} {c.key}</SelectItem>)}
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
            <Headphones className="h-14 w-14 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-bold text-foreground mb-2">Audio Library Coming Soon</h2>
            <p className="text-muted-foreground mb-4">Meanwhile, explore procedurally generated sacred sounds.</p>
            <Button onClick={() => navigate('/seeker/sacred-space')}>🕉️ Open Sacred Space</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {recentlyPlayed.length > 0 && <HorizontalRow title="Recently Played" emoji="🕐" items={recentlyPlayed} />}
          {favorites.length > 0 && <HorizontalRow title="Favorites" emoji="❤️" items={favorites} />}

          {catFilter === 'all'
            ? AUDIO_CATEGORIES.map(cat => {
                const items = grouped[cat.key];
                return items?.length ? <HorizontalRow key={cat.key} title={cat.label} emoji={cat.emoji} items={items} /> : null;
              })
            : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filtered.map(i => <AudioCard key={i.id} item={i} />)}
              </div>
            )}
          {filtered.length === 0 && <p className="text-center text-muted-foreground py-10">No audio matches your filters.</p>}
        </div>
      )}

      {/* Mini Player */}
      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t shadow-2xl">
          {/* Progress bar at top */}
          <div
            className="h-1 bg-muted cursor-pointer group"
            onClick={e => {
              const rect = e.currentTarget.getBoundingClientRect();
              seek(((e.clientX - rect.left) / rect.width) * 100);
            }}
          >
            <div className="h-full bg-primary transition-all" style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }} />
          </div>

          <div className="flex items-center gap-3 px-4 py-2.5 max-w-screen-xl mx-auto">
            {/* Track info */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[hsl(var(--chakra-indigo)/0.3)] to-[hsl(var(--wisdom-purple)/0.3)] flex items-center justify-center flex-shrink-0 overflow-hidden">
                {currentTrack.thumbnail_url
                  ? <img src={currentTrack.thumbnail_url} alt="" className="w-full h-full object-cover" />
                  : <Music className="h-5 w-5 text-[hsl(var(--chakra-indigo))]" />}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{currentTrack.title}</p>
                <p className="text-[10px] text-muted-foreground">{formatTime(currentTime)} / {formatTime(duration)}</p>
              </div>
              {isPlaying && <EqualizerBars active />}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => skipBy(-15)}>
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button size="icon" className="h-9 w-9 rounded-full" onClick={togglePlay}>
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => skipBy(15)}>
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>

            {/* Right controls */}
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMuted(!muted)}>
                {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <Slider
                value={[muted ? 0 : volume * 100]}
                onValueChange={([v]) => { setVolume(v / 100); setMuted(false); }}
                max={100}
                step={1}
                className="w-20"
              />

              {/* Sleep timer */}
              <Select value={String(sleepTimer)} onValueChange={v => setSleepTimer(Number(v))}>
                <SelectTrigger className="w-auto h-8 px-2 border-none bg-transparent">
                  <Timer className="h-4 w-4 text-muted-foreground" />
                  {sleepTimeLeft !== null && <span className="text-[10px] ml-1">{formatTime(sleepTimeLeft)}</span>}
                </SelectTrigger>
                <SelectContent>
                  {SLEEP_OPTIONS.map(o => <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>

              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setExpanded(!expanded)}>
                {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>

              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { audioRef.current?.pause(); setIsPlaying(false); setCurrentTrack(null); }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Full-screen player */}
      <Dialog open={expanded && !!currentTrack} onOpenChange={open => setExpanded(open)}>
        <DialogContent className="max-w-md">
          {currentTrack && (
            <div className="text-center space-y-6">
              <DialogHeader>
                <DialogTitle className="sr-only">Now Playing</DialogTitle>
                <DialogDescription className="sr-only">Audio player</DialogDescription>
              </DialogHeader>

              {/* Album art */}
              <div className="mx-auto h-48 w-48 rounded-2xl bg-gradient-to-br from-[hsl(var(--chakra-indigo)/0.4)] to-[hsl(var(--wisdom-purple)/0.4)] flex items-center justify-center overflow-hidden shadow-xl">
                {currentTrack.thumbnail_url
                  ? <img src={currentTrack.thumbnail_url} alt="" className="w-full h-full object-cover" />
                  : <span className="text-7xl opacity-60">🕉️</span>}
              </div>

              <div>
                <h2 className="text-lg font-bold text-foreground">{currentTrack.title}</h2>
                {currentTrack.category && <p className="text-sm text-muted-foreground">{currentTrack.category}</p>}
              </div>

              {/* Seek bar */}
              <div className="space-y-1">
                <Slider
                  value={[duration ? (currentTime / duration) * 100 : 0]}
                  onValueChange={([v]) => seek(v)}
                  max={100}
                  step={0.1}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => skipBy(-15)}>
                  <SkipBack className="h-5 w-5" />
                </Button>
                <Button size="icon" className="h-14 w-14 rounded-full" onClick={togglePlay}>
                  {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => skipBy(15)}>
                  <SkipForward className="h-5 w-5" />
                </Button>
              </div>

              {/* Volume & Sleep */}
              <div className="flex items-center justify-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => setMuted(!muted)}>
                  {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <Slider value={[muted ? 0 : volume * 100]} onValueChange={([v]) => { setVolume(v / 100); setMuted(false); }} max={100} className="w-32" />
                <Select value={String(sleepTimer)} onValueChange={v => setSleepTimer(Number(v))}>
                  <SelectTrigger className="w-auto h-8 px-2 border-none">
                    <Timer className="h-4 w-4" />
                    {sleepTimeLeft !== null && <span className="text-[10px] ml-1">{formatTime(sleepTimeLeft)}</span>}
                  </SelectTrigger>
                  <SelectContent>
                    {SLEEP_OPTIONS.map(o => <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {currentTrack.description && (
                <p className="text-xs text-muted-foreground">{currentTrack.description}</p>
              )}

              <Button variant="outline" size="sm" onClick={() => navigate('/seeker/sacred-space')}>
                🕉️ Mix with Sacred Sounds
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
