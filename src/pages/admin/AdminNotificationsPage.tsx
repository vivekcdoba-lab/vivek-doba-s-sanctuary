import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Bell, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const AdminNotificationsPage = () => {
  const queryClient = useQueryClient();
  const { data: notifications = [], isLoading } = useQuery({ queryKey: ['all-notifications'], queryFn: async () => { const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(100); if (error) throw error; return data; } });

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">🔔 Notifications</h1><p className="text-muted-foreground">Platform notification history</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold">{notifications.length}</p><p className="text-sm text-muted-foreground">Total Notifications</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-primary">{notifications.filter(n => !n.is_read).length}</p><p className="text-sm text-muted-foreground">Unread</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-emerald-600">{notifications.filter(n => n.is_read).length}</p><p className="text-sm text-muted-foreground">Read</p></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5" /> Recent Notifications</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <p className="text-center py-8 text-muted-foreground">Loading...</p> :
          <Table><TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Message</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
            <TableBody>{notifications.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No notifications</TableCell></TableRow> :
              notifications.map(n => <TableRow key={n.id}><TableCell className="font-medium">{n.title}</TableCell><TableCell className="max-w-[200px] truncate">{n.message}</TableCell><TableCell><Badge variant="outline">{n.type}</Badge></TableCell><TableCell><Badge variant={n.is_read ? 'secondary' : 'default'}>{n.is_read ? 'Read' : 'Unread'}</Badge></TableCell><TableCell className="text-sm">{format(new Date(n.created_at), 'dd MMM HH:mm')}</TableCell></TableRow>)}</TableBody></Table>}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminNotificationsPage;
