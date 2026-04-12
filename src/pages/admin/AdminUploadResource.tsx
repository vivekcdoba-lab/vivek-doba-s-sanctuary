import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const AdminUploadResource = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ title: '', description: '', type: 'video', category: '', language: 'HI', url: '', duration_minutes: '' });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('learning_content').insert({ title: form.title, description: form.description || null, type: form.type, category: form.category || null, language: form.language, url: form.url, duration_minutes: form.duration_minutes ? parseInt(form.duration_minutes) : null } as any);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['learning-content'] }); toast({ title: '✅ Resource uploaded' }); setForm({ title: '', description: '', type: 'video', category: '', language: 'HI', url: '', duration_minutes: '' }); },
    onError: () => toast({ title: 'Upload failed', variant: 'destructive' }),
  });

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">📤 Upload Resource</h1><p className="text-muted-foreground">Add new learning content</p></div>
      <Card className="max-w-2xl">
        <CardHeader><CardTitle className="flex items-center gap-2"><FileUp className="w-5 h-5" /> Resource Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={e => { e.preventDefault(); if (!form.title || !form.url) { toast({ title: 'Title and URL required', variant: 'destructive' }); return; } createMutation.mutate(); }} className="space-y-4">
            <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Resource title" /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Type</Label><Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="video">Video</SelectItem><SelectItem value="audio">Audio</SelectItem><SelectItem value="pdf">PDF</SelectItem></SelectContent></Select></div>
              <div><Label>Language</Label><Select value={form.language} onValueChange={v => setForm(p => ({ ...p, language: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="HI">Hindi</SelectItem><SelectItem value="EN">English</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Category</Label><Input value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} placeholder="e.g. Dharma, Meditation" /></div>
              <div><Label>Duration (min)</Label><Input type="number" value={form.duration_minutes} onChange={e => setForm(p => ({ ...p, duration_minutes: e.target.value }))} /></div>
            </div>
            <div><Label>URL *</Label><Input value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))} placeholder="https://..." /></div>
            <Button type="submit" disabled={createMutation.isPending} className="w-full"><Upload className="w-4 h-4 mr-2" />{createMutation.isPending ? 'Uploading...' : 'Upload Resource'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUploadResource;
