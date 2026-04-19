import { useState, useEffect } from 'react';
import { useAllProfiles, type SeekerProfile } from '@/hooks/useSeekerProfiles';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { Search, ShieldAlert, Shield, Activity, Pencil, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { PERMISSION_KEYS, PERMISSION_LABELS, allPermissionsTrue, permissionCount, type PermissionKey } from '@/lib/adminPermissions';

type AdminProfile = SeekerProfile & {
  admin_level?: string | null;
  admin_permissions?: Record<string, boolean> | null;
};

const AdminAdmins = () => {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const { data: allProfiles = [], isLoading } = useAllProfiles();
  const [search, setSearch] = useState('');
  const [callerIsSuper, setCallerIsSuper] = useState(false);
  const [editing, setEditing] = useState<AdminProfile | null>(null);
  const [editLevel, setEditLevel] = useState<'admin' | 'super_admin'>('admin');
  const [editPerms, setEditPerms] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    supabase.from('profiles').select('admin_level').eq('user_id', user.id).maybeSingle()
      .then(({ data }) => setCallerIsSuper(data?.admin_level === 'super_admin'));
  }, [user?.id]);

  const admins = (allProfiles as AdminProfile[]).filter(p => p.role === 'admin');
  const filtered = admins.filter(a =>
    a.full_name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  );
  const superCount = admins.filter(a => a.admin_level === 'super_admin').length;

  const openEdit = (a: AdminProfile) => {
    setEditing(a);
    setEditLevel((a.admin_level as any) === 'super_admin' ? 'super_admin' : 'admin');
    setEditPerms(a.admin_permissions || {});
  };

  const togglePerm = (key: PermissionKey) =>
    setEditPerms(prev => ({ ...prev, [key]: !prev[key] }));

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    const finalPerms = editLevel === 'super_admin' ? allPermissionsTrue() : editPerms;
    const { error } = await supabase.from('profiles')
      .update({ admin_level: editLevel, admin_permissions: finalPerms } as any)
      .eq('id', editing.id);
    setSaving(false);
    if (error) {
      toast.error(error.message || 'Failed to update admin');
      return;
    }
    toast.success(`Updated ${editing.full_name}`);
    setEditing(null);
    qc.invalidateQueries({ queryKey: ['all-profiles'] });
  };

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
            <p className="text-2xl font-bold">{superCount}</p>
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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No admins found</TableCell></TableRow>
              ) : filtered.map((admin) => {
                const isSuper = admin.admin_level === 'super_admin';
                const pCount = permissionCount(admin.admin_permissions);
                return (
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
                      <Badge variant={isSuper ? 'destructive' : 'default'}>
                        {isSuper ? 'Super Admin' : 'Admin'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{admin.phone || '—'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {isSuper ? 'All Access' : `${pCount} of ${PERMISSION_KEYS.length}`}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{format(new Date(admin.created_at), 'dd MMM yyyy')}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(admin)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Admin: {editing?.full_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Admin Level</Label>
              <Select value={editLevel} onValueChange={(v) => setEditLevel(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin" disabled={!callerIsSuper}>
                    Super Admin {!callerIsSuper && '(super admin only)'}
                  </SelectItem>
                </SelectContent>
              </Select>
              {!callerIsSuper && (
                <p className="text-xs text-muted-foreground">Only super admins can change another admin's level.</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Permissions ({editLevel === 'super_admin' ? PERMISSION_KEYS.length : PERMISSION_KEYS.filter(k => editPerms[k]).length} / {PERMISSION_KEYS.length})</Label>
                {editLevel !== 'super_admin' && (
                  <div className="flex gap-2">
                    <Button type="button" size="sm" variant="ghost" className="h-7 text-xs"
                      onClick={() => setEditPerms(allPermissionsTrue())}>Select all</Button>
                    <Button type="button" size="sm" variant="ghost" className="h-7 text-xs"
                      onClick={() => setEditPerms({})}>Clear</Button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {PERMISSION_KEYS.map(k => {
                  const isSuper = editLevel === 'super_admin';
                  return (
                    <label key={k} className={`flex items-center gap-2 text-sm p-2 rounded border ${isSuper ? 'opacity-60' : 'cursor-pointer hover:bg-muted/50'}`}>
                      <Checkbox
                        checked={isSuper || !!editPerms[k]}
                        disabled={isSuper}
                        onCheckedChange={() => togglePerm(k)}
                      />
                      <span>{PERMISSION_LABELS[k]}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAdmins;
