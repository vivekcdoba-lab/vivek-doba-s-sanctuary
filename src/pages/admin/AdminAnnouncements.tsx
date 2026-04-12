import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Megaphone, Pin, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const AdminAnnouncements = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', priority: 'normal', type: 'general' });

  const { data: announcements = [], isLoading } = useQuery({ queryKey: ['announcements'], queryFn: async () => { const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false }); if (error) throw error; return data; } });

  const createAnn = useMutation({
    mutationFn: async () => { const { error } = await supabase.from('announcements').insert({ title: form.title, content: form.content, priority: form.priority, type: form.type } as any); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['announcements'] }); setOpen(false); setForm({ title: '', content: '', priority: 'normal', type: 'general' }); toast({ title: '✅ Announcement created' }); },
  });

  const togglePin = useMutation({ mutationFn: async ({ id, pinned }: { id: string; pinned: boolean }) => { const { error } = await supabase.from('announcements').update({ is_pinned: pinned }).eq('id', id); if (error) throw error; }, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['announcements'] }) });

  const deleteAnn = useMutation({ mutationFn: async (id: string) => { const { error } = await supabase.from('announcements').delete().eq('id', id); if (error) throw error; }, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['announcements'] }); toast({ title: 'Deleted' }); } });

  const priorityColors: Record<string, string> = { high: 'destructive', normal: 'default', low: 'secondary' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-foreground">📢 Announcements</h1><p className="text-muted-foreground">Manage platform announcements</p></div>
        <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />New Announcement</Button></DialogTrigger>
          <DialogContent><DialogHeader><DialogTitle>Create Announcement</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Title</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
              <div><Label>Content</Label><Textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Priority</Label><Select value={form.priority} onValueChange={v => setForm(p => ({ ...p, priority: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['low','normal','high'].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Type</Label><Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['general','event','update','urgent'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <Button onClick={() => createAnn.mutate()} disabled={!form.title || !form.content} className="w-full">Publish</Button>
            </div>
          </DialogContent></Dialog></div>
      {isLoading ? <p className="text-center py-8 text-muted-foreground">Loading...</p> :
      <div className="space-y-3">
        {announcements.map(a => (
          <Card key={a.id} className={a.is_pinned ? 'border-primary' : ''}>
            <CardContent className="py-4 flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">{a.is_pinned && <Pin className="w-4 h-4 text-primary" />}<h3 className="font-semibold">{a.title}</h3><Badge variant={(priorityColors[a.priority] || 'default') as any}>{a.priority}</Badge><Badge variant="outline">{a.type}</Badge></div>
                <p className="text-sm text-muted-foreground">{a.content}</p>
                <p className="text-xs text-muted-foreground mt-2">{format(new Date(a.created_at), 'dd MMM yyyy HH:mm')}</p>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => togglePin.mutate({ id: a.id, pinned: !a.is_pinned })}><Pin className="w-4 h-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => deleteAnn.mutate(a.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>}
    </div>
  );
};

export default AdminAnnouncements;
