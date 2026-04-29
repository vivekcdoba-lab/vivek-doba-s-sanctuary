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
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  FileText, Search, Download, Eye, Bookmark, BookmarkCheck,
  Grid3X3, List, Filter, ExternalLink, Share2, X, Maximize2
} from 'lucide-react';
import { toast } from 'sonner';

const PDF_CATEGORIES = [
  { key: 'Workshop Handouts', emoji: '📋', color: 'bg-[hsl(var(--saffron))]/10 text-[hsl(var(--saffron))]' },
  { key: 'Framework PDFs', emoji: '🧩', color: 'bg-[hsl(var(--chakra-indigo))]/10 text-[hsl(var(--chakra-indigo))]' },
  { key: 'Session Worksheets', emoji: '📝', color: 'bg-[hsl(var(--dharma-green))]/10 text-[hsl(var(--dharma-green))]' },
  { key: 'Reading Materials', emoji: '📖', color: 'bg-[hsl(var(--wisdom-purple))]/10 text-[hsl(var(--wisdom-purple))]' },
  { key: 'Certificates', emoji: '🏅', color: 'bg-[hsl(var(--gold-bright))]/10 text-[hsl(var(--gold-bright))]' },
];

interface PdfItem {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  url: string;
  thumbnail_url: string | null;
  duration_minutes: number | null;
  tier: string;
  language: string;
  tags: string[] | null;
  view_count: number;
  created_at: string;
  course_id: string | null;
}

interface PdfProgress {
  id: string;
  content_id: string;
  progress_percent: number;
  is_completed: boolean;
  is_bookmarked: boolean;
}

export default function SeekerLearningPdfs() {
  const { profile } = useAuthStore();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [viewingPdf, setViewingPdf] = useState<PdfItem | null>(null);
  const [fullscreen, setFullscreen] = useState(false);

  // Fetch PDF content from learning_content + resources tables
  const { data: content = [], isLoading } = useQuery({
    queryKey: ['learning-pdfs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_content')
        .select('*')
        .eq('is_active', true)
        .eq('type', 'pdf')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as PdfItem[];
    },
  });

  // Also fetch from resources table
  const { data: resources = [] } = useQuery({
    queryKey: ['resources-pdfs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('type', 'pdf')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((r: any) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        category: r.category,
        url: r.file_url || '',
        thumbnail_url: null,
        duration_minutes: null,
        tier: 'standard',
        language: r.language || 'EN',
        tags: Array.isArray(r.tags) ? r.tags : [],
        view_count: r.view_count || 0,
        created_at: r.created_at,
        course_id: r.course_id,
      })) as PdfItem[];
    },
  });

  const allPdfs = useMemo(() => {
    const ids = new Set(content.map(c => c.id));
    return [...content, ...resources.filter(r => !ids.has(r.id))];
  }, [content, resources]);

  // Fetch progress
  const { data: progressMap = {} } = useQuery({
    queryKey: ['pdf-progress', profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_content_progress')
        .select('*')
        .eq('seeker_id', profile!.id);
      if (error) throw error;
      const map: Record<string, PdfProgress> = {};
      (data || []).forEach((p: any) => { map[p.content_id] = p as PdfProgress; });
      return map;
    },
  });

  const upsertProgress = useMutation({
    mutationFn: async (params: { contentId: string; updates: Partial<PdfProgress> }) => {
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pdf-progress'] }),
  });

  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const cur = progressMap[id]?.is_bookmarked || false;
    upsertProgress.mutate({ contentId: id, updates: { is_bookmarked: !cur } });
    toast.success(cur ? 'Removed bookmark' : 'Bookmarked!');
  };

  const handleView = (item: PdfItem) => {
    setViewingPdf(item);
    upsertProgress.mutate({ contentId: item.id, updates: { progress_percent: 100, is_completed: true } });
  };

  const handleShare = async (item: PdfItem) => {
    const text = `📄 ${item.title}`;
    if (navigator.share) {
      await navigator.share({ title: item.title, text, url: item.url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(item.url);
      toast.success('Link copied!');
    }
  };

  const filtered = useMemo(() =>
    allPdfs.filter(c => {
      if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !(c.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase()))) return false;
      if (catFilter !== 'all' && c.category !== catFilter) return false;
      return true;
    }),
  [allPdfs, search, catFilter]);

  const bookmarked = useMemo(() => allPdfs.filter(c => progressMap[c.id]?.is_bookmarked), [allPdfs, progressMap]);

  const getCatMeta = (cat: string | null) => PDF_CATEGORIES.find(c => c.key === cat);

  const isNew = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    return diff < 7 * 24 * 60 * 60 * 1000;
  };

  const PdfCard = ({ item }: { item: PdfItem }) => {
    const prog = progressMap[item.id];
    const catMeta = getCatMeta(item.category);

    if (viewMode === 'list') {
      return (
        <div className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:shadow-md transition-all group">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground truncate">{item.title}</h3>
              {isNew(item.created_at) && <Badge className="bg-[hsl(var(--dharma-green))] text-white text-[8px] px-1.5">NEW</Badge>}
              {prog?.is_completed && <Badge variant="outline" className="text-[8px] px-1.5">✓ Viewed</Badge>}
            </div>
            <p className="text-xs text-muted-foreground truncate">{item.description || item.category}</p>
          </div>
          <div className="flex items-center gap-1.5">
            {catMeta && <Badge className={`${catMeta.color} text-[10px]`}>{catMeta.emoji} {catMeta.key}</Badge>}
            <Badge variant="outline" className="text-[10px]">{item.language}</Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleView(item); }}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => toggleBookmark(item.id, e)}>
              {prog?.is_bookmarked ? <BookmarkCheck className="h-4 w-4 text-[hsl(var(--gold-bright))]" /> : <Bookmark className="h-4 w-4" />}
            </Button>
            {/* Download removed — view-only */}
          </div>
        </div>
      );
    }

    return (
      <Card className="overflow-hidden hover:shadow-lg transition-all group cursor-pointer border-border" onClick={() => handleView(item)}>
        {/* Thumbnail / Icon area */}
        <div className="relative aspect-[4/3] bg-gradient-to-br from-primary/5 to-primary/15 flex items-center justify-center">
          {item.thumbnail_url ? (
            <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            <div className="text-center">
              <FileText className="h-12 w-12 text-primary/40 mx-auto" />
              <span className="text-[10px] text-muted-foreground mt-1 block">{item.category || 'PDF'}</span>
            </div>
          )}

          {/* Overlay actions */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <Button size="icon" className="h-9 w-9 rounded-full"><Eye className="h-4 w-4" /></Button>
            {/* Download removed — view-only */}
          </div>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-1">
            {isNew(item.created_at) && <Badge className="bg-[hsl(var(--dharma-green))] text-white text-[8px] px-1.5">NEW</Badge>}
            {prog?.is_completed && <Badge className="bg-primary/80 text-primary-foreground text-[8px] px-1.5">✓</Badge>}
          </div>
          <button
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => toggleBookmark(item.id, e)}
          >
            {prog?.is_bookmarked
              ? <BookmarkCheck className="h-5 w-5 text-[hsl(var(--gold-bright))]" />
              : <Bookmark className="h-5 w-5 text-white/80" />}
          </button>

          {/* View count */}
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
            <Eye className="h-3 w-3" /> {item.view_count}
          </div>
        </div>

        <CardContent className="p-3 space-y-1.5">
          <h3 className="text-xs font-semibold text-foreground line-clamp-2 leading-tight">{item.title}</h3>
          {item.description && <p className="text-[10px] text-muted-foreground line-clamp-1">{item.description}</p>}
          <div className="flex items-center gap-1.5 flex-wrap">
            {catMeta && <Badge className={`${catMeta.color} text-[9px] px-1.5 py-0`}>{catMeta.emoji} {catMeta.key}</Badge>}
            <Badge variant="outline" className="text-[9px] px-1.5 py-0">{item.language}</Badge>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <BackToHome />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" /> PDF Resources
          </h1>
          <p className="text-sm text-muted-foreground">{allPdfs.length} documents available</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            className="h-9 w-9"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            className="h-9 w-9"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by title or tag..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-[220px]">
            <Filter className="h-4 w-4 mr-1" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {PDF_CATEGORIES.map(c => <SelectItem key={c.key} value={c.key}>{c.emoji} {c.key}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : allPdfs.length === 0 ? (
        <Card className="py-16 text-center">
          <CardContent>
            <FileText className="h-14 w-14 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-bold text-foreground mb-2">No PDF Resources Yet</h2>
            <p className="text-muted-foreground">Check back soon for worksheets, frameworks, and reading materials.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Bookmarked section */}
          {bookmarked.length > 0 && catFilter === 'all' && !search && (
            <div className="space-y-2">
              <h2 className="text-base font-bold text-foreground">⭐ Bookmarked</h2>
              <div className={viewMode === 'grid'
                ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'
                : 'space-y-2'}>
                {bookmarked.map(i => <PdfCard key={`bm-${i.id}`} item={i} />)}
              </div>
            </div>
          )}

          {/* Main content */}
          <div>
            <h2 className="text-base font-bold text-foreground mb-3">
              {catFilter !== 'all' ? `${getCatMeta(catFilter)?.emoji || '📄'} ${catFilter}` : '📄 All Documents'}
              <span className="text-sm font-normal text-muted-foreground ml-2">({filtered.length})</span>
            </h2>
            {filtered.length === 0 ? (
              <p className="text-center text-muted-foreground py-10">No documents match your filters.</p>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filtered.map(i => <PdfCard key={i.id} item={i} />)}
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map(i => <PdfCard key={i.id} item={i} />)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* PDF Viewer Dialog */}
      <Dialog open={!!viewingPdf && !fullscreen} onOpenChange={open => { if (!open) setViewingPdf(null); }}>
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0">
          {viewingPdf && (
            <>
              <DialogHeader className="px-4 pt-4 pb-2 border-b flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <DialogTitle className="text-base truncate">{viewingPdf.title}</DialogTitle>
                    <DialogDescription className="text-xs">{viewingPdf.category || 'PDF Document'}</DialogDescription>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleShare(viewingPdf)}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleBookmark(viewingPdf.id)}>
                      {progressMap[viewingPdf.id]?.is_bookmarked
                        ? <BookmarkCheck className="h-4 w-4 text-[hsl(var(--gold-bright))]" />
                        : <Bookmark className="h-4 w-4" />}
                    </Button>
                    {/* Download intentionally disabled — view-only */}
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setFullscreen(true)}>
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </DialogHeader>
              <div className="flex-1 min-h-0" onContextMenu={(e) => e.preventDefault()}>
                {viewingPdf.url ? (
                  <iframe
                    src={`${viewingPdf.url}${viewingPdf.url.includes('#') ? '' : '#toolbar=0&navpanes=0'}`}
                    className="w-full h-full border-0"
                    title={viewingPdf.title}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>No preview available for this document.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Fullscreen viewer */}
      {viewingPdf && fullscreen && (
        <div className="fixed inset-0 z-[100] bg-background flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 border-b bg-card">
            <h2 className="text-sm font-semibold text-foreground truncate">{viewingPdf.title}</h2>
            <div className="flex items-center gap-1">
              {/* Download and Open-in-tab intentionally disabled — view-only */}
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setFullscreen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1" onContextMenu={(e) => e.preventDefault()}>
            <iframe src={`${viewingPdf.url}${viewingPdf.url.includes('#') ? '' : '#toolbar=0&navpanes=0'}`} className="w-full h-full border-0" title={viewingPdf.title} />
          </div>
        </div>
      )}
    </div>
  );
}
