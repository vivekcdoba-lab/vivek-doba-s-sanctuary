import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDbCourses } from '@/hooks/useDbCourses';
import { useSeekerProfiles } from '@/hooks/useSeekerProfiles';
import { Search, Filter, Loader2, Edit, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { formatDateDMY } from "@/lib/dateFormat";

const STATUS_OPTIONS = ['active', 'paused', 'completed', 'dropped'];
const statusColor = (s: string) => {
  if (s === 'active') return 'bg-green-500/10 text-green-600 border-green-200';
  if (s === 'completed') return 'bg-blue-500/10 text-blue-600 border-blue-200';
  if (s === 'paused') return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
  return 'bg-red-500/10 text-red-600 border-red-200';
};

const AdminEnrollments = () => {
  const { data: courses = [] } = useDbCourses();
  const { data: seekers = [] } = useSeekerProfiles();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editEnrollment, setEditEnrollment] = useState<any>(null);
  const [editStatus, setEditStatus] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ['all-enrollments'],
    queryFn: async () => {
      const { data, error } = await supabase.from('enrollments').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('enrollments').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['all-enrollments'] }); toast.success('Enrollment updated'); setEditEnrollment(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('enrollments').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['all-enrollments'] }); toast.success('Enrollment deleted'); },
  });

  const getSeeker = (id: string) => seekers.find(s => s.id === id);
  const getCourse = (id: string) => courses.find(c => c.id === id);

  const filtered = enrollments.filter(e => {
    const seeker = getSeeker(e.seeker_id);
    const course = getCourse(e.course_id);
    const matchSearch = !search || (seeker?.full_name || '').toLowerCase().includes(search.toLowerCase()) || (course?.name || '').toLowerCase().includes(search.toLowerCase());
    const matchCourse = courseFilter === 'all' || e.course_id === courseFilter;
    const matchStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchSearch && matchCourse && matchStatus;
  });

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">All Enrollments</h1>
        <p className="text-sm text-muted-foreground">{enrollments.length} total enrollments</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by seeker or course..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="All Courses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Seeker</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No enrollments found</TableCell></TableRow>
              ) : filtered.slice(0, 50).map(e => {
                const seeker = getSeeker(e.seeker_id);
                const course = getCourse(e.course_id);
                return (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{seeker?.full_name || 'Unknown'}</TableCell>
                    <TableCell className="text-muted-foreground">{course?.name || 'Unknown'}</TableCell>
                    <TableCell><Badge variant="outline">{e.tier}</Badge></TableCell>
                    <TableCell><Badge className={statusColor(e.status)}>{e.status}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{formatDateDMY(new Date(e.start_date))}</TableCell>
                    <TableCell><Badge variant={e.payment_status === 'received' ? 'default' : 'destructive'}>{e.payment_status}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setEditEnrollment(e); setEditStatus(e.status); }}>
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => setPendingDeleteId(e.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editEnrollment} onOpenChange={() => setEditEnrollment(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Update Enrollment</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label>Status</Label>
              <Select value={editStatus} onValueChange={setEditStatus}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditEnrollment(null)}>Cancel</Button>
            <Button onClick={() => editEnrollment && updateMutation.mutate({ id: editEnrollment.id, status: editStatus })} disabled={updateMutation.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!pendingDeleteId} onOpenChange={(o) => !o && setPendingDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this enrollment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The enrollment will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { if (pendingDeleteId) { deleteMutation.mutate(pendingDeleteId); setPendingDeleteId(null); } }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminEnrollments;
