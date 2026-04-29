import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Eye, Play } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ResourcePreviewModal } from '@/components/ResourcePreviewModal';
import { VisibilityEditor } from '@/components/admin/VisibilityEditor';

const AdminVideos = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [previewItem, setPreviewItem] = useState<{ title: string; url: string } | null>(null);

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['learning-content', 'video'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_content')
        .select('*')
        .eq('type', 'video')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from('learning_content').update({ is_active: active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-content'] });
      toast({ title: '✅ Updated' });
    },
  });

  const filtered = videos.filter(v => v.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">🎥 Video Content</h1>
          <p className="text-muted-foreground">Manage video learning resources</p>
        </div>
        <Badge variant="secondary">{videos.length} videos</Badge>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search videos..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Access</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No video content found</TableCell></TableRow>
                ) : filtered.map(v => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">{v.title}</TableCell>
                    <TableCell><Badge variant="outline">{v.category || 'General'}</Badge></TableCell>
                    <TableCell>{v.duration_minutes ? `${v.duration_minutes}m` : '—'}</TableCell>
                    <TableCell><span className="inline-flex items-center gap-1"><Eye className="w-3 h-3" />{v.view_count}</span></TableCell>
                    <TableCell>{v.language}</TableCell>
                    <TableCell><VisibilityEditor contentId={v.id} value={(v as any).visibility} /></TableCell>
                    <TableCell><Badge variant={v.is_active ? 'default' : 'secondary'}>{v.is_active ? 'Active' : 'Inactive'}</Badge></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={!v.url}
                          title={v.url ? 'Play video' : 'No URL available'}
                          onClick={() => v.url && setPreviewItem({ title: v.title, url: v.url })}
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => toggleActive.mutate({ id: v.id, active: !v.is_active })}>
                          {v.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ResourcePreviewModal
        open={!!previewItem}
        onOpenChange={(o) => !o && setPreviewItem(null)}
        title={previewItem?.title || ''}
        type="video"
        url={previewItem?.url}
      />
    </div>
  );
};

export default AdminVideos;
