import { SEEKERS } from '@/data/mockData';

const milestones = [
  { label: 'Enrolled in LGT Program', date: '15/09/2024', status: 'done', icon: '🎯' },
  { label: 'Welcome Call Completed', date: '16/09/2024', status: 'done', icon: '📞' },
  { label: 'Initial SWOT Assessment', date: '20/09/2024', status: 'done', icon: '📋' },
  { label: 'Wheel of Life Baseline', date: '22/09/2024', status: 'done', icon: '📊' },
  { label: 'Module 1 — Self-Discovery', date: 'Oct 2024', status: 'done', icon: '🌟' },
  { label: 'Module 2 — Values & Purpose', date: 'Nov 2024', status: 'done', icon: '🕉️' },
  { label: 'Module 3 — Business Alignment', date: 'Jan 2025', status: 'current', icon: '💼' },
  { label: 'Module 4 — Leadership', date: 'Apr 2025', status: 'upcoming', icon: '👑' },
  { label: 'Module 5 — Communication', date: 'May 2025', status: 'upcoming', icon: '🗣️' },
  { label: 'Module 6 — Mastery & Completion', date: 'Jul 2025', status: 'upcoming', icon: '🏆' },
  { label: 'Certificate of Transformation', date: 'Jul 2025', status: 'upcoming', icon: '📜' },
];

const breakthroughs = [
  { text: 'First time admitted fear of failure in Session 5', date: '10/11/2024' },
  { text: 'Connected father\'s work ethic to own burnout pattern', date: '15/12/2024' },
  { text: 'Set boundaries with a difficult client for the first time', date: '24/03/2025' },
];

const visionBoard = [
  { area: '💼 Career', vision: 'India\'s leading spiritual business coach by 2030' },
  { area: '👨‍👩‍👧 Family', vision: 'Quality time every Sunday, no-phone dinner rule' },
  { area: '❤️ Health', vision: 'Run a half-marathon, daily yoga practice' },
  { area: '💰 Wealth', vision: '₹1 Cr annual revenue, 6 months emergency fund' },
  { area: '🕉️ Spiritual', vision: 'Daily 20-min meditation, 2 retreats per year' },
  { area: '🌱 Personal', vision: 'Read 50 books, learn Sanskrit, travel to 5 countries' },
];

const SeekerJourney = () => {
  const seeker = SEEKERS[0];

  return (
    <div className="p-4 space-y-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-foreground">My Journey</h1>

      {/* Transformation Snapshot */}
      <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-3">Transformation Snapshot</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 rounded-lg bg-red-500/5 border border-red-500/20">
            <p className="text-xs text-muted-foreground">Where I Started</p>
            <p className="text-2xl font-bold text-red-500">45%</p>
            <p className="text-[10px] text-muted-foreground">Overall Score</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-green-500/5 border border-green-500/20">
            <p className="text-xs text-muted-foreground">Where I Am Now</p>
            <p className="text-2xl font-bold text-green-500">72%</p>
            <p className="text-[10px] text-muted-foreground">Overall Score</p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-3">Module Progress</h3>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
          {milestones.map((m, i) => (
            <div key={i} className="relative flex items-start gap-4 pb-4 last:pb-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm z-10 flex-shrink-0 ${
                m.status === 'done' ? 'bg-green-500 text-white' :
                m.status === 'current' ? 'bg-primary text-primary-foreground ring-4 ring-primary/20 animate-pulse' :
                'bg-muted text-muted-foreground'
              }`}>{m.icon}</div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${m.status === 'done' ? 'text-foreground' : m.status === 'current' ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>{m.label}</p>
                <p className="text-[10px] text-muted-foreground">{m.date}</p>
              </div>
              {m.status === 'done' && <span className="text-green-500 text-xs">✅</span>}
              {m.status === 'current' && <span className="text-primary text-xs">🔵 Current</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Key Breakthroughs */}
      <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-3">✨ Key Breakthroughs</h3>
        <div className="space-y-2">
          {breakthroughs.map((b, i) => (
            <div key={i} className="p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-sm text-foreground">{b.text}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{b.date}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Vision Board */}
      <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-3">🎯 Digital Vision Board</h3>
        <div className="grid grid-cols-2 gap-2">
          {visionBoard.map(v => (
            <div key={v.area} className="p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs font-semibold text-foreground">{v.area}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{v.vision}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Certificate Preview */}
      <div className="bg-card rounded-xl p-6 border-2 border-primary/20 shadow-sm text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">Certificate of Transformation</p>
        <div className="mt-3 p-4 border border-dashed border-primary/30 rounded-lg">
          <span className="text-4xl">🔒</span>
          <p className="text-sm text-muted-foreground mt-2">Complete all 6 modules to unlock your certificate</p>
          <div className="w-full bg-muted rounded-full h-2 mt-3">
            <div className="bg-primary h-2 rounded-full" style={{ width: '33%' }} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">2 of 6 modules completed (33%)</p>
        </div>
      </div>

      <footer className="text-center py-6 border-t border-border">
        <p className="text-xs text-muted-foreground">Vivek Doba Training Solutions</p>
        <p className="text-[10px] text-muted-foreground mt-1">Made with 🙏 for seekers of transformation</p>
      </footer>
    </div>
  );
};

export default SeekerJourney;
