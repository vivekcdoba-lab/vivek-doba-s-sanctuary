import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs';
import { Search, Plus, Pencil, Trash2, ExternalLink, Upload, Youtube, Instagram, Facebook, Twitter, Linkedin, Link as LinkIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type MediaRow = {
  id: string;
  title: string;
  platform: string;
  content_type: string;
  external_url: string;
  thumbnail_url: string | null;
  description: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
};

const PLATFORMS = [
  { value: 'youtube', label: 'YouTube', Icon: Youtube },
  { value: 'instagram', label: 'Instagram', Icon: Instagram },
  { value: 'facebook', label: 'Facebook', Icon: Facebook },
  { value: 'x', label: 'X (Twitter)', Icon: Twitter },
  { value: 'linkedin', label: 'LinkedIn', Icon: Linkedin },
  { value: 'other', label: 'Other', Icon: LinkIcon },
] as const;

const CONTENT_TYPES = [
  { value: 'video', label: 'Video' },
  { value: 'reel', label: 'Reel' },
  { value: 'short', label: 'Short' },
  { value: 'post', label: 'Post' },
  { value: 'ad', label: 'Ad' },
] as const;

function getPlatformIcon(platform: string) {
  return PLATFORMS.find(p => p.value === platform)?.Icon ?? LinkIcon;
}

function youtubeIdFromUrl(url: string): { id: string; isShort: boolean } | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) {
      const id = u.pathname.slice(1);
      return id ? { id, isShort: false } : null;
    }
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return { id: v, isShort: false };
      const m = u.pathname.match(/\/(shorts|embed)\/([\w-]+)/);
      if (m) return { id: m[2], isShort: m[1] === 'shorts' };
    }
  } catch { /* noop */ }
  return null;
}

type Detected = {
  platform?: string;
  contentType?: string;
  thumbnail?: string;
  noThumbHint?: boolean;
};

function detectFromUrl(url: string): Detected {
  if (!url || !url.trim()) return {};
  const trimmed = url.trim();
  let u: URL;
  try { u = new URL(trimmed); } catch { return {}; }
  const host = u.hostname.toLowerCase();

  // YouTube
  const yt = youtubeIdFromUrl(trimmed);
  if (yt) {
    return {
      platform: 'youtube',
      contentType: yt.isShort ? 'short' : 'video',
      thumbnail: `https://i.ytimg.com/vi/${yt.id}/hqdefault.jpg`,
    };
  }

  // Vimeo
  if (host.includes('vimeo.com')) {
    const m = u.pathname.match(/\/(\d+)/);
    if (m) {
      return {
        platform: 'other',
        contentType: 'video',
        thumbnail: `https://vumbnail.com/${m[1]}.jpg`,
      };
    }
  }

  // Instagram
  if (host.includes('instagram.com')) {
    const m = u.pathname.match(/\/(reel|reels|p|tv)\/([\w-]+)/);
    if (m) {
      const isReel = m[1] === 'reel' || m[1] === 'reels';
      return {
        platform: 'instagram',
        contentType: isReel ? 'reel' : 'post',
        thumbnail: `https://www.instagram.com/p/${m[2]}/media/?size=l`,
      };
    }
    return { platform: 'instagram', contentType: 'post' };
  }

  // Facebook
  if (host.includes('facebook.com') || host.includes('fb.watch')) {
    const reelM = u.pathname.match(/\/reel\/(\d+)/);
    if (reelM) return {
      platform: 'facebook', contentType: 'reel',
      thumbnail: `https://graph.facebook.com/${reelM[1]}/picture?type=large`,
    };
    const vidM = u.pathname.match(/\/videos\/(\d+)/);
    if (vidM) return {
      platform: 'facebook', contentType: 'video',
      thumbnail: `https://graph.facebook.com/${vidM[1]}/picture?type=large`,
    };
    const watchV = u.searchParams.get('v');
    if (watchV) return {
      platform: 'facebook', contentType: 'video',
      thumbnail: `https://graph.facebook.com/${watchV}/picture?type=large`,
    };
    return { platform: 'facebook', contentType: 'post', noThumbHint: true };
  }

  // X / Twitter
  if (host === 'x.com' || host.endsWith('.x.com') || host.includes('twitter.com')) {
    return { platform: 'x', contentType: 'post', noThumbHint: true };
  }

  // LinkedIn
  if (host.includes('linkedin.com')) {
    return { platform: 'linkedin', contentType: 'post', noThumbHint: true };
  }

  return {};
}

const emptyForm: Partial<MediaRow> = {
  title: '',
  platform: 'youtube',
  content_type: 'video',
  external_url: '',
  thumbnail_url: '',
  description: '',
  display_order: 0,
  is_active: true,
};

const AdminHomepageMedia = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MediaRow | null>(null);
  const [form, setForm] = useState<Partial<MediaRow>>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [detected, setDetected] = useState<Detected>({});
  // Tracks whether the admin has manually overridden these fields. Reset on dialog open.
  const autoThumbRef = useRef(true);
  const manualPlatformRef = useRef(false);
  const manualTypeRef = useRef(false);

  // When the URL changes, auto-detect platform/type/thumbnail
  useEffect(() => {
    if (!dialogOpen) return;
    const d = detectFromUrl(form.external_url || '');
    setDetected(d);
    setForm(f => {
      const next: Partial<MediaRow> = { ...f };
      if (autoThumbRef.current) {
        next.thumbnail_url = d.thumbnail || '';
      }
      if (!manualPlatformRef.current && d.platform) {
        next.platform = d.platform;
      }
      if (!manualTypeRef.current && d.contentType) {
        next.content_type = d.contentType;
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.external_url, dialogOpen]);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['homepage-media-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homepage_media')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as MediaRow[];
    },
  });

  const upsert = useMutation({
    mutationFn: async (payload: Partial<MediaRow>) => {
      // Save-time fallback: derive thumbnail from URL if still empty
      let thumb = payload.thumbnail_url || '';
      if (!thumb && payload.external_url) {
        const d = detectFromUrl(payload.external_url);
        if (d.thumbnail) thumb = d.thumbnail;
      }
      const data = {
        title: payload.title?.trim() || '',
        platform: payload.platform || 'youtube',
        content_type: payload.content_type || 'video',
        external_url: payload.external_url?.trim() || '',
        thumbnail_url: thumb || null,
        description: payload.description?.trim() || null,
        display_order: Number(payload.display_order ?? 0),
        is_active: !!payload.is_active,
      };
      if (editing?.id) {
        const { error } = await supabase.from('homepage_media').update(data).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('homepage_media').insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['homepage-media-admin'] });
      qc.invalidateQueries({ queryKey: ['homepage-media-public'] });
      toast({ title: editing ? '✅ Updated' : '✅ Added' });
      setDialogOpen(false);
      setEditing(null);
      setForm(emptyForm);
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from('homepage_media').update({ is_active: active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['homepage-media-admin'] });
      qc.invalidateQueries({ queryKey: ['homepage-media-public'] });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('homepage_media').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['homepage-media-admin'] });
      qc.invalidateQueries({ queryKey: ['homepage-media-public'] });
      toast({ title: '🗑️ Deleted' });
    },
  });

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from('homepage-media').upload(path, file, { upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from('homepage-media').getPublicUrl(path);
      autoThumbRef.current = false;
      setForm(f => ({ ...f, thumbnail_url: data.publicUrl }));
      toast({ title: '✅ Thumbnail uploaded' });
    } catch (e: any) {
      toast({ title: 'Upload failed', description: e.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    autoThumbRef.current = true;
    manualPlatformRef.current = false;
    manualTypeRef.current = false;
    setDetected({});
    setDialogOpen(true);
  }

  function openEdit(row: MediaRow) {
    setEditing(row);
    setForm(row);
    // Existing rows already have user-set values; don't auto-overwrite them
    autoThumbRef.current = !row.thumbnail_url;
    manualPlatformRef.current = true;
    manualTypeRef.current = true;
    setDetected(detectFromUrl(row.external_url || ''));
    setDialogOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title?.trim() || !form.external_url?.trim()) {
      toast({ title: 'Title and URL required', variant: 'destructive' });
      return;
    }
    upsert.mutate(form);
  }

  const filtered = rows.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.platform.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">📺 Homepage Media</h1>
          <p className="text-muted-foreground">Manage videos & social posts shown on the homepage</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary">{rows.length} items</Badge>
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4" /> Add Media
          </Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by title or platform..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thumbnail</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No media yet</TableCell></TableRow>
                ) : filtered.map(r => {
                  const Icon = getPlatformIcon(r.platform);
                  return (
                    <TableRow key={r.id}>
                      <TableCell>
                        {r.thumbnail_url ? (
                          <img src={r.thumbnail_url} alt={r.title} className="w-20 h-12 object-cover rounded border border-border" />
                        ) : (
                          <div className="w-20 h-12 rounded border border-dashed border-border flex items-center justify-center text-muted-foreground"><Icon className="w-4 h-4" /></div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium max-w-[240px] truncate">{r.title}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5">
                          <Icon className="w-4 h-4" />
                          {PLATFORMS.find(p => p.value === r.platform)?.label ?? r.platform}
                        </span>
                      </TableCell>
                      <TableCell><Badge variant="outline">{r.content_type}</Badge></TableCell>
                      <TableCell>{r.display_order}</TableCell>
                      <TableCell>
                        <Switch checked={r.is_active} onCheckedChange={(v) => toggleActive.mutate({ id: r.id, active: v })} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" asChild title="Open URL">
                            <a href={r.external_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-4 h-4" /></a>
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => openEdit(r)}><Pencil className="w-4 h-4" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => {
                            if (confirm(`Delete "${r.title}"?`)) remove.mutate(r.id);
                          }}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditing(null); setForm(emptyForm); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Media' : 'Add Media'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Platform</Label>
                <Select value={form.platform} onValueChange={(v) => { manualPlatformRef.current = true; setForm(f => ({ ...f, platform: v })); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Type</Label>
                <Select value={form.content_type} onValueChange={(v) => { manualTypeRef.current = true; setForm(f => ({ ...f, content_type: v })); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CONTENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>External URL *</Label>
              <Input
                type="url"
                placeholder="https://youtube.com/watch?v=... or https://instagram.com/reel/..."
                value={form.external_url || ''}
                onChange={e => setForm(f => ({ ...f, external_url: e.target.value }))}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">Where the user goes when they click the card. We'll auto-pick a thumbnail from the link when possible.</p>
              {detected.noThumbHint && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  This platform doesn't expose a public thumbnail — please upload one below.
                </p>
              )}
            </div>

            <div>
              <Label>Thumbnail</Label>
              <Tabs defaultValue="url">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="url">Paste URL</TabsTrigger>
                  <TabsTrigger value="upload">Upload</TabsTrigger>
                </TabsList>
                <TabsContent value="url" className="space-y-2">
                  <Input
                    type="url"
                    placeholder="Auto-filled from link — override here if needed"
                    value={form.thumbnail_url || ''}
                    onChange={e => { autoThumbRef.current = false; setForm(f => ({ ...f, thumbnail_url: e.target.value })); }}
                  />
                </TabsContent>
                <TabsContent value="upload" className="space-y-2">
                  <Input type="file" accept="image/*" disabled={uploading} onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(file);
                  }} />
                  {uploading && <p className="text-xs text-muted-foreground"><Upload className="w-3 h-3 inline" /> Uploading...</p>}
                </TabsContent>
              </Tabs>
              {form.thumbnail_url && (
                <img
                  src={form.thumbnail_url}
                  alt="preview"
                  className="mt-2 w-40 aspect-video object-cover rounded border border-border"
                  onError={(e) => {
                    // YouTube fallback chain: maxres -> hq -> mq -> default
                    const img = e.currentTarget as HTMLImageElement;
                    const src = img.src;
                    const ytMatch = src.match(/i\.ytimg\.com\/vi\/([\w-]+)\/(\w+)\.jpg/);
                    if (!ytMatch) return;
                    const id = ytMatch[1];
                    const current = ytMatch[2];
                    const chain = ['maxresdefault', 'hqdefault', 'mqdefault', 'default'];
                    const idx = chain.indexOf(current);
                    if (idx >= 0 && idx < chain.length - 1) {
                      img.src = `https://i.ytimg.com/vi/${id}/${chain[idx + 1]}.jpg`;
                    }
                  }}
                />
              )}
            </div>

            <div>
              <Label>Description</Label>
              <Textarea rows={2} value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>

            <div className="grid grid-cols-2 gap-3 items-end">
              <div>
                <Label>Display order</Label>
                <Input type="number" value={form.display_order ?? 0} onChange={e => setForm(f => ({ ...f, display_order: Number(e.target.value) }))} />
              </div>
              <div className="flex items-center gap-2 pb-2">
                <Switch checked={!!form.is_active} onCheckedChange={(v) => setForm(f => ({ ...f, is_active: v }))} />
                <Label>Active</Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={upsert.isPending}>{editing ? 'Save' : 'Add'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminHomepageMedia;
