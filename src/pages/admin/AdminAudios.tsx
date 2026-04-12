import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Music, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const AdminAudios = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const { data: audios = [], isLoading } = useQuery({ queryKey: ['learning-content', 'audio'], queryFn: async () => { const { data, error } = await supabase.from('learning_content').select('*').eq('type', 'audio').order('created_at', { ascending: false }); if (error) throw error; return data; } });
  const toggleActive = useMutation({ mutationFn: async ({ id, active }: { id: string; active: boolean }) => { const { error } = await supabase.from('learning_content').update({ is_active: active }).eq('id', id); if (error) throw error; }, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['learning-content'] }); toast({ title: '✅ Updated' }); } });
  const filtered = audios.filter(a => a.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-foreground">🎵 Audio Content</h1><p className="text-muted-foreground">Manage audio learning resources</p></div><Badge variant="secondary">{audios.length} audios</Badge></div>
      <div className="relative max-w-sm"><Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" /><Input placeholder="Search audios..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} /></div>
      <Card>
        <CardContent className="pt-6">
          {isLoading ? <p className="text-center py-8 text-muted-foreground">Loading...</p> :
          <Table><TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead>Duration</TableHead><TableHead>Views</TableHead><TableHead>Language</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>{filtered.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No audio content found</TableCell></TableRow> :
              filtered.map(a => <TableRow key={a.id}><TableCell className="font-medium max-w-[200px] truncate">{a.title}</TableCell><TableCell><Badge variant="outline">{a.category || 'General'}</Badge></TableCell><TableCell>{a.duration_minutes ? `${a.duration_minutes}m` : '—'}</TableCell><TableCell className="flex items-center gap-1"><Eye className="w-3 h-3" />{a.view_count}</TableCell><TableCell>{a.language}</TableCell><TableCell><Badge variant={a.is_active ? 'default' : 'secondary'}>{a.is_active ? 'Active' : 'Inactive'}</Badge></TableCell><TableCell><Button size="sm" variant="ghost" onClick={() => toggleActive.mutate({ id: a.id, active: !a.is_active })}>{a.is_active ? 'Deactivate' : 'Activate'}</Button></TableCell></TableRow>)}</TableBody></Table>}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAudios;
