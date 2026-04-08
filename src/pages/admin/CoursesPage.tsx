import { useState } from 'react';
import { COURSES, formatINR, SEEKERS } from '@/data/mockData';
import { Plus, Users, Clock, Star, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TIERS = ['standard', 'premium', 'platinum', 'chakravartin'];
const FORMATS = ['Workshop', 'Intensive', '1-on-1', 'Group', 'Group + 1-on-1', 'Ultra 1-on-1'];
const GRADIENT_PRESETS = [
  ['#2196F3', '#00BCD4'],
  ['#4CAF50', '#009688'],
  ['#800020', '#7B1FA2'],
  ['#9E9E9E', '#FFD700'],
  ['#FFD700', '#CD7F32'],
  ['#FF9800', '#FF9933'],
  ['#E0E0E0', '#FAFAFA'],
  ['#FFD700', '#7B1FA2'],
  ['#E91E63', '#9C27B0'],
  ['#3F51B5', '#2196F3'],
];

const CoursesPage = () => {
  const { toast } = useToast();
  const [courses, setCourses] = useState(COURSES);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '', tagline: '', duration: '', format: 'Workshop', tier: 'standard',
    price: '', max_participants: '', gradient_index: 0,
    event_date: '', location: '', location_type: 'in_person',
  });

  const getEnrolledCount = (courseId: string) => SEEKERS.filter((s) => s.course?.id === courseId && s.enrollment?.status === 'active').length;

  const resetForm = () => {
    setForm({ name: '', tagline: '', duration: '', format: 'Workshop', tier: 'standard', price: '', max_participants: '', gradient_index: 0, event_date: '', location: '', location_type: 'in_person' });
    setEditId(null);
  };

  const openAdd = () => { resetForm(); setShowModal(true); };

  const openEdit = (id: string) => {
    const c = courses.find(x => x.id === id);
    if (!c) return;
    const gi = GRADIENT_PRESETS.findIndex(g => g[0] === c.gradient_colors[0] && g[1] === c.gradient_colors[1]);
    setForm({
      name: c.name, tagline: c.tagline || '', duration: c.duration, format: c.format,
      tier: c.tier, price: String(c.price), max_participants: String(c.max_participants),
      gradient_index: gi >= 0 ? gi : 0,
      event_date: (c as any).event_date || '', location: (c as any).location || '', location_type: (c as any).location_type || 'in_person',
    });
    setEditId(id);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name || !form.duration || !form.price || !form.max_participants) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    const courseData = {
      name: form.name, tagline: form.tagline, duration: form.duration, format: form.format,
      tier: form.tier as any, price: Number(form.price), max_participants: Number(form.max_participants),
      gradient_colors: GRADIENT_PRESETS[form.gradient_index] as [string, string], is_active: true,
      event_date: form.event_date || null, location: form.location || null, location_type: form.location_type,
    };

    if (editId) {
      setCourses(prev => prev.map(c => c.id === editId ? { ...c, ...courseData } : c));
      toast({ title: `✅ "${form.name}" updated successfully` });
    } else {
      const newCourse = { id: `c${Date.now()}`, ...courseData };
      setCourses(prev => [...prev, newCourse]);
      toast({ title: `✅ "${form.name}" added successfully` });
    }
    setShowModal(false);
    resetForm();
  };

  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));
  const inputCls = "w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-colors";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Training Programs</h1>
          <p className="text-sm text-muted-foreground">{courses.length} programs offered</p>
        </div>
        <button onClick={openAdd} className="gradient-chakravartin text-primary-foreground px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2 hover:opacity-90">
          <Plus className="w-4 h-4" /> Add Course
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-5 stagger-children">
        {courses.map((course) => (
          <div key={course.id} className="bg-card rounded-2xl shadow-md border border-border overflow-hidden card-hover">
            <div className="h-24 relative" style={{ background: `linear-gradient(135deg, ${course.gradient_colors[0]}, ${course.gradient_colors[1]})` }}>
              <div className="absolute inset-0 flex items-center justify-between p-5">
                <div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    course.tier === 'chakravartin' ? 'shimmer-gold text-primary-foreground' :
                    course.tier === 'platinum' ? 'bg-primary-foreground/20 text-primary-foreground backdrop-blur-sm' :
                    'bg-primary-foreground/20 text-primary-foreground backdrop-blur-sm'
                  }`}>
                    {course.tier === 'chakravartin' ? '👑 By Invitation Only' : course.tier}
                  </span>
                </div>
                <p className="text-2xl font-bold text-primary-foreground">{formatINR(course.price)}</p>
              </div>
            </div>

            <div className="p-5">
              <h3 className="text-lg font-bold text-foreground mb-1">{course.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{course.tagline}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  <Clock className="w-3 h-3" /> {course.duration}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  <Star className="w-3 h-3" /> {course.format}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  <Users className="w-3 h-3" /> Max {course.max_participants}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-dharma-green font-medium">{getEnrolledCount(course.id)} enrolled</span>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 rounded-lg text-xs font-medium border border-primary text-primary hover:bg-primary/5">View</button>
                  <button onClick={() => openEdit(course.id)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:opacity-90">Edit</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Course Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto border border-border" onClick={e => e.stopPropagation()}>
            {/* Modal Header with gradient preview */}
            <div className="h-16 rounded-t-2xl relative" style={{ background: `linear-gradient(135deg, ${GRADIENT_PRESETS[form.gradient_index][0]}, ${GRADIENT_PRESETS[form.gradient_index][1]})` }}>
              <button onClick={() => setShowModal(false)} className="absolute top-3 right-3 text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <h2 className="text-xl font-bold text-foreground">{editId ? 'Edit Course' : 'Add New Course'}</h2>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Course Name *</label>
                <input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g., Leadership through Mahabharata" />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Tagline</label>
                <input className={inputCls} value={form.tagline} onChange={e => set('tagline', e.target.value)} placeholder="Short description" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Duration *</label>
                  <input className={inputCls} value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="e.g., 6 Months, 1 Day" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Format *</label>
                  <select className={inputCls} value={form.format} onChange={e => set('format', e.target.value)}>
                    {FORMATS.map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Price (₹) *</label>
                  <input className={inputCls} type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="e.g., 25000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Max Participants *</label>
                  <input className={inputCls} type="number" value={form.max_participants} onChange={e => set('max_participants', e.target.value)} placeholder="e.g., 30" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Tier *</label>
                <div className="flex flex-wrap gap-2">
                  {TIERS.map(t => (
                    <button key={t} onClick={() => set('tier', t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${form.tier === t ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:border-primary/40'}`}>
                      {t === 'chakravartin' ? '👑 Chakravartin' : t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Color Theme</label>
                <div className="flex flex-wrap gap-2">
                  {GRADIENT_PRESETS.map((g, i) => (
                    <button key={i} onClick={() => set('gradient_index', i)} className={`w-10 h-10 rounded-lg border-2 transition-all ${form.gradient_index === i ? 'border-primary scale-110 shadow-md' : 'border-transparent'}`} style={{ background: `linear-gradient(135deg, ${g[0]}, ${g[1]})` }} />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Event Date</label>
                  <input className={inputCls} type="date" value={form.event_date} onChange={e => set('event_date', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Location Type *</label>
                  <select className={inputCls} value={form.location_type} onChange={e => set('location_type', e.target.value)}>
                    <option value="in_person">In Person</option>
                    <option value="online">Online</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Location</label>
                <input className={inputCls} value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g., Pune, Mumbai, Zoom" />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">Cancel</button>
                <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-primary-foreground gradient-chakravartin hover:opacity-90 transition-opacity">{editId ? 'Save Changes' : 'Add Course'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
