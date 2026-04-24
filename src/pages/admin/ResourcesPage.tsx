import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RESOURCES, COURSES } from '@/data/mockData';
import { STORY_LIBRARY } from '@/data/storyLibrary';
import { FileText, Headphones, Video, FileSpreadsheet, Search, Download, Eye, BookOpen, Trash2, Laptop, Cloud, Link as LinkIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Resource } from '@/types';
import { ResourcePreviewModal } from '@/components/ResourcePreviewModal';

const typeIcon: Record<string, any> = { pdf: FileText, audio: Headphones, video: Video, worksheet: FileSpreadsheet };
const typeColors: Record<string, string> = {
  pdf: 'bg-rose-500/10 text-rose-600',
  audio: 'bg-violet-500/10 text-violet-600',
  video: 'bg-sky-500/10 text-sky-600',
  worksheet: 'bg-emerald-500/10 text-emerald-600',
};
const categories = ['All', 'Course Materials', 'Worksheets', 'Meditation', 'Affirmations', 'Templates', 'Books'];
const langColors: Record<string, string> = {
  EN: 'bg-sky-blue/10 text-sky-blue',
  MR: 'bg-saffron/10 text-saffron',
  HI: 'bg-lotus-pink/10 text-lotus-pink',
  HG: 'bg-amber-500/10 text-amber-600',
  MIX: 'bg-muted text-muted-foreground',
};

type ExtResource = Resource & { url?: string; _source?: 'db'; _createdAt?: string };

const sourceLabel = (url?: string): { label: string; icon: any } | null => {
  if (!url) return null;
  if (url.startsWith('storage:resources/')) return { label: 'Laptop', icon: Laptop };
  if (url.includes('drive.google.com')) return { label: 'Drive', icon: Cloud };
  return { label: 'URL', icon: LinkIcon };
};

const openResource = async (url?: string) => {
  if (!url) return;
  if (url.startsWith('storage:resources/')) {
    const path = url.replace('storage:resources/', '');
    const { data, error } = await supabase.storage.from('resources').createSignedUrl(path, 60);
    if (error || !data?.signedUrl) { toast.error('Could not open file'); return; }
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
    return;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
};

// PDF thumbnail component (lazy loads pdfjs)
const PdfThumbnail = ({ url }: { url?: string }) => {
  const [thumb, setThumb] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!url) { setFailed(true); return; }
    (async () => {
      try {
        let resolvedUrl = url;
        if (url.startsWith('storage:resources/')) {
          const path = url.replace('storage:resources/', '');
          const { data, error } = await supabase.storage.from('resources').createSignedUrl(path, 120);
          if (error || !data?.signedUrl) throw new Error('signed url');
          resolvedUrl = data.signedUrl;
        }
        const pdfjs: any = await import('pdfjs-dist');
        // worker setup via CDN to avoid bundler config
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
        const loadingTask = pdfjs.getDocument(resolvedUrl);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 0.4 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('canvas');
        await page.render({ canvasContext: ctx, viewport }).promise;
        if (!cancelled) setThumb(canvas.toDataURL('image/jpeg', 0.7));
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => { cancelled = true; };
  }, [url]);

  if (failed || (!thumb && !url)) {
    return (
      <div className="h-24 w-full bg-muted/30 flex items-center justify-center border-b border-border">
        <FileText className="w-8 h-8 text-muted-foreground/50" />
      </div>
    );
  }
  if (!thumb) {
    return <div className="h-24 w-full bg-muted/30 animate-pulse border-b border-border" />;
  }
  return (
    <div className="h-24 w-full bg-muted/30 border-b border-border overflow-hidden flex items-center justify-center">
      <img src={thumb} alt="PDF preview" className="max-h-full object-contain" />
    </div>
  );
};

const ResourcesPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [typeFilter, setTypeFilter] = useState('all');
  const [langFilter, setLangFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'resources' | 'stories'>('resources');
  const [storySource, setStorySource] = useState('all');

  const { data: dbResources = [] } = useQuery({
    queryKey: ['learning-content'],
    queryFn: async () => {
      const { data, error } = await supabase.from('learning_content').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((r: any): ExtResource => ({
        id: r.id,
        title: r.title,
        description: r.description || '',
        type: r.type,
        category: r.category || 'Course Materials',
        language: (r.language || 'EN') as Resource['language'],
        tags: [],
        view_count: 0,
        download_count: 0,
        url: r.url,
        _source: 'db',
        _createdAt: r.created_at,
      } as ExtResource));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (r: ExtResource) => {
      if (r.url?.startsWith('storage:resources/')) {
        const path = r.url.replace('storage:resources/', '');
        await supabase.storage.from('resources').remove([path]);
      }
      const { error } = await supabase.from('learning_content').delete().eq('id', r.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-content'] });
      toast.success('Resource deleted');
    },
    onError: (e: any) => toast.error(e.message || 'Delete failed'),
  });

  const allResources: ExtResource[] = [...dbResources, ...(RESOURCES as ExtResource[])];

  const filtered = allResources.filter((r) => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || r.category === category;
    const matchType = typeFilter === 'all' || r.type === typeFilter;
    const matchLang = langFilter === 'all' || r.language === langFilter;
    return matchSearch && matchCat && matchType && matchLang;
  });

  const filteredStories = STORY_LIBRARY.filter(s => {
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase()) || s.theme.toLowerCase().includes(search.toLowerCase());
    const matchSource = storySource === 'all' || s.source === storySource;
    return matchSearch && matchSource;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Resource Library</h1>
          <p className="text-sm text-muted-foreground">{allResources.length} resources • {STORY_LIBRARY.length} stories</p>
        </div>
      </div>

      {/* Tab Toggle */}
      <div className="flex gap-2">
        <button onClick={() => setActiveTab('resources')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'resources' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
          📁 Resources
        </button>
        <button onClick={() => setActiveTab('stories')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'stories' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
          📖 Story Library
        </button>
      </div>

      {activeTab === 'resources' ? (
        <>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search resources..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[140px]"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="worksheet">Worksheet</SelectItem>
              </SelectContent>
            </Select>
            <Select value={langFilter} onValueChange={setLangFilter}>
              <SelectTrigger className="w-full sm:w-[150px]"><SelectValue placeholder="Language" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                <SelectItem value="EN">English</SelectItem>
                <SelectItem value="HI">Hindi</SelectItem>
                <SelectItem value="MR">Marathi</SelectItem>
                <SelectItem value="HG">Hinglish</SelectItem>
                <SelectItem value="MIX">Mix</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((c) => (
              <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${category === c ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>{c}</button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 stagger-children">
            {filtered.map((r) => {
              const Icon = typeIcon[r.type] || FileText;
              const course = (r as any).course_id ? COURSES.find(c => c.id === (r as any).course_id) : null;
              const url = r.url;
              const src = sourceLabel(url);
              const SrcIcon = src?.icon;
              const isDb = r._source === 'db';
              return (
                <div key={r.id} className="bg-card rounded-2xl shadow-md border border-border overflow-hidden card-hover">
                  {r.type === 'pdf' && <PdfThumbnail url={url} />}
                  <div className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${typeColors[r.type] || 'bg-primary/10 text-primary'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-foreground text-sm">{r.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{r.description}</p>
                      </div>
                      {isDb && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive flex-shrink-0">
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this resource?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently remove "{r.title}" and any uploaded file. This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteMutation.mutate(r)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      {course && <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{course.name.slice(0, 25)}</span>}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${langColors[r.language] || 'bg-muted text-muted-foreground'}`}>{r.language}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${typeColors[r.type] || 'bg-muted text-muted-foreground'}`}>{r.type}</span>
                      {src && SrcIcon && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground inline-flex items-center gap-1">
                          <SrcIcon className="w-2.5 h-2.5" /> {src.label}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex gap-3">
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {r.view_count}</span>
                        <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {r.download_count}</span>
                      </div>
                      {url ? (
                        <button onClick={() => openResource(url)} className="text-primary hover:underline font-medium">View →</button>
                      ) : (
                        <span title="No URL available" className="text-muted-foreground/60 font-medium cursor-not-allowed">View →</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <>
          {/* Story Library */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search stories by title or theme..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <div className="flex gap-2">
              {['all', 'ramayana', 'mahabharata', 'other'].map(src => (
                <button key={src} onClick={() => setStorySource(src)} className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${storySource === src ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {src === 'all' ? 'All' : src.charAt(0).toUpperCase() + src.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 stagger-children">
            {filteredStories.map(story => (
              <div key={story.id} className="bg-card rounded-2xl shadow-md border border-border overflow-hidden card-hover">
                <div className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-foreground text-sm">{story.title}</h3>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {story.theme.split(', ').map(t => (
                          <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 mb-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Source</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        story.source === 'ramayana' ? 'bg-saffron/10 text-saffron' :
                        story.source === 'mahabharata' ? 'bg-chakra-indigo/10 text-chakra-indigo' :
                        'bg-muted text-muted-foreground'
                      }`}>{story.source}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Times Used</span>
                      <span className="font-medium text-foreground">{story.times_used}</span>
                    </div>
                    {story.effective_with && (
                      <div className="text-xs">
                        <span className="text-muted-foreground">Most effective with: </span>
                        <span className="text-foreground">{story.effective_with}</span>
                      </div>
                    )}
                    {story.last_used_seeker && (
                      <div className="text-xs text-muted-foreground">
                        Last used: {story.last_used_seeker}, {story.last_used_session}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {((activeTab === 'resources' && filtered.length === 0) || (activeTab === 'stories' && filteredStories.length === 0)) && (
        <div className="text-center py-16">
          <span className="text-5xl block mb-4">📁</span>
          <p className="text-muted-foreground">No results match your search.</p>
        </div>
      )}
    </div>
  );
};

export default ResourcesPage;
