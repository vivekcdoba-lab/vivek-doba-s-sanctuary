import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, Clock } from 'lucide-react';
import { format } from 'date-fns';

const AdminAuditLogs = () => {
  const { data: sessions = [], isLoading } = useQuery({ queryKey: ['user-sessions-audit'], queryFn: async () => { const { data, error } = await supabase.from('user_sessions').select('*, profiles!user_sessions_user_id_fkey(full_name, role)').order('login_at', { ascending: false }).limit(100); if (error) throw error; return data as any[]; } });

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">🔒 Audit Logs</h1><p className="text-muted-foreground">User login activity and session history</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold">{sessions.length}</p><p className="text-sm text-muted-foreground">Recent Sessions</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-emerald-600">{sessions.filter((s: any) => s.status === 'active').length}</p><p className="text-sm text-muted-foreground">Active Now</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-muted-foreground">{sessions.filter((s: any) => s.status === 'closed').length}</p><p className="text-sm text-muted-foreground">Closed</p></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5" /> Login Activity</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <p className="text-center py-8 text-muted-foreground">Loading...</p> :
          <Table><TableHeader><TableRow><TableHead>User</TableHead><TableHead>Role</TableHead><TableHead>Login</TableHead><TableHead>Status</TableHead><TableHead>Duration</TableHead><TableHead>Logout Reason</TableHead></TableRow></TableHeader>
            <TableBody>{sessions.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No audit logs</TableCell></TableRow> :
              sessions.map((s: any) => <TableRow key={s.id}><TableCell className="font-medium">{s.profiles?.full_name || 'Unknown'}</TableCell><TableCell><Badge variant="outline">{s.profiles?.role || '—'}</Badge></TableCell><TableCell className="text-sm">{format(new Date(s.login_at), 'dd MMM HH:mm')}</TableCell><TableCell><Badge variant={s.status === 'active' ? 'default' : 'secondary'}>{s.status}</Badge></TableCell><TableCell>{s.duration_seconds ? `${Math.round(s.duration_seconds / 60)}m` : '—'}</TableCell><TableCell>{s.logout_reason || '—'}</TableCell></TableRow>)}</TableBody></Table>}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAuditLogs;
