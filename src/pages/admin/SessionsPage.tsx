import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SESSIONS, SEEKERS, COURSES, formatTime12 } from '@/data/mockData';
import { JOURNEY_STAGES } from '@/types';
import { calculateRiskScore, getRiskEmoji } from '@/lib/riskEngine';
import { Plus, Video, MapPin, Bell, Play, X, RotateCcw, AlertTriangle, Check, Clock, Shield, Eye, FileText } from 'lucide-react';
import SendReminderModal from '@/components/SendReminderModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const SESSION_STATUS_CONFIG: Record<string, { label: string; emoji: string; color: string }> = {
  requested: { label: 'Requested', emoji: '📋', color: 'bg-muted text-muted-foreground' },
  scheduled: { label: 'Scheduled', emoji: '📅', color: 'bg-sky-blue/10 text-sky-blue' },
  confirmed: { label: 'Confirmed', emoji: '✅', color: 'bg-chakra-indigo/10 text-chakra-indigo' },
  in_progress: { label: 'In Progress', emoji: '▶️', color: 'bg-saffron/10 text-saffron animate-pulse' },
  completed: { label: 'Completed', emoji: '✅', color: 'bg-dharma-green/10 text-dharma-green' },
  submitted: { label: 'Submitted', emoji: '📤', color: 'bg-chakra-indigo/10 text-chakra-indigo' },
  reviewing: { label: 'Reviewing', emoji: '👁️', color: 'bg-saffron/10 text-saffron' },
  approved: { label: 'Approved', emoji: '🏆', color: 'bg-dharma-green/10 text-dharma-green' },
  revision_requested: { label: 'Revision', emoji: '🔄', color: 'bg-warning-amber/10 text-warning-amber' },
  missed: { label: 'Missed', emoji: '❌', color: 'bg-destructive/10 text-destructive' },
  rescheduled: { label: 'Rescheduled', emoji: '🔄', color: 'bg-warning-amber/10 text-warning-amber' },
  cancelled: { label: 'Cancelled', emoji: '🚫', color: 'bg-muted text-muted-foreground' },
};

const STATUS_FILTERS = ['all', 'scheduled', 'confirmed', 'in_progress', 'completed', 'missed', 'rescheduled', 'cancelled'];

interface SessionTemplate {
  id: string;
  name: string;
  default_topic_ids: string[] | null;
  default_assignments: any[] | null;
}

const SessionsPage = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [sessions, setSessions] = useState(SESSIONS);
  const [reminder, setReminder] = useState<{ seeker: typeof SEEKERS[0]; session: typeof SESSIONS[0] } | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [templates, setTemplates] = useState<SessionTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [newSession, setNewSession] = useState({
    seeker_id: '', course_id: '', date: '', start_time: '10:00', end_time: '11:00',
    session_type: 'video' as 'video' | 'in_person', duration_minutes: 60, notes: '',
  });
  const [liveSession, setLiveSession] = useState<string | null>(null);
  const [liveNotes, setLiveNotes] = useState('');
  const [liveTimer, setLiveTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  // Post-session wizard removed — all fields are on live session page now
  const [postData, setPostData] = useState({
    sessionName: '',
    pillar: 'all' as string,
    topics: '',
    insights: '',
    breakthroughs: '',
    challenges: '',
    therapyGiven: '',
    mood: '😊',
    engagement: 7,
    energy: 7,
    openness: 7,
    stories: [] as string[],
    clientGoodThings: ['', '', ''],
    clientGrowth: { dharma: '', artha: '', kama: '', moksha: '' },
    majorWin: '',
    assignments: '',
    pendingAssignments: '',
    privateNotes: '',
    focusNext: '',
    nextSessionTime: '',
    nextWeekAssignments: '',
    punishments: '',
    rewards: '',
    targets: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTemplates = async () => {
      const { data } = await supabase
        .from('session_templates')
        .select('id, name, default_topic_ids, default_assignments')
        .order('name');
      if (data) setTemplates(data as SessionTemplate[]);
    };
    fetchTemplates();
  }, []);

  const applyTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (!templateId) return;
    const tpl = templates.find(t => t.id === templateId);
    if (!tpl) return;
    const assignments = (tpl.default_assignments || [])
      .map((a: any) => a.title || a)
      .join('\n');
    if (assignments) {
      setNewSession(p => ({ ...p, notes: assignments }));
    }
    toast.success(`Template "${tpl.name}" applied`);
  };

  const filtered = sessions.filter(s => statusFilter === 'all' || s.status === statusFilter)
    .sort((a, b) => b.date.localeCompare(a.date) || b.start_time.localeCompare(a.start_time));

  const isTomorrow = (dateStr: string) => {
    const d = new Date(dateStr);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return d.toDateString() === tomorrow.toDateString();
  };

  // Timer effect
  useEffect(() => {
    if (timerRunning) {
      const interval = setInterval(() => setLiveTimer(t => t + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timerRunning]);

  const formatTimer = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const startSession = (sessionId: string) => {
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status: 'in_progress' as const } : s));
    setLiveSession(sessionId);
    setLiveTimer(0);
    setTimerRunning(true);
  };

  const submitToSeeker = (sessionId: string) => {
    setTimerRunning(false);
    // Save all data and mark as submitted → seeker can now see it
    setSessions(prev => prev.map(s => s.id === sessionId ? {
      ...s,
      status: 'submitted' as const,
      topics_covered: postData.topics.split(',').map(t => t.trim()).filter(Boolean),
      key_insights: postData.insights,
      breakthroughs: postData.breakthroughs,
      session_notes: liveNotes,
      engagement_score: postData.engagement,
    } : s));
    setLiveSession(null);
    toast.success('✅ Session submitted to seeker! They can now read, reflect & accept.');
    setPostData({ sessionName: '', pillar: 'all', topics: '', insights: '', breakthroughs: '', challenges: '', therapyGiven: '', mood: '😊', engagement: 7, energy: 7, openness: 7, stories: [], clientGoodThings: ['', '', ''], clientGrowth: { dharma: '', artha: '', kama: '', moksha: '' }, majorWin: '', assignments: '', pendingAssignments: '', privateNotes: '', focusNext: '', nextSessionTime: '', nextWeekAssignments: '', punishments: '', rewards: '', targets: '' });
    setLiveNotes('');
  };

  const approveSession = (sessionId: string) => {
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status: 'approved' as const } : s));
    toast.success('✅ Session approved! Both parties can now sign.');
  };

  const markMissed = (sessionId: string) => {
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status: 'missed' as const } : s));
  };

  // Live session view
  if (liveSession) {
    const session = sessions.find(s => s.id === liveSession);
    const seeker = SEEKERS.find(s => s.id === session?.seeker_id);
    const prevSession = SESSIONS.filter(s => s.seeker_id === seeker?.id && s.status === 'completed').sort((a, b) => b.date.localeCompare(a.date))[0];
    const stage = JOURNEY_STAGES.find(j => j.key === (seeker?.journey_stage || 'awakening'));

    return (
      <div className="space-y-4">
        <div className="gradient-sacred rounded-2xl p-6 text-primary-foreground">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-primary-foreground/60">▶️ SESSION IN PROGRESS</p>
              <h1 className="text-xl font-bold">Session #{session?.session_number} — {seeker?.full_name}</h1>
              <p className="text-sm text-primary-foreground/80">{seeker?.course?.name}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-mono font-bold">{formatTimer(liveTimer)}</p>
              <p className="text-xs text-primary-foreground/60">{session?.duration_minutes} min planned</p>
            </div>
          </div>
        </div>

        {/* Session Prep */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <h3 className="font-semibold text-foreground text-sm mb-2">📋 SESSION PREP</h3>
          <div className="text-xs space-y-1 text-muted-foreground">
            {prevSession && <p>• Last session: #{prevSession.session_number} — {prevSession.topics_covered?.join(', ') || 'N/A'}</p>}
            {prevSession?.key_insights && <p>• Key insight: "{prevSession.key_insights}"</p>}
            <p>• Stage: {stage?.emoji} {stage?.name} ({stage?.sanskrit})</p>
            <p>• Streak: {seeker?.streak} days 🔥</p>
            <p>• Risk: {getRiskEmoji(calculateRiskScore(seeker!).level)} {calculateRiskScore(seeker!).level}</p>
          </div>
        </div>

        {/* Session Name */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <h3 className="font-semibold text-foreground text-sm mb-1">🏷️ Session Name</h3>
          <p className="text-xs text-muted-foreground mb-2">Give this session a meaningful title</p>
          <input value={postData.sessionName} onChange={e => setPostData(p => ({ ...p, sessionName: e.target.value }))} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="e.g., Leadership Breakthrough Session" />
        </div>

        {/* Pillar Focus */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <h3 className="font-semibold text-foreground text-sm mb-1">🙏 Pillar Focus</h3>
          <p className="text-xs text-muted-foreground mb-2">Dharma / Artha / Kama / Moksha / All</p>
          <div className="grid grid-cols-5 gap-2">
            {[
              { key: 'dharma', label: '🙏', desc: 'Dharma' },
              { key: 'artha', label: '💰', desc: 'Artha' },
              { key: 'kama', label: '❤️', desc: 'Kama' },
              { key: 'moksha', label: '🕉️', desc: 'Moksha' },
              { key: 'all', label: '✨', desc: 'All' },
            ].map(p => (
              <button key={p.key} onClick={() => setPostData(prev => ({ ...prev, pillar: p.key }))} className={`p-2 rounded-xl border text-center transition-all ${postData.pillar === p.key ? 'border-primary bg-primary/10 ring-2 ring-primary/20' : 'border-border hover:border-primary/30'}`}>
                <span className="text-lg block">{p.label}</span>
                <span className="text-[10px] text-muted-foreground">{p.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Topics Covered */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <h3 className="font-semibold text-foreground text-sm mb-1">📚 Topics Covered</h3>
          <p className="text-xs text-muted-foreground mb-2">Comma-separated list</p>
          <input value={postData.topics} onChange={e => setPostData(p => ({ ...p, topics: e.target.value }))} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="e.g., Delegation, Time management" />
        </div>

        {/* Quick Notes */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <h3 className="font-semibold text-foreground text-sm mb-1">📝 Quick Notes (auto-save)</h3>
          <textarea value={liveNotes} onChange={e => setLiveNotes(e.target.value)} className="w-full min-h-[120px] rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Type during session..." />
        </div>

        {/* Key Insights */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <h3 className="font-semibold text-foreground text-sm mb-1">💡 Key Insights</h3>
          <textarea value={postData.insights} onChange={e => setPostData(p => ({ ...p, insights: e.target.value }))} className="w-full min-h-[60px] rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Key takeaways from this session..." />
        </div>

        {/* Breakthroughs */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <h3 className="font-semibold text-foreground text-sm mb-1">🚀 Breakthroughs</h3>
          <textarea value={postData.breakthroughs} onChange={e => setPostData(p => ({ ...p, breakthroughs: e.target.value }))} className="w-full min-h-[60px] rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Any breakthrough moments?" />
        </div>

        {/* Challenges */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <h3 className="font-semibold text-foreground text-sm mb-1">⚠️ Challenges Discussed</h3>
          <textarea value={postData.challenges} onChange={e => setPostData(p => ({ ...p, challenges: e.target.value }))} className="w-full min-h-[60px] rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="What challenges came up?" />
        </div>

        {/* Therapy Given */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <h3 className="font-semibold text-foreground text-sm mb-1">🧘 Therapy / Technique Given</h3>
          <textarea value={postData.therapyGiven} onChange={e => setPostData(p => ({ ...p, therapyGiven: e.target.value }))} className="w-full min-h-[60px] rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="What therapy or technique was used?" />
        </div>

        {/* Stories Used */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <h3 className="font-semibold text-foreground text-sm mb-1">📖 Stories Used</h3>
          <p className="text-xs text-muted-foreground mb-2">Select stories shared during this session</p>
          <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
            {[
              "Ram's Exile", "Hanuman's Leap", "Sita's Strength", "Lakshman Rekha",
              "Arjuna's Dilemma", "Karna's Loyalty", "Krishna's Flute", "Eklavya's Dedication",
              "Vibhishan's Choice", "Ram's Bridge", "Draupadi's Courage", "Bhishma's Vow",
              "Shabari's Devotion", "Jatayu's Sacrifice", "Ahilya's Redemption", "Krishna's Vishwaroop"
            ].map(story => (
              <button key={story} onClick={() => setPostData(p => ({
                ...p,
                stories: p.stories.includes(story) ? p.stories.filter(s => s !== story) : [...p.stories, story],
              }))} className={`text-left p-1.5 rounded-lg text-xs border transition-all ${postData.stories.includes(story) ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/30'}`}>
                📖 {story}
              </button>
            ))}
          </div>
        </div>

        {/* Client Mood */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <h3 className="font-semibold text-foreground text-sm mb-1">😊 Client Mood</h3>
          <div className="flex gap-3">
            {['😊', '😐', '😔', '😰', '🔥', '😤'].map(m => (
              <button key={m} onClick={() => setPostData(p => ({ ...p, mood: m }))} className={`text-2xl p-2 rounded-lg border transition-all ${postData.mood === m ? 'border-primary bg-primary/10 scale-110' : 'border-border'}`}>{m}</button>
            ))}
          </div>
        </div>

        {/* Client's 3 Good Things */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <h3 className="font-semibold text-foreground text-sm mb-1">🌟 Client's 3 Good Things</h3>
          <div className="space-y-2 mt-2">
            {[0, 1, 2].map(i => (
              <input key={i} value={postData.clientGoodThings[i]} onChange={e => {
                const updated = [...postData.clientGoodThings];
                updated[i] = e.target.value;
                setPostData(p => ({ ...p, clientGoodThings: updated }));
              }} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder={`Good thing ${i + 1}...`} />
            ))}
          </div>
        </div>

        {/* Growth Across 4 Pillars */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <h3 className="font-semibold text-foreground text-sm mb-1">📈 Growth Across 4 Pillars</h3>
          <div className="grid grid-cols-1 gap-2 mt-2">
            {[
              { key: 'dharma', emoji: '🙏', label: 'Dharma' },
              { key: 'artha', emoji: '💰', label: 'Artha' },
              { key: 'kama', emoji: '❤️', label: 'Kama' },
              { key: 'moksha', emoji: '🕉️', label: 'Moksha' },
            ].map(pillar => (
              <div key={pillar.key} className="bg-muted/30 rounded-lg p-2">
                <label className="text-xs font-medium text-foreground">{pillar.emoji} {pillar.label}</label>
                <textarea value={postData.clientGrowth[pillar.key as keyof typeof postData.clientGrowth]} onChange={e => setPostData(p => ({ ...p, clientGrowth: { ...p.clientGrowth, [pillar.key]: e.target.value } }))} className="mt-1 w-full min-h-[36px] rounded-lg border border-input bg-background px-3 py-1.5 text-xs" placeholder={`Growth in ${pillar.label}...`} />
              </div>
            ))}
          </div>
        </div>

        {/* Major Win */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <h3 className="font-semibold text-foreground text-sm mb-1">🏆 Major Win This Week</h3>
          <textarea value={postData.majorWin} onChange={e => setPostData(p => ({ ...p, majorWin: e.target.value }))} className="w-full min-h-[60px] rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Their biggest achievement this week..." />
        </div>

        {/* Pending Assignments Review */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <h3 className="font-semibold text-foreground text-sm mb-1">📝 Last Week Pending Assignment Review</h3>
          <textarea value={postData.pendingAssignments} onChange={e => setPostData(p => ({ ...p, pendingAssignments: e.target.value }))} className="w-full min-h-[60px] rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Which assignments were completed? Which are pending?" />
        </div>

        {/* New Assignments */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <h3 className="font-semibold text-foreground text-sm mb-1">📋 New Assignments Given</h3>
          <textarea value={postData.assignments} onChange={e => setPostData(p => ({ ...p, assignments: e.target.value }))} className="w-full min-h-[60px] rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Enter one assignment per line" />
        </div>

        {/* Next Session Time */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <h3 className="font-semibold text-foreground text-sm mb-1">📅 Next Session Time</h3>
          <input value={postData.nextSessionTime} onChange={e => setPostData(p => ({ ...p, nextSessionTime: e.target.value }))} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="e.g., Thursday 10:00 AM" />
        </div>

        {/* Next Week Assignments */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <h3 className="font-semibold text-foreground text-sm mb-1">📋 Next Week Assignments</h3>
          <textarea value={postData.nextWeekAssignments} onChange={e => setPostData(p => ({ ...p, nextWeekAssignments: e.target.value }))} className="w-full min-h-[50px] rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Assignments for next week..." />
        </div>

        {/* Targets */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <h3 className="font-semibold text-foreground text-sm mb-1">🎯 Targets</h3>
          <textarea value={postData.targets} onChange={e => setPostData(p => ({ ...p, targets: e.target.value }))} className="w-full min-h-[50px] rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Targets for the coming week..." />
        </div>

        {/* Rewards */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <h3 className="font-semibold text-foreground text-sm mb-1">🏆 Rewards</h3>
          <textarea value={postData.rewards} onChange={e => setPostData(p => ({ ...p, rewards: e.target.value }))} className="w-full min-h-[50px] rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Rewards for achieving targets..." />
        </div>

        {/* Consequences */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <h3 className="font-semibold text-foreground text-sm mb-1">⚡ Consequences</h3>
          <textarea value={postData.punishments} onChange={e => setPostData(p => ({ ...p, punishments: e.target.value }))} className="w-full min-h-[50px] rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Consequences for missing targets..." />
        </div>

        {/* Engagement / Energy / Openness */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <h3 className="font-semibold text-foreground text-sm mb-2">📊 Client Assessment</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Engagement ({postData.engagement}/10)</p>
              <input type="range" min={1} max={10} value={postData.engagement} onChange={e => setPostData(p => ({ ...p, engagement: Number(e.target.value) }))} className="w-full accent-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Energy ({postData.energy}/10)</p>
              <input type="range" min={1} max={10} value={postData.energy} onChange={e => setPostData(p => ({ ...p, energy: Number(e.target.value) }))} className="w-full accent-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Openness ({postData.openness}/10)</p>
              <input type="range" min={1} max={10} value={postData.openness} onChange={e => setPostData(p => ({ ...p, openness: Number(e.target.value) }))} className="w-full accent-primary" />
            </div>
          </div>
        </div>

        {/* Private Notes */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <h3 className="font-semibold text-foreground text-sm mb-1">🔒 Private Notes (not visible to seeker)</h3>
          <textarea value={postData.privateNotes} onChange={e => setPostData(p => ({ ...p, privateNotes: e.target.value }))} className="w-full min-h-[60px] rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Your private observations..." />
        </div>

        {/* Actions */}
        <div className="flex gap-3 sticky bottom-0 bg-background py-3 border-t border-border">
          <button onClick={() => setTimerRunning(!timerRunning)} className="px-4 py-2 rounded-xl text-sm font-medium bg-warning-amber/10 text-warning-amber flex items-center gap-2">
            {timerRunning ? '⏸️ Pause' : '▶️ Resume'}
          </button>
          <button onClick={() => submitToSeeker(liveSession)} className="px-6 py-2 rounded-xl text-sm font-medium gradient-sacred text-primary-foreground flex items-center gap-2">
            📤 End & Submit to Seeker
          </button>
        </div>
      </div>
    );
  }

  // Flow status banner for submitted sessions
  const getFlowStatus = (status: string) => {
    const steps = [
      { key: 'in_progress', label: '🎙️ Session', done: ['submitted', 'reviewing', 'approved', 'completed'].includes(status) },
      { key: 'submitted', label: '📤 Sent to Seeker', done: ['reviewing', 'approved', 'completed'].includes(status) },
      { key: 'reviewing', label: '👁️ Seeker Accepted', done: ['approved', 'completed'].includes(status) },
      { key: 'approved', label: '✅ Coach Approved', done: ['completed'].includes(status) },
      { key: 'completed', label: '🏆 Signed & Certified', done: status === 'completed' },
    ];
    return steps;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Sessions</h1>
        <button onClick={() => setShowSchedule(true)} className="gradient-sacred text-primary-foreground px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2 hover:opacity-90">
          <Plus className="w-4 h-4" /> Schedule Session
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {s === 'all' ? 'All' : SESSION_STATUS_CONFIG[s]?.emoji + ' ' + SESSION_STATUS_CONFIG[s]?.label}
          </button>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border">
            <th className="text-left p-3 font-medium text-muted-foreground">Date/Time</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Seeker</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Course</th>
            <th className="text-left p-3 font-medium text-muted-foreground">#</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Type</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
          </tr></thead>
          <tbody>
            {filtered.map((session) => {
              const seeker = SEEKERS.find((s) => s.id === session.seeker_id);
              const course = COURSES.find((c) => c.id === session.course_id);
              const config = SESSION_STATUS_CONFIG[session.status] || { label: session.status, emoji: '', color: 'bg-muted text-muted-foreground' };
              const canStart = ['scheduled', 'confirmed'].includes(session.status);
              const canRemind = session.status === 'scheduled' && session.date >= new Date().toISOString().split('T')[0];

              return (
                <tr key={session.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="p-3">
                    <p className="font-medium text-foreground">{session.date}</p>
                    <p className="text-xs text-muted-foreground">{formatTime12(session.start_time)} - {formatTime12(session.end_time)}</p>
                  </td>
                  <td className="p-3 font-medium text-foreground">{seeker?.full_name}</td>
                  <td className="p-3 text-muted-foreground text-xs">{course?.name?.slice(0, 25)}</td>
                  <td className="p-3 text-foreground">#{session.session_number}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${config.color}`}>
                      {config.emoji} {config.label}
                    </span>
                    {['submitted', 'reviewing', 'approved'].includes(session.status) && (
                      <div className="flex gap-0.5 mt-1.5">
                        {getFlowStatus(session.status).map((step, i) => (
                          <div key={step.key} className={`h-1 flex-1 rounded-full ${step.done ? 'bg-dharma-green' : 'bg-muted'}`} title={step.label} />
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="p-3">{session.location_type === 'online' ? <Video className="w-4 h-4 text-sky-blue" /> : <MapPin className="w-4 h-4 text-dharma-green" />}</td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      {canStart && (
                        <button onClick={() => startSession(session.id)} className="px-2 py-1 rounded-lg text-[10px] font-medium gradient-sacred text-primary-foreground flex items-center gap-1">
                          <Play className="w-3 h-3" /> Start
                        </button>
                      )}
                      {canStart && (
                        <button onClick={() => markMissed(session.id)} className="px-2 py-1 rounded-lg text-[10px] font-medium bg-destructive/10 text-destructive flex items-center gap-1">
                          <X className="w-3 h-3" /> No-Show
                        </button>
                      )}
                      {canRemind && seeker && (
                        <button onClick={() => setReminder({ seeker, session })}
                          className="px-2 py-1 rounded-lg text-[10px] font-medium bg-sky-blue/10 text-sky-blue flex items-center gap-1">
                         <Bell className="w-3 h-3" /> Remind
                        </button>
                      )}
                      {['submitted', 'reviewing'].includes(session.status) && (
                        <button onClick={() => approveSession(session.id)} className="px-2 py-1 rounded-lg text-[10px] font-medium bg-dharma-green/10 text-dharma-green flex items-center gap-1">
                          <Check className="w-3 h-3" /> Approve
                        </button>
                      )}
                      {['completed', 'submitted', 'reviewing', 'approved', 'revision_requested'].includes(session.status) && (
                        <button onClick={() => navigate(`/sessions/${session.id}/review`)} className="px-2 py-1 rounded-lg text-[10px] font-medium bg-chakra-indigo/10 text-chakra-indigo flex items-center gap-1">
                          <Eye className="w-3 h-3" /> Review
                        </button>
                      )}
                      {session.status === 'approved' && (
                        <button onClick={() => navigate(`/sessions/${session.id}/certify`)} className="px-2 py-1 rounded-lg text-[10px] font-medium bg-primary/10 text-primary flex items-center gap-1">
                          <Shield className="w-3 h-3" /> Sign
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {reminder && (
        <SendReminderModal
          open={!!reminder}
          onClose={() => setReminder(null)}
          seekerName={reminder.seeker.full_name}
          seekerPhone={reminder.seeker.phone}
          seekerEmail={reminder.seeker.email}
          context="session"
          contextData={{
            sessionNumber: reminder.session.session_number,
            sessionDate: reminder.session.date,
            sessionTime: reminder.session.start_time,
          }}
        />
      )}

      <Dialog open={showSchedule} onOpenChange={setShowSchedule}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>📅 Schedule New Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {/* Template Selector */}
            {templates.length > 0 && (
              <div className="bg-muted/30 rounded-lg p-3 border border-dashed border-border">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" /> Apply Template
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={e => applyTemplate(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm"
                >
                  <option value="">No template (blank session)</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <p className="text-[10px] text-muted-foreground mt-1">Pre-fills assignments from the template</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-foreground">Seeker *</label>
              <select value={newSession.seeker_id} onChange={e => setNewSession(p => ({ ...p, seeker_id: e.target.value }))} className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm">
                <option value="">Select Seeker</option>
                {SEEKERS.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Course *</label>
              <select value={newSession.course_id} onChange={e => setNewSession(p => ({ ...p, course_id: e.target.value }))} className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm">
                <option value="">Select Course</option>
                {COURSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Date *</label>
              <input type="date" value={newSession.date} onChange={e => setNewSession(p => ({ ...p, date: e.target.value }))} className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-sm font-medium text-foreground">Start Time *</label>
                <input type="time" value={newSession.start_time} onChange={e => setNewSession(p => ({ ...p, start_time: e.target.value }))} className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-foreground">End Time *</label>
                <input type="time" value={newSession.end_time} onChange={e => setNewSession(p => ({ ...p, end_time: e.target.value }))} className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Session Type</label>
              <select value={newSession.session_type} onChange={e => setNewSession(p => ({ ...p, session_type: e.target.value as 'video' | 'in_person' }))} className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm">
                <option value="video">📹 Video Call</option>
                <option value="in_person">🏢 In Person</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Duration (min)</label>
              <input type="number" value={newSession.duration_minutes} onChange={e => setNewSession(p => ({ ...p, duration_minutes: Number(e.target.value) }))} className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Notes</label>
              <textarea value={newSession.notes} onChange={e => setNewSession(p => ({ ...p, notes: e.target.value }))} className="mt-1 w-full min-h-[60px] rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Optional notes..." />
            </div>
            <button
              onClick={() => {
                if (!newSession.seeker_id || !newSession.course_id || !newSession.date) {
                  toast.error('Please fill Seeker, Course and Date');
                  return;
                }
                const seeker = SEEKERS.find(s => s.id === newSession.seeker_id);
                const seekerSessions = sessions.filter(s => s.seeker_id === newSession.seeker_id);
                const nextNum = seekerSessions.length > 0 ? Math.max(...seekerSessions.map(s => s.session_number)) + 1 : 1;
                setSessions(prev => [...prev, {
                  id: `sess_${Date.now()}`,
                  seeker_id: newSession.seeker_id,
                  course_id: newSession.course_id,
                  session_number: nextNum,
                  date: newSession.date,
                  start_time: newSession.start_time,
                  end_time: newSession.end_time,
                  status: 'scheduled' as const,
                  session_type: newSession.session_type,
                  duration_minutes: newSession.duration_minutes,
                  location: newSession.session_type === 'video' ? 'Zoom' : 'Office',
                  location_type: newSession.session_type === 'video' ? 'online' as const : 'in_person' as const,
                  topics_covered: [],
                  key_insights: '',
                  session_notes: newSession.notes,
                  engagement_score: 0,
                  seeker_confirmed: false,
                }]);
                toast.success(`Session scheduled for ${seeker?.full_name}`);
                setShowSchedule(false);
                setNewSession({ seeker_id: '', course_id: '', date: '', start_time: '10:00', end_time: '11:00', session_type: 'video', duration_minutes: 60, notes: '' });
                setSelectedTemplateId('');
              }}
              className="w-full py-2.5 rounded-xl gradient-sacred text-primary-foreground font-medium text-sm"
            >
              Schedule Session
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SessionsPage;
