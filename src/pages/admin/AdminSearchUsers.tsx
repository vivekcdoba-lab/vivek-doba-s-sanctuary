import { useState, useMemo } from 'react';
import { useAllProfiles } from '@/hooks/useSeekerProfiles';
import { Search, Download, Mail, Eye, Edit, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const AdminSearchUsers = () => {
  const { data: profiles = [], isLoading } = useAllProfiles();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');

  const cities = useMemo(() => {
    const set = new Set(profiles.map(p => p.city).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [profiles]);

  const filtered = useMemo(() => {
    return profiles.filter(p => {
      const matchSearch = !search || p.full_name.toLowerCase().includes(search.toLowerCase()) ||
        p.email.toLowerCase().includes(search.toLowerCase()) ||
        (p.phone || '').includes(search) ||
        (p.company || '').toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === 'all' || p.role === roleFilter;
      const matchCity = cityFilter === 'all' || p.city === cityFilter;
      return matchSearch && matchRole && matchCity;
    });
  }, [profiles, search, roleFilter, cityFilter]);

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Role', 'City', 'Company', 'Joined'];
    const rows = filtered.map(p => [p.full_name, p.email, p.phone || '', p.role, p.city || '', p.company || '', format(new Date(p.created_at), 'yyyy-MM-dd')]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `users_export_${format(new Date(), 'yyyyMMdd')}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} users`);
  };

  const roleBadgeVariant = (role: string) => {
    if (role === 'admin') return 'destructive' as const;
    if (role === 'coach') return 'default' as const;
    return 'secondary' as const;
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Search Users</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} of {profiles.length} users</p>
        </div>
        <Button variant="outline" onClick={exportCSV} className="gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name, email, phone, company..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="seeker">Seeker</SelectItem>
            <SelectItem value="coach">Coach</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Select value={cityFilter} onValueChange={setCityFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No users match your search</TableCell></TableRow>
              ) : filtered.slice(0, 50).map(user => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar_url || ''} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">{user.full_name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.full_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{user.email}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{user.phone || '—'}</TableCell>
                  <TableCell><Badge variant={roleBadgeVariant(user.role)}>{user.role}</Badge></TableCell>
                  <TableCell className="text-muted-foreground text-sm">{user.city || '—'}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{format(new Date(user.created_at), 'dd MMM yy')}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {user.role === 'seeker' && (
                        <Link to={`/seekers/${user.id}`}>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Eye className="w-3.5 h-3.5" /></Button>
                        </Link>
                      )}
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => toast.info('Edit feature coming soon')}>
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filtered.length > 50 && (
            <div className="p-3 text-center text-sm text-muted-foreground border-t">Showing 50 of {filtered.length} results. Refine your search.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSearchUsers;
