import { useState } from 'react';
import { useCreateCourse, useAllDbCourses } from '@/hooks/useDbCourses';
import { ArrowLeft, ArrowRight, Check, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const TIERS = ['standard', 'premium', 'platinum', 'chakravartin'];
const FORMATS = ['Workshop', 'Intensive', '1-on-1', 'Group', 'Group + 1-on-1', 'Ultra 1-on-1'];
const LOCATION_TYPES = ['in_person', 'online', 'hybrid'];
const GRADIENT_PRESETS = [
  ['#2196F3', '#00BCD4'], ['#4CAF50', '#009688'], ['#800020', '#7B1FA2'],
  ['#9E9E9E', '#FFD700'], ['#FFD700', '#CD7F32'], ['#FF9800', '#FF9933'],
  ['#E91E63', '#9C27B0'], ['#3F51B5', '#2196F3'],
];
const STEPS = ['Basic Info', 'Details & Pricing', 'Appearance', 'Review'];

const AdminCreateProgram = () => {
  const navigate = useNavigate();
  const createCourse = useCreateCourse();
  const { data: allCourses = [] } = useAllDbCourses();
  const [step, setStep] = useState(0);
  const [copyFromId, setCopyFromId] = useState<string>('none');
  const [copiedFromName, setCopiedFromName] = useState<string>('');
  const [form, setForm] = useState({
    name: '', tagline: '', description: '', duration: '', format: 'Workshop',
    tier: 'standard', price: '', max_participants: '50', gradient_index: 0,
    event_date: '', location: '', location_type: 'in_person',
  });

  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));
  const formatINR = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  const handleCopyFrom = (id: string) => {
    setCopyFromId(id);
    if (id === 'none') { setCopiedFromName(''); return; }
    const src = allCourses.find(c => c.id === id);
    if (!src) return;
    const srcColors = Array.isArray(src.gradient_colors) ? src.gradient_colors : [];
    const gIdx = GRADIENT_PRESETS.findIndex(g => g[0] === srcColors[0] && g[1] === srcColors[1]);
    setForm({
      name: `${src.name} (Copy)`,
      tagline: src.tagline || '',
      description: src.description || '',
      duration: src.duration || '',
      format: src.format || 'Workshop',
      tier: src.tier || 'standard',
      price: src.price != null ? String(src.price) : '',
      max_participants: src.max_participants != null ? String(src.max_participants) : '50',
      gradient_index: gIdx >= 0 ? gIdx : 0,
      event_date: '',
      location: src.location || '',
      location_type: src.location_type || 'in_person',
    });
    setCopiedFromName(src.name);
  };

  const canNext = () => {
    if (step === 0) return form.name && form.duration;
    if (step === 1) return form.price && form.max_participants;
    return true;
  };

  const handleCreate = async () => {
    try {
      await createCourse.mutateAsync({
        name: form.name, tagline: form.tagline, description: form.description,
        duration: form.duration, format: form.format, tier: form.tier,
        price: Number(form.price), max_participants: Number(form.max_participants),
        gradient_colors: GRADIENT_PRESETS[form.gradient_index], is_active: true,
        event_date: form.event_date || null, location: form.location || null,
        location_type: form.location_type,
      } as any);
      toast.success(`Program "${form.name}" created!`);
      navigate('/courses');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Create New Program</h1>
        <p className="text-sm text-muted-foreground">Set up a new training program</p>
      </div>

      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              i < step ? 'bg-primary text-primary-foreground' : i === step ? 'bg-primary text-primary-foreground ring-2 ring-primary/30' : 'bg-muted text-muted-foreground'
            }`}>{i < step ? <Check className="w-4 h-4" /> : i + 1}</div>
            <span className={`text-sm hidden md:inline ${i === step ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className="w-6 h-px bg-border" />}
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          {step === 0 && (<>
            <div className="space-y-2"><Label>Program Name *</Label><Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. LGT PLATINUM™" /></div>
            <div className="space-y-2"><Label>Tagline</Label><Input value={form.tagline} onChange={e => set('tagline', e.target.value)} placeholder="Short description" /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Detailed program description..." rows={4} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Duration *</Label><Input value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="e.g. 180 days" /></div>
              <div className="space-y-2">
                <Label>Format</Label>
                <Select value={form.format} onValueChange={v => set('format', v)}><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{FORMATS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </>)}

          {step === 1 && (<>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tier</Label>
                <Select value={form.tier} onValueChange={v => set('tier', v)}><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TIERS.map(t => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Price (₹) *</Label><Input type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="200000" /></div>
            </div>
            <div className="space-y-2"><Label>Max Participants *</Label><Input type="number" value={form.max_participants} onChange={e => set('max_participants', e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Event Date</Label><Input type="date" value={form.event_date} onChange={e => set('event_date', e.target.value)} /></div>
              <div className="space-y-2">
                <Label>Location Type</Label>
                <Select value={form.location_type} onValueChange={v => set('location_type', v)}><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{LOCATION_TYPES.map(l => <SelectItem key={l} value={l}>{l.replace('_', ' ')}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label>Location</Label><Input value={form.location} onChange={e => set('location', e.target.value)} placeholder="Venue or meeting link" maxLength={60} /></div>
          </>)}

          {step === 2 && (<>
            <div className="space-y-2">
              <Label>Gradient Theme</Label>
              <div className="grid grid-cols-4 gap-3">
                {GRADIENT_PRESETS.map((g, i) => (
                  <button key={i} onClick={() => set('gradient_index', i)}
                    className={`h-16 rounded-xl border-2 transition-all ${form.gradient_index === i ? 'border-primary ring-2 ring-primary/30 scale-105' : 'border-border'}`}
                    style={{ background: `linear-gradient(135deg, ${g[0]}, ${g[1]})` }} />
                ))}
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden border border-border">
              <div className="h-24" style={{ background: `linear-gradient(135deg, ${GRADIENT_PRESETS[form.gradient_index][0]}, ${GRADIENT_PRESETS[form.gradient_index][1]})` }}>
                <div className="h-full flex items-center justify-between px-5">
                  <Badge className="bg-primary-foreground/20 text-primary-foreground backdrop-blur-sm border-0">{form.tier}</Badge>
                  <span className="text-2xl font-bold text-primary-foreground">{form.price ? formatINR(Number(form.price)) : '₹0'}</span>
                </div>
              </div>
              <div className="p-5 bg-card">
                <h3 className="text-lg font-bold text-foreground">{form.name || 'Program Name'}</h3>
                <p className="text-sm text-muted-foreground">{form.tagline || 'Program tagline'}</p>
              </div>
            </div>
          </>)}

          {step === 3 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Review Program</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Name:</span> <span className="font-medium ml-1">{form.name}</span></div>
                <div><span className="text-muted-foreground">Tier:</span> <Badge className="ml-1">{form.tier}</Badge></div>
                <div><span className="text-muted-foreground">Price:</span> <span className="ml-1">{form.price ? formatINR(Number(form.price)) : '—'}</span></div>
                <div><span className="text-muted-foreground">Duration:</span> <span className="ml-1">{form.duration}</span></div>
                <div><span className="text-muted-foreground">Format:</span> <span className="ml-1">{form.format}</span></div>
                <div><span className="text-muted-foreground">Max:</span> <span className="ml-1">{form.max_participants}</span></div>
                {form.event_date && <div><span className="text-muted-foreground">Date:</span> <span className="ml-1">{form.event_date}</span></div>}
                {form.location && <div><span className="text-muted-foreground">Location:</span> <span className="ml-1">{form.location}</span></div>}
              </div>
              {form.description && <div><span className="text-sm text-muted-foreground">Description:</span><p className="text-sm mt-1">{form.description}</p></div>}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 0}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
        {step < 3 ? (
          <Button onClick={() => setStep(s => s + 1)} disabled={!canNext()}>Next <ArrowRight className="w-4 h-4 ml-1" /></Button>
        ) : (
          <Button onClick={handleCreate} disabled={createCourse.isPending}>{createCourse.isPending ? 'Creating...' : <><Plus className="w-4 h-4 mr-1" /> Create Program</>}</Button>
        )}
      </div>
    </div>
  );
};

export default AdminCreateProgram;
