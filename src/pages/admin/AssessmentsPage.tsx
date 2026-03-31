import { useState } from 'react';
import { SEEKERS, COURSES } from '@/data/mockData';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { ChevronDown, ChevronUp, Plus, Trash2, Edit, Save, X } from 'lucide-react';

const TABS = ['SWOT', 'Wheel of Life ⭐', "Life's Golden Triangle", 'Purusharthas', 'Real Happiness', 'MOOCH'];
const PERIODS = ['Initial', 'Month 1', 'Month 2', 'Month 3', 'Month 6', 'Month 9', 'Month 12', 'Final'];

// ===== SWOT Data =====
const SWOT_INIT = {
  strengths: [
    { text: 'Strong willpower and determination', category: 'Personal', addedBy: 'Coach' },
    { text: 'Excellent public speaker', category: 'Professional', addedBy: 'Coach' },
    { text: 'Deep connection to spiritual practice', category: 'Spiritual', addedBy: 'Coach' },
    { text: 'Natural leader in group settings', category: 'Leadership', addedBy: 'Coach' },
    { text: 'Quick learner and implementer', category: 'Professional', addedBy: 'Seeker' },
  ],
  weaknesses: [
    { text: 'Difficulty delegating tasks', category: 'Professional', addedBy: 'Coach', status: 'Working On', plan: 'Practice delegating 1 task per week' },
    { text: 'Impatience with slow results', category: 'Personal', addedBy: 'Coach', status: 'Identified', plan: '' },
    { text: 'Avoids financial planning', category: 'Professional', addedBy: 'Coach', status: 'Working On', plan: '' },
  ],
  opportunities: [
    { text: 'Growing demand for spiritual coaching in corporate sector', category: 'Professional', addedBy: 'Coach', action: 'Create corporate workshop proposal', deadline: '30/04/2026' },
    { text: 'Strong referral network from LGT alumni', category: 'Professional', addedBy: 'Coach', action: 'Leverage 3 referrals this quarter', deadline: '30/06/2026' },
    { text: 'Rising interest in Vedantic leadership', category: 'Spiritual', addedBy: 'Coach', action: 'Develop content series', deadline: '31/05/2026' },
  ],
  threats: [
    { text: 'Market saturation of generic coaching', category: 'Professional', severity: 'High', mitigation: 'Differentiate through spiritual depth and proven framework' },
    { text: 'Health risk from overwork', category: 'Personal', severity: 'Medium', mitigation: 'Enforce daily exercise and meditation routine' },
    { text: 'Family time getting reduced', category: 'Personal', severity: 'Medium', mitigation: 'Block family time on calendar as sacred' },
  ],
};

// ===== Wheel Data =====
const WHEEL_INIT = [
  { dimension: 'Career & Work', coach: 7, seeker: 5, ideal: 9, abbr: '💼 Career' },
  { dimension: 'Finance & Wealth', coach: 4, seeker: 3, ideal: 8, abbr: '💰 Finance' },
  { dimension: 'Health & Vitality', coach: 8, seeker: 7, ideal: 9, abbr: '❤️ Health' },
  { dimension: 'Family & Home', coach: 6, seeker: 8, ideal: 8, abbr: '🏠 Family' },
  { dimension: 'Relationships', coach: 5, seeker: 4, ideal: 8, abbr: '💕 Relations' },
  { dimension: 'Personal Growth', coach: 7, seeker: 6, ideal: 9, abbr: '📚 Growth' },
  { dimension: 'Fun & Recreation', coach: 3, seeker: 5, ideal: 7, abbr: '🎯 Fun' },
  { dimension: 'Environment', coach: 7, seeker: 6, ideal: 8, abbr: '🌿 Environ' },
  { dimension: 'Spirituality', coach: 9, seeker: 8, ideal: 10, abbr: '🕉️ Spiritual' },
  { dimension: 'Service', coach: 6, seeker: 5, ideal: 8, abbr: '🙏 Service' },
];

const catColor = (c: string) => c === 'Personal' ? 'bg-sky-blue/10 text-sky-blue' : c === 'Professional' ? 'bg-wisdom-purple/10 text-wisdom-purple' : c === 'Spiritual' ? 'bg-primary/10 text-primary' : 'bg-maroon/10 text-maroon';

const AssessmentsPage = () => {
  const [tab, setTab] = useState(0);
  const [seekerId, setSeekerId] = useState('s1');
  const [period, setPeriod] = useState('Month 3');
  const [wheelData, setWheelData] = useState(WHEEL_INIT);
  const [lgtScores, setLgtScores] = useState({ personal: 7, professional: 6, spiritual: 8 });
  const [lgtExpanded, setLgtExpanded] = useState<number | null>(null);
  const [purushScores, setPurushScores] = useState({ dharma: 8, artha: 5, kama: 4, moksha: 7 });
  const [happinessScores, setHappinessScores] = useState([8, 7, 6, 9, 8, 7, 6, 8, 7, 7]);
  const [moochExpanded, setMoochExpanded] = useState<number | null>(null);

  const seeker = SEEKERS.find(s => s.id === seekerId);
  const wheelOverall = (wheelData.reduce((a, d) => a + d.coach, 0) / 10).toFixed(1);
  const selfOverall = (wheelData.reduce((a, d) => a + d.seeker, 0) / 10).toFixed(1);

  const lgtBalance = (() => {
    const arr = [lgtScores.personal, lgtScores.professional, lgtScores.spiritual];
    const mean = arr.reduce((a, b) => a + b, 0) / 3;
    const sd = Math.sqrt(arr.reduce((a, b) => a + (b - mean) ** 2, 0) / 3);
    return Math.max(0, Math.round(100 - sd * 15));
  })();

  const happinessOverall = (happinessScores.reduce((a, b) => a + b, 0) / happinessScores.length).toFixed(1);
  const happDims = ['Inner Joy', 'Purpose', 'Flow State', 'Gratitude', 'Peace', 'Authentic', 'Connection', 'Service', 'Presence', 'Resilience'];

  const LGT_SUBS = [
    { title: '⭐ Personal Mastery', key: 'personal' as const, color: 'from-primary to-primary/80', subs: ['Self-Awareness', 'Emotional Intelligence', 'Mindset & Beliefs', 'Habits & Discipline', 'Vision & Goals', 'Confidence', 'Resilience', 'Health & Energy'] },
    { title: '💼 Professional Excellence', key: 'professional' as const, color: 'from-maroon to-maroon/80', subs: ['Leadership', 'Communication', 'Strategic Thinking', 'Team Building', 'Business Acumen', 'Innovation', 'Networking', 'Execution'] },
    { title: '🕉️ Spiritual Wellbeing', key: 'spiritual' as const, color: 'from-saffron to-saffron/80', subs: ['Inner Peace', 'Life Purpose', 'Gratitude Practice', 'Compassion', 'Work-Life Balance', 'Dharma Alignment', 'Meditation', 'Service'] },
  ];

  const MOOCH_PATTERNS = [
    { name: 'Need to control everything', impact: 'High', status: 'Working On', desc: 'Compulsive need to oversee every detail of business operations', triggers: ['Delegation', 'New hires', 'Team decisions'], areas: ['Professional', 'Relationship'], root: 'Fear of failure if others do it differently', awareness: 6, strategies: ['Start with small delegations', 'Trust-building exercises'] },
    { name: 'Avoiding difficult conversations', impact: 'Medium', status: 'Aware', desc: 'Tendency to postpone or avoid confrontational discussions', triggers: ['Conflict', 'Negative feedback', 'Financial disputes'], areas: ['Professional', 'Personal'], root: 'Fear of rejection and conflict', awareness: 5, strategies: ['Practice with low-stakes conversations'] },
    { name: 'Self-worth tied to achievements', impact: 'High', status: 'Identified', desc: 'Identity heavily dependent on external validation and success metrics', triggers: ['Failure', 'Comparison', 'Slow periods'], areas: ['Personal', 'Spiritual'], root: 'Childhood conditioning around performance-based love', awareness: 4, strategies: [] },
  ];

  const BELIEFS = [
    { belief: 'I am not worthy unless I achieve great things', origin: 'Childhood comparison with sibling', impact: 8, replacement: 'I am inherently worthy regardless of achievements', affirmation: 'I am worthy of all the success and love that comes to me', evidence: ['Successfully led team through crisis', 'Family loves me for who I am'], status: 'Challenging' },
    { belief: 'Asking for help is weakness', origin: 'Cultural conditioning around self-reliance', impact: 6, replacement: 'Asking for help is wisdom and strength', affirmation: 'I grow stronger when I allow others to support me', evidence: ['Coach helped me see blind spots', 'Team collaboration doubled revenue'], status: 'Replacing' },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="gradient-sacred rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Transformation Assessment Center</h1>
        <p className="text-white/80 text-sm mt-1">Measure growth across all dimensions of being</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <select value={seekerId} onChange={e => setSeekerId(e.target.value)} className="bg-card border border-input rounded-xl px-3 py-2 text-sm text-foreground">
          {SEEKERS.map(s => <option key={s.id} value={s.id}>{s.full_name} — {s.course?.name?.slice(0, 20)}</option>)}
        </select>
        <select value={period} onChange={e => setPeriod(e.target.value)} className="bg-card border border-input rounded-xl px-3 py-2 text-sm text-foreground">
          {PERIODS.map(p => <option key={p}>{p}</option>)}
        </select>
        <button className="px-4 py-2 rounded-xl gradient-chakravartin text-primary-foreground text-sm font-medium">📥 New Assessment</button>
        <button className="px-4 py-2 rounded-xl border border-border text-foreground text-sm font-medium hover:bg-muted">📊 Compare Previous</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border overflow-x-auto pb-px">
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)} className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${tab === i ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>{t}</button>
        ))}
      </div>

      {/* ===== TAB 0: SWOT ===== */}
      {tab === 0 && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="bg-dharma-green px-4 py-2"><h3 className="text-white font-semibold text-sm">💪 Strengths</h3></div>
              <div className="p-4 space-y-2">
                {SWOT_INIT.strengths.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/30 group">
                    <span className="text-sm text-foreground flex-1">{s.text}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${catColor(s.category)}`}>{s.category}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${s.addedBy === 'Coach' ? 'bg-primary/10 text-primary' : 'bg-sky-blue/10 text-sky-blue'}`}>{s.addedBy}</span>
                  </div>
                ))}
                <button className="text-xs text-primary flex items-center gap-1 mt-2"><Plus className="w-3 h-3" /> Add Strength</button>
              </div>
            </div>
            {/* Weaknesses */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="bg-destructive px-4 py-2"><h3 className="text-white font-semibold text-sm">⚠️ Weaknesses</h3></div>
              <div className="p-4 space-y-2">
                {SWOT_INIT.weaknesses.map((w, i) => (
                  <div key={i} className="p-2 rounded-lg hover:bg-muted/30">
                    <div className="flex items-start gap-2">
                      <span className="text-sm text-foreground flex-1">{w.text}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${w.status === 'Identified' ? 'bg-destructive/10 text-destructive' : w.status === 'Working On' ? 'bg-warning-amber/10 text-warning-amber' : 'bg-dharma-green/10 text-dharma-green'}`}>{w.status}</span>
                    </div>
                    {w.plan && <p className="text-xs text-muted-foreground mt-1 italic">Plan: {w.plan}</p>}
                  </div>
                ))}
                <button className="text-xs text-primary flex items-center gap-1 mt-2"><Plus className="w-3 h-3" /> Add Weakness</button>
              </div>
            </div>
            {/* Opportunities */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="bg-sky-blue px-4 py-2"><h3 className="text-white font-semibold text-sm">🚀 Opportunities</h3></div>
              <div className="p-4 space-y-2">
                {SWOT_INIT.opportunities.map((o, i) => (
                  <div key={i} className="p-2 rounded-lg hover:bg-muted/30">
                    <p className="text-sm text-foreground">{o.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">Action: {o.action} · By: {o.deadline}</p>
                  </div>
                ))}
                <button className="text-xs text-primary flex items-center gap-1 mt-2"><Plus className="w-3 h-3" /> Add Opportunity</button>
              </div>
            </div>
            {/* Threats */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="bg-warning-amber px-4 py-2"><h3 className="text-white font-semibold text-sm">🔥 Threats</h3></div>
              <div className="p-4 space-y-2">
                {SWOT_INIT.threats.map((t, i) => (
                  <div key={i} className="p-2 rounded-lg hover:bg-muted/30">
                    <div className="flex items-start gap-2">
                      <span className="text-sm text-foreground flex-1">{t.text}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${t.severity === 'High' ? 'bg-destructive/10 text-destructive' : 'bg-warning-amber/10 text-warning-amber'}`}>{t.severity === 'High' ? '🔴' : '🟡'} {t.severity}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Mitigation: {t.mitigation}</p>
                  </div>
                ))}
                <button className="text-xs text-primary flex items-center gap-1 mt-2"><Plus className="w-3 h-3" /> Add Threat</button>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-5 border border-border space-y-3">
            <div><label className="text-sm font-medium text-foreground">Overall SWOT Analysis</label><textarea className="w-full bg-background border border-input rounded-xl p-3 text-sm mt-1 min-h-[60px]" defaultValue="Rahul shows strong personal qualities and spiritual depth. Professional growth is accelerating but delegation remains the key bottleneck." /></div>
            <button className="px-6 py-2.5 rounded-xl gradient-chakravartin text-primary-foreground text-sm font-medium">💾 Save Assessment</button>
          </div>
        </div>
      )}

      {/* ===== TAB 1: WHEEL OF LIFE ===== */}
      {tab === 1 && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Chart */}
            <div className="lg:col-span-3 bg-card rounded-xl p-5 border border-border">
              <h3 className="font-semibold text-foreground mb-3">Wheel of Life — {seeker?.full_name}</h3>
              <ResponsiveContainer width="100%" height={380}>
                <RadarChart data={wheelData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="abbr" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fontSize: 9 }} />
                  <Radar name="Coach Assessment" dataKey="coach" stroke="#B8860B" fill="#B8860B" fillOpacity={0.3} strokeWidth={2} />
                  <Radar name="Self Assessment" dataKey="seeker" stroke="#3F51B5" fill="#3F51B5" fillOpacity={0.15} strokeWidth={2} strokeDasharray="5 5" />
                  <Radar name="Ideal" dataKey="ideal" stroke="#22C55E" fill="none" strokeWidth={1} strokeDasharray="3 3" />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            {/* Scoring */}
            <div className="lg:col-span-2 bg-card rounded-xl p-5 border border-border space-y-3 max-h-[480px] overflow-y-auto">
              <h3 className="font-semibold text-foreground text-sm">Score Each Dimension</h3>
              {wheelData.map((d, i) => {
                const gap = Math.abs(d.coach - d.seeker);
                return (
                  <div key={d.dimension} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground">{d.abbr}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${gap >= 3 ? 'bg-destructive/10 text-destructive' : gap >= 2 ? 'bg-warning-amber/10 text-warning-amber' : 'bg-dharma-green/10 text-dharma-green'}`}>Gap: {gap}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground w-10">Coach</span>
                      <input type="range" min={1} max={10} value={d.coach} onChange={e => {
                        const next = [...wheelData];
                        next[i] = { ...next[i], coach: +e.target.value };
                        setWheelData(next);
                      }} className="flex-1 accent-primary h-1.5" />
                      <span className="text-sm font-bold text-foreground w-5 text-right">{d.coach}</span>
                    </div>
                    <div className="flex items-center gap-2 opacity-60">
                      <span className="text-[10px] text-muted-foreground w-10">Self</span>
                      <div className="flex-1 bg-muted rounded-full h-1.5"><div className="bg-chakra-indigo rounded-full h-1.5" style={{ width: `${d.seeker * 10}%` }} /></div>
                      <span className="text-xs text-muted-foreground w-5 text-right">{d.seeker}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gap Analysis */}
          {wheelData.some(d => Math.abs(d.coach - d.seeker) >= 3) && (
            <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4">
              <p className="text-sm text-destructive font-medium">⚠️ Large perception gap detected in: {wheelData.filter(d => Math.abs(d.coach - d.seeker) >= 3).map(d => d.dimension).join(', ')}. Discuss in next session.</p>
            </div>
          )}

          <div className="bg-card rounded-xl border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/30">
                <th className="text-left p-3 font-medium text-muted-foreground">Dimension</th>
                <th className="text-center p-3 font-medium text-muted-foreground">Coach</th>
                <th className="text-center p-3 font-medium text-muted-foreground">Self</th>
                <th className="text-center p-3 font-medium text-muted-foreground">Gap</th>
                <th className="text-center p-3 font-medium text-muted-foreground">Priority</th>
              </tr></thead>
              <tbody>
                {[...wheelData].sort((a, b) => Math.abs(b.coach - b.seeker) - Math.abs(a.coach - a.seeker)).map(d => {
                  const gap = Math.abs(d.coach - d.seeker);
                  return (
                    <tr key={d.dimension} className="border-b border-border">
                      <td className="p-3 text-foreground">{d.abbr} {d.dimension.split(' ')[0]}</td>
                      <td className="p-3 text-center font-medium">{d.coach}</td>
                      <td className="p-3 text-center">{d.seeker}</td>
                      <td className="p-3 text-center"><span className={gap >= 3 ? 'text-destructive font-medium' : gap >= 2 ? 'text-warning-amber' : 'text-dharma-green'}>{gap >= 2 && '⚠️'}{gap}</span></td>
                      <td className="p-3 text-center"><span className={`text-xs px-2 py-0.5 rounded-full ${d.coach <= 4 ? 'bg-destructive/10 text-destructive' : d.coach <= 6 ? 'bg-warning-amber/10 text-warning-amber' : 'bg-dharma-green/10 text-dharma-green'}`}>{d.coach <= 4 ? '🔴 High' : d.coach <= 6 ? 'Medium' : 'Low'}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-card rounded-xl p-5 border border-border text-center">
              <p className="text-xs text-muted-foreground">Coach Overall</p>
              <p className={`text-3xl font-bold ${+wheelOverall >= 7 ? 'text-dharma-green' : +wheelOverall >= 4 ? 'text-saffron' : 'text-destructive'}`}>{wheelOverall}</p>
              <p className="text-xs text-muted-foreground">/ 10</p>
            </div>
            <div className="bg-card rounded-xl p-5 border border-border text-center">
              <p className="text-xs text-muted-foreground">Self Overall</p>
              <p className="text-3xl font-bold text-chakra-indigo">{selfOverall}</p>
              <p className="text-xs text-muted-foreground">/ 10</p>
            </div>
            <div className="bg-card rounded-xl p-5 border border-border">
              <p className="text-xs text-dharma-green font-medium mb-1">Top Strengths</p>
              <p className="text-sm text-foreground">{[...wheelData].sort((a, b) => b.coach - a.coach).slice(0, 3).map(d => `${d.dimension.split(' ')[0]} (${d.coach})`).join(', ')}</p>
              <p className="text-xs text-destructive font-medium mt-2 mb-1">Focus Areas</p>
              <p className="text-sm text-foreground">{[...wheelData].sort((a, b) => a.coach - b.coach).slice(0, 3).map(d => `${d.dimension.split(' ')[0]} (${d.coach})`).join(', ')}</p>
            </div>
          </div>

          <div className="bg-card rounded-xl p-5 border border-border space-y-3">
            <label className="text-sm font-medium text-foreground">Coach Observations & Recommendations</label>
            <textarea className="w-full bg-background border border-input rounded-xl p-3 text-sm min-h-[80px]" defaultValue="Rahul shows exceptional spiritual depth but needs focused work on Fun & Recreation and Financial planning. The gap between coach and self-assessment in Family suggests differing perspectives worth exploring." />
            <div className="flex gap-2">
              <button className="px-6 py-2.5 rounded-xl gradient-chakravartin text-primary-foreground text-sm font-medium">💾 Save Assessment</button>
              <button className="px-4 py-2 rounded-xl border border-border text-foreground text-sm hover:bg-muted">📤 Share with Seeker</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== TAB 2: LGT ===== */}
      {tab === 2 && (
        <div className="space-y-6">
          {/* Triangle Visualization */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex flex-col items-center">
              <svg viewBox="0 0 400 360" className="w-full max-w-md">
                <defs><linearGradient id="triFill" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#B8860B" stopOpacity="0.1" /><stop offset="100%" stopColor="#FF9933" stopOpacity="0.08" /></linearGradient></defs>
                <polygon points="200,30 50,320 350,320" fill="url(#triFill)" stroke="#B8860B" strokeWidth="2" />
                {/* Personal - top */}
                <circle cx="200" cy="30" r="28" fill="#B8860B" /><text x="200" y="35" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">{lgtScores.personal}</text>
                <text x="200" y="8" textAnchor="middle" fill="currentColor" fontSize="11" className="fill-foreground">⭐ Personal Mastery</text>
                {/* Professional - bottom left */}
                <circle cx="50" cy="320" r="28" fill="#800020" /><text x="50" y="325" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">{lgtScores.professional}</text>
                <text x="50" y="355" textAnchor="middle" fill="currentColor" fontSize="11" className="fill-foreground">💼 Professional</text>
                {/* Spiritual - bottom right */}
                <circle cx="350" cy="320" r="28" fill="#FF9933" /><text x="350" y="325" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">{lgtScores.spiritual}</text>
                <text x="350" y="355" textAnchor="middle" fill="currentColor" fontSize="11" className="fill-foreground">🕉️ Spiritual</text>
                {/* Center balance */}
                <circle cx="200" cy="220" r="35" fill="none" stroke="#B8860B" strokeWidth="2" strokeDasharray="4 2" />
                <text x="200" y="215" textAnchor="middle" fill="currentColor" fontSize="11" fontWeight="600" className="fill-foreground">Balance</text>
                <text x="200" y="232" textAnchor="middle" fill="#B8860B" fontSize="16" fontWeight="bold">{lgtBalance}%</text>
              </svg>
            </div>
          </div>

          {/* 3 Corners */}
          {LGT_SUBS.map((corner, ci) => (
            <div key={corner.key} className="bg-card rounded-xl border border-border overflow-hidden">
              <button onClick={() => setLgtExpanded(lgtExpanded === ci ? null : ci)} className={`w-full flex items-center justify-between p-4 bg-gradient-to-r ${corner.color} text-white`}>
                <h3 className="font-semibold">{corner.title}</h3>
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold">{lgtScores[corner.key]}/10</span>
                  {lgtExpanded === ci ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>
              {lgtExpanded === ci && (
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">Overall Score:</span>
                    <input type="range" min={1} max={10} value={lgtScores[corner.key]} onChange={e => setLgtScores(p => ({ ...p, [corner.key]: +e.target.value }))} className="flex-1 accent-primary" />
                    <span className="text-lg font-bold text-foreground">{lgtScores[corner.key]}</span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-2">
                    {corner.subs.map(sub => (
                      <div key={sub} className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-28 truncate">{sub}</span>
                        <input type="range" min={1} max={10} defaultValue={5 + Math.floor(Math.random() * 4)} className="flex-1 accent-primary h-1" />
                      </div>
                    ))}
                  </div>
                  <textarea className="w-full bg-background border border-input rounded-xl p-3 text-sm min-h-[60px]" placeholder="Coach's observation..." />
                </div>
              )}
            </div>
          ))}

          <div className="flex gap-2">
            <button className="px-6 py-2.5 rounded-xl gradient-chakravartin text-primary-foreground text-sm font-medium">💾 Save Assessment</button>
            <button className="px-4 py-2 rounded-xl border border-border text-foreground text-sm hover:bg-muted">📊 Compare Previous</button>
          </div>
        </div>
      )}

      {/* ===== TAB 3: PURUSHARTHAS ===== */}
      {tab === 3 && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            {([
              { key: 'dharma' as const, title: 'धर्म — Dharma', subtitle: 'Duty, Purpose & Righteousness', border: 'border-l-saffron', subs: ['Life Purpose Clarity', 'Values Alignment', 'Ethical Decisions', 'Social Responsibility', 'Duty Fulfillment'] },
              { key: 'artha' as const, title: 'अर्थ — Artha', subtitle: 'Wealth, Prosperity & Resources', border: 'border-l-primary', subs: ['Financial Security', 'Wealth Mindset', 'Business Growth', 'Resourcefulness', 'Investment Awareness'] },
              { key: 'kama' as const, title: 'काम — Kama', subtitle: 'Desire, Joy & Fulfillment', border: 'border-l-lotus-pink', subs: ['Life Enjoyment', 'Relationship Quality', 'Creativity', 'Passion Pursuit', 'Aesthetic Appreciation'] },
              { key: 'moksha' as const, title: 'मोक्ष — Moksha', subtitle: 'Liberation & Self-Realization', border: 'border-l-wisdom-purple', subs: ['Inner Freedom', 'Self-Realization', 'Detachment', 'Consciousness Level', 'Practice Depth'] },
            ]).map(p => (
              <div key={p.key} className={`bg-card rounded-xl p-5 border border-border ${p.border} border-l-4`}>
                <h3 className="font-semibold text-foreground font-devanagari">{p.title}</h3>
                <p className="text-xs text-muted-foreground mb-3">{p.subtitle}</p>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm text-muted-foreground">Overall:</span>
                  <input type="range" min={1} max={10} value={purushScores[p.key]} onChange={e => setPurushScores(prev => ({ ...prev, [p.key]: +e.target.value }))} className="flex-1 accent-primary" />
                  <span className="text-2xl font-bold text-foreground">{purushScores[p.key]}</span>
                </div>
                {p.subs.map(sub => (
                  <div key={sub} className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs text-muted-foreground w-32 truncate">{sub}</span>
                    <input type="range" min={1} max={10} defaultValue={purushScores[p.key] + Math.floor(Math.random() * 3) - 1} className="flex-1 accent-primary h-1" />
                  </div>
                ))}
                <textarea className="w-full bg-background border border-input rounded-xl p-2 text-sm mt-3 min-h-[40px]" placeholder="Coach feedback..." />
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-card rounded-xl p-5 border border-border">
            <h3 className="font-semibold text-foreground mb-3">Purushartha Balance</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[
                { name: 'Dharma', score: purushScores.dharma, fill: '#FF9933' },
                { name: 'Artha', score: purushScores.artha, fill: '#B8860B' },
                { name: 'Kama', score: purushScores.kama, fill: '#E91E63' },
                { name: 'Moksha', score: purushScores.moksha, fill: '#7B1FA2' },
              ]} layout="vertical"><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" domain={[0, 10]} /><YAxis type="category" dataKey="name" width={60} /><Tooltip /><Bar dataKey="score" radius={[0, 8, 8, 0]} /></BarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-3">
              <p className="text-sm"><span className="text-dharma-green font-medium">Dominant:</span> {Object.entries(purushScores).sort(([,a],[,b]) => b - a)[0][0]} ({Object.entries(purushScores).sort(([,a],[,b]) => b - a)[0][1]}/10)</p>
              <p className="text-sm"><span className="text-destructive font-medium">Neglected:</span> {Object.entries(purushScores).sort(([,a],[,b]) => a - b)[0][0]} ({Object.entries(purushScores).sort(([,a],[,b]) => a - b)[0][1]}/10)</p>
            </div>
          </div>
          <button className="px-6 py-2.5 rounded-xl gradient-chakravartin text-primary-foreground text-sm font-medium">💾 Save Assessment</button>
        </div>
      )}

      {/* ===== TAB 4: HAPPINESS ===== */}
      {tab === 4 && (
        <div className="space-y-6">
          <div className="bg-card rounded-xl p-6 border border-border text-center">
            <p className="text-5xl mb-2">{+happinessOverall >= 7 ? '😊' : +happinessOverall >= 5 ? '🙂' : '😐'}</p>
            <p className={`text-4xl font-bold ${+happinessOverall >= 7 ? 'text-dharma-green' : +happinessOverall >= 5 ? 'text-saffron' : 'text-destructive'}`}>{happinessOverall} / 10</p>
            <p className="text-sm text-muted-foreground">Real Happiness Index</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {happDims.map((dim, i) => (
              <div key={dim} className="bg-card rounded-xl p-4 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{['🌟','🎯','🌊','🙏','🕊️','🎭','🤝','💝','⏰','💪'][i]} {dim}</span>
                  <span className="text-lg font-bold text-foreground">{happinessScores[i]}</span>
                </div>
                <input type="range" min={1} max={10} value={happinessScores[i]} onChange={e => {
                  const next = [...happinessScores];
                  next[i] = +e.target.value;
                  setHappinessScores(next);
                }} className="w-full accent-primary" />
              </div>
            ))}
          </div>

          {/* Blockers & Enablers */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-card rounded-xl p-5 border border-border">
              <h3 className="font-semibold text-destructive mb-3">Happiness Blockers</h3>
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                  <p className="text-sm text-foreground font-medium">Fear of failure</p>
                  <p className="text-xs text-muted-foreground">Severity: 7/10 · Area: Career · Strategy: Reframe failure as learning</p>
                </div>
                <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                  <p className="text-sm text-foreground font-medium">Overwork tendency</p>
                  <p className="text-xs text-muted-foreground">Severity: 6/10 · Area: Health · Strategy: Set hard stop at 7 PM</p>
                </div>
                <button className="text-xs text-primary flex items-center gap-1"><Plus className="w-3 h-3" /> Add Blocker</button>
              </div>
            </div>
            <div className="bg-card rounded-xl p-5 border border-border">
              <h3 className="font-semibold text-dharma-green mb-3">Happiness Enablers</h3>
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-dharma-green/5 border border-dharma-green/10">
                  <p className="text-sm text-foreground font-medium">Morning meditation</p>
                  <p className="text-xs text-muted-foreground">Frequency: Daily · Impact: 9/10</p>
                </div>
                <div className="p-3 rounded-lg bg-dharma-green/5 border border-dharma-green/10">
                  <p className="text-sm text-foreground font-medium">Family dinner time</p>
                  <p className="text-xs text-muted-foreground">Frequency: Daily · Impact: 8/10</p>
                </div>
                <button className="text-xs text-primary flex items-center gap-1"><Plus className="w-3 h-3" /> Add Enabler</button>
              </div>
            </div>
          </div>
          <button className="px-6 py-2.5 rounded-xl gradient-chakravartin text-primary-foreground text-sm font-medium">💾 Save Assessment</button>
        </div>
      )}

      {/* ===== TAB 5: MOOCH ===== */}
      {tab === 5 && (
        <div className="space-y-6">
          <div className="bg-chakra-indigo/5 rounded-xl p-5 border border-chakra-indigo/20">
            <h3 className="font-semibold text-foreground mb-1">🧠 Unconscious Patterns (मूच्छ)</h3>
            <p className="text-xs text-muted-foreground">Identifying and transforming deep-seated patterns that limit growth</p>
          </div>

          {/* Patterns */}
          {MOOCH_PATTERNS.map((p, i) => (
            <div key={i} className="bg-card rounded-xl border border-border overflow-hidden">
              <button onClick={() => setMoochExpanded(moochExpanded === i ? null : i)} className="w-full flex items-center justify-between p-4 hover:bg-muted/30">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground">{p.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${p.impact === 'High' ? 'bg-destructive/10 text-destructive' : 'bg-warning-amber/10 text-warning-amber'}`}>{p.impact === 'High' ? '🔴' : '🟡'} {p.impact}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${p.status === 'Working On' ? 'bg-saffron/10 text-saffron' : p.status === 'Aware' ? 'bg-sky-blue/10 text-sky-blue' : 'bg-muted text-muted-foreground'}`}>{p.status}</span>
                </div>
                {moochExpanded === i ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>
              {moochExpanded === i && (
                <div className="p-5 border-t border-border space-y-3">
                  <div><label className="text-xs font-medium text-muted-foreground">Description</label><textarea className="w-full bg-background border border-input rounded-xl p-2 text-sm mt-1" defaultValue={p.desc} /></div>
                  <div><label className="text-xs font-medium text-muted-foreground">Triggers</label><div className="flex gap-1 flex-wrap mt-1">{p.triggers.map(t => <span key={t} className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">{t}</span>)}<button className="text-xs text-primary">+ Add</button></div></div>
                  <div><label className="text-xs font-medium text-muted-foreground">Areas Affected</label><div className="flex gap-2 flex-wrap mt-1">{p.areas.map(a => <span key={a} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">{a}</span>)}</div></div>
                  <div><label className="text-xs font-medium text-muted-foreground">Root Cause</label><textarea className="w-full bg-background border border-input rounded-xl p-2 text-sm mt-1" defaultValue={p.root} /></div>
                  <div className="flex items-center gap-3"><label className="text-xs font-medium text-muted-foreground">Awareness:</label><input type="range" min={1} max={10} defaultValue={p.awareness} className="flex-1 accent-primary" /><span className="font-bold">{p.awareness}/10</span></div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Transformation Status</label>
                    <div className="flex gap-1 mt-2">{['Identified', 'Aware', 'Working On', 'Transforming', 'Transformed'].map((s, si) => {
                      const activeIdx = ['Identified', 'Aware', 'Working On', 'Transforming', 'Transformed'].indexOf(p.status);
                      return <div key={s} className={`flex-1 h-2 rounded-full ${si <= activeIdx ? 'bg-primary' : 'bg-muted'}`} title={s} />;
                    })}</div>
                    <div className="flex justify-between text-[9px] text-muted-foreground mt-1"><span>Identified</span><span>Transformed</span></div>
                  </div>
                  {p.strategies.length > 0 && <div><label className="text-xs font-medium text-muted-foreground">Strategies</label><ul className="mt-1 space-y-1">{p.strategies.map((s, si) => <li key={si} className="text-sm text-foreground flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-primary" />{s}</li>)}</ul></div>}
                </div>
              )}
            </div>
          ))}
          <button className="text-sm text-primary flex items-center gap-1"><Plus className="w-4 h-4" /> Add Pattern</button>

          {/* Limiting Beliefs */}
          <div className="bg-card rounded-xl p-5 border border-border">
            <h3 className="font-semibold text-foreground mb-4">Limiting Beliefs</h3>
            {BELIEFS.map((b, i) => (
              <div key={i} className="mb-4 p-4 rounded-xl border border-border bg-muted/10">
                <p className="text-sm font-medium text-destructive">"{b.belief}"</p>
                <p className="text-xs text-muted-foreground mt-1">Origin: {b.origin} · Impact: {b.impact}/10</p>
                <div className="mt-2 p-2 rounded-lg bg-dharma-green/5 border border-dharma-green/10">
                  <p className="text-xs text-dharma-green font-medium">Replacement: "{b.replacement}"</p>
                  <p className="text-xs text-muted-foreground">Affirmation: "{b.affirmation}"</p>
                </div>
                <div className="mt-2"><p className="text-xs text-muted-foreground font-medium">Evidence Against:</p>{b.evidence.map((e, ei) => <p key={ei} className="text-xs text-foreground ml-2">• {e}</p>)}</div>
                <div className="flex gap-1 mt-2">{['Identified', 'Challenging', 'Replacing', 'Replaced'].map((s, si) => {
                  const idx = ['Identified', 'Challenging', 'Replacing', 'Replaced'].indexOf(b.status);
                  return <div key={s} className={`flex-1 h-1.5 rounded-full ${si <= idx ? 'bg-dharma-green' : 'bg-muted'}`} />;
                })}</div>
              </div>
            ))}
          </div>

          <div className="bg-card rounded-xl p-4 border border-border text-center">
            <p className="text-xs text-muted-foreground">Overall Awareness Score</p>
            <p className="text-3xl font-bold text-foreground">{(MOOCH_PATTERNS.reduce((a, p) => a + p.awareness, 0) / MOOCH_PATTERNS.length).toFixed(1)} / 10</p>
          </div>
          <button className="px-6 py-2.5 rounded-xl gradient-chakravartin text-primary-foreground text-sm font-medium">💾 Save Assessment</button>
        </div>
      )}
    </div>
  );
};

export default AssessmentsPage;
