import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { COURSES } from '@/data/mockData';

const WORKSHOPS = [
  { id: 'w1', name: 'Laws of Attraction through Ramayana', desc: 'Manifest your desires through timeless Ramayana wisdom', duration: 'Full Day (10 AM - 6 PM)', price: 5000, max: 50, gradient: 'linear-gradient(135deg, #2196F3, #00BCD4)' },
  { id: 'w2', name: 'Team Building', desc: 'Transform groups into unstoppable teams', duration: 'Full Day', price: 7000, max: 40, gradient: 'linear-gradient(135deg, #4CAF50, #009688)' },
  { id: 'w3', name: 'Leadership through Mahabharata', desc: 'Master leadership from the greatest epic ever told', duration: '3 Days', price: 25000, max: 30, gradient: 'linear-gradient(135deg, #800020, #7B1FA2)', premium: true },
];
const INDUSTRIES = ['IT & Software','Manufacturing','Education','Healthcare','Retail & E-commerce','Finance & Banking','Real Estate','Government & Politics','Legal','Agriculture','Media & Entertainment','Hospitality','Consulting','NGO/Non-Profit','Other'];
const REVENUE_RANGES = ['Below ₹10 Lakhs','₹10L - ₹50L','₹50L - ₹1 Crore','₹1Cr - ₹5 Crore','₹5Cr - ₹25 Crore','₹25Cr - ₹100 Crore','₹100 Crore+','Not Applicable (Salaried)','Prefer Not to Say'];
const EXPERIENCE = ['0-2','3-5','6-10','11-15','16-20','20+'];
const STATES = ['Maharashtra','Karnataka','Tamil Nadu','Delhi','Gujarat','Rajasthan','Madhya Pradesh','Uttar Pradesh','West Bengal','Kerala','Telangana','Andhra Pradesh','Punjab','Haryana','Bihar','Other'];
const SOURCES = ['Website','Instagram','YouTube','LinkedIn','Facebook','Referred by','Workshop/Event','Google Search','Other'];

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

// Field component defined OUTSIDE to prevent re-creation on each render
const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div><label className="block text-sm font-medium text-foreground mb-1">{label}{required && <span className="text-destructive ml-1">*</span>}</label>{children}</div>
);

const inputCls = "w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-colors";

// Validation helpers
const sanitizeName = (val: string) => val.replace(/[^a-zA-Z\s]/g, '').slice(0, 60);
const sanitizeDigits = (val: string) => val.replace(/[^0-9]/g, '').slice(0, 10);
const sanitizeEmail = (val: string) => val.slice(0, 60);
const sanitizeCity = (val: string) => val.slice(0, 20);
const sanitize20 = (val: string) => val.slice(0, 20);
const sanitize100 = (val: string) => val.slice(0, 100);
const sanitize1000 = (val: string) => val.slice(0, 1000);
const sanitize40 = (val: string) => val.slice(0, 40);
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.com$/i.test(email.trim());

const CharCount = ({ current, max }: { current: number; max: number }) => (
  <p className="text-xs text-muted-foreground mt-1">{current}/{max} characters</p>
);

const RegisterWorkshop = () => {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);
  const [form, setForm] = useState({
    workshopId: '', preferredDate: '', location: 'pune',
    venueAddress: '', participantCount: '', venueContact: '',
    fullName: '', mobile: '', email: '', whatsapp: '', sameWhatsapp: true,
    countryCode: '+91', whatsappCountryCode: '+91',
    dob: '', gender: '', city: '', state: '', pincode: '',
    profession: '', company: '', industry: '', experience: '', revenue: '', teamSize: '', linkedin: '', otherState: '',
    goals: '', challenge: '', priorPrograms: 'no', priorDetails: '', source: '', referredBy: '', otherSource: '',
    interestedCourses: [] as string[],
    paymentMode: 'pay_now', companyInvoice: '', gstNumber: '', specialReqs: '',
    consent1: false, consent2: false,
  });

  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));
  const selected = WORKSHOPS.find(w => w.id === form.workshopId);
  const emailError = form.email && !isValidEmail(form.email) ? 'Email must include @ and end with .com (e.g. xyz@abc.com)' : '';
  const toggleCourse = (id: string) => set('interestedCourses', form.interestedCourses.includes(id) ? form.interestedCourses.filter((x: string) => x !== id) : [...form.interestedCourses, id]);

  const handleSubmit = () => {
    if (!form.workshopId) { toast({ title: 'Please select a workshop', variant: 'destructive' }); return; }
    if (!form.fullName || form.fullName.length < 2) { toast({ title: 'Please enter a valid full name (min 2 characters)', variant: 'destructive' }); return; }
    if (form.mobile.length !== 10) { toast({ title: 'Please enter a valid 10-digit mobile number', variant: 'destructive' }); return; }
    if (!form.email || !isValidEmail(form.email)) { toast({ title: 'Please enter a valid email with @ and .com (e.g. xyz@abc.com)', variant: 'destructive' }); return; }
    if (!form.city) { toast({ title: 'Please enter your city', variant: 'destructive' }); return; }
    if (!form.profession || !form.company || !form.industry || !form.goals || !form.challenge || !form.consent1) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' }); return;
    }
    setLoading(true);
    setTimeout(() => { setLoading(false); setSubmitted(true); }, 1500);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl shadow-xl p-8 max-w-lg w-full text-center border border-border">
          <div className="text-5xl mb-4">🎯</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Registration Submitted!</h2>
          <p className="text-muted-foreground mb-2">Workshop: {selected?.name}</p>
          <p className="text-muted-foreground text-sm mb-6">Investment: ₹{selected?.price.toLocaleString('en-IN')}</p>
          <div className="text-left text-sm text-muted-foreground space-y-1 mb-6">
            <p className="font-semibold text-foreground">What happens next:</p>
            <p>1. Our team will confirm availability and date</p>
            <p>2. Payment details will be shared via WhatsApp/Email</p>
            <p>3. You'll receive a preparation guide before the workshop</p>
          </div>
          <Link to="/" className="inline-block py-2.5 px-6 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">← Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="text-white py-8 px-4" style={{ background: 'linear-gradient(135deg, #FF9933, #FFD700)' }}>
        <div className="max-w-3xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-1 text-white/80 hover:text-white text-sm mb-4"><ArrowLeft className="w-4 h-4" /> Back to Home</Link>
          <h1 className="text-2xl sm:text-3xl font-bold">🎯 Register for a One-Day Workshop</h1>
          <p className="text-white/80 mt-2 text-sm">Experience transformation in a single powerful day with Vivek Doba</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Workshop Selection */}
        <div className="bg-card rounded-xl border-l-4 p-6 shadow-sm" style={{ borderLeftColor: '#FF9933' }}>
          <h3 className="font-semibold text-foreground mb-4">Select Workshop *</h3>
          <div className="grid gap-3">
            {WORKSHOPS.map(w => (
              <button key={w.id} onClick={() => set('workshopId', w.id)} className={`w-full text-left p-4 rounded-xl border-2 transition-all ${form.workshopId === w.id ? 'border-primary shadow-md' : 'border-border hover:border-primary/40'}`}>
                <div className="h-1.5 rounded-full mb-3" style={{ background: w.gradient }} />
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{w.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{w.desc}</p>
                    <p className="text-xs text-muted-foreground mt-1">{w.duration} | Max: {w.max} participants</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="font-bold text-foreground">₹{w.price.toLocaleString('en-IN')}</p>
                    {w.premium && <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Premium ✦</span>}
                    {form.workshopId === w.id && <Check className="w-5 h-5 text-primary mt-1 ml-auto" />}
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <Field label="Preferred Date" required><input className={inputCls} type="date" value={form.preferredDate} onChange={e => set('preferredDate', e.target.value)} /></Field>
            <Field label="Preferred Location" required>
              <select className={inputCls} value={form.location} onChange={e => set('location', e.target.value)}>
                <option value="pune">Pune (Hinjewadi/Kothrud)</option>
                <option value="mumbai">Mumbai</option>
                <option value="online">Online (Zoom)</option>
                <option value="venue">At My Office/Venue</option>
              </select>
            </Field>
          </div>
          {form.location === 'venue' && (
            <div className="grid sm:grid-cols-2 gap-4 mt-3">
              <Field label="Venue Address">
                <textarea className={inputCls} rows={2} value={form.venueAddress} onChange={e => set('venueAddress', sanitize100(e.target.value))} maxLength={100} />
                <CharCount current={form.venueAddress.length} max={100} />
              </Field>
              <div className="space-y-3">
                <Field label="Number of Participants"><input className={inputCls} type="number" value={form.participantCount} onChange={e => set('participantCount', e.target.value)} /></Field>
                <Field label="Contact Person">
                  <input className={inputCls} value={form.venueContact} onChange={e => set('venueContact', sanitizeName(e.target.value))} maxLength={60} />
                </Field>
              </div>
            </div>
          )}
        </div>

        {/* Courses Interested In */}
        <div className="bg-card rounded-xl border-l-4 p-6 shadow-sm" style={{ borderLeftColor: '#E91E63' }}>
          <h3 className="font-semibold text-foreground mb-4">Also Interested In (Other Courses)</h3>
          <p className="text-xs text-muted-foreground mb-3">Select any additional courses you'd like to explore</p>
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
              {form.interestedCourses.map((id: string) => {
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

        {/* Personal Details */}
        <div className="bg-card rounded-xl border-l-4 p-6 shadow-sm" style={{ borderLeftColor: '#FFD700' }}>
          <h3 className="font-semibold text-foreground mb-4">Personal Details</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Full Name" required>
              <input className={inputCls} value={form.fullName} onChange={e => set('fullName', sanitizeName(e.target.value))} placeholder="Letters only" maxLength={60} />
              <CharCount current={form.fullName.length} max={60} />
            </Field>
            <Field label="Mobile Number" required>
              <div className="flex gap-2">
                <select className={`${inputCls} !w-28 flex-shrink-0`} value={form.countryCode} onChange={e => set('countryCode', e.target.value)}>
                  {COUNTRY_CODES.map(cc => <option key={cc.code} value={cc.code}>{cc.short}</option>)}
                </select>
                <input className={inputCls} type="tel" value={form.mobile} onChange={e => set('mobile', sanitizeDigits(e.target.value))} placeholder="10-digit number" maxLength={10} />
              </div>
              <CharCount current={form.mobile.length} max={10} />
            </Field>
            <Field label="Email" required>
              <input className={`${inputCls} ${emailError ? 'border-destructive focus:border-destructive' : ''}`} type="email" value={form.email} onChange={e => set('email', sanitizeEmail(e.target.value).replace(/\s/g, ''))} placeholder="xyz@abc.com" maxLength={60} pattern="^[^\s@]+@[^\s@]+\.com$" title="Enter email with @ and .com (e.g. xyz@abc.com)" />
              <CharCount current={form.email.length} max={60} />
              {emailError && <p className="text-xs text-destructive mt-1">{emailError}</p>}
            </Field>
            <Field label="WhatsApp">
              <label className="flex items-center gap-2 mb-1"><input type="checkbox" checked={form.sameWhatsapp} onChange={e => set('sameWhatsapp', e.target.checked)} className="rounded" /><span className="text-xs text-muted-foreground">Same as mobile</span></label>
              {!form.sameWhatsapp && (
                <div className="flex gap-2">
                  <select className={`${inputCls} !w-28 flex-shrink-0`} value={form.whatsappCountryCode} onChange={e => set('whatsappCountryCode', e.target.value)}>
                    {COUNTRY_CODES.map(cc => <option key={cc.code} value={cc.code}>{cc.short}</option>)}
                  </select>
                  <input className={inputCls} type="tel" value={form.whatsapp} onChange={e => set('whatsapp', sanitizeDigits(e.target.value))} placeholder="10-digit number" maxLength={10} />
                </div>
              )}
            </Field>
            <Field label="Date of Birth"><input className={inputCls} type="date" value={form.dob} onChange={e => set('dob', e.target.value)} /></Field>
            <Field label="Gender">
              <div className="flex gap-4 mt-1">{['Male','Female','Other'].map(g => <label key={g} className="flex items-center gap-1.5 text-sm text-foreground"><input type="radio" name="gender" value={g} checked={form.gender === g} onChange={() => set('gender', g)} />{g}</label>)}</div>
            </Field>
            <Field label="City" required>
              <input className={inputCls} value={form.city} onChange={e => set('city', sanitizeCity(e.target.value))} maxLength={20} />
              <CharCount current={form.city.length} max={20} />
            </Field>
            <Field label="State" required>
              <select className={inputCls} value={form.state} onChange={e => { set('state', e.target.value); if (e.target.value !== 'Other') set('otherState', ''); }}>
                <option value="">Select...</option>{STATES.map(s => <option key={s}>{s}</option>)}
              </select>
              {form.state === 'Other' && (
                <div className="mt-2">
                  <input className={inputCls} value={form.otherState} onChange={e => set('otherState', sanitize20(e.target.value))} placeholder="Enter your state" maxLength={20} />
                  <CharCount current={form.otherState.length} max={20} />
                </div>
              )}
            </Field>
          </div>
        </div>

        {/* Professional Details */}
        <div className="bg-card rounded-xl border-l-4 p-6 shadow-sm" style={{ borderLeftColor: '#3F51B5' }}>
          <h3 className="font-semibold text-foreground mb-4">Professional Details</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Current Profession/Role" required>
              <input className={inputCls} value={form.profession} onChange={e => set('profession', sanitize20(e.target.value))} maxLength={20} />
              <CharCount current={form.profession.length} max={20} />
            </Field>
            <Field label="Company/Business Name" required>
              <input className={inputCls} value={form.company} onChange={e => set('company', sanitize20(e.target.value))} maxLength={20} />
              <CharCount current={form.company.length} max={20} />
            </Field>
            <Field label="Industry" required><select className={inputCls} value={form.industry} onChange={e => set('industry', e.target.value)}><option value="">Select...</option>{INDUSTRIES.map(i => <option key={i}>{i}</option>)}</select></Field>
            <Field label="Years of Experience" required><select className={inputCls} value={form.experience} onChange={e => set('experience', e.target.value)}><option value="">Select...</option>{EXPERIENCE.map(e => <option key={e}>{e}</option>)}</select></Field>
            <Field label="Revenue Range" required><select className={inputCls} value={form.revenue} onChange={e => set('revenue', e.target.value)}><option value="">Select...</option>{REVENUE_RANGES.map(r => <option key={r}>{r}</option>)}</select></Field>
            <Field label="LinkedIn Profile URL"><input className={inputCls} value={form.linkedin} onChange={e => set('linkedin', e.target.value)} placeholder="Optional" /></Field>
          </div>
        </div>

        {/* Goals */}
        <div className="bg-card rounded-xl border-l-4 p-6 shadow-sm" style={{ borderLeftColor: '#4CAF50' }}>
          <h3 className="font-semibold text-foreground mb-4">Your Goals</h3>
          <div className="space-y-4">
            <Field label="What do you hope to gain?" required>
              <textarea className={inputCls} rows={3} value={form.goals} onChange={e => set('goals', sanitize1000(e.target.value))} placeholder="What specific outcomes are you looking for?" maxLength={1000} />
              <CharCount current={form.goals.length} max={1000} />
            </Field>
            <Field label="Biggest challenge right now?" required>
              <textarea className={inputCls} rows={3} value={form.challenge} onChange={e => set('challenge', sanitize1000(e.target.value))} placeholder="Be specific..." maxLength={1000} />
              <CharCount current={form.challenge.length} max={1000} />
            </Field>
            <Field label="Attended any coaching program before?" required>
              <div className="flex gap-4">{['Yes','Never','This will be my first'].map(o => <label key={o} className="flex items-center gap-1.5 text-sm"><input type="radio" name="prior" checked={form.priorPrograms === o.toLowerCase()} onChange={() => { set('priorPrograms', o.toLowerCase()); if (o.toLowerCase() !== 'yes') set('priorDetails', ''); }} />{o}</label>)}</div>
            </Field>
            {form.priorPrograms === 'yes' && (
              <Field label="Program details (brief)">
                <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" placeholder="Name of program attended" value={form.priorDetails} onChange={e => set('priorDetails', sanitize100(e.target.value))} maxLength={100} />
                <CharCount current={form.priorDetails.length} max={100} />
              </Field>
            )}
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="How did you hear about us?" required>
                <select className={inputCls} value={form.source} onChange={e => { set('source', e.target.value); if (e.target.value !== 'Referred by' && e.target.value !== 'Other') { set('referredBy', ''); set('otherSource', ''); } }}>
                  <option value="">Select...</option>{SOURCES.map(s => <option key={s}>{s}</option>)}
                </select>
              </Field>
              {form.source === 'Referred by' && (
                <Field label="Referred by" required>
                  <input className={inputCls} value={form.referredBy} onChange={e => set('referredBy', sanitize20(e.target.value))} placeholder="Name of referrer" maxLength={20} />
                  <CharCount current={form.referredBy.length} max={20} />
                </Field>
              )}
              {form.source === 'Other' && (
                <Field label="Please specify" required>
                  <input className={inputCls} value={form.otherSource} onChange={e => set('otherSource', sanitize40(e.target.value))} placeholder="How did you hear about us?" maxLength={40} />
                  <CharCount current={form.otherSource.length} max={40} />
                </Field>
              )}
            </div>
          </div>
        </div>

        {/* Payment & Consent */}
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <h3 className="font-semibold text-foreground mb-4">Payment & Consent</h3>
          <Field label="Payment Mode Preference" required>
            <div className="space-y-2 mt-1">
              {[['pay_now','Pay Now (UPI/Online)'],['at_venue','Pay at Venue (Cash/Card)'],['corporate','Corporate Invoice']].map(([v,l]) => (
                <label key={v} className="flex items-center gap-2 text-sm"><input type="radio" name="payment" checked={form.paymentMode === v} onChange={() => set('paymentMode', v)} />{l}</label>
              ))}
            </div>
          </Field>
          {form.paymentMode === 'pay_now' && <p className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded">UPI: vivekdoba@sbi | Or pay via Razorpay link after approval</p>}
          {form.paymentMode === 'corporate' && (
            <div className="grid sm:grid-cols-2 gap-3 mt-3">
              <Field label="Company Name for Invoice">
                <input className={inputCls} value={form.companyInvoice} onChange={e => set('companyInvoice', sanitize20(e.target.value))} maxLength={20} />
                <CharCount current={form.companyInvoice.length} max={20} />
              </Field>
              <Field label="GST Number"><input className={inputCls} value={form.gstNumber} onChange={e => set('gstNumber', e.target.value.slice(0, 15))} maxLength={15} /></Field>
            </div>
          )}
          <div className="space-y-3 mt-4">
            <label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" checked={form.consent1} onChange={e => set('consent1', e.target.checked)} className="mt-1 rounded" /><span className="text-sm">I confirm my registration and commit to attending the full workshop. I understand the investment of ₹{selected?.price.toLocaleString('en-IN') || '—'}. 🙏 *</span></label>
            <label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" checked={form.consent2} onChange={e => set('consent2', e.target.checked)} className="mt-1 rounded" /><span className="text-sm text-muted-foreground">I consent to receiving updates via WhatsApp and Email from VDTS.</span></label>
          </div>
          <button onClick={handleSubmit} disabled={loading} className="w-full mt-6 py-3.5 rounded-xl text-white font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #FF9933, #FFD700)' }}>
            {loading ? '⏳ Submitting...' : '🎯 Register for Workshop'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterWorkshop;
