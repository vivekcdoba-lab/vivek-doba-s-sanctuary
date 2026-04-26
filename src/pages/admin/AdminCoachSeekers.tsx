import { useMemo, useState } from 'react';
import { useAllProfiles, type SeekerProfile } from '@/hooks/useSeekerProfiles';
import { useCoachSeekers, useAssignSeekersToCoach, useUnassignSeeker, useReassignSeeker } from '@/hooks/useCoachSeekers';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Users, UserMinus, UserPlus, Loader2, ArrowRightLeft, Crown } from 'lucide-react';
import { toast } from 'sonner';

const AdminCoachSeekers = () => {
  const { profile } = useAuthStore();
  const { data: allProfiles = [], isLoading: loadingProfiles } = useAllProfiles();
  const { data: assignments = [], isLoading: loadingAssignments } = useCoachSeekers();
  const assignMut = useAssignSeekersToCoach();
  const unassignMut = useUnassignSeeker();
  const reassignMut = useReassignSeeker();

  const [search, setSearch] = useState('');
  const [selectedCoachId, setSelectedCoachId] = useState<string | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [seekerSearch, setSeekerSearch] = useState('');
  const [pickedSeekerIds, setPickedSeekerIds] = useState<Set<string>>(new Set());
  const [reassignFor, setReassignFor] = useState<{ seekerId: string; fromCoachId: string } | null>(null);
  const [reassignToId, setReassignToId] = useState('');

  const coaches = useMemo(
    () => allProfiles.filter(p => p.role === 'coach' || (p as any).is_also_coach === true)
      .sort((a, b) => a.full_name.localeCompare(b.full_name)),
    [allProfiles],
  );
  const seekers = useMemo(() => allProfiles.filter(p => p.role === 'seeker'), [allProfiles]);

  const filteredCoaches = coaches.filter(c =>
    !search ||
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()),
  );

  // Map: coach_id → seeker rows
  const seekersByCoach = useMemo(() => {
    const m = new Map<string, SeekerProfile[]>();
    assignments.forEach(a => {
      const seeker = seekers.find(s => s.id === a.seeker_id);
      if (!seeker) return;
      const arr = m.get(a.coach_id) || [];
      arr.push(seeker);
      m.set(a.coach_id, arr);
    });
    return m;
  }, [assignments, seekers]);

  // Already-assigned seeker ids (across all coaches) — useful for "primary coach" warning
  const assignedSeekerIds = useMemo(() => new Set(assignments.map(a => a.seeker_id)), [assignments]);

  const selectedCoach = coaches.find(c => c.id === selectedCoachId);
  const selectedCoachSeekers = selectedCoachId ? (seekersByCoach.get(selectedCoachId) || []) : [];

  const eligibleToAdd = seekers.filter(s => {
    // exclude seekers already assigned to this specific coach
    const alreadyMine = selectedCoachSeekers.some(x => x.id === s.id);
    if (alreadyMine) return false;
    if (seekerSearch) {
      const q = seekerSearch.toLowerCase();
      return s.full_name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
    }
    return true;
  });

  const handleAssign = async () => {
    if (!selectedCoachId || pickedSeekerIds.size === 0) {
      toast.error('Pick at least one seeker');
      return;
    }
    try {
      await assignMut.mutateAsync({
        coach_id: selectedCoachId,
        seeker_ids: Array.from(pickedSeekerIds),
        assigned_by: profile?.id || '',
      });
      toast.success(`Assigned ${pickedSeekerIds.size} seeker(s)`);
      setPickedSeekerIds(new Set());
      setSeekerSearch('');
      setAssignDialogOpen(false);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to assign');
    }
  };

  const handleUnassign = async (seekerId: string, coachId: string) => {
    if (!confirm('Remove this seeker from the coach? Sessions and assignments already created remain.')) return;
    try {
      await unassignMut.mutateAsync({ coach_id: coachId, seeker_id: seekerId });
      toast.success('Unassigned');
    } catch (e: any) {
      toast.error(e?.message || 'Failed');
    }
  };

  const handleReassign = async () => {
    if (!reassignFor || !reassignToId) {
      toast.error('Pick a destination coach');
      return;
    }
    try {
      await reassignMut.mutateAsync({
        seeker_id: reassignFor.seekerId,
        from_coach_id: reassignFor.fromCoachId,
        to_coach_id: reassignToId,
        assigned_by: profile?.id || '',
      });
      toast.success('Reassigned');
      setReassignFor(null);
      setReassignToId('');
    } catch (e: any) {
      toast.error(e?.message || 'Failed');
    }
  };

  if (loadingProfiles || loadingAssignments) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" /> Coach ↔ Seeker Assignments
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Assign seekers to coaches. Non-admin coaches will only see and manage seekers assigned to them.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coaches list */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Coaches ({coaches.length})</CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search coaches..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </CardHeader>
          <CardContent className="space-y-1 max-h-[600px] overflow-y-auto">
            {filteredCoaches.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No coaches</p>}
            {filteredCoaches.map(c => {
              const count = (seekersByCoach.get(c.id) || []).length;
              const isAdminCoach = c.role === 'admin';
              const active = selectedCoachId === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCoachId(c.id)}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                    active ? 'bg-primary/10 border border-primary/30' : 'hover:bg-muted'
                  }`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={c.avatar_url || ''} />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {c.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate flex items-center gap-1">
                      {c.full_name}
                      {isAdminCoach && <Crown className="w-3 h-3 text-amber-500" />}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">{c.email}</p>
                  </div>
                  <Badge variant="secondary">{count}</Badge>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Selected coach's seekers */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">
              {selectedCoach
                ? <>Seekers assigned to <span className="text-primary">{selectedCoach.full_name}</span></>
                : 'Select a coach'}
            </CardTitle>
            {selectedCoach && (
              <Button size="sm" onClick={() => setAssignDialogOpen(true)}>
                <UserPlus className="w-4 h-4 mr-1" /> Assign Seekers
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {!selectedCoach ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                Pick a coach from the left to manage their assigned seekers.
              </div>
            ) : selectedCoachSeekers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No seekers assigned yet.</p>
                <p className="text-xs mt-1">Click "Assign Seekers" to add some.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {selectedCoachSeekers.map(s => (
                  <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={s.avatar_url || ''} />
                      <AvatarFallback className="text-xs bg-secondary">{s.full_name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{s.full_name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{s.email}</p>
                    </div>
                    <Button
                      size="sm" variant="ghost"
                      onClick={() => { setReassignFor({ seekerId: s.id, fromCoachId: selectedCoach.id }); setReassignToId(''); }}
                      title="Reassign to another coach"
                    >
                      <ArrowRightLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm" variant="ghost"
                      onClick={() => handleUnassign(s.id, selectedCoach.id)}
                      disabled={unassignMut.isPending}
                      title="Unassign"
                    >
                      <UserMinus className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Assign Seekers dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={(o) => { setAssignDialogOpen(o); if (!o) { setPickedSeekerIds(new Set()); setSeekerSearch(''); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Assign seekers to {selectedCoach?.full_name}</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search seekers..." className="pl-9" value={seekerSearch} onChange={e => setSeekerSearch(e.target.value)} />
          </div>
          <div className="max-h-[360px] overflow-y-auto space-y-1 border border-border rounded-lg p-2">
            {eligibleToAdd.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No matching seekers.</p>}
            {eligibleToAdd.map(s => {
              const checked = pickedSeekerIds.has(s.id);
              const alreadyAssignedElsewhere = assignedSeekerIds.has(s.id);
              return (
                <label
                  key={s.id}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${checked ? 'bg-primary/10' : 'hover:bg-muted'}`}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(v) => setPickedSeekerIds(prev => {
                      const next = new Set(prev);
                      if (v) next.add(s.id); else next.delete(s.id);
                      return next;
                    })}
                  />
                  <Avatar className="h-7 w-7"><AvatarFallback className="text-xs">{s.full_name.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{s.full_name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{s.email}</p>
                  </div>
                  {alreadyAssignedElsewhere && (
                    <Badge variant="outline" className="text-[10px]">Already assigned</Badge>
                  )}
                </label>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAssign} disabled={assignMut.isPending || pickedSeekerIds.size === 0}>
              {assignMut.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Assign {pickedSeekerIds.size > 0 ? `(${pickedSeekerIds.size})` : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reassign dialog */}
      <Dialog open={!!reassignFor} onOpenChange={(o) => { if (!o) { setReassignFor(null); setReassignToId(''); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Reassign seeker</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Move <strong>{seekers.find(s => s.id === reassignFor?.seekerId)?.full_name}</strong> to a new coach.
            </p>
            <Select value={reassignToId} onValueChange={setReassignToId}>
              <SelectTrigger><SelectValue placeholder="Select new coach" /></SelectTrigger>
              <SelectContent>
                {coaches.filter(c => c.id !== reassignFor?.fromCoachId).map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.full_name}{c.role === 'admin' ? ' 👑' : ''}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReassignFor(null)}>Cancel</Button>
            <Button onClick={handleReassign} disabled={reassignMut.isPending || !reassignToId}>
              {reassignMut.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Reassign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCoachSeekers;
