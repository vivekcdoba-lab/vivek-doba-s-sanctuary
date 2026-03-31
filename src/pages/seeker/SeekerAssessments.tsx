import { useState, useMemo } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import LGTAssessment from '@/components/LGTAssessment';

// 9 Life Areas matching Vivek Doba's Wheel of Life framework
const AREAS = [
  { id: 1, name: "Spiritual Fulfilment", hindi: "आध्यात्मिक पूर्णता", icon: "🕉️", hint: "Inner peace, meditation, prayer, purpose" },
  { id: 2, name: "Learnings", hindi: "सीखना / ज्ञान", icon: "📚", hint: "Education, skills, personal growth" },
  { id: 3, name: "Work", hindi: "कार्य / करियर", icon: "💼", hint: "Career satisfaction, achievements, purpose" },
  { id: 4, name: "Money", hindi: "धन / आर्थिक", icon: "💰", hint: "Financial health, savings, freedom" },
  { id: 5, name: "Love", hindi: "प्रेम", icon: "❤️", hint: "Romantic love, self-love, compassion" },
  { id: 6, name: "Helping Others", hindi: "सेवा / परोपकार", icon: "🙏", hint: "Charity, mentoring, giving back" },
  { id: 7, name: "Relationships", hindi: "रिश्ते / संबंध", icon: "👨‍👩‍👧‍👦", hint: "Family, friends, social connections" },
  { id: 8, name: "Health", hindi: "स्वास्थ्य", icon: "🏃", hint: "Physical fitness, mental health, energy" },
  { id: 9, name: "Fun & Enjoyment", hindi: "मज़ा और आनंद", icon: "🎉", hint: "Hobbies, travel, recreation, joy" },
];

const ZONE_COLORS = { red: '#E63946', yellow: '#F4A61C', white: '#BDC3C7', blue: '#3498DB', green: '#2ECC71' };

function getZone(score: number) {
  if (score <= 2) return { name: 'Red Zone', color: ZONE_COLORS.red, label: 'Danger', emoji: '🔴', bg: 'bg-red-50 dark:bg-red-950/20' };
  if (score <= 4) return { name: 'Yellow Zone', color: ZONE_COLORS.yellow, label: 'Caution', emoji: '🟡', bg: 'bg-yellow-50 dark:bg-yellow-950/20' };
  if (score <= 6) return { name: 'White Zone', color: ZONE_COLORS.white, label: 'Average', emoji: '⚪', bg: 'bg-gray-50 dark:bg-gray-800/20' };
  if (score <= 8) return { name: 'Blue Zone', color: ZONE_COLORS.blue, label: 'Good', emoji: '🔵', bg: 'bg-blue-50 dark:bg-blue-950/20' };
  return { name: 'Green Zone', color: ZONE_COLORS.green, label: 'Excellent', emoji: '🟢', bg: 'bg-green-50 dark:bg-green-950/20' };
}

function getDetailedRemark(areaIndex: number, score: number): string {
  const remarksMap: ((s: number) => string)[] = [
    s => s <= 2 ? "⚠️ Your spiritual connection is critically low. Start with 5 minutes of daily stillness — prayer, meditation, or gratitude journaling."
      : s <= 4 ? "Your spiritual life needs nurturing. Try morning meditation or evening reflection."
      : s <= 6 ? "Basic spiritual practice exists but there's untapped potential. Deepen your sadhana."
      : s <= 8 ? "Good spiritual foundation! Consider mentoring others or deepening scripture study."
      : "🌟 Exceptional! Your spiritual life is your strength. Keep this as your anchor.",
    s => s <= 2 ? "⚠️ Learning has almost stopped. Pick up one book, one podcast, one course today."
      : s <= 4 ? "Your learning curve is flat. Set a goal: 1 book/month or 1 new skill this quarter."
      : s <= 6 ? "Average learning engagement. Create a structured plan — 30 minutes daily can transform you."
      : s <= 8 ? "Strong learner! Now focus on applying what you learn."
      : "🌟 Outstanding! You're a lifelong learner. Consider creating content or mentoring.",
    s => s <= 2 ? "⚠️ Work satisfaction is critically low. Urgently reassess your current path."
      : s <= 4 ? "Work feels like a burden. Identify what drains and what energizes you."
      : s <= 6 ? "Work is okay but not exciting. Challenge yourself — growth happens at the edge of comfort."
      : s <= 8 ? "Doing well at work! Align daily tasks with your bigger life mission."
      : "🌟 Thriving at work! You've found your dharma in action.",
    s => s <= 2 ? "⚠️ Financial emergency zone. Start with basics: track expenses, cut unnecessary costs, build emergency fund."
      : s <= 4 ? "Financial health needs attention. Create a budget, reduce debt, start investing even ₹500/month."
      : s <= 6 ? "Financially stable but not growing. Explore investments and multiple income streams."
      : s <= 8 ? "Good financial position! Focus on wealth creation — assets over liabilities, passive income."
      : "🌟 Financial mastery! Remember to give back — dana multiplies wealth.",
    s => s <= 2 ? "⚠️ Love is almost absent. Start with self-love — you cannot pour from an empty cup."
      : s <= 4 ? "Love needs attention. Open your heart — express feelings, be vulnerable."
      : s <= 6 ? "Love is present but could be deeper. Remove barriers — ego, fear, past hurt."
      : s <= 8 ? "Beautiful! Love flows well. Nurture it with quality time and presence."
      : "🌟 Your heart overflows with love! Keep spreading this energy.",
    s => s <= 2 ? "⚠️ Seva (service) is missing. Start small — help one person today."
      : s <= 4 ? "You help occasionally but it's not a habit. Make giving a regular practice."
      : s <= 6 ? "You contribute but there's more potential. Find a cause that deeply moves you."
      : s <= 8 ? "Strong seva spirit! Consider scaling your impact."
      : "🌟 You're a true karma yogi! Your service is extraordinary.",
    s => s <= 2 ? "⚠️ Relationships are in crisis. Reach out to one person today."
      : s <= 4 ? "Relationships feel strained. Invest time in your top 5 people."
      : s <= 6 ? "Relationships are okay but shallow. Go deeper — have meaningful conversations."
      : s <= 8 ? "Healthy relationships! Focus on being more present."
      : "🌟 Your relationships are your crown jewel!",
    s => s <= 2 ? "⚠️ Health emergency! Start with: 8 hours sleep, 3 liters water, 30 minutes walk."
      : s <= 4 ? "Health is suffering. Commit to basics: regular meals, daily movement, adequate sleep."
      : s <= 6 ? "Average health. Add structure: morning exercise, meal planning, annual check-up."
      : s <= 8 ? "Good health! Fine-tune with nutrition, stress management, and preventive care."
      : "🌟 Exceptional health! Your energy amplifies everything you do.",
    s => s <= 2 ? "⚠️ Joy is missing. Schedule fun like you schedule meetings — it's essential."
      : s <= 4 ? "Life feels heavy. Rediscover what makes you laugh and smile."
      : s <= 6 ? "Some fun but not enough. Rest and play are productive."
      : s <= 8 ? "You know how to have a good time! Keep the balance."
      : "🌟 You've mastered the art of enjoyment!",
  ];
  return remarksMap[areaIndex](score);
}

function getOverallRemark(scores: number[], total: number, avg: string, name: string): string {
  const pct = ((total / 90) * 100).toFixed(0);
  const redCount = scores.filter(s => s <= 2).length;
  const yellowCount = scores.filter(s => s >= 3 && s <= 4).length;

  if (Number(pct) >= 80) return `🌟 Outstanding Life Balance! You are living an extraordinary life. Focus on maintaining this balance and helping others. "Yogah karmasu kaushalam" — You have mastered the yoga of balanced action!`;
  if (Number(pct) >= 60) return `✨ Good Foundation! Solid strengths with clear growth opportunities.${redCount > 0 ? ` ${redCount} area(s) in the Red Zone need urgent attention.` : ''} Focus on your bottom 2-3 areas for the next 90 days.`;
  if (Number(pct) >= 40) return `⚡ Wake-Up Call! Your wheel is significantly unbalanced. ${redCount + yellowCount} areas in Red/Yellow zones. Pick your lowest area, commit to one small daily action. "Uddhared atmanatmanam" — Elevate yourself!`;
  return `🔥 Critical Transformation Needed! But the darkest hour is just before dawn. You've taken the most courageous step — facing the truth. Take one area, make one change, and begin.`;
}

const ZONES = [
  { name: '🔴 Red Zone — Danger', range: '0–2 marks • Needs immediate attention', color: ZONE_COLORS.red },
  { name: '🟡 Yellow Zone — Caution', range: '3–4 marks • Below average, needs work', color: ZONE_COLORS.yellow },
  { name: '⚪ White Zone — Average', range: '5–6 marks • Stable but room to grow', color: ZONE_COLORS.white },
  { name: '🔵 Blue Zone — Good', range: '7–8 marks • Doing well', color: ZONE_COLORS.blue },
  { name: '🟢 Green Zone — Excellent', range: '9–10 marks • Thriving!', color: ZONE_COLORS.green },
];

const INITIAL_SCORES = [8, 6, 5, 3, 4, 5, 8, 7, 5];

const PROGRESS_TABLE = [
  { name: 'Wheel of Life', initial: '4.6', m1: '5.1', m2: '5.8', m3: '6.2' },
  { name: 'LGT Balance', initial: '45%', m1: '52%', m2: '61%', m3: '68%' },
  { name: 'Happiness', initial: '5.5', m1: '6.0', m2: '6.8', m3: '7.2' },
  { name: 'Purushartha Balance', initial: '50%', m1: '55%', m2: '62%', m3: '65%' },
];

const SeekerAssessments = () => {
  const [selfAssessing, setSelfAssessing] = useState(false);
  const [lgtAssessing, setLgtAssessing] = useState(false);
  const [scores, setScores] = useState<number[]>(INITIAL_SCORES);
  const [showResults, setShowResults] = useState(false);

  const analysis = useMemo(() => {
    const total = scores.reduce((a, b) => a + b, 0);
    const avg = (total / 9).toFixed(1);
    const max = Math.max(...scores);
    const min = Math.min(...scores);
    const balance = (10 - (max - min)).toFixed(1);
    const strongIdx = scores.indexOf(max);
    const weakIdx = scores.indexOf(min);
    return { total, avg, max, min, balance, strongIdx, weakIdx };
  }, [scores]);

  const radarData = AREAS.map((a, i) => ({ name: a.icon + ' ' + a.name, score: scores[i], fullMark: 10 }));
  const barData = AREAS.map((a, i) => ({ name: a.icon + ' ' + a.name.split(' ').slice(0, 2).join(' '), score: scores[i], color: getZone(scores[i]).color }));

  const handleUpdateScore = (index: number, value: number) => {
    const next = [...scores];
    next[index] = value;
    setScores(next);
  };

  const handleAnalyze = () => {
    setShowResults(true);
  };

  return (
    <div className="p-4 space-y-5 max-w-2xl mx-auto animate-fade-up">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">My Transformation Assessments</h1>
        <p className="text-xs text-muted-foreground mt-1">Jeevan Chakra — Discover Your Life Balance</p>
      </div>

      {/* Assessment Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-card rounded-xl p-4 border-l-4 border-l-[#2ECC71] border border-border">
          <p className="text-xs text-muted-foreground">📋 SWOT</p>
          <p className="text-lg font-bold text-foreground">S:5 W:3</p>
          <p className="text-[10px] text-muted-foreground">Last: 15/02/2026</p>
          <button className="text-xs text-primary mt-2">View Details</button>
        </div>
        <div className="bg-card rounded-xl p-4 border-l-4 border-l-primary border border-border">
          <p className="text-xs text-muted-foreground">☸ Wheel of Life</p>
          <p className="text-lg font-bold text-foreground">{analysis.avg}/10</p>
          <p className="text-[10px] text-muted-foreground">Last: 01/03/2026</p>
          <button onClick={() => { setSelfAssessing(true); setShowResults(false); }} className="text-xs text-primary mt-2 font-medium">🎯 Self-Assess</button>
        </div>
        <div className="bg-card rounded-xl p-4 border-l-4 border-l-[#FF9933] border border-border">
          <p className="text-xs text-muted-foreground">🔺 LGT</p>
          <p className="text-lg font-bold text-foreground">68%</p>
          <p className="text-[10px] text-muted-foreground">Balance</p>
          <button className="text-xs text-primary mt-2">View Details</button>
        </div>
        <div className="bg-card rounded-xl p-4 border-l-4 border-l-[#7B1FA2] border border-border">
          <p className="text-xs text-muted-foreground">🕉️ Purusharthas</p>
          <p className="text-sm font-bold text-foreground">D:8 A:5 K:4 M:7</p>
          <p className="text-[10px] text-muted-foreground">Last: 01/03/2026</p>
          <button className="text-xs text-primary mt-2">View Details</button>
        </div>
        <div className="bg-card rounded-xl p-4 border-l-4 border-l-[#2ECC71] border border-border">
          <p className="text-xs text-muted-foreground">😊 Happiness</p>
          <p className="text-lg font-bold text-foreground">7.2/10</p>
          <p className="text-[10px] text-[#2ECC71]">↑0.5</p>
          <button className="text-xs text-primary mt-2">😊 Quick Check</button>
        </div>
        <div className="bg-card rounded-xl p-4 border-l-4 border-l-[#3F51B5] border border-border">
          <p className="text-xs text-muted-foreground">🧠 MOOCH</p>
          <p className="text-sm font-bold text-foreground">5 patterns</p>
          <p className="text-[10px] text-muted-foreground">Awareness: 6.5</p>
          <button className="text-xs text-primary mt-2">View Details</button>
        </div>
      </div>

      {/* ═══ WHEEL OF LIFE SELF-ASSESSMENT ═══ */}
      {selfAssessing && (
        <div className="space-y-5">
          {/* Scoring Section */}
          <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-foreground">☸ Rate Your Life Areas</h2>
              <button onClick={() => { setSelfAssessing(false); setShowResults(false); }} className="text-xs text-muted-foreground hover:text-foreground">✕ Close</button>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Slide each bar from 0 (Lowest) to 10 (Highest) — Be honest with yourself 🙏</p>

            <div className="space-y-1">
              {AREAS.map((area, i) => {
                const zone = getZone(scores[i]);
                return (
                  <div key={area.id} className="flex items-center gap-2 py-2.5 border-b border-border last:border-b-0">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: '#0D1B3E', color: '#D4A843' }}>
                      {area.id}
                    </div>
                    <span className="text-base shrink-0">{area.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground leading-tight truncate">
                        {area.name} <span className="text-[10px] text-muted-foreground font-normal">{area.hindi}</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">{area.hint}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        type="range"
                        min={0}
                        max={10}
                        value={scores[i]}
                        onChange={e => handleUpdateScore(i, +e.target.value)}
                        className="w-20 sm:w-32 h-2 rounded-lg appearance-none cursor-pointer accent-primary"
                        style={{
                          background: `linear-gradient(to right, ${zone.color} 0%, ${zone.color} ${(scores[i] / 10) * 100}%, hsl(var(--border)) ${(scores[i] / 10) * 100}%)`
                        }}
                      />
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-base shrink-0"
                        style={{ backgroundColor: zone.color }}
                      >
                        {scores[i]}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            className="w-full py-4 rounded-xl text-base font-bold tracking-wider transition-all hover:scale-[1.02] shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #0D1B3E, #162758)',
              color: '#D4A843',
              border: '2px solid #D4A843',
            }}
          >
            🔱 ANALYZE MY WHEEL OF LIFE 🔱
          </button>

          {/* ═══ RESULTS ═══ */}
          {showResults && (
            <div className="space-y-5 animate-fade-up">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-card rounded-xl p-4 border border-border text-center shadow-sm">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Score</p>
                  <p className="text-2xl font-bold text-foreground">{analysis.total}<span className="text-xs text-muted-foreground">/90</span></p>
                  <p className="text-[10px] text-muted-foreground">{((analysis.total / 90) * 100).toFixed(0)}% Life Fulfilment</p>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border text-center shadow-sm">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Average Score</p>
                  <p className="text-2xl font-bold" style={{ color: getZone(Number(analysis.avg)).color }}>{analysis.avg}</p>
                  <p className="text-[10px]" style={{ color: getZone(Number(analysis.avg)).color }}>{getZone(Number(analysis.avg)).emoji} {getZone(Number(analysis.avg)).label}</p>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border text-center shadow-sm">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Strongest Area</p>
                  <p className="text-2xl font-bold" style={{ color: ZONE_COLORS.green }}>{analysis.max}</p>
                  <p className="text-[10px] text-foreground">{AREAS[analysis.strongIdx].icon} {AREAS[analysis.strongIdx].name}</p>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border text-center shadow-sm">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Needs Attention</p>
                  <p className="text-2xl font-bold" style={{ color: ZONE_COLORS.red }}>{analysis.min}</p>
                  <p className="text-[10px] text-foreground">{AREAS[analysis.weakIdx].icon} {AREAS[analysis.weakIdx].name}</p>
                </div>
              </div>

              {/* Zone Classification */}
              <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
                <h3 className="text-sm font-bold text-foreground mb-3">🎯 Zone Classification / ज़ोन वर्गीकरण</h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {ZONES.map(z => (
                    <div key={z.name} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                      <div className="w-5 h-5 rounded shrink-0" style={{ backgroundColor: z.color, border: z.color === ZONE_COLORS.white ? '1px solid hsl(var(--border))' : undefined }} />
                      <div>
                        <p className="text-[10px] font-semibold text-foreground leading-tight">{z.name.split('—')[0].trim()}</p>
                        <p className="text-[8px] text-muted-foreground leading-tight">{z.range.split('•')[0].trim()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Charts */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Radar Chart */}
                <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
                  <h3 className="text-sm font-bold text-foreground mb-2">☸ Your Wheel of Life</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="hsl(var(--border))" />
                        <PolarAngleAxis dataKey="name" tick={{ fontSize: 8 }} />
                        <Radar dataKey="score" stroke="#D4A843" fill="#D4A843" fillOpacity={0.2} strokeWidth={2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Bar Chart */}
                <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
                  <h3 className="text-sm font-bold text-foreground mb-2">📊 Score Comparison</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData} layout="vertical" margin={{ left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 10 }} />
                        <YAxis dataKey="name" type="category" tick={{ fontSize: 8 }} width={90} />
                        <Tooltip />
                        <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                          {barData.map((entry, index) => (
                            <Cell key={index} fill={entry.color + 'CC'} stroke={entry.color} strokeWidth={1.5} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Detailed Area Analysis */}
              <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
                <h3 className="text-sm font-bold text-foreground mb-4">📋 Detailed Area Analysis / विस्तृत विश्लेषण</h3>
                <div className="space-y-3">
                  {AREAS.map((area, i) => {
                    const zone = getZone(scores[i]);
                    return (
                      <div key={area.id} className="rounded-xl p-4 border-l-4" style={{ borderColor: zone.color, backgroundColor: `${zone.color}08` }}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{area.icon}</span>
                            <span className="text-sm font-semibold text-foreground">{area.name}</span>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold text-white" style={{ backgroundColor: zone.color }}>
                              {zone.emoji} {zone.name}
                            </span>
                          </div>
                          <span className="text-lg font-bold" style={{ color: zone.color }}>{scores[i]}/10</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{getDetailedRemark(i, scores[i])}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Overall Assessment */}
              <div className="rounded-xl p-5 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #080F24, #0D1B3E)' }}>
                <span className="absolute bottom-[-20px] right-2 text-[80px] opacity-5 pointer-events-none">🕉</span>
                <h3 className="text-sm font-bold mb-3" style={{ color: '#D4A843' }}>🔱 Overall Life Assessment</h3>
                <p className="text-xs leading-relaxed text-white/90">
                  Your overall life score is <span className="font-bold" style={{ color: '#D4A843' }}>{analysis.total}/90 ({((analysis.total / 90) * 100).toFixed(0)}%)</span> with an average of <span className="font-bold" style={{ color: '#D4A843' }}>{analysis.avg}/10</span>.
                </p>
                <p className="text-xs leading-relaxed text-white/80 mt-2">{getOverallRemark(scores, analysis.total, analysis.avg, 'Seeker')}</p>
                <p className="text-xs leading-relaxed text-white/70 mt-3">
                  🔱 <span className="font-bold text-white/90">Action Plan:</span> Focus on your bottom 3 areas first. Set one specific goal for each. Review your Wheel of Life every 30 days. <span className="font-bold" style={{ color: '#D4A843' }}>Let's transform your wheel together in Life's Golden Triangle!</span> 🔱
                </p>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => window.print()}
                  className="py-3 rounded-xl font-bold text-sm tracking-wider transition-all hover:opacity-90"
                  style={{ background: '#D4A843', color: '#0D1B3E' }}
                >
                  🖨️ Print Report
                </button>
                <button
                  onClick={() => { setScores(INITIAL_SCORES); setShowResults(false); }}
                  className="py-3 rounded-xl text-sm border border-border text-muted-foreground hover:text-foreground transition-colors"
                >
                  ↺ Reset & Redo
                </button>
              </div>

              {/* Save */}
              <button
                onClick={() => { setSelfAssessing(false); setShowResults(false); }}
                className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #FF9933, #B8860B)' }}
              >
                💾 Save Self-Assessment
              </button>
            </div>
          )}
        </div>
      )}

      {/* Progress Table */}
      <div className="bg-card rounded-xl p-5 border border-border">
        <h3 className="font-semibold text-foreground mb-3">📊 My Progress Over Time</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-2 font-medium text-muted-foreground">Assessment</th>
                <th className="text-center p-2 font-medium text-muted-foreground">Initial</th>
                <th className="text-center p-2 font-medium text-muted-foreground">Month 1</th>
                <th className="text-center p-2 font-medium text-muted-foreground">Month 2</th>
                <th className="text-center p-2 font-medium text-muted-foreground">Month 3</th>
              </tr>
            </thead>
            <tbody>
              {PROGRESS_TABLE.map(row => (
                <tr key={row.name} className="border-b border-border">
                  <td className="p-2 text-foreground font-medium">{row.name}</td>
                  <td className="p-2 text-center text-muted-foreground">{row.initial}</td>
                  <td className="p-2 text-center text-foreground">{row.m1}</td>
                  <td className="p-2 text-center text-foreground">{row.m2}</td>
                  <td className="p-2 text-center text-[#2ECC71] font-medium">{row.m3}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SeekerAssessments;
