import { useState } from 'react';
import { useAllProfiles } from '@/hooks/useSeekerProfiles';
import { Search, ShieldAlert, Shield, Activity } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const AdminAdmins = () => {
  const { data: allProfiles = [], isLoading } = useAllProfiles();
  const [search, setSearch] = useState('');

  const admins = allProfiles.filter(p => p.role === 'admin');

  const filtered = admins.filter(a =>
    a.full_name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Accounts</h1>
        <p className="text-sm text-muted-foreground">{admins.length} admin accounts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <ShieldAlert className="w-8 h-8 mx-auto text-destructive mb-2" />
            <p className="text-2xl font-bold">{admins.filter(a => a.email.includes('vivek') || admins.indexOf(a) === 0).length}</p>
            <p className="text-sm text-muted-foreground">Super Admins</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Shield className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold">{admins.length}</p>
            <p className="text-sm text-muted-foreground">Total Admins</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Activity className="w-8 h-8 mx-auto text-green-500 mb-2" />
            <p className="text-2xl font-bold">{admins.length}</p>
            <p className="text-sm text-muted-foreground">Active</p>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search admins..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Admin</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No admins found</TableCell></TableRow>
              ) : filtered.map((admin, idx) => (
                <TableRow key={admin.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={admin.avatar_url || ''} />
                        <AvatarFallback className="bg-destructive/10 text-destructive text-xs">{admin.full_name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{admin.full_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{admin.email}</TableCell>
                  <TableCell>
                    <Badge variant={idx === 0 ? 'destructive' : 'default'}>
                      {idx === 0 ? 'Super Admin' : 'Admin'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{admin.phone || '—'}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      <Badge variant="outline" className="text-xs">Full Access</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{format(new Date(admin.created_at), 'dd MMM yyyy')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAdmins;
