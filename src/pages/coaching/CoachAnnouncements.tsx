import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Megaphone, Pin, Send, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { formatDateDMY } from "@/lib/dateFormat";

export default function CoachAnnouncements() {
  const { profile } = useAuthStore();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [audience, setAudience] = useState('all');
  const [priority, setPriority] = useState('normal');

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['coach-announcements'],
    queryFn: async () => {
      const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(50);
      if (error) throw error;
      return data || [];
    },
  });

  const createAnnouncement = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('announcements').insert({
        title,
        content,
        audience: [audience],
        priority,
        created_by: profile?.id || null,
        type: 'general',
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-announcements'] });
      setTitle(''); setContent('');
      toast({ title: '📢 Announcement Sent!', description: 'Your announcement has been published.' });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-[#FF6B00]" /> Announcements
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Create and view announcements for seekers</p>
      </div>

      <Card className="p-4 space-y-3">
        <h3 className="font-medium text-foreground">📢 New Announcement</h3>
        <Input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
        <Textarea placeholder="Write your announcement..." value={content} onChange={e => setContent(e.target.value)} rows={4} />
        <div className="flex gap-3">
          <Select value={audience} onValueChange={setAudience}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Seekers</SelectItem>
              <SelectItem value="seeker">Seekers Only</SelectItem>
              <SelectItem value="coach">Coaches Only</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => createAnnouncement.mutate()} disabled={!title.trim() || !content.trim()} className="bg-[#FF6B00] hover:bg-[#e65e00] ml-auto">
            <Send className="w-4 h-4 mr-1" /> Publish
          </Button>
        </div>
      </Card>

      <h3 className="font-medium text-foreground">📋 Past Announcements ({announcements.length})</h3>
      <div className="space-y-3">
        {announcements.map(ann => (
          <Card key={ann.id} className="p-4">
            <div className="flex items-center gap-2 mb-2">
              {ann.is_pinned && <Pin className="w-4 h-4 text-[#FF6B00]" />}
              <h4 className="font-semibold text-foreground flex-1">{ann.title}</h4>
              <Badge variant={ann.priority === 'urgent' ? 'destructive' : ann.priority === 'high' ? 'default' : 'outline'}>
                {ann.priority}
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" /> {formatDateDMY(new Date(ann.created_at))}
              </span>
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ann.content}</p>
            <div className="flex gap-1 mt-2">
              {ann.audience?.map((a: string) => <Badge key={a} variant="outline" className="text-[10px]">{a}</Badge>)}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
