import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDbCourses } from '@/hooks/useDbCourses';
import { useSeekerProfiles } from '@/hooks/useSeekerProfiles';
import { UserPlus, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const TIERS = ['standard', 'premium', 'platinum', 'chakravartin'];
const STEPS = ['Select Seeker', 'Select Program', 'Review & Enroll'];
const formatINR = (n: number) => `₹${n.toLocaleString('en-IN')}`;

const AdminNewEnrollment = () => {
  const navigate = useNavigate();
  const { data: courses = [] } = useDbCourses();
  const { data: seekers = [] } = useSeekerProfiles();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [seekerSearch, setSeekerSearch] = useState('');
  const [form, setForm] = useState({ seeker_id: '', course_id: '', tier: 'standard', start_date: new Date().toISOString().split('T')[0] });

  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('enrollments').insert({
        seeker_id: form.seeker_id, course_id: form.course_id, tier: form.tier,
        start_date: form.start_date, status: 'active', payment_status: 'pending',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-enrollments'] });
      toast.success('Enrollment created!');
      navigate('/admin/enrollments');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to create enrollment'),
  });

  const canNext = () => {
    if (step === 0) return !!form.seeker_id;
    if (step === 1) return !!form.course_id;
    return true;
  };

  const selectedSeeker = seekers.find(s => s.id === form.seeker_id);
  const selectedCourse = courses.find(c => c.id === form.course_id);

  const filteredSeekers = seekers.filter(s =>
    s.full_name.toLowerCase().includes(seekerSearch.toLowerCase()) ||
    s.email.toLowerCase().includes(seekerSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">New Enrollment</h1>
        <p className="text-sm text-muted-foreground">Enroll a seeker in a program</p>
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
            <div className="space-y-2">
              <Label>Search Seeker</Label>
              <Input placeholder="Type name or email..." value={seekerSearch} onChange={e => setSeekerSearch(e.target.value)} />
            </div>
            <div className="max-h-64 overflow-y-auto space-y-1">
              {filteredSeekers.slice(0, 20).map(s => (
                <button key={s.id} onClick={() => set('seeker_id', s.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors ${
                    form.seeker_id === s.id ? 'bg-primary/10 border border-primary/30' : 'hover:bg-muted'
                  }`}>
                  <div>
                    <span className="font-medium text-foreground">{s.full_name}</span>
                    <span className="text-muted-foreground ml-2 text-xs">{s.email}</span>
                  </div>
                  {form.seeker_id === s.id && <Check className="w-4 h-4 text-primary" />}
                </button>
              ))}
              {filteredSeekers.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No seekers found</p>}
            </div>
          </>)}

          {step === 1 && (<>
            <div className="space-y-2">
              <Label>Select Program</Label>
              <div className="grid gap-2">
                {courses.map(c => {
                  const gc = c.gradient_colors as any;
                  return (
                    <button key={c.id} onClick={() => { set('course_id', c.id); set('tier', c.tier); }}
                      className={`text-left rounded-xl border p-3 transition-all ${
                        form.course_id === c.id ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
                      }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-foreground">{c.name}</span>
                          <p className="text-xs text-muted-foreground">{c.tagline}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="text-xs">{c.tier}</Badge>
                          <p className="text-sm font-bold text-foreground mt-1">{formatINR(Number(c.price))}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tier Override</Label>
                <Select value={form.tier} onValueChange={v => set('tier', v)}><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TIERS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} />
              </div>
            </div>
          </>)}

          {step === 2 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Review Enrollment</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Seeker:</span> <span className="font-medium ml-1">{selectedSeeker?.full_name || '—'}</span></div>
                <div><span className="text-muted-foreground">Email:</span> <span className="ml-1">{selectedSeeker?.email || '—'}</span></div>
                <div><span className="text-muted-foreground">Program:</span> <span className="font-medium ml-1">{selectedCourse?.name || '—'}</span></div>
                <div><span className="text-muted-foreground">Price:</span> <span className="ml-1">{selectedCourse ? formatINR(Number(selectedCourse.price)) : '—'}</span></div>
                <div><span className="text-muted-foreground">Tier:</span> <Badge className="ml-1">{form.tier}</Badge></div>
                <div><span className="text-muted-foreground">Start:</span> <span className="ml-1">{form.start_date}</span></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 0}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
        {step < 2 ? (
          <Button onClick={() => setStep(s => s + 1)} disabled={!canNext()}>Next <ArrowRight className="w-4 h-4 ml-1" /></Button>
        ) : (
          <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Enrolling...' : <><UserPlus className="w-4 h-4 mr-1" /> Enroll Seeker</>}
          </Button>
        )}
      </div>
    </div>
  );
};

export default AdminNewEnrollment;
