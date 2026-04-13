import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { User, Mail, Phone, Lock, Flower2, Loader2, ArrowLeft } from 'lucide-react';
import { COURSES } from '@/data/mockData';
import { supabase } from '@/integrations/supabase/client';

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', whatsapp: '', password: '', confirm: '', course: '', source: '' });
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.phone || !form.password || !agreed) {
      toast.error('Please fill all required fields');
      return;
    }
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$%&*!?_\-+=]).{12,}$/;
    if (!passwordRegex.test(form.password)) {
      toast.error('Password must be at least 12 characters with one uppercase letter, one number, and one special character (@#$%&*!?_-+=)');
      return;
    }
    if (form.phone.length !== 10) {
      toast.error('Phone must be 10 digits');
      return;
    }

    setLoading(true);
    try {
      // Submit to submissions table for admin approval instead of creating auth user directly
      const { error } = await supabase.from('submissions').insert([{
        form_type: 'registration',
        full_name: form.name,
        email: form.email,
        mobile: form.phone,
        country_code: '+91',
        status: 'pending',
        form_data: {
          fullName: form.name,
          email: form.email,
          phone: form.phone,
          whatsapp: form.whatsapp || form.phone,
          password: form.password,
          course: form.course,
          source: form.source,
        },
      }]);

      if (error) {
        if (error.message.includes('duplicate') || error.message.includes('unique')) {
          toast.error('An application with this email already exists. Please wait for approval or contact support.');
        } else {
          toast.error('Failed to submit application. Please try again.');
        }
        console.error('Submission error:', error);
        return;
      }

      // Send notification to admin about new submission
      try {
        await supabase.functions.invoke('send-notification', {
          body: {
            type: 'new_submission',
            form_type: 'registration',
            applicant_name: form.name,
            applicant_email: form.email,
            applicant_mobile: `+91${form.phone}`,
            form_data: {
              fullName: form.name,
              email: form.email,
              phone: form.phone,
              whatsapp: form.whatsapp || form.phone,
              course: form.course,
              source: form.source,
            },
          },
        });
      } catch (e) {
        console.error('Notification error:', e);
      }

      toast.success('Your application has been submitted for review! You will receive an email and WhatsApp message once approved. 🙏');
      navigate('/login');
    } catch {
      toast.error('An error occurred during registration');
    } finally {
      setLoading(false);
    }
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
          <div className="text-center mb-4 relative">
            <Link to="/login" className="absolute left-0 top-1 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
            <Flower2 className="w-7 h-7 text-primary mx-auto mb-2" />
            <h2 className="text-xl font-bold text-foreground">Create Your Account</h2>
            <p className="text-xs text-muted-foreground mt-1">Your application will be reviewed by our team</p>
          </div>

          <div className="space-y-3">
            <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Full Name *" value={form.name} onChange={(e) => update('name', e.target.value)} className="pl-10" /></div>
            <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input type="email" placeholder="Email *" value={form.email} onChange={(e) => update('email', e.target.value)} className="pl-10" /></div>
            <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Phone (10 digits) *" value={form.phone} onChange={(e) => update('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} className="pl-10" /></div>
            <Input placeholder="WhatsApp Number" value={form.whatsapp} onChange={(e) => update('whatsapp', e.target.value)} />
            <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input type="password" placeholder="Password (min 12 chars) *" value={form.password} onChange={(e) => update('password', e.target.value)} className="pl-10" /></div>
            <p className="text-xs text-muted-foreground -mt-1 ml-1">Min 12 chars, 1 uppercase, 1 number, 1 special character (@#$%&*!?_-+=)</p>
            <Input type="password" placeholder="Confirm Password *" value={form.confirm} onChange={(e) => update('confirm', e.target.value)} />

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

          <button onClick={handleRegister} disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-primary-foreground gradient-saffron hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flower2 className="w-4 h-4" />} Submit Application
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
