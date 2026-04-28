import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAllDbCourses, useUpdateCourse } from '@/hooks/useDbCourses';
import { useAllProgramTrainers } from '@/hooks/useProgramTrainers';
import { Edit, Save, Search, Clock, Star, Users, Loader2, Crown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  LIFECYCLE_STATUSES,
  LIFECYCLE_LABELS,
  LIFECYCLE_BADGE_CLASSES,
  isActiveFlagFor,
  type LifecycleStatus,
} from '@/lib/programLifecycle';

const TIERS = ['standard', 'premium', 'platinum', 'chakravartin'];
const FORMATS = ['Workshop', 'Intensive', '1-on-1', 'Group', 'Group + 1-on-1', 'Ultra 1-on-1'];
const formatINR = (n: number) => `₹${n.toLocaleString('en-IN')}`;

const AdminEditPrograms = () => {
  const { data: courses = [], isLoading } = useAllDbCourses();
  const { data: allTrainers = [] } = useAllProgramTrainers();
  const updateCourse = useUpdateCourse();
  const coachCount = (id: string) => allTrainers.filter(t => t.program_id === id).length;
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<LifecycleStatus>('active');
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '', tagline: '', description: '', duration: '', format: '', tier: '',
    price: '', max_participants: '', event_date: '', location: '', location_type: '',
    lifecycle_status: 'active' as LifecycleStatus,
  });

  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const counts = useMemo(() => {
    const c: Record<LifecycleStatus, number> = { active: 0, upcoming: 0, completed: 0, deactivated: 0 };
    courses.forEach(x => { c[(x.lifecycle_status || 'active') as LifecycleStatus]++; });
    return c;
  }, [courses]);

  const openEdit = (id: string) => {
    const c = courses.find(x => x.id === id);
    if (!c) return;
    setForm({
      name: c.name, tagline: c.tagline || '', description: c.description || '',
      duration: c.duration || '', format: c.format || 'Workshop', tier: c.tier,
      price: String(c.price), max_participants: String(c.max_participants || 50),
      event_date: c.event_date || '', location: c.location || '', location_type: c.location_type || 'in_person',
      lifecycle_status: (c.lifecycle_status || 'active') as LifecycleStatus,
    });
    setEditId(id);
  };

  const handleSave = async () => {
    if (!editId || !form.name) return;
    try {
      await updateCourse.mutateAsync({
        id: editId, name: form.name, tagline: form.tagline, description: form.description,
        duration: form.duration, format: form.format, tier: form.tier,
        price: Number(form.price), max_participants: Number(form.max_participants),
        event_date: form.event_date || null, location: form.location || null, location_type: form.location_type,
        lifecycle_status: form.lifecycle_status,
        is_active: isActiveFlagFor(form.lifecycle_status),
      } as any);
      toast.success(`"${form.name}" updated`);
      setEditId(null);
    } catch (err: any) { toast.error(err.message || 'Failed to update'); }
  };

  const handleDeactivate = async (id: string, name: string) => {
    try {
      await updateCourse.mutateAsync({ id, is_active: false, lifecycle_status: 'deactivated' } as any);
      toast.success(`"${name}" deactivated`);
    } catch { toast.error('Failed to deactivate'); }
  };

  const filtered = courses
    .filter(c => (c.lifecycle_status || 'active') === tab)
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Edit Programs</h1>
        <p className="text-sm text-muted-foreground">{courses.length} total programs</p>
      </div>

      {/* Lifecycle status tabs */}
      <div className="flex flex-wrap gap-2">
        {LIFECYCLE_STATUSES.map(s => (
          <button
            key={s}
            onClick={() => setTab(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              tab === s
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground border-border hover:bg-muted'
            }`}
          >
            {LIFECYCLE_LABELS[s]} <span className="ml-1 opacity-70">({counts[s]})</span>
          </button>
        ))}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search programs..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-sm text-muted-foreground">No {LIFECYCLE_LABELS[tab].toLowerCase()} programs.</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {filtered.map(course => {
            const gc = course.gradient_colors as any;
            const status = (course.lifecycle_status || 'active') as LifecycleStatus;
            return (
              <Card key={course.id} className="overflow-hidden">
                <div className="h-20" style={{ background: gc ? `linear-gradient(135deg, ${gc[0]}, ${gc[1]})` : 'hsl(var(--primary))' }}>
                  <div className="h-full flex items-center justify-between px-5">
                    <Badge className="bg-primary-foreground/20 text-primary-foreground backdrop-blur-sm border-0 text-[10px] uppercase">{course.tier}</Badge>
                    <span className="text-xl font-bold text-primary-foreground">{formatINR(Number(course.price))}</span>
                  </div>
                </div>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-lg font-bold text-foreground">{course.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${LIFECYCLE_BADGE_CLASSES[status]}`}>
                      {LIFECYCLE_LABELS[status]}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{course.tagline}</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {course.duration && <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full"><Clock className="w-3 h-3" />{course.duration}</span>}
                    {course.format && <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full"><Star className="w-3 h-3" />{course.format}</span>}
                    <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full"><Users className="w-3 h-3" />Max {course.max_participants}</span>
                    <span className="flex items-center gap-1 text-xs text-[#FF6B00] bg-[#FF6B00]/10 px-2 py-0.5 rounded-full"><Crown className="w-3 h-3" />{coachCount(course.id)} coach{coachCount(course.id) === 1 ? '' : 'es'}</span>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="outline" asChild><Link to={`/admin/program-coaches?program=${course.id}`}><Crown className="w-3.5 h-3.5 mr-1" /> Coaches</Link></Button>
                    <Button size="sm" variant="outline" onClick={() => openEdit(course.id)}><Edit className="w-3.5 h-3.5 mr-1" /> Edit</Button>
                    {status !== 'deactivated' && (
                      <Button size="sm" variant="destructive" onClick={() => handleDeactivate(course.id, course.name)}>Deactivate</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!editId} onOpenChange={() => setEditId(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Program</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label>Name</Label><Input value={form.name} onChange={e => set('name', e.target.value)} /></div>
            <div className="space-y-1"><Label>Tagline</Label><Input value={form.tagline} onChange={e => set('tagline', e.target.value)} /></div>
            <div className="space-y-1"><Label>Description</Label><Textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Duration</Label><Input value={form.duration} onChange={e => set('duration', e.target.value)} /></div>
              <div className="space-y-1"><Label>Format</Label>
                <Select value={form.format} onValueChange={v => set('format', v)}><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{FORMATS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Tier</Label>
                <Select value={form.tier} onValueChange={v => set('tier', v)}><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TIERS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>Price (₹)</Label><Input type="number" value={form.price} onChange={e => set('price', e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Max Participants</Label><Input type="number" value={form.max_participants} onChange={e => set('max_participants', e.target.value)} /></div>
              <div className="space-y-1"><Label>Event Date</Label><Input type="date" value={form.event_date} onChange={e => set('event_date', e.target.value)} /></div>
            </div>
            <div className="space-y-1"><Label>Location</Label><Input value={form.location} onChange={e => set('location', e.target.value)} maxLength={60} /></div>
            <div className="space-y-1">
              <Label>Lifecycle Status</Label>
              <Select value={form.lifecycle_status} onValueChange={v => set('lifecycle_status', v as LifecycleStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LIFECYCLE_STATUSES.map(s => <SelectItem key={s} value={s}>{LIFECYCLE_LABELS[s]}</SelectItem>)}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Setting to Deactivated also hides the program from active lists.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditId(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={updateCourse.isPending}><Save className="w-4 h-4 mr-1" /> Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminEditPrograms;
