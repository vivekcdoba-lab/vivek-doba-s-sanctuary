import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDbCourses } from '@/hooks/useDbCourses';
import { useSeekerProfiles } from '@/hooks/useSeekerProfiles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users, Calendar, Layers, Plus, Pencil, Trash2 } from 'lucide-react';
import { format, startOfMonth } from 'date-fns';

interface BatchRow {
  id: string;
  name: string;
  course_id: string | null;
  start_date: string;
  capacity: number;
  status: string;
}

const STATUSES = ['planned', 'active', 'completed', 'cancelled'];

const AdminBatches = () => {
  const { data: courses = [] } = useDbCourses();
  const { data: seekers = [] } = useSeekerProfiles();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: enrollments = [], isLoading: loadingEnr } = useQuery({
    queryKey: ['all-enrollments'],
    queryFn: async () => {
      const { data, error } = await supabase.from('enrollments').select('*').order('start_date', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: batchRows = [], isLoading: loadingBatches } = useQuery({
    queryKey: ['batches'],
    queryFn: async () => {
      const { data, error } = await supabase.from('batches').select('*').order('start_date', { ascending: false });
      if (error) throw error;
      return (data || []) as BatchRow[];
    },
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BatchRow | null>(null);
  const [form, setForm] = useState({
    name: '',
    course_id: '',
    start_date: new Date().toISOString().slice(0, 10),
    capacity: 20,
    status: 'planned',
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', course_id: '', start_date: new Date().toISOString().slice(0, 10), capacity: 20, status: 'planned' });
    setOpen(true);
  };

  const openEdit = (b: BatchRow) => {
    setEditing(b);
    setForm({
      name: b.name,
      course_id: b.course_id || '',
      start_date: b.start_date,
      capacity: b.capacity,
      status: b.status,
    });
    setOpen(true);
  };

  const saveMut = useMutation({
    mutationFn: async () => {
      if (!form.name.trim()) throw new Error('Name is required');
      const payload = {
        name: form.name.trim(),
        course_id: form.course_id || null,
        start_date: form.start_date,
        capacity: Number(form.capacity) || 0,
        status: form.status,
      };
      if (editing) {
        const { error } = await supabase.from('batches').update(payload).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('batches').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({ title: editing ? 'Batch updated' : 'Batch created' });
      setOpen(false);
      qc.invalidateQueries({ queryKey: ['batches'] });
    },
    onError: (e: any) => toast({ title: 'Save failed', description: e.message, variant: 'destructive' }),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('batches').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Batch deleted' });
      setDeleteId(null);
      qc.invalidateQueries({ queryKey: ['batches'] });
    },
    onError: (e: any) => toast({ title: 'Delete failed', description: e.message, variant: 'destructive' }),
  });

  const enrollmentCountFor = (b: BatchRow) => {
    const monthKey = format(startOfMonth(new Date(b.start_date)), 'yyyy-MM');
    return enrollments.filter(e => e.course_id === b.course_id && format(startOfMonth(new Date(e.start_date)), 'yyyy-MM') === monthKey).length;
  };

  // Auto-grouped derived batches (kept for backward compat)
  const derivedBatches = useMemo(() => {
    const map: Record<string, { courseId: string; courseName: string; month: string; enrollments: typeof enrollments }> = {};
    enrollments.forEach(e => {
      const course = courses.find(c => c.id === e.course_id);
      const monthKey = format(startOfMonth(new Date(e.start_date)), 'yyyy-MM');
      const key = `${e.course_id}_${monthKey}`;
      if (!map[key]) {
        map[key] = { courseId: e.course_id, courseName: course?.name || 'Unknown', month: monthKey, enrollments: [] };
      }
      map[key].enrollments.push(e);
    });
    return Object.values(map).sort((a, b) => b.month.localeCompare(a.month));
  }, [enrollments, courses]);

  const getSeeker = (id: string) => seekers.find(s => s.id === id);

  if (loadingEnr || loadingBatches) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Batch Management</h1>
          <p className="text-sm text-muted-foreground">{batchRows.length} managed batches · {derivedBatches.length} auto-grouped from enrollments</p>
        </div>
        <Button onClick={openNew} className="gap-1.5"><Plus className="w-4 h-4" /> Add Batch</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6 text-center">
          <Layers className="w-6 h-6 mx-auto text-primary mb-1" />
          <p className="text-2xl font-bold">{batchRows.length}</p>
          <p className="text-xs text-muted-foreground">Managed Batches</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <Users className="w-6 h-6 mx-auto text-blue-500 mb-1" />
          <p className="text-2xl font-bold">{enrollments.filter(e => e.status === 'active').length}</p>
          <p className="text-xs text-muted-foreground">Active Enrollments</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <Calendar className="w-6 h-6 mx-auto text-green-500 mb-1" />
          <p className="text-2xl font-bold">{courses.length}</p>
          <p className="text-xs text-muted-foreground">Programs</p>
        </CardContent></Card>
      </div>

      {/* Managed batches */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Managed Batches</h2>
        {batchRows.length === 0 ? (
          <div className="border border-dashed border-border rounded-xl p-8 text-center text-sm text-muted-foreground">
            No managed batches yet. Click "Add Batch" to create one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {batchRows.map(b => {
              const course = courses.find(c => c.id === b.course_id);
              const enrolled = enrollmentCountFor(b);
              return (
                <Card key={b.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-base">{b.name}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">{course?.name || 'No program assigned'}</p>
                      </div>
                      <Badge variant={b.status === 'active' ? 'default' : 'outline'} className="text-[10px] uppercase">{b.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span><Calendar className="w-3.5 h-3.5 inline mr-1" />{format(new Date(b.start_date), 'dd MMM yyyy')}</span>
                      <span><Users className="w-3.5 h-3.5 inline mr-1" />{enrolled}/{b.capacity}</span>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(b)}><Pencil className="w-3.5 h-3.5 mr-1" />Edit</Button>
                      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(b.id)}><Trash2 className="w-3.5 h-3.5 mr-1" />Delete</Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Auto-grouped enrollment timeline */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Auto-grouped from Enrollments</h2>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
          <div className="space-y-6">
            {derivedBatches.map((batch, idx) => {
              const course = courses.find(c => c.id === batch.courseId);
              const gc = course?.gradient_colors as any;
              const activeCount = batch.enrollments.filter(e => e.status === 'active').length;
              return (
                <div key={idx} className="relative pl-10">
                  <div className="absolute left-2.5 top-3 w-3 h-3 rounded-full border-2 border-primary bg-background" />
                  <Card>
                    <div className="h-2 rounded-t-lg" style={{ background: gc ? `linear-gradient(90deg, ${gc[0]}, ${gc[1]})` : 'hsl(var(--primary))' }} />
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{batch.courseName}</CardTitle>
                        <Badge variant="outline" className="text-xs">{format(new Date(batch.month + '-01'), 'MMM yyyy')}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-4 mb-3 text-sm">
                        <span className="text-muted-foreground"><Users className="w-3.5 h-3.5 inline mr-1" />{batch.enrollments.length} enrolled</span>
                        <span className="text-green-600">{activeCount} active</span>
                        <span className="text-muted-foreground">{batch.enrollments.length - activeCount} other</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {batch.enrollments.slice(0, 10).map(e => {
                          const seeker = getSeeker(e.seeker_id);
                          return (
                            <Badge key={e.id} variant="outline" className="text-xs">
                              {seeker?.full_name || 'Unknown'}
                            </Badge>
                          );
                        })}
                        {batch.enrollments.length > 10 && <Badge variant="secondary" className="text-xs">+{batch.enrollments.length - 10} more</Badge>}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
            {derivedBatches.length === 0 && (
              <div className="pl-10 py-8 text-center text-muted-foreground text-sm">No enrollments yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* Create / Edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Batch' : 'Add Batch'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="b-name">Batch name</Label>
              <Input id="b-name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. LGT March 2026" />
            </div>
            <div className="space-y-1.5">
              <Label>Program</Label>
              <Select value={form.course_id} onValueChange={v => setForm({ ...form, course_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select program" /></SelectTrigger>
                <SelectContent>
                  {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="b-date">Start date</Label>
                <Input id="b-date" type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="b-cap">Capacity</Label>
                <Input id="b-cap" type="number" min={1} value={form.capacity} onChange={e => setForm({ ...form, capacity: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => saveMut.mutate()} disabled={saveMut.isPending || !form.name.trim()}>
              {saveMut.isPending && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
              {editing ? 'Save Changes' : 'Create Batch'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={o => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this batch?</AlertDialogTitle>
            <AlertDialogDescription>This removes the batch record. Enrollments are not affected.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteMut.mutate(deleteId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminBatches;
