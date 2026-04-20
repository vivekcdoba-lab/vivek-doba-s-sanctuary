import { useState, useMemo, useEffect } from 'react';
import { useAllProfiles, type SeekerProfile } from '@/hooks/useSeekerProfiles';
import { Search, Download, Eye, Edit, Trash2, Loader2, KeyRound } from 'lucide-react';
import { ResetPasswordDialog } from '@/components/admin/ResetPasswordDialog';
import { useAuthStore } from '@/store/authStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

type EditForm = {
  full_name: string;
  phone: string;
  city: string;
  state: string;
  company: string;
  occupation: string;
  role: 'seeker' | 'coach' | 'admin';
  access_end_date: string;
  is_also_coach: boolean;
};

const emptyForm: EditForm = {
  full_name: '', phone: '', city: '', state: '', company: '', occupation: '', role: 'seeker', access_end_date: '', is_also_coach: false,
};

const AdminSearchUsers = () => {
  const { data: profiles = [], isLoading } = useAllProfiles();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');

  const [editingUser, setEditingUser] = useState<SeekerProfile | null>(null);
  const [form, setForm] = useState<EditForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const [deleteUser, setDeleteUser] = useState<SeekerProfile | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [resetUser, setResetUser] = useState<SeekerProfile | null>(null);

  const { profile: callerProfile } = useAuthStore();
  const callerIsSuper = (callerProfile as any)?.admin_level === 'super_admin';

  useEffect(() => {
    if (editingUser) {
      setForm({
        full_name: editingUser.full_name || '',
        phone: editingUser.phone || '',
        city: editingUser.city || '',
        state: editingUser.state || '',
        company: editingUser.company || '',
        occupation: editingUser.occupation || '',
        role: (editingUser.role as 'seeker' | 'coach' | 'admin') || 'seeker',
        access_end_date: editingUser.access_end_date || '',
        is_also_coach: (editingUser as any).is_also_coach === true,
      });
    }
  }, [editingUser]);

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

  const handleSave = async () => {
    if (!editingUser) return;
    if (!form.full_name.trim()) {
      toast.error('Name is required');
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: form.full_name.trim(),
        phone: form.phone || null,
        city: form.city || null,
        state: form.state || null,
        company: form.company || null,
        occupation: form.occupation || null,
        role: form.role,
        access_end_date: form.access_end_date || null,
        is_also_coach: form.role === 'admin' ? form.is_also_coach : false,
      } as any)
      .eq('id', editingUser.id);
    setSaving(false);
    if (error) {
      toast.error(`Update failed: ${error.message}`);
      return;
    }
    toast.success('User updated');
    qc.invalidateQueries({ queryKey: ['all-profiles'] });
    qc.invalidateQueries({ queryKey: ['seeker-profiles'] });
    setEditingUser(null);
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    setDeleting(true);
    const { data, error } = await supabase.functions.invoke('delete-seeker', {
      body: { target_user_id: deleteUser.user_id },
    });
    setDeleting(false);
    if (error || (data as any)?.error) {
      toast.error(`Delete failed: ${error?.message || (data as any)?.error}`);
      return;
    }
    toast.success(`Deleted ${deleteUser.full_name}`);
    qc.invalidateQueries({ queryKey: ['all-profiles'] });
    qc.invalidateQueries({ queryKey: ['seeker-profiles'] });
    setDeleteUser(null);
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
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      <Badge variant={roleBadgeVariant(user.role)}>{user.role}</Badge>
                      {user.role === 'admin' && (user as any).is_also_coach === true && (
                        <Badge variant="default">coach</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{user.city || '—'}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{format(new Date(user.created_at), 'dd MMM yy')}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {user.role === 'seeker' && (
                        <Link to={`/seekers/${user.id}`}>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Eye className="w-3.5 h-3.5" /></Button>
                        </Link>
                      )}
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setEditingUser(user)} title="Edit">
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      {(user.role !== 'admin' || callerIsSuper) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={() => setResetUser(user)}
                          title="Reset password"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      {user.role === 'seeker' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteUser(user)}
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
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

      {/* Edit Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(o) => !o && setEditingUser(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>{editingUser?.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Full Name</Label>
              <Input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Phone</Label>
                <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <Label>Role</Label>
                <Select value={form.role} onValueChange={(v: 'seeker' | 'coach' | 'admin') => setForm({ ...form, role: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seeker">Seeker</SelectItem>
                    <SelectItem value="coach">Coach</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>City</Label>
                <Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
              </div>
              <div>
                <Label>State</Label>
                <Input value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Company</Label>
                <Input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
              </div>
              <div>
                <Label>Occupation</Label>
                <Input value={form.occupation} onChange={e => setForm({ ...form, occupation: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Access End Date <span className="text-muted-foreground text-xs">(optional — when access expires)</span></Label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={form.access_end_date}
                  onChange={e => setForm({ ...form, access_end_date: e.target.value })}
                  className="flex-1"
                />
                {form.access_end_date && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setForm({ ...form, access_end_date: '' })}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
            {form.role === 'admin' && (
              <div className="flex items-center gap-2 rounded-md border border-border p-3">
                <input
                  id="is_also_coach"
                  type="checkbox"
                  checked={form.is_also_coach}
                  onChange={(e) => setForm({ ...form, is_also_coach: e.target.checked })}
                  className="h-4 w-4 accent-primary"
                />
                <Label htmlFor="is_also_coach" className="cursor-pointer">
                  Also act as coach
                  <span className="block text-xs text-muted-foreground font-normal">
                    This user will appear in coach lists and pickers without losing admin access.
                  </span>
                </Label>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteUser} onOpenChange={(o) => !o && setDeleteUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteUser?.full_name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this seeker's account and all associated data
              (assessments, worksheets, sessions, messages). This action cannot be undone.
              Only seeker accounts can be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleDelete(); }}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ResetPasswordDialog
        user={resetUser ? { user_id: resetUser.user_id, full_name: resetUser.full_name, email: resetUser.email, role: resetUser.role } : null}
        open={!!resetUser}
        onOpenChange={(o) => !o && setResetUser(null)}
      />
    </div>
  );
};

export default AdminSearchUsers;
