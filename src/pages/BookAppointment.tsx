import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Phone, MessageSquare, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { COURSES } from '@/data/mockData';

const INDUSTRIES = ['IT & Software','Manufacturing','Education','Healthcare','Retail & E-commerce','Finance & Banking','Real Estate','Government & Politics','Legal','Agriculture','Media & Entertainment','Hospitality','Consulting','NGO/Non-Profit','Other'];
const REVENUE_RANGES = ['Below ₹10 Lakhs','₹10L - ₹50L','₹50L - ₹1 Crore','₹1Cr - ₹5 Crore','₹5Cr - ₹25 Crore','₹25Cr - ₹100 Crore','₹100 Crore+','Not Applicable (Salaried)','Prefer Not to Say'];
const TEAM_SIZES = ['Solo / Individual','2-5','6-15','16-50','51-200','200+'];
const PURPOSES = ['Personal Growth & Clarity','Business Growth & Strategy','Leadership Development','Work-Life Balance','Spiritual Guidance','Relationship Improvement','Team Building Advice','Career Transition','Stress & Burnout Management','Exploring Coaching Programs','Other'];
const SOURCES = ['Website','Instagram','YouTube','LinkedIn','Facebook','Referral from Friend/Colleague','Attended a Workshop/Event','Google Search','Newspaper/Magazine','Other'];

const COUNTRY_CODES = [
  { code: '+91', label: '🇮🇳 +91 India', short: '🇮🇳 +91' },
  { code: '+1', label: '🇺🇸 +1 USA', short: '🇺🇸 +1' },
  { code: '+44', label: '🇬🇧 +44 UK', short: '🇬🇧 +44' },
  { code: '+971', label: '🇦🇪 +971 UAE', short: '🇦🇪 +971' },
  { code: '+65', label: '🇸🇬 +65 Singapore', short: '🇸🇬 +65' },
  { code: '+61', label: '🇦🇺 +61 Australia', short: '🇦🇺 +61' },
  { code: '+49', label: '🇩🇪 +49 Germany', short: '🇩🇪 +49' },
  { code: '+81', label: '🇯🇵 +81 Japan', short: '🇯🇵 +81' },
];

const generateSlots = () => {
  const slots: string[] = [];
  const hours = [9,9.75,10.5,11.25,14,14.75,15.5,16.25,17];
  hours.forEach(h => {
    const hr = Math.floor(h);
    const mn = Math.round((h - hr) * 60);
    const ampm = hr >= 12 ? 'PM' : 'AM';
    const displayHr = hr > 12 ? hr - 12 : hr;
    slots.push(`${displayHr}:${mn.toString().padStart(2,'0')} ${ampm}`);
  });
  return slots;
};

const getNext14Days = () => {
  const days: { date: Date; label: string; available: boolean }[] = [];
  const now = new Date();
  for (let i = 1; i <= 14; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const dow = d.getDay();
    days.push({
      date: d,
      label: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
      available: dow !== 0,
    });
  }
  return days;
};

// Field component defined OUTSIDE to prevent re-creation on each render
const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div>
    <label className="block text-sm font-medium text-foreground mb-1">{label}{required && <span className="text-destructive ml-1">*</span>}</label>
    {children}
  </div>
);

const inputCls = "w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-colors";

const BookAppointment = () => {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: '', mobile: '', email: '', whatsapp: '', sameWhatsapp: true, city: '', address: '',
    countryCode: '+91', whatsappCountryCode: '+91',
    profession: '', company: '', industry: '', revenue: '', teamSize: '',
    purposes: [] as string[], challenge: '', source: '', referredBy: '',
    interestedCourses: [] as string[],
    selectedDate: null as Date | null, selectedSlot: '',
    consent: false,
  });

  const days = useMemo(getNext14Days, []);
  const slots = useMemo(generateSlots, []);
  const bookedSlots = ['10:30 AM', '2:00 PM'];

  const set = (key: string, val: any) => setForm(p => ({ ...p, [key]: val }));
  const togglePurpose = (p: string) => set('purposes', form.purposes.includes(p) ? form.purposes.filter(x => x !== p) : [...form.purposes, p]);
  const toggleCourse = (id: string) => set('interestedCourses', form.interestedCourses.includes(id) ? form.interestedCourses.filter(x => x !== id) : [...form.interestedCourses, id]);
  const [coursesOpen, setCoursesOpen] = useState(false);

  // Validation helpers
  const sanitizeName = (val: string) => val.replace(/[^a-zA-Z\s]/g, '').slice(0, 60);
  const sanitizeDigits = (val: string) => val.replace(/[^0-9]/g, '').slice(0, 10);
  const sanitizeEmail = (val: string) => val.slice(0, 60);
  const sanitizeCity = (val: string) => val.slice(0, 20);
  const sanitizeProfession = (val: string) => val.slice(0, 20);
  const sanitizeAddress = (val: string) => val.slice(0, 100);
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.(com|in|org|net|co|io|edu|gov|info)$/i.test(email);

  const handleSubmit = () => {
    if (!form.fullName || form.fullName.length < 2) {
      toast({ title: 'Please enter a valid full name (min 2 characters)', variant: 'destructive' }); return;
    }
    if (form.mobile.length !== 10) {
      toast({ title: 'Please enter a valid 10-digit mobile number', variant: 'destructive' }); return;
    }
    if (!form.email || !isValidEmail(form.email)) {
      toast({ title: 'Please enter a valid email (e.g. xyz@abc.com)', variant: 'destructive' }); return;
    }
    if (!form.city) {
      toast({ title: 'Please enter your city', variant: 'destructive' }); return;
    }
    if (!form.profession || !form.industry || !form.challenge || !form.source || !form.selectedDate || !form.selectedSlot || !form.consent || form.purposes.length === 0) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' }); return;
    }
    setLoading(true);
    setTimeout(() => { setLoading(false); setSubmitted(true); }, 1500);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl shadow-xl p-8 max-w-lg w-full text-center border border-border">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Appointment Request Submitted!</h2>
          <div className="bg-muted rounded-xl p-4 my-4 text-left">
            <p className="text-sm text-foreground">📅 {form.selectedDate?.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} at {form.selectedSlot}</p>
          </div>
          <div className="text-left text-sm text-muted-foreground space-y-1 mb-6">
            <p className="font-semibold text-foreground">What happens next:</p>
            <p>1. Vivek Sir will review your request within 24 hours</p>
            <p>2. Once approved, you'll receive confirmation via WhatsApp/Email</p>
            <p>3. A Google Meet link will be shared before the call</p>
          </div>
          <p className="text-sm text-muted-foreground mb-4">📞 Questions? Call 9607050111</p>
          <div className="flex gap-3">
            <Link to="/" className="flex-1 py-2.5 rounded-xl border border-border text-center text-sm font-medium text-foreground hover:bg-muted transition-colors">← Back to Home</Link>
            <a href="https://wa.me/919607050111" target="_blank" rel="noopener noreferrer" className="flex-1 py-2.5 rounded-xl text-center text-sm font-medium text-white" style={{ backgroundColor: '#25D366' }}>💬 WhatsApp Us</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="text-white py-8 px-4" style={{ background: 'linear-gradient(135deg, #2196F3, #00BCD4)' }}>
        <div className="max-w-3xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-1 text-white/80 hover:text-white text-sm mb-4 transition-colors"><ArrowLeft className="w-4 h-4" /> Back to Home</Link>
          <h1 className="text-2xl sm:text-3xl font-bold">📞 Book Your 45-Minute Discovery Call</h1>
          <p className="text-white/80 mt-2 text-sm">Take the first step toward transformation. This is a FREE, no-obligation call.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Section 1: Your Details */}
        <div className="bg-card rounded-xl border-l-4 p-6 shadow-sm" style={{ borderLeftColor: '#2196F3' }}>
          <h3 className="font-semibold text-foreground mb-4">Your Details</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Full Name" required>
              <input className={inputCls} value={form.fullName} onChange={e => set('fullName', sanitizeName(e.target.value))} placeholder="Your full name (letters only)" maxLength={60} />
              <p className="text-xs text-muted-foreground mt-1">{form.fullName.length}/60 characters</p>
            </Field>
            <Field label="Mobile Number" required>
              <div className="flex gap-1.5">
                <select
                  className="px-2 py-2.5 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none w-[100px] flex-shrink-0"
                  value={form.countryCode}
                  onChange={e => set('countryCode', e.target.value)}
                >
                  {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.short}</option>)}
                </select>
                <input className={inputCls} type="tel" value={form.mobile} onChange={e => set('mobile', sanitizeDigits(e.target.value))} placeholder="10-digit number" maxLength={10} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{form.mobile.length}/10 digits</p>
            </Field>
            <Field label="Email Address" required>
              <input className={inputCls} type="email" value={form.email} onChange={e => set('email', sanitizeEmail(e.target.value))} placeholder="xyz@abc.com" maxLength={60} />
              {form.email && !isValidEmail(form.email) && <p className="text-xs text-destructive mt-1">Enter a valid email (e.g. xyz@abc.com)</p>}
              <p className="text-xs text-muted-foreground mt-1">{form.email.length}/60 characters</p>
            </Field>
            <Field label="WhatsApp Number">
              <div className="flex items-center gap-2 mb-1.5">
                <input type="checkbox" checked={form.sameWhatsapp} onChange={e => set('sameWhatsapp', e.target.checked)} className="rounded" />
                <span className="text-xs text-muted-foreground">Same as mobile</span>
              </div>
              {!form.sameWhatsapp && (
                <div className="flex gap-1.5">
                  <select
                    className="px-2 py-2.5 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none w-[100px] flex-shrink-0"
                    value={form.whatsappCountryCode}
                    onChange={e => set('whatsappCountryCode', e.target.value)}
                  >
                    {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.short}</option>)}
                  </select>
                  <input className={inputCls} value={form.whatsapp} onChange={e => set('whatsapp', sanitizeDigits(e.target.value))} placeholder="WhatsApp number" maxLength={10} />
                </div>
              )}
            </Field>
            <Field label="City" required>
              <input className={inputCls} value={form.city} onChange={e => set('city', sanitizeCity(e.target.value))} placeholder="Your city" maxLength={20} />
              <p className="text-xs text-muted-foreground mt-1">{form.city.length}/20 characters</p>
            </Field>
            <Field label="Full Address">
              <textarea className={inputCls} rows={2} value={form.address} onChange={e => set('address', sanitizeAddress(e.target.value))} placeholder="Your complete address (optional)" maxLength={100} />
              <p className="text-xs text-muted-foreground mt-1">{form.address.length}/100 characters</p>
            </Field>
          </div>
        </div>

        {/* Courses Interested In */}
        <div className="bg-card rounded-xl border-l-4 p-6 shadow-sm" style={{ borderLeftColor: '#FFD700' }}>
          <h3 className="font-semibold text-foreground mb-4">Courses / Programs Interested In</h3>
          <p className="text-xs text-muted-foreground mb-3">Select one or more courses you'd like to explore</p>
          <div className="relative">
            <button type="button" onClick={() => setCoursesOpen(!coursesOpen)} className={`${inputCls} flex items-center justify-between text-left`}>
              <span className={form.interestedCourses.length ? 'text-foreground' : 'text-muted-foreground'}>
                {form.interestedCourses.length ? `${form.interestedCourses.length} course(s) selected` : 'Select courses...'}
              </span>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${coursesOpen ? 'rotate-180' : ''}`} />
            </button>
            {coursesOpen && (
              <div className="absolute z-20 mt-1 w-full bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {COURSES.filter(c => c.is_active).map(c => (
                  <label key={c.id} className="flex items-start gap-3 px-3 py-2.5 hover:bg-muted/50 cursor-pointer border-b border-border/50 last:border-0">
                    <input type="checkbox" checked={form.interestedCourses.includes(c.id)} onChange={() => toggleCourse(c.id)} className="mt-0.5 rounded accent-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.duration} · {c.format} · ₹{c.price.toLocaleString('en-IN')}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
          {form.interestedCourses.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {form.interestedCourses.map(id => {
                const c = COURSES.find(x => x.id === id);
                return c ? (
                  <span key={id} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                    {c.name}
                    <button onClick={() => toggleCourse(id)} className="hover:text-destructive">×</button>
                  </span>
                ) : null;
              })}
            </div>
          )}
        </div>

        {/* Section 2: About You */}
        <div className="bg-card rounded-xl border-l-4 p-6 shadow-sm" style={{ borderLeftColor: '#00BCD4' }}>
          <h3 className="font-semibold text-foreground mb-4">About You</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Profession/Designation" required>
              <input className={inputCls} value={form.profession} onChange={e => set('profession', sanitizeProfession(e.target.value))} placeholder="e.g., Business Owner, CEO" maxLength={20} />
              <p className="text-xs text-muted-foreground mt-1">{form.profession.length}/20 characters</p>
            </Field>
            <Field label="Company/Business Name">
              <input className={inputCls} value={form.company} onChange={e => set('company', e.target.value.slice(0, 20))} placeholder="Your organization name" maxLength={20} />
              <p className="text-xs text-muted-foreground mt-1">{form.company.length}/20 characters</p>
            </Field>
            <Field label="Industry" required>
              <select className={inputCls} value={form.industry} onChange={e => set('industry', e.target.value)}>
                <option value="">Select industry...</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </Field>
            <Field label="Annual Turnover/Revenue" required>
              <select className={inputCls} value={form.revenue} onChange={e => set('revenue', e.target.value)}>
                <option value="">Select range...</option>
                {REVENUE_RANGES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>
            <Field label="Team Size">
              <select className={inputCls} value={form.teamSize} onChange={e => set('teamSize', e.target.value)}>
                <option value="">Select...</option>
                {TEAM_SIZES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
          </div>
        </div>

        {/* Section 3: What brings you here */}
        <div className="bg-card rounded-xl border-l-4 p-6 shadow-sm" style={{ borderLeftColor: '#B8860B' }}>
          <h3 className="font-semibold text-foreground mb-4">What Brings You Here</h3>
          <Field label="What do you need this appointment for?" required>
            <div className="flex flex-wrap gap-2 mt-1">
              {PURPOSES.map(p => (
                <button key={p} onClick={() => togglePurpose(p)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${form.purposes.includes(p) ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground border-border hover:border-primary/50'}`}>{p}</button>
              ))}
            </div>
          </Field>
          <div className="mt-4">
            <Field label="Describe your current challenge or goal" required>
              <textarea className={inputCls} rows={3} value={form.challenge} onChange={e => set('challenge', e.target.value)} placeholder="Tell Vivek Sir what you're going through..." />
            </Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <Field label="How did you hear about Vivek Doba?" required>
              <select className={inputCls} value={form.source} onChange={e => set('source', e.target.value)}>
                <option value="">Select...</option>
                {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Referred by"><input className={inputCls} value={form.referredBy} onChange={e => set('referredBy', e.target.value)} placeholder="Name of the person" /></Field>
          </div>
        </div>

        {/* Section 4: Appointment Slot */}
        <div className="bg-card rounded-xl border-l-4 p-6 shadow-sm" style={{ borderLeftColor: '#3F51B5' }}>
          <h3 className="font-semibold text-foreground mb-4">Choose Your Appointment Slot</h3>
          <p className="text-sm text-muted-foreground mb-3">Step 1: Select a Date</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {days.map((d, i) => (
              <button
                key={i}
                disabled={!d.available}
                onClick={() => { set('selectedDate', d.date); set('selectedSlot', ''); }}
                className={`flex-shrink-0 px-4 py-3 rounded-xl text-center text-sm border-2 transition-all ${
                  !d.available ? 'opacity-40 cursor-not-allowed border-border bg-muted' :
                  form.selectedDate?.toDateString() === d.date.toDateString() ? 'border-primary bg-primary/10 text-primary font-semibold' :
                  'border-border hover:border-primary/50 text-foreground'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {form.selectedDate && (
            <>
              <p className="text-sm text-muted-foreground mt-4 mb-3">Step 2: Select a Time Slot</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {slots.map(s => {
                  const booked = bookedSlots.includes(s);
                  return (
                    <button
                      key={s}
                      disabled={booked}
                      onClick={() => set('selectedSlot', s)}
                      className={`py-2.5 rounded-lg text-sm font-medium border-2 transition-all ${
                        booked ? 'opacity-40 cursor-not-allowed border-border bg-muted line-through' :
                        form.selectedSlot === s ? 'border-primary bg-primary/10 text-primary' :
                        'border-border hover:border-primary/50 text-foreground'
                      }`}
                    >
                      {booked ? 'Booked' : s} {form.selectedSlot === s && '✓'}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {form.selectedDate && form.selectedSlot && (
            <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
              <p className="text-sm font-medium text-foreground">📅 Your Appointment: {form.selectedDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })} at {form.selectedSlot} (45 minutes)</p>
              <p className="text-xs text-muted-foreground mt-1">📍 Mode: Online (Google Meet link will be shared after approval)</p>
            </div>
          )}
        </div>

        {/* Consent + Submit */}
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={form.consent} onChange={e => set('consent', e.target.checked)} className="mt-1 rounded" />
            <span className="text-sm text-foreground">I understand this is a discovery call to explore coaching possibilities. I commit to attending at the scheduled time. 🙏</span>
          </label>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-6 py-3.5 rounded-xl text-white font-semibold text-base transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #2196F3, #00BCD4)' }}
          >
            {loading ? <span className="animate-spin">⏳</span> : '🙏'} {loading ? 'Submitting...' : 'Request Appointment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
