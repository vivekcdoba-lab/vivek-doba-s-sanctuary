import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileUp, Laptop, Cloud, Link as LinkIcon, Loader2, Lock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { VISIBILITY_OPTIONS, ContentVisibility } from '@/lib/contentVisibility';

type Source = 'laptop' | 'drive' | 'url';

const acceptForType = (t: string) => {
  if (t === 'video') return 'video/mp4,video/quicktime,.mp4,.mov';
  if (t === 'audio') return 'audio/*,.mp3,.m4a,.wav';
  if (t === 'pdf') return 'application/pdf,.pdf';
  return '*/*';
};

const DEFAULT_CATEGORIES = ['Course Materials', 'Worksheets', 'Meditation', 'Affirmations', 'Templates', 'Books'];

const AdminUploadResource = () => {
  const queryClient = useQueryClient();
  const [source, setSource] = useState<Source>('laptop');
  const [uploading, setUploading] = useState(false);
  const [categoryMode, setCategoryMode] = useState<'select' | 'other'>('select');
  const [form, setForm] = useState({ title: '', description: '', type: 'video', category: '', language: 'HI', url: '', duration_minutes: '', visibility: 'all' as ContentVisibility });

  const { data: existingCategories = [] } = useQuery({
    queryKey: ['learning-content-categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('learning_content').select('category');
      if (error) throw error;
      const uniq = Array.from(new Set((data || []).map((r: any) => r.category).filter(Boolean))) as string[];
      return uniq;
    },
  });

  const categoryOptions = Array.from(new Set([...DEFAULT_CATEGORIES, ...existingCategories])).sort();

  const reset = () => {
    setForm({ title: '', description: '', type: 'video', category: '', language: 'HI', url: '', duration_minutes: '' });
    setSource('laptop');
    setCategoryMode('select');
  };

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${form.type}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from('resources').upload(path, file, { upsert: false, contentType: file.type });
      if (error) throw error;
      setForm(p => ({ ...p, url: `storage:resources/${path}` }));
      toast({ title: '✅ File uploaded', description: file.name });
    } catch (e: any) {
      toast({ title: 'Upload failed', description: e.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('learning_content').insert({ title: form.title, description: form.description || null, type: form.type, category: form.category || null, language: form.language, url: form.url, duration_minutes: form.duration_minutes ? parseInt(form.duration_minutes) : null } as any);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['learning-content'] }); queryClient.invalidateQueries({ queryKey: ['learning-content-categories'] }); toast({ title: '✅ Resource uploaded' }); reset(); },
    onError: (e: any) => toast({ title: 'Upload failed', description: e.message, variant: 'destructive' }),
  });

  const sourceTabs: { id: Source; label: string; icon: any }[] = [
    { id: 'laptop', label: 'From Laptop', icon: Laptop },
    { id: 'drive', label: 'Google Drive', icon: Cloud },
    { id: 'url', label: 'URL / Online', icon: LinkIcon },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">📤 Upload Resource</h1><p className="text-muted-foreground">Add new learning content</p></div>
      <Card className="max-w-2xl">
        <CardHeader><CardTitle className="flex items-center gap-2"><FileUp className="w-5 h-5" /> Resource Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={e => { e.preventDefault(); if (!form.title || !form.url) { toast({ title: 'Title and URL/file required', variant: 'destructive' }); return; } createMutation.mutate(); }} className="space-y-4">
            <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Resource title" /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Type</Label><Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v, url: '' }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="video">Video</SelectItem><SelectItem value="audio">Audio</SelectItem><SelectItem value="pdf">PDF</SelectItem></SelectContent></Select></div>
              <div>
                <Label>Language</Label>
                <Select value={form.language} onValueChange={v => setForm(p => ({ ...p, language: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HI">Hindi</SelectItem>
                    <SelectItem value="EN">English</SelectItem>
                    <SelectItem value="MR">Marathi</SelectItem>
                    <SelectItem value="HG">Hinglish</SelectItem>
                    <SelectItem value="MIX">Mix Language</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                {categoryMode === 'select' ? (
                  <Select
                    value={form.category}
                    onValueChange={v => {
                      if (v === '__other__') { setCategoryMode('other'); setForm(p => ({ ...p, category: '' })); }
                      else setForm(p => ({ ...p, category: v }));
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      <SelectItem value="__other__">Other…</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex gap-2">
                    <Input value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} placeholder="New category name" autoFocus />
                    <Button type="button" variant="ghost" size="sm" onClick={() => { setCategoryMode('select'); setForm(p => ({ ...p, category: '' })); }}>Cancel</Button>
                  </div>
                )}
              </div>
              <div><Label>Duration (min)</Label><Input type="number" value={form.duration_minutes} onChange={e => setForm(p => ({ ...p, duration_minutes: e.target.value }))} /></div>
            </div>

            <div className="space-y-2">
              <Label>Source *</Label>
              <div className="flex gap-2 flex-wrap">
                {sourceTabs.map(t => {
                  const Icon = t.icon;
                  const active = source === t.id;
                  return (
                    <button type="button" key={t.id} onClick={() => { setSource(t.id); setForm(p => ({ ...p, url: '' })); }} className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                      <Icon className="w-4 h-4" /> {t.label}
                    </button>
                  );
                })}
              </div>

              {source === 'laptop' && (
                <div className="space-y-2">
                  <Input type="file" accept={acceptForType(form.type)} disabled={uploading} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                  {uploading && <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Loader2 className="w-3 h-3 animate-spin" /> Uploading…</p>}
                  {form.url && !uploading && <p className="text-xs text-muted-foreground break-all">📎 {form.url}</p>}
                </div>
              )}

              {source === 'drive' && (
                <div className="space-y-1">
                  <Input value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))} placeholder="https://drive.google.com/file/d/..." />
                  <p className="text-xs text-muted-foreground">Set link sharing to "Anyone with the link can view".</p>
                </div>
              )}

              {source === 'url' && (
                <Input value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))} placeholder="https://... (YouTube, Vimeo, Dropbox, etc.)" />
              )}
            </div>

            <Button type="submit" disabled={createMutation.isPending || uploading || !form.url} className="w-full"><Upload className="w-4 h-4 mr-2" />{createMutation.isPending ? 'Saving...' : 'Upload Resource'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUploadResource;
