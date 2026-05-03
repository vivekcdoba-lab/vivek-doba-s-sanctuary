import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Link2, Unlink, Plus, Loader2, Users, ChevronLeft } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { useSeekerProfiles } from '@/hooks/useSeekerProfiles';
import { useAllSeekerLinks, useLinkSeekers, useUnlinkSeekers, RELATIONSHIP_EMOJIS, RELATIONSHIP_LABELS, type SeekerLinkRow } from '@/hooks/useSeekerLinks';
import { useAuthStore } from '@/store/authStore';
import { formatDateDMY } from "@/lib/dateFormat";

const AdminLinkedProfiles = () => {
  const { profile } = useAuthStore();
  const { data: seekers = [] } = useSeekerProfiles();
  const { data: allLinks = [], isLoading } = useAllSeekerLinks();
  const linkSeekers = useLinkSeekers();
  const unlinkSeekers = useUnlinkSeekers();

  const [search, setSearch] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({
    primary_seeker_id: '', partner_seeker_id: '',
    relationship: 'spouse' as SeekerLinkRow['relationship'],
    relationship_label: '',
  });

  // Group rows by group_id
  const groups = useMemo(() => {
    const map = new Map<string, SeekerLinkRow[]>();
    allLinks.forEach(r => {
      const arr = map.get(r.group_id) || [];
      arr.push(r);
      map.set(r.group_id, arr);
    });
    return Array.from(map.entries()).map(([group_id, rows]) => ({ group_id, rows }));
  }, [allLinks]);

  const filteredGroups = groups.filter(g =>
    g.rows.some(r => r.seeker?.full_name.toLowerCase().includes(search.toLowerCase()))
  );

  // Seekers not yet in any group → eligible to be linked
  const linkedIds = new Set(allLinks.map(r => r.seeker_id));
  const eligibleSeekers = seekers.filter(s => !linkedIds.has(s.id));

  const handleLink = async () => {
    if (!form.primary_seeker_id || !form.partner_seeker_id) {
      toast({ title: 'Select both seekers', variant: 'destructive' });
      return;
    }
    if (form.relationship === 'custom' && !form.relationship_label.trim()) {
      toast({ title: 'Custom label required', variant: 'destructive' });
      return;
    }
    try {
      await linkSeekers.mutateAsync({
        primary_seeker_id: form.primary_seeker_id,
        partner_seeker_id: form.partner_seeker_id,
        relationship: form.relationship,
        relationship_label: form.relationship === 'custom' ? form.relationship_label : undefined,
        linked_by: profile?.id || '',
      });
      toast({ title: '✅ Profiles linked' });
      setShowDialog(false);
      setForm({ primary_seeker_id: '', partner_seeker_id: '', relationship: 'spouse', relationship_label: '' });
    } catch (e: any) {
      toast({ title: e?.message || 'Failed to link', variant: 'destructive' });
    }
  };

  const handleUnlink = async (group_id: string) => {
    if (!confirm('Unlink these profiles? Existing joint payments will remain visible only to the original payer.')) return;
    try {
      await unlinkSeekers.mutateAsync(group_id);
      toast({ title: '✅ Unlinked' });
    } catch {
      toast({ title: 'Failed to unlink', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" /> Linked Profiles
          </h1>
          <p className="text-sm text-muted-foreground">{groups.length} link group(s) — manage joint profiles for couples, family & partners</p>
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="w-4 h-4 mr-1" /> New Link
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by seeker name..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : filteredGroups.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Link2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>{search ? 'No matching links' : 'No linked profiles yet'}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Members</TableHead>
                  <TableHead>Relationship</TableHead>
                  <TableHead>Linked On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGroups.map(g => {
                  const r0 = g.rows[0];
                  const r1 = g.rows[1];
                  const rel = r0?.relationship || 'custom';
                  const label = r0?.relationship === 'custom'
                    ? r0?.relationship_label || 'Custom'
                    : RELATIONSHIP_LABELS[rel];
                  return (
                    <TableRow key={g.group_id}>
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          {g.rows.map(r => (
                            <span key={r.id} className="text-sm font-medium text-foreground">
                              {r.seeker?.full_name || '—'}
                              {r.relationship !== rel && (
                                <span className="text-xs text-muted-foreground ml-1">({RELATIONSHIP_LABELS[r.relationship]})</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-primary/30">
                          {RELATIONSHIP_EMOJIS[rel]} {label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDateDMY(r0?.created_at || '')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleUnlink(g.group_id)}>
                          <Unlink className="w-4 h-4 mr-1" /> Unlink
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Link Two Seeker Profiles</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Primary Seeker *</Label>
              <Select value={form.primary_seeker_id} onValueChange={v => setForm(p => ({ ...p, primary_seeker_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select primary seeker" /></SelectTrigger>
                <SelectContent>
                  {eligibleSeekers.map(s => <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Partner Seeker *</Label>
              <Select value={form.partner_seeker_id} onValueChange={v => setForm(p => ({ ...p, partner_seeker_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select partner seeker" /></SelectTrigger>
                <SelectContent>
                  {eligibleSeekers.filter(s => s.id !== form.primary_seeker_id).map(s => <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Relationship *</Label>
              <Select value={form.relationship} onValueChange={v => setForm(p => ({ ...p, relationship: v as any }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="spouse">💑 Spouse (Husband / Wife)</SelectItem>
                  <SelectItem value="parent">👨‍👧 Parent → Child</SelectItem>
                  <SelectItem value="sibling">👫 Siblings</SelectItem>
                  <SelectItem value="custom">🤝 Custom</SelectItem>
                </SelectContent>
              </Select>
              {form.relationship === 'parent' && (
                <p className="text-xs text-muted-foreground mt-1">Primary seeker is treated as the parent.</p>
              )}
            </div>
            {form.relationship === 'custom' && (
              <div>
                <Label>Custom Relationship Label *</Label>
                <Input
                  placeholder="e.g. Business Partner, Co-Founder"
                  value={form.relationship_label}
                  onChange={e => setForm(p => ({ ...p, relationship_label: e.target.value }))}
                />
              </div>
            )}
            {eligibleSeekers.length < 2 && (
              <p className="text-xs text-destructive">Not enough unlinked seekers available. All seekers may already be in a link group.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleLink} disabled={linkSeekers.isPending}>
              {linkSeekers.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Link Profiles
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLinkedProfiles;
