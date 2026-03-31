import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Phone, Lock, Flower2 } from 'lucide-react';
import { COURSES } from '@/data/mockData';

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', whatsapp: '', password: '', confirm: '', role: 'seeker' as 'admin' | 'seeker', course: '', source: '' });
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const { toast } = useToast();

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleRegister = () => {
    if (!form.name || !form.email || !form.phone || !form.password || !agreed) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    if (form.password !== form.confirm) {
      toast({ title: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    if (form.phone.length !== 10) {
      toast({ title: 'Phone must be 10 digits', variant: 'destructive' });
      return;
    }
    login(form.email, form.role);
    toast({ title: 'Welcome to your transformation journey! 🙏' });
    navigate(form.role === 'admin' ? '/dashboard' : '/seeker/home');
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="lg:w-[55%] gradient-hero relative flex items-center justify-center p-8 lg:p-16 min-h-[25vh] lg:min-h-screen">
        <div className="relative z-10 text-center">
          <div className="mx-auto w-24 h-24 lg:w-32 lg:h-32 rounded-full flex items-center justify-center mb-6 mandala-border">
            <div className="w-full h-full rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center">
              <span className="text-3xl lg:text-4xl font-bold text-primary-foreground">VD</span>
            </div>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-primary-foreground mb-2">Begin Your Sacred Journey</h1>
          <p className="text-primary-foreground/70 italic">Your transformation starts here</p>
        </div>
      </div>

      <div className="lg:w-[45%] flex items-center justify-center p-6 lg:p-12 bg-background overflow-y-auto">
        <div className="w-full max-w-md space-y-5 animate-fade-up">
          <div className="text-center mb-4">
            <Flower2 className="w-7 h-7 text-primary mx-auto mb-2" />
            <h2 className="text-xl font-bold text-foreground">Create Your Account</h2>
          </div>

          <div className="space-y-3">
            <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Full Name *" value={form.name} onChange={(e) => update('name', e.target.value)} className="pl-10" /></div>
            <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input type="email" placeholder="Email *" value={form.email} onChange={(e) => update('email', e.target.value)} className="pl-10" /></div>
            <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Phone (10 digits) *" value={form.phone} onChange={(e) => update('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} className="pl-10" /></div>
            <Input placeholder="WhatsApp Number" value={form.whatsapp} onChange={(e) => update('whatsapp', e.target.value)} />
            <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input type="password" placeholder="Password *" value={form.password} onChange={(e) => update('password', e.target.value)} className="pl-10" /></div>
            <Input type="password" placeholder="Confirm Password *" value={form.confirm} onChange={(e) => update('confirm', e.target.value)} />

            <div className="flex gap-3">
              {(['seeker', 'admin'] as const).map((r) => (
                <button key={r} onClick={() => update('role', r)} className={`flex-1 py-3 rounded-xl border-2 font-medium text-sm transition-all ${form.role === r ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}>
                  {r === 'seeker' ? '🙏 Seeker (साधक)' : '🏫 Coach'}
                </button>
              ))}
            </div>

            <select value={form.course} onChange={(e) => update('course', e.target.value)} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm">
              <option value="">Which program interests you?</option>
              {COURSES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <select value={form.source} onChange={(e) => update('source', e.target.value)} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm">
              <option value="">How did you find us?</option>
              {['Website', 'Social Media', 'Referral', 'Live Event', 'Other'].map((s) => <option key={s}>{s}</option>)}
            </select>

            <label className="flex items-start gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 accent-primary" />
              <span className="text-muted-foreground">I commit to my transformation journey with dedication 🙏</span>
            </label>
          </div>

          <button onClick={handleRegister} className="w-full py-3 rounded-xl font-semibold text-primary-foreground gradient-saffron hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
            <Flower2 className="w-4 h-4" /> Begin My Sacred Journey
          </button>

          <p className="text-center text-sm text-muted-foreground">
            Already on the path? <Link to="/login" className="text-primary hover:underline font-medium">Sign In →</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
