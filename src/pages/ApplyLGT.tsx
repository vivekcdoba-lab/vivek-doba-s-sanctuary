import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { COURSES } from '@/data/mockData';

const PROGRAMS = [
  { id: 'lgt_bo', name: "Life's Golden Triangle — Business Owners", desc: 'For entrepreneurs and business owners ready to align Dharma, Artha, and Kama', duration: '6 Months', sessions: 24, format: '1-on-1', price: 250000, tier: 'Platinum', gradient: 'linear-gradient(135deg, #9E9E9E, #FFD700)' },
  { id: 'lgt_leaders', name: "Life's Golden Triangle — Leaders Edition", desc: 'For politicians, CXOs, and senior leaders who shape the world', duration: '6 Months', sessions: 24, format: 'Group + 1-on-1', price: 350000, tier: 'Platinum', gradient: 'linear-gradient(135deg, #E0E0E0, #FAFAFA)' },
  { id: 'chakravartin', name: 'Chakravartin — The Sovereign Leadership Program', desc: "The emperor's journey — beyond platinum, beyond ordinary", duration: '12 Months', sessions: 48, format: 'Ultra-Premium 1-on-1', price: 1000000, tier: 'Chakravartin', gradient: 'linear-gradient(135deg, #FFD700, #7B1FA2)', invitation: true },
];

const INDUSTRIES = ['IT & Software','Manufacturing','Education','Healthcare','Pharma','Retail & E-commerce','Finance & Banking','Insurance','Real Estate & Construction','Government','Politics','Legal','Agriculture','Media & Entertainment','Hospitality & Tourism','Consulting','Automobile','Textile','Food & Beverage','NGO/Non-Profit','Freelancer/Solopreneur','Other'];
const REVENUE_RANGES = ['Not Applicable (Salaried)','Below ₹10 Lakhs','₹10L - ₹25L','₹25L - ₹50L','₹50L - ₹1 Crore','₹1Cr - ₹3 Crore','₹3Cr - ₹5 Crore','₹5Cr - ₹10 Crore','₹10Cr - ₹25 Crore','₹25Cr - ₹50 Crore','₹50Cr - ₹100 Crore','₹100 Crore+','Prefer Not to Disclose'];
const INVEST_MONTHLY = ['Below ₹10,000','₹10K - ₹25K','₹25K - ₹50K','₹50K - ₹1L','₹1L - ₹2L','₹2L+','Money is not a constraint'];
const STATES = ['Maharashtra','Karnataka','Tamil Nadu','Delhi','Gujarat','Rajasthan','Madhya Pradesh','Uttar Pradesh','West Bengal','Kerala','Telangana','Andhra Pradesh','Punjab','Haryana','Bihar','Goa','Jharkhand','Odisha','Assam','Chhattisgarh','Other'];
const RELATIONSHIPS = ['Spouse','Parent','Sibling','Friend','Colleague','Other'];
const BLOOD_GROUPS = ['A+','A-','B+','B-','O+','O-','AB+','AB-',"Don't Know"];
const CORE_VALUES = ['Integrity','Honesty','Family','Compassion','Growth','Discipline','Freedom','Wealth','Power','Service','Courage','Wisdom','Love','Gratitude','Excellence','Faith','Adventure','Creativity','Health','Legacy'];
const EMOTIONS = ['Joy','Gratitude','Peace','Excitement','Love','Confidence','Anxiety','Anger','Frustration','Sadness','Fear','Guilt','Shame','Loneliness','Overwhelm','Boredom','Jealousy','Resentment'];
const SPIRITUAL_TEXTS = ['Bhagavad Gita','Ramayana','Mahabharata','Upanishads','Bible','Quran','Buddhist texts','Guru Granth Sahib','Other','None'];
const SPIRITUAL_PRACTICES = ['Morning Prayer/Puja','Meditation','Yoga','Temple/Church/Mosque visits','Reading scriptures','Chanting/Mantras','Gratitude practice','Seva/Service','Fasting','None'];
const HOURS_WEEKLY = ['1-2 hours','3-5 hours','5-7 hours','7-10 hours','Whatever it takes'];
const WHEEL_DIMS = ['Career & Business','Finance & Wealth','Physical Health','Mental Peace','Family Life','Marriage/Partnership','Friendships & Social','Spiritual Growth','Fun & Recreation','Purpose & Meaning'];
const CHALLENGE_CATS = ['Personal','Business','Health','Relationship','Financial','Spiritual'];

const COUNTRY_CODES = [
  { code: '+91', flag: '🇮🇳', country: 'India' },
  { code: '+1', flag: '🇺🇸', country: 'USA' },
  { code: '+44', flag: '🇬🇧', country: 'UK' },
  { code: '+971', flag: '🇦🇪', country: 'UAE' },
  { code: '+65', flag: '🇸🇬', country: 'Singapore' },
  { code: '+61', flag: '🇦🇺', country: 'Australia' },
  { code: '+49', flag: '🇩🇪', country: 'Germany' },
  { code: '+81', flag: '🇯🇵', country: 'Japan' },
];

// Sanitizers
const sanitize = (val: string, max: number) => val.slice(0, max);
const sanitizeDigits = (val: string, max: number) => val.replace(/\D/g, '').slice(0, max);

// Reusable components defined OUTSIDE the main component to prevent re-mount
const Field = ({ label, required, children, className = '', highlight = false }: { label: string; required?: boolean; children: React.ReactNode; className?: string; highlight?: boolean }) => (
  <div className={`${className} ${highlight ? 'ring-2 ring-destructive/60 rounded-lg p-2 -m-1' : ''}`}><label className="block text-sm font-medium text-foreground mb-1">{label}{required && <span className="text-destructive ml-1">*</span>}</label>{children}</div>
);

const CharCount = ({ current, max }: { current: number; max: number }) => (
  <p className={`text-[10px] text-right mt-0.5 ${current >= max ? 'text-destructive' : 'text-muted-foreground'}`}>{current}/{max}</p>
);

const Section = ({ id, title, color, icon, open, onToggle, children }: { id: string; title: string; color: string; icon: string; open: boolean; onToggle: () => void; children: React.ReactNode }) => (
  <div className="bg-card rounded-xl shadow-sm overflow-hidden border border-border">
    <button onClick={onToggle} className="w-full flex items-center justify-between p-5 text-white font-semibold" style={{ background: color }}>
      <span>{icon} {title}</span>
      {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
    </button>
    {open && <div className="p-6 space-y-4">{children}</div>}
  </div>
);

const SliderField = ({ label, value, onChange, min = 1, max = 10, labels }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; labels?: [string, string] }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="text-foreground font-medium">{label}</span>
      <span className="font-bold text-primary">{value}/{max}</span>
    </div>
    <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))} className="w-full accent-primary" />
    {labels && <div className="flex justify-between text-[10px] text-muted-foreground"><span>{labels[0]}</span><span>{labels[1]}</span></div>}
  </div>
);

const PersonalitySlider = ({ left, right, value, onChange }: { left: string; right: string; value: number; onChange: (v: number) => void }) => (
  <div className="flex items-center gap-3">
    <span className="text-xs text-muted-foreground w-20 text-right">{left}</span>
    <input type="range" min={1} max={9} value={value} onChange={e => onChange(Number(e.target.value))} className="flex-1 accent-primary" />
    <span className="text-xs text-muted-foreground w-20">{right}</span>
  </div>
);

const PhoneWithCode = ({ codeValue, onCodeChange, phoneValue, onPhoneChange }: { codeValue: string; onCodeChange: (v: string) => void; phoneValue: string; onPhoneChange: (v: string) => void }) => (
  <div className="flex gap-2">
    <select value={codeValue} onChange={e => onCodeChange(e.target.value)} className="w-28 px-2 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 outline-none">
      {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
    </select>
    <input className="flex-1 px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 outline-none" type="tel" inputMode="numeric" maxLength={10} value={phoneValue} onChange={e => onPhoneChange(sanitizeDigits(e.target.value, 10))} placeholder="10-digit number" />
  </div>
);

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.com$/i.test(email);

const ApplyLGT = () => {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appId] = useState(`VDTS-APP-${Math.floor(1000 + Math.random() * 9000)}`);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ program: true, A: true });
  const [coursesOpen, setCoursesOpen] = useState(false);
  const [missingFields, setMissingFields] = useState<Set<string>>(new Set());

  const [f, setF] = useState<Record<string, any>>({
    programId: '', fullName: '', preferredName: '', dob: '', gender: '', maritalStatus: '', children: 0,
    childrenAges: '', bloodGroup: '', aadhaar: '', mobile: '', mobileCode: '+91', whatsapp: '', sameWhatsapp: true, email: '',
    altPhone: '', prefComm: ['whatsapp', 'email'], address1: '', address2: '', city: '', state: '', stateOther: '', pincode: '',
    country: 'India', hometown: '', emergName: '', emergRelation: '', emergRelOther: '', emergPhone: '', emergPhoneCode: '+91',
    designation: '', company: '', businessNature: '', industry: '', yearsInBiz: '', totalExp: '',
    annualRevenue: '', personalIncome: '', monthlyInvest: '', teamSize: '', managesPeople: 'no', directReports: '',
    hasPartner: 'no', partnerName: '', partnerAware: 'no', website: '',
    healthRating: 7, chronicConditions: 'none', chronicDetails: '', mentalHealth: 'none', mentalOther: '',
    medications: '', disabilities: '', exerciseFreq: '', exerciseTypes: [] as string[],
    sleepHours: '', sleepQuality: 5, alcohol: '', tobacco: '', diet: '', waterIntake: '', weight: '', height: '',
    energyLevel: 6, healthGoal: '',
    spouseRelRating: 7, spouseSupport: '', relChallenge: '', parentRelRating: 7, parentDetails: '',
    childRelRating: 7, childConcerns: '', siblingRelRating: 7, colleagueRelRating: 7, colleagueConflicts: '',
    closeFriends: '', loneliness: '', socialSatisfaction: 5, relGoal: '',
    mentalClarity: 6, stressLevel: 5, anxietyLevel: 5, selfConfidence: 6, emotionalStability: 6, decisionMaking: 6,
    pressureHandling: '', frequentEmotions: [] as string[], biggestFear: '', biggestRegret: '',
    meditationPractice: '', therapyHistory: '',
    spiritual: '', spiritualPractices: [] as string[], textsRead: [] as string[],
    lifePurpose: '', astrology: '', coreValues: [] as string[],
    hobbies: '', favBooks: '', favMovies: '', music: '', relaxation: '', dreamVacation: '', happiness: '',
    annoyances: '', energyDrains: '', avoidSituations: '',
    friendDescribe: '', criticDescribe: '',
    introExtro: 5, logicEmotion: 5, planSpontan: 5, leadFollow: 5, patientImpatient: 5, optimistPessimist: 5, riskTaker: 5, morningNight: 5,
    commStyle: '',
    wheelScores: WHEEL_DIMS.map(() => 5),
    challenge1: '', cat1: '', challenge2: '', cat2: '', challenge3: '', cat3: '',
    longTermIssues: '', triedBefore: 'no', triedDetails: '', biggestObstacle: '', limitingBeliefs: '',
    expectations: '', goalBiz: '', goalFinance: '', goalHealth: '', goalRelation: '', goalPersonal: '', goalSpiritual: '',
    successDef: '', failureDef: '', hoursPerWeek: '',
    commitments: { sessions: false, dailyTracking: false, feedback: false, investment: false, meditation: false, confidential: false },
    anythingElse: '',
    paymentPref: 'full', paymentMethod: '', gstRequired: 'no', gstCompany: '', gstNumber: '',
    interestedCourses: [] as string[],
    consent1: false, consent2: false, consent3: false, consent4: false,
  });

  const set = (k: string, v: any) => setF(p => ({ ...p, [k]: v }));
  const toggleArr = (k: string, v: string) => {
    const arr = f[k] as string[];
    set(k, arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);
  };
  const toggle = (section: string) => setOpenSections(p => ({ ...p, [section]: !p[section] }));
  const selected = PROGRAMS.find(p => p.id === f.programId);
  const toggleCourse = (id: string) => toggleArr('interestedCourses', id);

  const emailError = f.email.length > 0 && !isValidEmail(f.email) ? 'Email must include @ and end with .com' : '';

  const handleSubmit = () => {
    const missing = new Set<string>();
    
    // Program
    if (!f.programId) missing.add('programId');
    
    // All mandatory text fields
    const mandatoryTextFields = [
      'fullName','preferredName','dob','gender','maritalStatus','bloodGroup','mobile','email','city','state','pincode','hometown',
      'emergName','emergRelation','emergPhone',
      'designation','company','businessNature','yearsInBiz','website',
      'healthGoal','relGoal',
      'biggestFear','lifePurpose',
      'hobbies','favBooks','happiness','energyDrains','annoyances',
      'challenge1','challenge2','challenge3','longTermIssues','biggestObstacle','limitingBeliefs',
      'expectations','goalBiz','goalFinance','goalHealth','goalRelation','goalPersonal','goalSpiritual',
      'successDef','failureDef','hoursPerWeek','anythingElse',
    ];
    for (const key of mandatoryTextFields) {
      if (!f[key] || (typeof f[key] === 'string' && !f[key].trim())) missing.add(key);
    }

    // Commitments — all 6 must be checked
    const commitmentKeys = ['sessions','dailyTracking','feedback','investment','meditation','confidential'];
    for (const ck of commitmentKeys) {
      if (!f.commitments[ck]) missing.add(`commitment_${ck}`);
    }

    // Consents
    if (!f.consent1) missing.add('consent1');
    if (!f.consent2) missing.add('consent2');
    if (!f.consent3) missing.add('consent3');
    if (!f.consent4) missing.add('consent4');

    // Conditional
    if (f.gstRequired === 'yes') {
      if (!f.gstCompany.trim()) missing.add('gstCompany');
      if (!f.gstNumber.trim()) missing.add('gstNumber');
    }
    if (f.chronicConditions === 'yes' && !f.chronicDetails.trim()) missing.add('chronicDetails');
    if (f.state === 'Other' && !f.stateOther.trim()) missing.add('stateOther');
    if (f.emergRelation === 'Other' && !f.emergRelOther.trim()) missing.add('emergRelOther');

    // Email validation
    if (f.email && !isValidEmail(f.email)) missing.add('email');
    if (f.mobile && f.mobile.length !== 10) missing.add('mobile');
    if (f.pincode && f.pincode.length !== 6) missing.add('pincode');

    setMissingFields(missing);

    if (missing.size > 0) {
      toast({ title: `Please fill all ${missing.size} mandatory field(s) highlighted in red`, variant: 'destructive' });
      // Open all sections that have errors
      const sectionFieldMap: Record<string, string[]> = {
        A: ['fullName','preferredName','dob','gender','maritalStatus','bloodGroup','mobile','email','city','state','stateOther','pincode','hometown','emergName','emergRelation','emergRelOther','emergPhone'],
        B: ['designation','company','businessNature','yearsInBiz','website'],
        C: ['healthGoal','chronicDetails'],
        D: ['relGoal'],
        E: ['biggestFear'],
        F: ['lifePurpose'],
        G: ['hobbies','favBooks','happiness','energyDrains','annoyances'],
        H: ['challenge1','challenge2','challenge3','longTermIssues','biggestObstacle','limitingBeliefs'],
        I: ['expectations','goalBiz','goalFinance','goalHealth','goalRelation','goalPersonal','goalSpiritual','successDef','failureDef','hoursPerWeek','anythingElse'],
      };
      const toOpen: Record<string, boolean> = {};
      for (const [sec, fields] of Object.entries(sectionFieldMap)) {
        if (fields.some(fld => missing.has(fld))) toOpen[sec] = true;
      }
      if (Object.keys(toOpen).length > 0) setOpenSections(p => ({ ...p, ...toOpen }));
      return;
    }

    setLoading(true);
    setTimeout(() => { setLoading(false); setSubmitted(true); }, 2000);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl shadow-xl p-8 max-w-lg w-full text-center border border-border">
          <div className="text-5xl mb-4">🙏</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Application Submitted Successfully!</h2>
          <p className="text-muted-foreground mb-4">Thank you for taking this powerful step toward transformation.</p>
          <div className="bg-muted rounded-xl p-4 text-left text-sm space-y-1 mb-6">
            <p><strong>Application ID:</strong> {appId}</p>
            <p><strong>Submitted:</strong> {new Date().toLocaleDateString('en-IN')}</p>
            <p><strong>Program:</strong> {selected?.name}</p>
          </div>
          <div className="text-left text-sm text-muted-foreground space-y-1 mb-6">
            <p className="font-semibold text-foreground">What happens next:</p>
            <p>1. Vivek Sir personally reviews every application (within 48 hours)</p>
            <p>2. You may receive a short call to discuss your application</p>
            <p>3. Upon approval, you'll receive welcome kit, payment link & app access</p>
          </div>
          <p className="text-sm italic text-muted-foreground mb-6">"The journey of a thousand miles begins with a single step." — Lao Tzu</p>
          <div className="flex gap-3">
            <Link to="/" className="flex-1 py-2.5 rounded-xl border border-border text-center text-sm font-medium hover:bg-muted">← Back to Home</Link>
            <a href="https://wa.me/919607050111" target="_blank" rel="noopener noreferrer" className="flex-1 py-2.5 rounded-xl text-center text-sm font-medium text-white" style={{ backgroundColor: '#25D366' }}>💬 WhatsApp Us</a>
          </div>
        </div>
      </div>
    );
  }

  const inputCls = "w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="text-white py-8 px-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #FFD700, #7B1FA2)' }}>
        <div className="max-w-3xl mx-auto relative z-10">
          <Link to="/" className="inline-flex items-center gap-1 text-white/80 hover:text-white text-sm mb-4"><ArrowLeft className="w-4 h-4" /> Back to Home</Link>
          <h1 className="text-2xl sm:text-3xl font-bold">👑 Apply for Life's Golden Triangle</h1>
          <p className="text-white/80 mt-2 text-sm">A 180-day sacred journey of Personal Mastery, Professional Excellence, and Spiritual Wellbeing.</p>
          <p className="text-white/60 mt-1 text-xs">⚡ Limited seats. Investment: ₹2,50,000 - ₹10,00,000 based on program tier.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        {/* Program Selector */}
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <h3 className="font-semibold text-foreground mb-4">Select Program *</h3>
          <div className="space-y-3">
            {PROGRAMS.map(p => (
              <button key={p.id} onClick={() => set('programId', p.id)} className={`w-full text-left p-4 rounded-xl border-2 transition-all ${f.programId === p.id ? 'border-primary shadow-md' : 'border-border hover:border-primary/40'}`}>
                <div className="h-1.5 rounded-full mb-3" style={{ background: p.gradient }} />
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{p.desc}</p>
                    <p className="text-xs text-muted-foreground mt-1">{p.duration} | {p.sessions} Sessions | {p.format}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="font-bold text-foreground">₹{p.price.toLocaleString('en-IN')}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${p.invitation ? 'bg-purple-100 text-purple-700' : 'bg-primary/10 text-primary'}`}>{p.invitation ? '👑 By Invitation Only' : p.tier}</span>
                    {f.programId === p.id && <Check className="w-5 h-5 text-primary mt-1 ml-auto" />}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Courses Interested In */}
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <h3 className="font-semibold text-foreground mb-4">Also Interested In (Other Courses)</h3>
          <p className="text-xs text-muted-foreground mb-3">Select any additional courses you'd like to explore alongside your chosen program</p>
          <div className="relative">
            <button type="button" onClick={() => setCoursesOpen(!coursesOpen)} className={`${inputCls} flex items-center justify-between text-left`}>
              <span className={f.interestedCourses.length ? 'text-foreground' : 'text-muted-foreground'}>
                {f.interestedCourses.length ? `${f.interestedCourses.length} course(s) selected` : 'Select courses...'}
              </span>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${coursesOpen ? 'rotate-180' : ''}`} />
            </button>
            {coursesOpen && (
              <div className="absolute z-20 mt-1 w-full bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {COURSES.filter(c => c.is_active).map(c => (
                  <label key={c.id} className="flex items-start gap-3 px-3 py-2.5 hover:bg-muted/50 cursor-pointer border-b border-border/50 last:border-0">
                    <input type="checkbox" checked={f.interestedCourses.includes(c.id)} onChange={() => toggleCourse(c.id)} className="mt-0.5 rounded accent-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.duration} · {c.format} · ₹{c.price.toLocaleString('en-IN')}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
          {f.interestedCourses.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {f.interestedCourses.map((id: string) => {
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

        {/* Section A: Personal */}
        <Section id="A" title="Tell Us About Yourself" color="linear-gradient(135deg, #B8860B, #FFD700)" icon="👤" open={!!openSections.A} onToggle={() => toggle('A')}>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Full Name (as per Aadhaar/PAN)" required>
              <input className={inputCls} maxLength={30} value={f.fullName} onChange={e => set('fullName', sanitize(e.target.value, 30))} />
              <CharCount current={f.fullName.length} max={30} />
            </Field>
            <Field label="Preferred Name/Nickname" required>
              <input className={inputCls} maxLength={20} value={f.preferredName} onChange={e => set('preferredName', sanitize(e.target.value, 20))} placeholder="What should Vivek Sir call you?" />
              <CharCount current={f.preferredName.length} max={20} />
            </Field>
            <Field label="Date of Birth" required><input className={inputCls} type="date" value={f.dob} onChange={e => set('dob', e.target.value)} /></Field>
            <Field label="Gender" required>
              <div className="flex gap-3 mt-1">{['Male','Female','Other'].map(g => <label key={g} className="flex items-center gap-1.5 text-sm"><input type="radio" name="gender" checked={f.gender === g} onChange={() => set('gender', g)} />{g}</label>)}</div>
            </Field>
            <Field label="Marital Status" required>
              <select className={inputCls} value={f.maritalStatus} onChange={e => set('maritalStatus', e.target.value)}><option value="">Select...</option>{['Single','Married','Divorced','Widowed','Separated'].map(s => <option key={s}>{s}</option>)}</select>
            </Field>
            <Field label="Blood Group" required>
              <select className={inputCls} value={f.bloodGroup} onChange={e => set('bloodGroup', e.target.value)}><option value="">Select...</option>{BLOOD_GROUPS.map(b => <option key={b}>{b}</option>)}</select>
            </Field>
            <Field label="Mobile Number" required>
              <PhoneWithCode codeValue={f.mobileCode} onCodeChange={v => set('mobileCode', v)} phoneValue={f.mobile} onPhoneChange={v => set('mobile', v)} />
            </Field>
            <Field label="Email Address" required>
              <input className={`${inputCls} ${emailError ? 'border-destructive' : ''}`} type="email" maxLength={60} value={f.email} onChange={e => set('email', sanitize(e.target.value.replace(/\s/g, ''), 60))} placeholder="xyz@abc.com" />
              {emailError && <p className="text-[10px] text-destructive mt-0.5">{emailError}</p>}
              <CharCount current={f.email.length} max={60} />
            </Field>
            <Field label="City" required>
              <input className={inputCls} maxLength={20} value={f.city} onChange={e => set('city', sanitize(e.target.value, 20))} />
              <CharCount current={f.city.length} max={20} />
            </Field>
            <Field label="State" required>
              <select className={inputCls} value={f.state} onChange={e => { set('state', e.target.value); if (e.target.value !== 'Other') set('stateOther', ''); }}><option value="">Select...</option>{STATES.map(s => <option key={s}>{s}</option>)}</select>
              {f.state === 'Other' && (
                <div className="mt-2">
                  <input className={inputCls} maxLength={20} value={f.stateOther} onChange={e => set('stateOther', sanitize(e.target.value, 20))} placeholder="Enter your state" />
                  <CharCount current={f.stateOther.length} max={20} />
                </div>
              )}
            </Field>
            <Field label="Pincode" required>
              <input className={inputCls} inputMode="numeric" maxLength={6} value={f.pincode} onChange={e => set('pincode', sanitizeDigits(e.target.value, 6))} />
            </Field>
            <Field label="Hometown" required>
              <input className={inputCls} maxLength={20} value={f.hometown} onChange={e => set('hometown', sanitize(e.target.value, 20))} />
              <CharCount current={f.hometown.length} max={20} />
            </Field>
          </div>
          <p className="text-sm font-semibold text-foreground mt-4 mb-2">Emergency Contact</p>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Name" required>
              <input className={inputCls} maxLength={30} value={f.emergName} onChange={e => set('emergName', sanitize(e.target.value, 30))} />
              <CharCount current={f.emergName.length} max={30} />
            </Field>
            <Field label="Relationship" required>
              <select className={inputCls} value={f.emergRelation} onChange={e => { set('emergRelation', e.target.value); if (e.target.value !== 'Other') set('emergRelOther', ''); }}><option value="">Select...</option>{RELATIONSHIPS.map(r => <option key={r}>{r}</option>)}</select>
              {f.emergRelation === 'Other' && (
                <div className="mt-2">
                  <input className={inputCls} maxLength={20} value={f.emergRelOther} onChange={e => set('emergRelOther', sanitize(e.target.value, 20))} placeholder="Specify relationship" />
                  <CharCount current={f.emergRelOther.length} max={20} />
                </div>
              )}
            </Field>
            <Field label="Phone" required>
              <PhoneWithCode codeValue={f.emergPhoneCode} onCodeChange={v => set('emergPhoneCode', v)} phoneValue={f.emergPhone} onPhoneChange={v => set('emergPhone', v)} />
            </Field>
          </div>
        </Section>

        {/* Section B: Professional */}
        <Section id="B" title="Your Professional World" color="linear-gradient(135deg, #800020, #B91C1C)" icon="💼" open={!!openSections.B} onToggle={() => toggle('B')}>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Designation/Title" required>
              <input className={inputCls} maxLength={20} value={f.designation} onChange={e => set('designation', sanitize(e.target.value, 20))} placeholder="CEO, Founder, Director..." />
              <CharCount current={f.designation.length} max={20} />
            </Field>
            <Field label="Company/Business" required>
              <input className={inputCls} maxLength={20} value={f.company} onChange={e => set('company', sanitize(e.target.value, 20))} />
              <CharCount current={f.company.length} max={20} />
            </Field>
            <Field label="Nature of Business" required className="sm:col-span-2">
              <textarea className={inputCls} rows={2} maxLength={100} value={f.businessNature} onChange={e => set('businessNature', sanitize(e.target.value, 100))} placeholder="Describe what your business does..." />
              <CharCount current={f.businessNature.length} max={100} />
            </Field>
            <Field label="Industry" required><select className={inputCls} value={f.industry} onChange={e => set('industry', e.target.value)}><option value="">Select...</option>{INDUSTRIES.map(i => <option key={i}>{i}</option>)}</select></Field>
            <Field label="Years in Current Business" required>
              <input className={inputCls} inputMode="numeric" value={f.yearsInBiz} onChange={e => set('yearsInBiz', sanitizeDigits(e.target.value, 3))} />
            </Field>
            <Field label="Annual Business Revenue" required><select className={inputCls} value={f.annualRevenue} onChange={e => set('annualRevenue', e.target.value)}><option value="">Select...</option>{REVENUE_RANGES.map(r => <option key={r}>{r}</option>)}</select></Field>
            <Field label="Monthly self-growth investment"><select className={inputCls} value={f.monthlyInvest} onChange={e => set('monthlyInvest', e.target.value)}><option value="">Select...</option>{INVEST_MONTHLY.map(i => <option key={i}>{i}</option>)}</select></Field>
            <Field label="Team size"><select className={inputCls} value={f.teamSize} onChange={e => set('teamSize', e.target.value)}><option value="">Select...</option>{['Solo','2-5','6-15','16-50','51-200','200-500','500+'].map(t => <option key={t}>{t}</option>)}</select></Field>
            <Field label="Website/LinkedIn" required>
              <input className={inputCls} maxLength={60} value={f.website} onChange={e => set('website', sanitize(e.target.value, 60))} />
              <CharCount current={f.website.length} max={60} />
            </Field>
          </div>
        </Section>

        {/* Section C: Health */}
        <Section id="C" title="Your Health Matters" color="linear-gradient(135deg, #22C55E, #16A34A)" icon="❤️" open={!!openSections.C} onToggle={() => toggle('C')}>
          <SliderField label="Overall physical health" value={f.healthRating} onChange={v => set('healthRating', v)} labels={['Very Poor','Excellent']} />
          <Field label="Chronic health conditions?" required>
            <div className="flex gap-4">{['None','Yes'].map(o => <label key={o} className="flex items-center gap-1.5 text-sm"><input type="radio" name="chronic" checked={f.chronicConditions === o.toLowerCase()} onChange={() => { set('chronicConditions', o.toLowerCase()); if (o === 'None') set('chronicDetails', ''); }} />{o}</label>)}</div>
          </Field>
          {f.chronicConditions === 'yes' && (
            <Field label="Details" required>
              <textarea className={inputCls} rows={2} maxLength={100} value={f.chronicDetails} onChange={e => set('chronicDetails', sanitize(e.target.value, 100))} placeholder="Please describe your conditions..." />
              <CharCount current={f.chronicDetails.length} max={100} />
            </Field>
          )}
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Exercise regularly?"><select className={inputCls} value={f.exerciseFreq} onChange={e => set('exerciseFreq', e.target.value)}><option value="">Select...</option>{['Daily','3-5 times/week','1-2 times/week','Rarely','Never'].map(e => <option key={e}>{e}</option>)}</select></Field>
            <Field label="Average sleep hours"><select className={inputCls} value={f.sleepHours} onChange={e => set('sleepHours', e.target.value)}><option value="">Select...</option>{['Less than 5','5-6','6-7','7-8','8+'].map(s => <option key={s}>{s}</option>)}</select></Field>
            <Field label="Diet"><select className={inputCls} value={f.diet} onChange={e => set('diet', e.target.value)}><option value="">Select...</option>{['Vegetarian','Non-Vegetarian','Vegan','Jain','Eggetarian'].map(d => <option key={d}>{d}</option>)}</select></Field>
            <Field label="Water intake (glasses/day)"><select className={inputCls} value={f.waterIntake} onChange={e => set('waterIntake', e.target.value)}><option value="">Select...</option>{['Less than 4','4-6','6-8','8+'].map(w => <option key={w}>{w}</option>)}</select></Field>
          </div>
          <SliderField label="Body energy level" value={f.energyLevel} onChange={v => set('energyLevel', v)} />
          <Field label="Health goal for next 6 months" required>
            <textarea className={inputCls} rows={2} maxLength={60} value={f.healthGoal} onChange={e => set('healthGoal', sanitize(e.target.value, 60))} placeholder="e.g., Lose 10 kg, manage BP..." />
            <CharCount current={f.healthGoal.length} max={60} />
          </Field>
        </Section>

        {/* Section D: Relationships */}
        <Section id="D" title="Your Relationships" color="linear-gradient(135deg, #E91E63, #F06292)" icon="💕" open={!!openSections.D} onToggle={() => toggle('D')}>
          <SliderField label="Relationship with spouse/partner" value={f.spouseRelRating} onChange={v => set('spouseRelRating', v)} />
          <SliderField label="Relationship with parents" value={f.parentRelRating} onChange={v => set('parentRelRating', v)} />
          <SliderField label="Relationship with children" value={f.childRelRating} onChange={v => set('childRelRating', v)} />
          <SliderField label="Social life satisfaction" value={f.socialSatisfaction} onChange={v => set('socialSatisfaction', v)} />
          <Field label="Close friends you can confide in?"><select className={inputCls} value={f.closeFriends} onChange={e => set('closeFriends', e.target.value)}><option value="">Select...</option>{['Yes, many','A few','Not really','No'].map(o => <option key={o}>{o}</option>)}</select></Field>
          <Field label="Relationship goal for next 6 months" required>
            <textarea className={inputCls} rows={2} maxLength={100} value={f.relGoal} onChange={e => set('relGoal', sanitize(e.target.value, 100))} placeholder="e.g., Improve marriage communication..." />
            <CharCount current={f.relGoal.length} max={100} />
          </Field>
        </Section>

        {/* Section E: Mental & Emotional */}
        <Section id="E" title="Your Inner World" color="linear-gradient(135deg, #3F51B5, #5C6BC0)" icon="🧠" open={!!openSections.E} onToggle={() => toggle('E')}>
          <div className="grid sm:grid-cols-2 gap-4">
            <SliderField label="Mental clarity & focus" value={f.mentalClarity} onChange={v => set('mentalClarity', v)} />
            <SliderField label="Stress level" value={f.stressLevel} onChange={v => set('stressLevel', v)} labels={['Very Stressed','Completely Calm']} />
            <SliderField label="Self-confidence" value={f.selfConfidence} onChange={v => set('selfConfidence', v)} />
            <SliderField label="Decision-making ability" value={f.decisionMaking} onChange={v => set('decisionMaking', v)} />
          </div>
          <Field label="Emotions you experience MOST often (select up to 5)">
            <div className="flex flex-wrap gap-2 mt-1">{EMOTIONS.map(e => <button key={e} onClick={() => toggleArr('frequentEmotions', e)} className={`px-3 py-1 rounded-full text-xs border transition-colors ${f.frequentEmotions.includes(e) ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}>{e}</button>)}</div>
          </Field>
          <Field label="Your biggest fear" required>
            <textarea className={inputCls} rows={2} maxLength={100} value={f.biggestFear} onChange={e => set('biggestFear', sanitize(e.target.value, 100))} placeholder="What scares you the most?" />
            <CharCount current={f.biggestFear.length} max={100} />
          </Field>
          <Field label="Meditation/mindfulness practice?"><select className={inputCls} value={f.meditationPractice} onChange={e => set('meditationPractice', e.target.value)}><option value="">Select...</option>{['Daily','Sometimes','Tried but stopped','Never'].map(o => <option key={o}>{o}</option>)}</select></Field>
        </Section>

        {/* Section F: Spiritual */}
        <Section id="F" title="Your Spiritual Self" color="linear-gradient(135deg, #FF9933, #F57C00)" icon="🕉️" open={!!openSections.F} onToggle={() => toggle('F')}>
          <Field label="Do you consider yourself spiritual?" required><select className={inputCls} value={f.spiritual} onChange={e => set('spiritual', e.target.value)}><option value="">Select...</option>{['Deeply spiritual','Somewhat','Not particularly','Atheist','Exploring'].map(o => <option key={o}>{o}</option>)}</select></Field>
          <Field label="Spiritual practices you follow">
            <div className="flex flex-wrap gap-2 mt-1">{SPIRITUAL_PRACTICES.map(p => <button key={p} onClick={() => toggleArr('spiritualPractices', p)} className={`px-3 py-1 rounded-full text-xs border transition-colors ${f.spiritualPractices.includes(p) ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'}`}>{p}</button>)}</div>
          </Field>
          <Field label="Spiritual texts you've read">
            <div className="flex flex-wrap gap-2 mt-1">{SPIRITUAL_TEXTS.map(t => <button key={t} onClick={() => toggleArr('textsRead', t)} className={`px-3 py-1 rounded-full text-xs border transition-colors ${f.textsRead.includes(t) ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'}`}>{t}</button>)}</div>
          </Field>
          <Field label="Your purpose of life" required>
            <textarea className={inputCls} rows={2} maxLength={100} value={f.lifePurpose} onChange={e => set('lifePurpose', sanitize(e.target.value, 100))} placeholder="Why do you think you exist? What is your dharma?" />
            <CharCount current={f.lifePurpose.length} max={100} />
          </Field>
          <Field label="Core values (select up to 7)" required>
            <div className="flex flex-wrap gap-2 mt-1">{CORE_VALUES.map(v => <button key={v} onClick={() => f.coreValues.length < 7 || f.coreValues.includes(v) ? toggleArr('coreValues', v) : null} className={`px-3 py-1 rounded-full text-xs border transition-colors ${f.coreValues.includes(v) ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'}`}>{v}</button>)}</div>
          </Field>
        </Section>

        {/* Section G: The Real You */}
        <Section id="G" title="The Real You" color="linear-gradient(135deg, #7B1FA2, #9C27B0)" icon="🎭" open={!!openSections.G} onToggle={() => toggle('G')}>
          <Field label="Hobbies / things you enjoy" required>
            <textarea className={inputCls} rows={2} maxLength={100} value={f.hobbies} onChange={e => set('hobbies', sanitize(e.target.value, 100))} placeholder="Reading, cricket, cooking, travel..." />
            <CharCount current={f.hobbies.length} max={100} />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Favorite books (top 3)" required>
              <textarea className={inputCls} rows={2} maxLength={100} value={f.favBooks} onChange={e => set('favBooks', sanitize(e.target.value, 100))} />
              <CharCount current={f.favBooks.length} max={100} />
            </Field>
            <Field label="What makes you genuinely happy?" required>
              <textarea className={inputCls} rows={2} maxLength={100} value={f.happiness} onChange={e => set('happiness', sanitize(e.target.value, 100))} />
              <CharCount current={f.happiness.length} max={100} />
            </Field>
            <Field label="What drains your energy?" required>
              <textarea className={inputCls} rows={2} maxLength={100} value={f.energyDrains} onChange={e => set('energyDrains', sanitize(e.target.value, 100))} />
              <CharCount current={f.energyDrains.length} max={100} />
            </Field>
            <Field label="Things that annoy you" required>
              <textarea className={inputCls} rows={2} maxLength={100} value={f.annoyances} onChange={e => set('annoyances', sanitize(e.target.value, 100))} placeholder="What triggers you?" />
              <CharCount current={f.annoyances.length} max={100} />
            </Field>
          </div>
          <p className="text-sm font-semibold text-foreground mt-4 mb-3">Personality Spectrum</p>
          <div className="space-y-3">
            <PersonalitySlider left="Introvert" right="Extrovert" value={f.introExtro} onChange={v => set('introExtro', v)} />
            <PersonalitySlider left="Logical" right="Emotional" value={f.logicEmotion} onChange={v => set('logicEmotion', v)} />
            <PersonalitySlider left="Planner" right="Spontaneous" value={f.planSpontan} onChange={v => set('planSpontan', v)} />
            <PersonalitySlider left="Patient" right="Impatient" value={f.patientImpatient} onChange={v => set('patientImpatient', v)} />
            <PersonalitySlider left="Optimist" right="Pessimist" value={f.optimistPessimist} onChange={v => set('optimistPessimist', v)} />
            <PersonalitySlider left="Risk-taker" right="Risk-averse" value={f.riskTaker} onChange={v => set('riskTaker', v)} />
            <PersonalitySlider left="Morning" right="Night owl" value={f.morningNight} onChange={v => set('morningNight', v)} />
          </div>
          <Field label="Communication style"><select className={inputCls} value={f.commStyle} onChange={e => set('commStyle', e.target.value)}><option value="">Select...</option>{['Direct & Blunt','Gentle & Diplomatic','Data-Driven & Logical','Story-Based & Emotional','Philosophical & Deep'].map(o => <option key={o}>{o}</option>)}</select></Field>
        </Section>

        {/* Section H: Challenges */}
        <Section id="H" title="What's Holding You Back" color="linear-gradient(135deg, #EF4444, #DC2626)" icon="⚡" open={!!openSections.H} onToggle={() => toggle('H')}>
          <p className="text-sm text-muted-foreground mb-3">Rate these areas of your life RIGHT NOW (1-10)</p>
          <div className="space-y-3">
            {WHEEL_DIMS.map((dim, i) => (
              <SliderField key={dim} label={dim} value={f.wheelScores[i]} onChange={v => { const ns = [...f.wheelScores]; ns[i] = v; set('wheelScores', ns); }} />
            ))}
          </div>
          <p className="text-sm font-semibold text-foreground mt-6 mb-3">Top 3 Challenges</p>
          {[1, 2, 3].map(n => (
            <div key={n} className="grid sm:grid-cols-[1fr_auto] gap-2 mb-3">
              <Field label={`Challenge ${n}`} required>
                <textarea className={inputCls} rows={2} maxLength={100} value={f[`challenge${n}`]} onChange={e => set(`challenge${n}`, sanitize(e.target.value, 100))} />
                <CharCount current={(f[`challenge${n}`] || '').length} max={100} />
              </Field>
              <Field label="Category"><select className={inputCls} value={f[`cat${n}`]} onChange={e => set(`cat${n}`, e.target.value)}><option value="">—</option>{CHALLENGE_CATS.map(c => <option key={c}>{c}</option>)}</select></Field>
            </div>
          ))}
          <Field label="Issues you've been struggling with for a long time" required>
            <textarea className={inputCls} rows={3} maxLength={100} value={f.longTermIssues} onChange={e => set('longTermIssues', sanitize(e.target.value, 100))} placeholder="Patterns you can't break..." />
            <CharCount current={f.longTermIssues.length} max={100} />
          </Field>
          <Field label="Biggest obstacle between you and your ideal life" required>
            <textarea className={inputCls} rows={2} maxLength={100} value={f.biggestObstacle} onChange={e => set('biggestObstacle', sanitize(e.target.value, 100))} />
            <CharCount current={f.biggestObstacle.length} max={100} />
          </Field>
          <Field label="Limiting beliefs you're aware of" required>
            <textarea className={inputCls} rows={2} maxLength={100} value={f.limitingBeliefs} onChange={e => set('limitingBeliefs', sanitize(e.target.value, 100))} placeholder="e.g., 'I'm not good enough'..." />
            <CharCount current={f.limitingBeliefs.length} max={100} />
          </Field>
        </Section>

        {/* Section I: Vision */}
        <Section id="I" title="Your Vision for the Next 6 Months" color="linear-gradient(135deg, #B8860B, #DAA520)" icon="🎯" open={!!openSections.I} onToggle={() => toggle('I')}>
          <Field label="What do you expect from this program?" required>
            <textarea className={inputCls} rows={3} maxLength={100} value={f.expectations} onChange={e => set('expectations', sanitize(e.target.value, 100))} placeholder="Be specific. What should be DIFFERENT?" />
            <CharCount current={f.expectations.length} max={100} />
          </Field>
          <p className="text-sm font-semibold text-foreground mt-2 mb-3">Specific Goals</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="🏆 Business/Career Goal" required>
              <textarea className={inputCls} rows={2} maxLength={100} value={f.goalBiz} onChange={e => set('goalBiz', sanitize(e.target.value, 100))} />
              <CharCount current={f.goalBiz.length} max={100} />
            </Field>
            <Field label="💰 Financial Goal" required>
              <textarea className={inputCls} rows={2} maxLength={100} value={f.goalFinance} onChange={e => set('goalFinance', sanitize(e.target.value, 100))} />
              <CharCount current={f.goalFinance.length} max={100} />
            </Field>
            <Field label="❤️ Health Goal" required>
              <textarea className={inputCls} rows={2} maxLength={100} value={f.goalHealth} onChange={e => set('goalHealth', sanitize(e.target.value, 100))} />
              <CharCount current={f.goalHealth.length} max={100} />
            </Field>
            <Field label="💕 Relationship Goal" required>
              <textarea className={inputCls} rows={2} maxLength={100} value={f.goalRelation} onChange={e => set('goalRelation', sanitize(e.target.value, 100))} />
              <CharCount current={f.goalRelation.length} max={100} />
            </Field>
            <Field label="🧠 Personal Growth Goal" required>
              <textarea className={inputCls} rows={2} maxLength={100} value={f.goalPersonal} onChange={e => set('goalPersonal', sanitize(e.target.value, 100))} />
              <CharCount current={f.goalPersonal.length} max={100} />
            </Field>
            <Field label="🕉️ Spiritual Goal" required>
              <textarea className={inputCls} rows={2} maxLength={100} value={f.goalSpiritual} onChange={e => set('goalSpiritual', sanitize(e.target.value, 100))} />
              <CharCount current={f.goalSpiritual.length} max={100} />
            </Field>
          </div>
          <Field label="What would make this program a SUCCESS?" required>
            <textarea className={inputCls} rows={2} maxLength={100} value={f.successDef} onChange={e => set('successDef', sanitize(e.target.value, 100))} />
            <CharCount current={f.successDef.length} max={100} />
          </Field>
          <Field label="What would make this program a FAILURE?" required>
            <textarea className={inputCls} rows={2} maxLength={100} value={f.failureDef} onChange={e => set('failureDef', sanitize(e.target.value, 100))} />
            <CharCount current={f.failureDef.length} max={100} />
          </Field>
          <Field label="Hours per week you can dedicate" required>
            <textarea className={inputCls} rows={1} maxLength={100} value={f.hoursPerWeek} onChange={e => set('hoursPerWeek', sanitize(e.target.value, 100))} />
            <CharCount current={f.hoursPerWeek.length} max={100} />
          </Field>
          <p className="text-sm font-semibold text-foreground mt-4 mb-2">Commitments (all must be checked)</p>
          <div className="space-y-2">
            {[
              ['sessions','Attend all sessions sincerely'],
              ['dailyTracking','Complete daily tracking and assignments honestly'],
              ['feedback','Be open to feedback and confronting uncomfortable truths'],
              ['investment','Invest the full program fee as commitment'],
              ['meditation','Practice meditation and journaling daily'],
              ['confidential','Keep all coaching discussions confidential'],
            ].map(([k, text]) => (
              <label key={k} className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" checked={f.commitments[k]} onChange={e => set('commitments', { ...f.commitments, [k]: e.target.checked })} className="mt-1 rounded" />
                <span className="text-sm text-foreground">{text}</span>
              </label>
            ))}
          </div>
          <Field label="Anything else Vivek Sir should know?" required>
            <textarea className={inputCls} rows={3} maxLength={100} value={f.anythingElse} onChange={e => set('anythingElse', sanitize(e.target.value, 100))} placeholder="Anything that didn't fit above..." />
            <CharCount current={f.anythingElse.length} max={100} />
          </Field>
        </Section>

        {/* Section J: Payment & Consent */}
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <h3 className="font-semibold text-foreground mb-4">Payment & Consent</h3>
          {selected && <p className="text-sm bg-muted p-3 rounded-lg mb-4">Selected: <strong>{selected.name}</strong> — ₹{selected.price.toLocaleString('en-IN')}</p>}
          <Field label="Payment Preference" required>
            <div className="space-y-2 mt-1">
              <label className="flex items-center gap-2 text-sm"><input type="radio" name="pay" checked={f.paymentPref === 'full'} onChange={() => set('paymentPref', 'full')} />Full Payment (₹{selected?.price.toLocaleString('en-IN') || '—'}) — Best Value</label>
              <label className="flex items-center gap-2 text-sm"><input type="radio" name="pay" checked={f.paymentPref === 'emi'} onChange={() => set('paymentPref', 'emi')} />EMI (6 instalments of ₹{selected ? (selected.price / 6).toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '—'})</label>
              <label className="flex items-center gap-2 text-sm"><input type="radio" name="pay" checked={f.paymentPref === 'custom'} onChange={() => set('paymentPref', 'custom')} />Custom Plan — Discuss with Vivek Sir</label>
            </div>
          </Field>

          <div className="mt-4">
            <Field label="Need Corporate/GST Invoice?" required>
              <div className="flex gap-4 mt-1">
                <label className="flex items-center gap-1.5 text-sm"><input type="radio" name="gst" checked={f.gstRequired === 'no'} onChange={() => { set('gstRequired', 'no'); set('gstCompany', ''); set('gstNumber', ''); }} />No</label>
                <label className="flex items-center gap-1.5 text-sm"><input type="radio" name="gst" checked={f.gstRequired === 'yes'} onChange={() => set('gstRequired', 'yes')} />Yes</label>
              </div>
            </Field>
            {f.gstRequired === 'yes' && (
              <div className="grid sm:grid-cols-2 gap-4 mt-3">
                <Field label="Company Name for Invoice" required>
                  <input className={inputCls} maxLength={60} value={f.gstCompany} onChange={e => set('gstCompany', sanitize(e.target.value, 60))} />
                  <CharCount current={f.gstCompany.length} max={60} />
                </Field>
                <Field label="GST Number" required>
                  <input className={inputCls} maxLength={15} value={f.gstNumber} onChange={e => set('gstNumber', sanitize(e.target.value.toUpperCase(), 15))} placeholder="e.g. 27AABCU9603R1ZM" />
                  <CharCount current={f.gstNumber.length} max={15} />
                </Field>
              </div>
            )}
          </div>

          <div className="space-y-3 mt-6 border-t border-border pt-4">
            <label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" checked={f.consent1} onChange={e => set('consent1', e.target.checked)} className="mt-1 rounded" /><span className="text-sm">I declare that all information provided is true and complete. *</span></label>
            <label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" checked={f.consent2} onChange={e => set('consent2', e.target.checked)} className="mt-1 rounded" /><span className="text-sm">I understand this is an APPLICATION and acceptance is at the discretion of Vivek Doba. *</span></label>
            <label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" checked={f.consent3} onChange={e => set('consent3', e.target.checked)} className="mt-1 rounded" /><span className="text-sm">I commit to my transformation journey with sincerity, dedication, and discipline. 🙏 *</span></label>
            <label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" checked={f.consent4} onChange={e => set('consent4', e.target.checked)} className="mt-1 rounded" /><span className="text-sm">I consent to VDTS contacting me via WhatsApp, Email, and Phone. *</span></label>
          </div>
          <button onClick={handleSubmit} disabled={loading} className="w-full mt-6 py-4 rounded-xl text-white font-bold text-base transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #FFD700, #7B1FA2)' }}>
            {loading ? '⏳ Submitting your sacred application...' : '👑 Submit My Application'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplyLGT;
