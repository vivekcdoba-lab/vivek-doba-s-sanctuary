import { useState } from 'react';
import { Plus, Users, Clock, Star, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useDbCourses, useCreateCourse, useUpdateCourse } from '@/hooks/useDbCourses';
import { useSeekerProfiles } from '@/hooks/useSeekerProfiles';

const formatINR = (n: number) => `₹${n.toLocaleString('en-IN')}`;
const TIERS = ['standard', 'premium', 'platinum', 'chakravartin'];
const FORMATS = ['Workshop', 'Intensive', '1-on-1', 'Group', 'Group + 1-on-1', 'Ultra 1-on-1'];
const GRADIENT_PRESETS = [
  ['#2196F3', '#00BCD4'], ['#4CAF50', '#009688'], ['#800020', '#7B1FA2'],
  ['#9E9E9E', '#FFD700'], ['#FFD700', '#CD7F32'], ['#FF9800', '#FF9933'],
  ['#E0E0E0', '#FAFAFA'], ['#FFD700', '#7B1FA2'], ['#E91E63', '#9C27B0'], ['#3F51B5', '#2196F3'],
];

const CoursesPage = () => {
  const { data: courses = [], isLoading } = useDbCourses();
  const { data: seekers = [] } = useSeekerProfiles();
  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', tagline: '', duration: '', format: 'Workshop', tier: 'standard', price: '', max_participants: '', gradient_index: 0, event_date: '', location: '', location_type: 'in_person' });

  const resetForm = () => { setForm({ name: '', tagline: '', duration: '', format: 'Workshop', tier: 'standard', price: '', max_participants: '', gradient_index: 0, event_date: '', location: '', location_type: 'in_person' }); setEditId(null); };
  const openAdd = () => { resetForm(); setShowModal(true); };
  const openEdit = (id: string) => {
    const c = courses.find(x => x.id === id);
    if (!c) return;
    const gc = c.gradient_colors as any;
    const gi = GRADIENT_PRESETS.findIndex(g => gc && g[0] === gc[0] && g[1] === gc[1]);
    setForm({ name: c.name, tagline: c.tagline || '', duration: c.duration || '', format: c.format || 'Workshop', tier: c.tier, price: String(c.price), max_participants: String(c.max_participants), gradient_index: gi >= 0 ? gi : 0, event_date: c.event_date || '', location: c.location || '', location_type: c.location_type || 'in_person' });
    setEditId(id); setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.duration || !form.price || !form.max_participants) { toast.error('Please fill all required fields'); return; }
    const data = { name: form.name, tagline: form.tagline, duration: form.duration, format: form.format, tier: form.tier, price: Number(form.price), max_participants: Number(form.max_participants), gradient_colors: GRADIENT_PRESETS[form.gradient_index], is_active: true, event_date: form.event_date || null, location: form.location || null, location_type: form.location_type };
    try {
      if (editId) { await updateCourse.mutateAsync({ id: editId, ...data }); toast.success(`"${form.name}" updated`); }
      else { await createCourse.mutateAsync(data as any); toast.success(`"${form.name}" added`); }
      setShowModal(false); resetForm();
    } catch (err: any) { toast.error(err.message || 'Failed to save'); }
  };

  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));
  const inputCls = "w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-colors";

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Training Programs</h1><p className="text-sm text-muted-foreground">{courses.length} programs offered</p></div>
        <button onClick={openAdd} className="gradient-chakravartin text-primary-foreground px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2 hover:opacity-90"><Plus className="w-4 h-4" /> Add Course</button>
      </div>
      {courses.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-5 stagger-children">
          {courses.map((course) => {
            const gc = course.gradient_colors as any;
            return (
              <div key={course.id} className="bg-card rounded-2xl shadow-md border border-border overflow-hidden card-hover">
                <div className="h-24 relative" style={{ background: gc ? `linear-gradient(135deg, ${gc[0]}, ${gc[1]})` : 'hsl(var(--primary))' }}>
                  <div className="absolute inset-0 flex items-center justify-between p-5">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary-foreground/20 text-primary-foreground backdrop-blur-sm">{course.tier}</span>
                    <p className="text-2xl font-bold text-primary-foreground">{formatINR(Number(course.price))}</p>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-foreground mb-1">{course.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{course.tagline}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {course.duration && <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full"><Clock className="w-3 h-3" /> {course.duration}</span>}
                    {course.format && <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full"><Star className="w-3 h-3" /> {course.format}</span>}
                    <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full"><Users className="w-3 h-3" /> Max {course.max_participants}</span>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(course.id)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:opacity-90">Edit</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16"><span className="text-5xl block mb-3">📚</span><p className="text-muted-foreground">No courses yet. Add your first program!</p></div>
      )}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto border border-border" onClick={e => e.stopPropagation()}>
            <div className="h-16 rounded-t-2xl relative" style={{ background: `linear-gradient(135deg, ${GRADIENT_PRESETS[form.gradient_index][0]}, ${GRADIENT_PRESETS[form.gradient_index][1]})` }}>
              <button onClick={() => setShowModal(false)} className="absolute top-3 right-3 text-white/80 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <h2 className="text-xl font-bold text-foreground">{editId ? 'Edit Course' : 'Add New Course'}</h2>
              <div><label className="block text-sm font-medium text-foreground mb-1">Course Name *</label><input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g., Leadership through Mahabharata" /></div>
              <div><label className="block text-sm font-medium text-foreground mb-1">Tagline</label><input className={inputCls} value={form.tagline} onChange={e => set('tagline', e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-foreground mb-1">Duration *</label><input className={inputCls} value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="e.g., 6 Months" /></div>
                <div><label className="block text-sm font-medium text-foreground mb-1">Format</label><select className={inputCls} value={form.format} onChange={e => set('format', e.target.value)}>{FORMATS.map(f => <option key={f}>{f}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-foreground mb-1">Price (₹) *</label><input className={inputCls} type="number" value={form.price} onChange={e => set('price', e.target.value)} /></div>
                <div><label className="block text-sm font-medium text-foreground mb-1">Max Participants *</label><input className={inputCls} type="number" value={form.max_participants} onChange={e => set('max_participants', e.target.value)} /></div>
              </div>
              <div><label className="block text-sm font-medium text-foreground mb-1">Tier</label><div className="flex flex-wrap gap-2">{TIERS.map(t => (<button key={t} onClick={() => set('tier', t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize ${form.tier === t ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground'}`}>{t}</button>))}</div></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-foreground mb-1">Event Date</label><input className={inputCls} type="date" value={form.event_date} onChange={e => set('event_date', e.target.value)} /></div>
                <div><label className="block text-sm font-medium text-foreground mb-1">Location</label><input className={inputCls} value={form.location} onChange={e => set('location', e.target.value.slice(0, 60))} placeholder="e.g., Mumbai, Andheri West" maxLength={60} /></div>
              </div>
              <div><label className="block text-sm font-medium text-foreground mb-1">Color Theme</label><div className="flex flex-wrap gap-2">{GRADIENT_PRESETS.map((g, i) => (<button key={i} onClick={() => set('gradient_index', i)} className={`w-10 h-10 rounded-lg border-2 ${form.gradient_index === i ? 'border-primary scale-110 shadow-md' : 'border-transparent'}`} style={{ background: `linear-gradient(135deg, ${g[0]}, ${g[1]})` }} />))}</div></div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground">Cancel</button>
                <button onClick={handleSave} disabled={createCourse.isPending || updateCourse.isPending} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-primary-foreground gradient-chakravartin">{createCourse.isPending || updateCourse.isPending ? 'Saving...' : editId ? 'Save Changes' : 'Add Course'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
