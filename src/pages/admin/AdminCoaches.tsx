import { useState } from 'react';
import { useAllProfiles, type SeekerProfile } from '@/hooks/useSeekerProfiles';
import { useDbSessions } from '@/hooks/useDbSessions';
import { Search, Shield, ShieldCheck, UserCheck, KeyRound } from 'lucide-react';
import { ResetPasswordDialog } from '@/components/admin/ResetPasswordDialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { formatDateDMY } from "@/lib/dateFormat";

const AdminCoaches = () => {
  const { data: allProfiles = [], isLoading } = useAllProfiles();
  const { data: sessions = [] } = useDbSessions();
  const [search, setSearch] = useState('');
  const [resetUser, setResetUser] = useState<SeekerProfile | null>(null);

  const coaches = allProfiles.filter(p => p.role === 'coach' || p.is_also_coach === true);

  const getAssignedSeekersCount = (coachId: string) => {
    const seekerIds = new Set(
      sessions
        .filter((s: any) => s.coach_id === coachId && s.seeker_id)
        .map((s: any) => s.seeker_id)
    );
    return seekerIds.size;
  };

  const filtered = coaches.filter(c =>
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Coaches</h1>
          <p className="text-sm text-muted-foreground">{coaches.length} coach accounts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <ShieldCheck className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold">{coaches.length}</p>
            <p className="text-sm text-muted-foreground">Total Coaches</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <UserCheck className="w-8 h-8 mx-auto text-green-500 mb-2" />
            <p className="text-2xl font-bold">{coaches.length}</p>
            <p className="text-sm text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Shield className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-2xl font-bold">{allProfiles.filter(p => p.role === 'seeker').length}</p>
            <p className="text-sm text-muted-foreground">Total Seekers Managed</p>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search coaches..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Coach</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No coaches found</TableCell></TableRow>
              ) : filtered.map(coach => (
                <TableRow key={coach.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={coach.avatar_url || ''} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">{coach.full_name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{coach.full_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{coach.email}</TableCell>
                  <TableCell className="text-muted-foreground">{coach.city || '—'}</TableCell>
                  <TableCell>
                    <Badge className="bg-green-500/10 text-green-600 border-green-200">Active</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDateDMY(new Date(coach.created_at))}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setResetUser(coach)} title="Reset password">
                      <KeyRound className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ResetPasswordDialog
        user={resetUser ? { user_id: resetUser.user_id, full_name: resetUser.full_name, email: resetUser.email, role: resetUser.role } : null}
        open={!!resetUser}
        onOpenChange={(o) => !o && setResetUser(null)}
      />
    </div>
  );
};

export default AdminCoaches;
