import { useState } from 'react';
import { useCreateLead } from '@/hooks/useDbLeads';
import { useDbCourses } from '@/hooks/useDbCourses';
import { UserPlus, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const SOURCES = ['Website', 'Social Media', 'Referral', 'Live Event', 'Cold Call', 'LinkedIn', 'WhatsApp', 'Other'];
const PRIORITIES = ['hot', 'warm', 'cold'];
const STEPS = ['Contact Info', 'Interest & Details', 'Review'];

const priorityColor = (p: string) => {
  if (p === 'hot') return 'bg-red-500/10 text-red-600 border-red-200';
  if (p === 'warm') return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
  return 'bg-blue-500/10 text-blue-600 border-blue-200';
};

const AdminAddLead = () => {
  const navigate = useNavigate();
  const { data: courses = [] } = useDbCourses();
  const createLead = useCreateLead();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: '', phone: '', email: '', source: 'Website',
    priority: 'warm', interested_course_id: '', current_challenge: '', notes: '',
  });

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  const canNext = () => { if (step === 0) return form.name && (form.phone || form.email); return true; };

  const handleCreate = async () => {
    try {
      await createLead.mutateAsync({
        name: form.name, phone: form.phone, email: form.email, source: form.source,
        priority: form.priority, interested_course_id: form.interested_course_id || undefined,
        current_challenge: form.current_challenge, notes: form.notes,
      });
      toast.success(`Lead "${form.name}" added!`);
      navigate('/leads');
    } catch (err: any) { toast.error(err.message || 'Failed to add lead'); }
  };

  const selectedCourse = courses.find(c => c.id === form.interested_course_id);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Add New Lead</h1>
        <p className="text-sm text-muted-foreground">Capture a new prospect</p>
      </div>

      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              i < step ? 'bg-primary text-primary-foreground' : i === step ? 'bg-primary text-primary-foreground ring-2 ring-primary/30' : 'bg-muted text-muted-foreground'
            }`}>{i < step ? <Check className="w-4 h-4" /> : i + 1}</div>
            <span className={`text-sm hidden sm:inline ${i === step ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className="w-6 h-px bg-border" />}
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          {step === 0 && (<>
            <div className="space-y-2"><Label>Full Name *</Label><Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Lead's full name" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" /></div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@example.com" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Source</Label>
                <Select value={form.source} onValueChange={v => set('source', v)}><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{SOURCES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Priority</Label>
                <Select value={form.priority} onValueChange={v => set('priority', v)}><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PRIORITIES.map(p => <SelectItem key={p} value={p}>{p === 'hot' ? '🔴 Hot' : p === 'warm' ? '🟡 Warm' : '❄️ Cold'}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </>)}

          {step === 1 && (<>
            <div className="space-y-2"><Label>Interested Program</Label>
              <Select value={form.interested_course_id} onValueChange={v => set('interested_course_id', v)}>
                <SelectTrigger><SelectValue placeholder="Select program (optional)" /></SelectTrigger>
                <SelectContent>{courses.map(c => <SelectItem key={c.id} value={c.id}>{c.name} — ₹{Number(c.price).toLocaleString('en-IN')}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Current Challenge</Label><Textarea value={form.current_challenge} onChange={e => set('current_challenge', e.target.value)} placeholder="What challenge are they facing?" rows={3} /></div>
            <div className="space-y-2"><Label>Notes</Label><Textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Additional notes..." rows={3} /></div>
          </>)}

          {step === 2 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Review Lead</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Name:</span> <span className="font-medium ml-1">{form.name}</span></div>
                <div><span className="text-muted-foreground">Priority:</span> <Badge className={`ml-1 ${priorityColor(form.priority)}`}>{form.priority}</Badge></div>
                {form.phone && <div><span className="text-muted-foreground">Phone:</span> <span className="ml-1">{form.phone}</span></div>}
                {form.email && <div><span className="text-muted-foreground">Email:</span> <span className="ml-1">{form.email}</span></div>}
                <div><span className="text-muted-foreground">Source:</span> <span className="ml-1">{form.source}</span></div>
                {selectedCourse && <div><span className="text-muted-foreground">Program:</span> <span className="ml-1">{selectedCourse.name}</span></div>}
              </div>
              {form.current_challenge && <div><span className="text-sm text-muted-foreground">Challenge:</span><p className="text-sm mt-1">{form.current_challenge}</p></div>}
              {form.notes && <div><span className="text-sm text-muted-foreground">Notes:</span><p className="text-sm mt-1">{form.notes}</p></div>}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 0}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
        {step < 2 ? (
          <Button onClick={() => setStep(s => s + 1)} disabled={!canNext()}>Next <ArrowRight className="w-4 h-4 ml-1" /></Button>
        ) : (
          <Button onClick={handleCreate} disabled={createLead.isPending}>{createLead.isPending ? 'Adding...' : <><UserPlus className="w-4 h-4 mr-1" /> Add Lead</>}</Button>
        )}
      </div>
    </div>
  );
};

export default AdminAddLead;
