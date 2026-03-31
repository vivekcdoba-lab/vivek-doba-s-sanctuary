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
const BLOOD_GROUPS = ['A+','A-','B+','B-','O+','O-','AB+','AB-'];
const CORE_VALUES = ['Integrity','Honesty','Family','Compassion','Growth','Discipline','Freedom','Wealth','Power','Service','Courage','Wisdom','Love','Gratitude','Excellence','Faith','Adventure','Creativity','Health','Legacy'];
const EMOTIONS = ['Joy','Gratitude','Peace','Excitement','Love','Confidence','Anxiety','Anger','Frustration','Sadness','Fear','Guilt','Shame','Loneliness','Overwhelm','Boredom','Jealousy','Resentment'];
const SPIRITUAL_TEXTS = ['Bhagavad Gita','Ramayana','Mahabharata','Upanishads','Bible','Quran','Buddhist texts','Guru Granth Sahib','Other','None'];
const SPIRITUAL_PRACTICES = ['Morning Prayer/Puja','Meditation','Yoga','Temple/Church/Mosque visits','Reading scriptures','Chanting/Mantras','Gratitude practice','Seva/Service','Fasting','None'];
const HOURS_WEEKLY = ['1-2 hours','3-5 hours','5-7 hours','7-10 hours','Whatever it takes'];
const WHEEL_DIMS = ['Career & Business','Finance & Wealth','Physical Health','Mental Peace','Family Life','Marriage/Partnership','Friendships & Social','Spiritual Growth','Fun & Recreation','Purpose & Meaning'];
const CHALLENGE_CATS = ['Personal','Business','Health','Relationship','Financial','Spiritual'];

const ApplyLGT = () => {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appId] = useState(`VDTS-APP-${Math.floor(1000 + Math.random() * 9000)}`);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ program: true, A: true });

  // All form fields in one state
  const [f, setF] = useState<Record<string, any>>({
    programId: '', fullName: '', preferredName: '', dob: '', gender: '', maritalStatus: '', children: 0,
    childrenAges: '', bloodGroup: '', aadhaar: '', mobile: '', whatsapp: '', sameWhatsapp: true, email: '',
    altPhone: '', prefComm: ['whatsapp', 'email'], address1: '', address2: '', city: '', state: '', pincode: '',
    country: 'India', hometown: '', emergName: '', emergRelation: '', emergPhone: '',
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

  const handleSubmit = () => {
    if (!f.programId || !f.fullName || !f.mobile || !f.email || !f.city || !f.consent1 || !f.consent2 || !f.consent3 || !f.consent4) {
      toast({ title: 'Please fill all required fields and checkboxes', variant: 'destructive' });
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
  const Field = ({ label, required, children, className = '' }: { label: string; required?: boolean; children: React.ReactNode; className?: string }) => (
    <div className={className}><label className="block text-sm font-medium text-foreground mb-1">{label}{required && <span className="text-destructive ml-1">*</span>}</label>{children}</div>
  );

  const Section = ({ id, title, color, icon, children }: { id: string; title: string; color: string; icon: string; children: React.ReactNode }) => (
    <div className="bg-card rounded-xl shadow-sm overflow-hidden border border-border">
      <button onClick={() => toggle(id)} className="w-full flex items-center justify-between p-5 text-white font-semibold" style={{ background: color }}>
        <span>{icon} {title}</span>
        {openSections[id] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>
      {openSections[id] && <div className="p-6 space-y-4">{children}</div>}
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

  const PersonalitySlider = ({ label, left, right, value, k }: { label: string; left: string; right: string; value: number; k: string }) => (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-20 text-right">{left}</span>
      <input type="range" min={1} max={9} value={value} onChange={e => set(k, Number(e.target.value))} className="flex-1 accent-primary" />
      <span className="text-xs text-muted-foreground w-20">{right}</span>
    </div>
  );

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

        {/* Section A: Personal */}
        <Section id="A" title="Tell Us About Yourself" color="linear-gradient(135deg, #B8860B, #FFD700)" icon="👤">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Full Name (as per Aadhaar/PAN)" required><input className={inputCls} value={f.fullName} onChange={e => set('fullName', e.target.value)} /></Field>
            <Field label="Preferred Name/Nickname"><input className={inputCls} value={f.preferredName} onChange={e => set('preferredName', e.target.value)} placeholder="What should Vivek Sir call you?" /></Field>
            <Field label="Date of Birth" required><input className={inputCls} type="date" value={f.dob} onChange={e => set('dob', e.target.value)} /></Field>
            <Field label="Gender" required>
              <div className="flex gap-3 mt-1">{['Male','Female','Other'].map(g => <label key={g} className="flex items-center gap-1.5 text-sm"><input type="radio" name="gender" checked={f.gender === g} onChange={() => set('gender', g)} />{g}</label>)}</div>
            </Field>
            <Field label="Marital Status" required>
              <select className={inputCls} value={f.maritalStatus} onChange={e => set('maritalStatus', e.target.value)}><option value="">Select...</option>{['Single','Married','Divorced','Widowed','Separated'].map(s => <option key={s}>{s}</option>)}</select>
            </Field>
            <Field label="Blood Group"><select className={inputCls} value={f.bloodGroup} onChange={e => set('bloodGroup', e.target.value)}><option value="">Select...</option>{BLOOD_GROUPS.map(b => <option key={b}>{b}</option>)}</select></Field>
            <Field label="Mobile Number" required><input className={inputCls} type="tel" maxLength={10} value={f.mobile} onChange={e => set('mobile', e.target.value)} /></Field>
            <Field label="Email Address" required><input className={inputCls} type="email" value={f.email} onChange={e => set('email', e.target.value)} /></Field>
            <Field label="City" required><input className={inputCls} value={f.city} onChange={e => set('city', e.target.value)} /></Field>
            <Field label="State" required>
              <select className={inputCls} value={f.state} onChange={e => set('state', e.target.value)}><option value="">Select...</option>{STATES.map(s => <option key={s}>{s}</option>)}</select>
            </Field>
            <Field label="Pincode" required><input className={inputCls} type="number" maxLength={6} value={f.pincode} onChange={e => set('pincode', e.target.value)} /></Field>
            <Field label="Hometown"><input className={inputCls} value={f.hometown} onChange={e => set('hometown', e.target.value)} /></Field>
          </div>
          <p className="text-sm font-semibold text-foreground mt-4 mb-2">Emergency Contact</p>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Name" required><input className={inputCls} value={f.emergName} onChange={e => set('emergName', e.target.value)} /></Field>
            <Field label="Relationship" required><select className={inputCls} value={f.emergRelation} onChange={e => set('emergRelation', e.target.value)}><option value="">Select...</option>{RELATIONSHIPS.map(r => <option key={r}>{r}</option>)}</select></Field>
            <Field label="Phone" required><input className={inputCls} type="tel" maxLength={10} value={f.emergPhone} onChange={e => set('emergPhone', e.target.value)} /></Field>
          </div>
        </Section>

        {/* Section B: Professional */}
        <Section id="B" title="Your Professional World" color="linear-gradient(135deg, #800020, #B91C1C)" icon="💼">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Designation/Title" required><input className={inputCls} value={f.designation} onChange={e => set('designation', e.target.value)} placeholder="CEO, Founder, Director..." /></Field>
            <Field label="Company/Business" required><input className={inputCls} value={f.company} onChange={e => set('company', e.target.value)} /></Field>
            <Field label="Nature of Business" required className="sm:col-span-2"><textarea className={inputCls} rows={2} value={f.businessNature} onChange={e => set('businessNature', e.target.value)} placeholder="Describe what your business does..." /></Field>
            <Field label="Industry" required><select className={inputCls} value={f.industry} onChange={e => set('industry', e.target.value)}><option value="">Select...</option>{INDUSTRIES.map(i => <option key={i}>{i}</option>)}</select></Field>
            <Field label="Years in Current Business" required><input className={inputCls} type="number" value={f.yearsInBiz} onChange={e => set('yearsInBiz', e.target.value)} /></Field>
            <Field label="Annual Business Revenue" required><select className={inputCls} value={f.annualRevenue} onChange={e => set('annualRevenue', e.target.value)}><option value="">Select...</option>{REVENUE_RANGES.map(r => <option key={r}>{r}</option>)}</select></Field>
            <Field label="Monthly self-growth investment"><select className={inputCls} value={f.monthlyInvest} onChange={e => set('monthlyInvest', e.target.value)}><option value="">Select...</option>{INVEST_MONTHLY.map(i => <option key={i}>{i}</option>)}</select></Field>
            <Field label="Team size"><select className={inputCls} value={f.teamSize} onChange={e => set('teamSize', e.target.value)}><option value="">Select...</option>{['Solo','2-5','6-15','16-50','51-200','200-500','500+'].map(t => <option key={t}>{t}</option>)}</select></Field>
            <Field label="Website/LinkedIn"><input className={inputCls} value={f.website} onChange={e => set('website', e.target.value)} /></Field>
          </div>
        </Section>

        {/* Section C: Health */}
        <Section id="C" title="Your Health Matters" color="linear-gradient(135deg, #22C55E, #16A34A)" icon="❤️">
          <SliderField label="Overall physical health" value={f.healthRating} onChange={v => set('healthRating', v)} labels={['Very Poor','Excellent']} />
          <Field label="Chronic health conditions?" required>
            <div className="flex gap-4">{['None','Yes'].map(o => <label key={o} className="flex items-center gap-1.5 text-sm"><input type="radio" name="chronic" checked={f.chronicConditions === o.toLowerCase()} onChange={() => set('chronicConditions', o.toLowerCase())} />{o}</label>)}</div>
          </Field>
          {f.chronicConditions === 'yes' && <Field label="Details"><textarea className={inputCls} rows={2} value={f.chronicDetails} onChange={e => set('chronicDetails', e.target.value)} /></Field>}
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Exercise regularly?"><select className={inputCls} value={f.exerciseFreq} onChange={e => set('exerciseFreq', e.target.value)}><option value="">Select...</option>{['Daily','3-5 times/week','1-2 times/week','Rarely','Never'].map(e => <option key={e}>{e}</option>)}</select></Field>
            <Field label="Average sleep hours"><select className={inputCls} value={f.sleepHours} onChange={e => set('sleepHours', e.target.value)}><option value="">Select...</option>{['Less than 5','5-6','6-7','7-8','8+'].map(s => <option key={s}>{s}</option>)}</select></Field>
            <Field label="Diet"><select className={inputCls} value={f.diet} onChange={e => set('diet', e.target.value)}><option value="">Select...</option>{['Vegetarian','Non-Vegetarian','Vegan','Jain','Eggetarian'].map(d => <option key={d}>{d}</option>)}</select></Field>
            <Field label="Water intake (glasses/day)"><select className={inputCls} value={f.waterIntake} onChange={e => set('waterIntake', e.target.value)}><option value="">Select...</option>{['Less than 4','4-6','6-8','8+'].map(w => <option key={w}>{w}</option>)}</select></Field>
          </div>
          <SliderField label="Body energy level" value={f.energyLevel} onChange={v => set('energyLevel', v)} />
          <Field label="Health goal for next 6 months"><textarea className={inputCls} rows={2} value={f.healthGoal} onChange={e => set('healthGoal', e.target.value)} placeholder="e.g., Lose 10 kg, manage BP..." /></Field>
        </Section>

        {/* Section D: Relationships */}
        <Section id="D" title="Your Relationships" color="linear-gradient(135deg, #E91E63, #F06292)" icon="💕">
          <SliderField label="Relationship with spouse/partner" value={f.spouseRelRating} onChange={v => set('spouseRelRating', v)} />
          <SliderField label="Relationship with parents" value={f.parentRelRating} onChange={v => set('parentRelRating', v)} />
          <SliderField label="Relationship with children" value={f.childRelRating} onChange={v => set('childRelRating', v)} />
          <SliderField label="Social life satisfaction" value={f.socialSatisfaction} onChange={v => set('socialSatisfaction', v)} />
          <Field label="Close friends you can confide in?"><select className={inputCls} value={f.closeFriends} onChange={e => set('closeFriends', e.target.value)}><option value="">Select...</option>{['Yes, many','A few','Not really','No'].map(o => <option key={o}>{o}</option>)}</select></Field>
          <Field label="Relationship goal for next 6 months"><textarea className={inputCls} rows={2} value={f.relGoal} onChange={e => set('relGoal', e.target.value)} placeholder="e.g., Improve marriage communication..." /></Field>
        </Section>

        {/* Section E: Mental & Emotional */}
        <Section id="E" title="Your Inner World" color="linear-gradient(135deg, #3F51B5, #5C6BC0)" icon="🧠">
          <div className="grid sm:grid-cols-2 gap-4">
            <SliderField label="Mental clarity & focus" value={f.mentalClarity} onChange={v => set('mentalClarity', v)} />
            <SliderField label="Stress level" value={f.stressLevel} onChange={v => set('stressLevel', v)} labels={['Very Stressed','Completely Calm']} />
            <SliderField label="Self-confidence" value={f.selfConfidence} onChange={v => set('selfConfidence', v)} />
            <SliderField label="Decision-making ability" value={f.decisionMaking} onChange={v => set('decisionMaking', v)} />
          </div>
          <Field label="Emotions you experience MOST often (select up to 5)">
            <div className="flex flex-wrap gap-2 mt-1">{EMOTIONS.map(e => <button key={e} onClick={() => toggleArr('frequentEmotions', e)} className={`px-3 py-1 rounded-full text-xs border transition-colors ${f.frequentEmotions.includes(e) ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}>{e}</button>)}</div>
          </Field>
          <Field label="Your biggest fear"><textarea className={inputCls} rows={2} value={f.biggestFear} onChange={e => set('biggestFear', e.target.value)} placeholder="What scares you the most?" /></Field>
          <Field label="Meditation/mindfulness practice?"><select className={inputCls} value={f.meditationPractice} onChange={e => set('meditationPractice', e.target.value)}><option value="">Select...</option>{['Daily','Sometimes','Tried but stopped','Never'].map(o => <option key={o}>{o}</option>)}</select></Field>
        </Section>

        {/* Section F: Spiritual */}
        <Section id="F" title="Your Spiritual Self" color="linear-gradient(135deg, #FF9933, #F57C00)" icon="🕉️">
          <Field label="Do you consider yourself spiritual?" required><select className={inputCls} value={f.spiritual} onChange={e => set('spiritual', e.target.value)}><option value="">Select...</option>{['Deeply spiritual','Somewhat','Not particularly','Atheist','Exploring'].map(o => <option key={o}>{o}</option>)}</select></Field>
          <Field label="Spiritual practices you follow">
            <div className="flex flex-wrap gap-2 mt-1">{SPIRITUAL_PRACTICES.map(p => <button key={p} onClick={() => toggleArr('spiritualPractices', p)} className={`px-3 py-1 rounded-full text-xs border transition-colors ${f.spiritualPractices.includes(p) ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'}`}>{p}</button>)}</div>
          </Field>
          <Field label="Spiritual texts you've read">
            <div className="flex flex-wrap gap-2 mt-1">{SPIRITUAL_TEXTS.map(t => <button key={t} onClick={() => toggleArr('textsRead', t)} className={`px-3 py-1 rounded-full text-xs border transition-colors ${f.textsRead.includes(t) ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'}`}>{t}</button>)}</div>
          </Field>
          <Field label="Your life purpose"><textarea className={inputCls} rows={2} value={f.lifePurpose} onChange={e => set('lifePurpose', e.target.value)} placeholder="Why do you think you exist? What is your dharma?" /></Field>
          <Field label="Core values (select up to 7)" required>
            <div className="flex flex-wrap gap-2 mt-1">{CORE_VALUES.map(v => <button key={v} onClick={() => f.coreValues.length < 7 || f.coreValues.includes(v) ? toggleArr('coreValues', v) : null} className={`px-3 py-1 rounded-full text-xs border transition-colors ${f.coreValues.includes(v) ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'}`}>{v}</button>)}</div>
          </Field>
        </Section>

        {/* Section G: Personality */}
        <Section id="G" title="The Real You" color="linear-gradient(135deg, #7B1FA2, #9C27B0)" icon="🎭">
          <Field label="Hobbies / things you enjoy" required><textarea className={inputCls} rows={2} value={f.hobbies} onChange={e => set('hobbies', e.target.value)} placeholder="Reading, cricket, cooking, travel..." /></Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Favorite books (top 3)"><textarea className={inputCls} rows={2} value={f.favBooks} onChange={e => set('favBooks', e.target.value)} /></Field>
            <Field label="What makes you genuinely happy?"><textarea className={inputCls} rows={2} value={f.happiness} onChange={e => set('happiness', e.target.value)} /></Field>
            <Field label="What drains your energy?"><textarea className={inputCls} rows={2} value={f.energyDrains} onChange={e => set('energyDrains', e.target.value)} /></Field>
            <Field label="Things that annoy you"><textarea className={inputCls} rows={2} value={f.annoyances} onChange={e => set('annoyances', e.target.value)} placeholder="What triggers you?" /></Field>
          </div>
          <p className="text-sm font-semibold text-foreground mt-4 mb-3">Personality Spectrum</p>
          <div className="space-y-3">
            <PersonalitySlider label="" left="Introvert" right="Extrovert" value={f.introExtro} k="introExtro" />
            <PersonalitySlider label="" left="Logical" right="Emotional" value={f.logicEmotion} k="logicEmotion" />
            <PersonalitySlider label="" left="Planner" right="Spontaneous" value={f.planSpontan} k="planSpontan" />
            <PersonalitySlider label="" left="Patient" right="Impatient" value={f.patientImpatient} k="patientImpatient" />
            <PersonalitySlider label="" left="Optimist" right="Pessimist" value={f.optimistPessimist} k="optimistPessimist" />
            <PersonalitySlider label="" left="Risk-taker" right="Risk-averse" value={f.riskTaker} k="riskTaker" />
            <PersonalitySlider label="" left="Morning" right="Night owl" value={f.morningNight} k="morningNight" />
          </div>
          <Field label="Communication style"><select className={inputCls} value={f.commStyle} onChange={e => set('commStyle', e.target.value)}><option value="">Select...</option>{['Direct & Blunt','Gentle & Diplomatic','Data-Driven & Logical','Story-Based & Emotional','Philosophical & Deep'].map(o => <option key={o}>{o}</option>)}</select></Field>
        </Section>

        {/* Section H: Challenges */}
        <Section id="H" title="What's Holding You Back" color="linear-gradient(135deg, #EF4444, #DC2626)" icon="⚡">
          <p className="text-sm text-muted-foreground mb-3">Rate these areas of your life RIGHT NOW (1-10)</p>
          <div className="space-y-3">
            {WHEEL_DIMS.map((dim, i) => (
              <SliderField key={dim} label={dim} value={f.wheelScores[i]} onChange={v => { const ns = [...f.wheelScores]; ns[i] = v; set('wheelScores', ns); }} />
            ))}
          </div>
          <p className="text-sm font-semibold text-foreground mt-6 mb-3">Top 3 Challenges</p>
          {[1, 2, 3].map(n => (
            <div key={n} className="grid sm:grid-cols-[1fr_auto] gap-2 mb-3">
              <Field label={`Challenge ${n}${n <= 2 ? ' *' : ''}`}><textarea className={inputCls} rows={2} value={f[`challenge${n}`]} onChange={e => set(`challenge${n}`, e.target.value)} /></Field>
              <Field label="Category"><select className={inputCls} value={f[`cat${n}`]} onChange={e => set(`cat${n}`, e.target.value)}><option value="">—</option>{CHALLENGE_CATS.map(c => <option key={c}>{c}</option>)}</select></Field>
            </div>
          ))}
          <Field label="Issues you've been struggling with for a long time" required><textarea className={inputCls} rows={3} value={f.longTermIssues} onChange={e => set('longTermIssues', e.target.value)} placeholder="Patterns you can't break..." /></Field>
          <Field label="Biggest obstacle between you and your ideal life" required><textarea className={inputCls} rows={2} value={f.biggestObstacle} onChange={e => set('biggestObstacle', e.target.value)} /></Field>
          <Field label="Limiting beliefs you're aware of"><textarea className={inputCls} rows={2} value={f.limitingBeliefs} onChange={e => set('limitingBeliefs', e.target.value)} placeholder="e.g., 'I'm not good enough'..." /></Field>
        </Section>

        {/* Section I: Expectations */}
        <Section id="I" title="Your Vision for the Next 6 Months" color="linear-gradient(135deg, #B8860B, #DAA520)" icon="🎯">
          <Field label="What do you expect from this program?" required><textarea className={inputCls} rows={3} value={f.expectations} onChange={e => set('expectations', e.target.value)} placeholder="Be specific. What should be DIFFERENT?" /></Field>
          <p className="text-sm font-semibold text-foreground mt-2 mb-3">Specific Goals (fill at least 3)</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="🏆 Business/Career Goal"><textarea className={inputCls} rows={2} value={f.goalBiz} onChange={e => set('goalBiz', e.target.value)} /></Field>
            <Field label="💰 Financial Goal"><textarea className={inputCls} rows={2} value={f.goalFinance} onChange={e => set('goalFinance', e.target.value)} /></Field>
            <Field label="❤️ Health Goal"><textarea className={inputCls} rows={2} value={f.goalHealth} onChange={e => set('goalHealth', e.target.value)} /></Field>
            <Field label="💕 Relationship Goal"><textarea className={inputCls} rows={2} value={f.goalRelation} onChange={e => set('goalRelation', e.target.value)} /></Field>
            <Field label="🧠 Personal Growth Goal"><textarea className={inputCls} rows={2} value={f.goalPersonal} onChange={e => set('goalPersonal', e.target.value)} /></Field>
            <Field label="🕉️ Spiritual Goal"><textarea className={inputCls} rows={2} value={f.goalSpiritual} onChange={e => set('goalSpiritual', e.target.value)} /></Field>
          </div>
          <Field label="What would make this program a SUCCESS?" required><textarea className={inputCls} rows={2} value={f.successDef} onChange={e => set('successDef', e.target.value)} /></Field>
          <Field label="What would make this program a FAILURE?" required><textarea className={inputCls} rows={2} value={f.failureDef} onChange={e => set('failureDef', e.target.value)} /></Field>
          <Field label="Hours per week you can dedicate" required><select className={inputCls} value={f.hoursPerWeek} onChange={e => set('hoursPerWeek', e.target.value)}><option value="">Select...</option>{HOURS_WEEKLY.map(h => <option key={h}>{h}</option>)}</select></Field>
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
          <Field label="Anything else Vivek Sir should know?"><textarea className={inputCls} rows={3} value={f.anythingElse} onChange={e => set('anythingElse', e.target.value)} placeholder="Anything that didn't fit above..." /></Field>
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
