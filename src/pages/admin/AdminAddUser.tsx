import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDbCourses } from '@/hooks/useDbCourses';
import { UserPlus, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

const STEPS = ['Role & Basic Info', 'Profile Details', 'Review & Create'];

const AdminAddUser = () => {
  const { data: courses = [] } = useDbCourses();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    role: 'seeker',
    full_name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    company: '',
    occupation: '',
    gender: '',
    course_id: '',
    send_welcome: true,
  });

  const update = (key: string, val: any) => setForm(prev => ({ ...prev, [key]: val }));

  const canNext = () => {
    if (step === 0) return form.role && form.full_name && form.email && form.phone;
    return true;
  };

  const handleCreate = async () => {
    if (!form.full_name || !form.email || !form.phone) {
      toast.error('Please fill required fields');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: {
          email: form.email,
          full_name: form.full_name,
          phone: form.phone,
          role: form.role,
          city: form.city,
          state: form.state,
          company: form.company,
          occupation: form.occupation,
          gender: form.gender,
          course_id: form.role === 'seeker' && form.course_id ? form.course_id : null,
        },
      });
      if (error || (data as any)?.error) {
        toast.error((data as any)?.error || error?.message || 'Failed to create user');
        setLoading(false);
        return;
      }
      const tempPwd = (data as any)?.temp_password;
      toast.success(`${form.role.toUpperCase()} "${form.full_name}" created. Temp password: ${tempPwd}`, { duration: 15000 });
      setForm({ role: 'seeker', full_name: '', email: '', phone: '', city: '', state: '', company: '', occupation: '', gender: '', course_id: '', send_welcome: true });
      setStep(0);
    } catch (e: any) {
      toast.error(e?.message || 'Error creating user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Add New User</h1>
        <p className="text-sm text-muted-foreground">Create a new account in the system</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              i < step ? 'bg-primary text-primary-foreground' : i === step ? 'bg-primary text-primary-foreground ring-2 ring-primary/30' : 'bg-muted text-muted-foreground'
            }`}>
              {i < step ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-sm hidden sm:inline ${i === step ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className="w-8 h-px bg-border" />}
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          {step === 0 && (
            <>
              <div className="space-y-2">
                <Label>Role *</Label>
                <Select value={form.role} onValueChange={v => update('role', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seeker">Seeker</SelectItem>
                    <SelectItem value="coach">Coach</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input value={form.full_name} onChange={e => update('full_name', e.target.value)} placeholder="Enter full name" />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="email@example.com" />
              </div>
              <div className="space-y-2">
                <Label>Phone *</Label>
                <Input value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+91 9876543210" />
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input value={form.city} onChange={e => update('city', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input value={form.state} onChange={e => update('state', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input value={form.company} onChange={e => update('company', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Occupation</Label>
                  <Input value={form.occupation} onChange={e => update('occupation', e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={form.gender} onValueChange={v => update('gender', v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.role === 'seeker' && (
                <div className="space-y-2">
                  <Label>Enroll in Course</Label>
                  <Select value={form.course_id} onValueChange={v => update('course_id', v)}>
                    <SelectTrigger><SelectValue placeholder="Select course (optional)" /></SelectTrigger>
                    <SelectContent>
                      {courses.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Checkbox checked={form.send_welcome} onCheckedChange={v => update('send_welcome', !!v)} id="welcome" />
                <Label htmlFor="welcome" className="text-sm">Send welcome email</Label>
              </div>
            </>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Review Details</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Role:</span> <Badge className="ml-2">{form.role}</Badge></div>
                <div><span className="text-muted-foreground">Name:</span> <span className="font-medium ml-2">{form.full_name}</span></div>
                <div><span className="text-muted-foreground">Email:</span> <span className="ml-2">{form.email}</span></div>
                <div><span className="text-muted-foreground">Phone:</span> <span className="ml-2">{form.phone}</span></div>
                {form.city && <div><span className="text-muted-foreground">City:</span> <span className="ml-2">{form.city}</span></div>}
                {form.state && <div><span className="text-muted-foreground">State:</span> <span className="ml-2">{form.state}</span></div>}
                {form.company && <div><span className="text-muted-foreground">Company:</span> <span className="ml-2">{form.company}</span></div>}
                {form.occupation && <div><span className="text-muted-foreground">Occupation:</span> <span className="ml-2">{form.occupation}</span></div>}
                {form.gender && <div><span className="text-muted-foreground">Gender:</span> <span className="ml-2">{form.gender}</span></div>}
                <div><span className="text-muted-foreground">Welcome Email:</span> <span className="ml-2">{form.send_welcome ? 'Yes' : 'No'}</span></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 0}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        {step < 2 ? (
          <Button onClick={() => setStep(s => s + 1)} disabled={!canNext()}>
            Next <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={handleCreate} disabled={loading} className="bg-primary">
            {loading ? <><span className="animate-spin mr-2">⏳</span> Creating...</> : <><UserPlus className="w-4 h-4 mr-1" /> Create User</>}
          </Button>
        )}
      </div>
    </div>
  );
};

export default AdminAddUser;
