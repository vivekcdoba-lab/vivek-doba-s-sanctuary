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

const SessionsPage = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [sessions, setSessions] = useState(SESSIONS);
  const [reminder, setReminder] = useState<{ seeker: typeof SEEKERS[0]; session: typeof SESSIONS[0] } | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [newSession, setNewSession] = useState({
    seeker_id: '', course_id: '', date: '', start_time: '10:00', end_time: '11:00',
    session_type: 'video' as 'video' | 'in_person', duration_minutes: 60, notes: '',
  });
  const [liveSession, setLiveSession] = useState<string | null>(null);
  const [liveNotes, setLiveNotes] = useState('');
  const [liveTimer, setLiveTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showPostSession, setShowPostSession] = useState<string | null>(null);
  const [postStep, setPostStep] = useState(1);
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

  const filtered = sessions.filter(s => statusFilter === 'all' || s.status === statusFilter)
    .sort((a, b) => b.date.localeCompare(a.date) || b.start_time.localeCompare(a.start_time));

  const isTomorrow = (dateStr: string) => {
    const d = new Date(dateStr);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return d.toDateString() === tomorrow.toDateString();
  };

  // Timer effect
  useState(() => {
    if (timerRunning) {
      const interval = setInterval(() => setLiveTimer(t => t + 1), 1000);
      return () => clearInterval(interval);
    }
  });

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

  const endSession = (sessionId: string) => {
    setTimerRunning(false);
    setLiveSession(null);
    setShowPostSession(sessionId);
    setPostStep(1);
  };

  const completeSession = (sessionId: string) => {
    setSessions(prev => prev.map(s => s.id === sessionId ? {
      ...s,
      status: 'completed' as const,
      topics_covered: postData.topics.split(',').map(t => t.trim()).filter(Boolean),
      key_insights: postData.insights,
      session_notes: liveNotes,
      engagement_score: postData.engagement,
    } : s));
    setShowPostSession(null);
    setPostData({ sessionName: '', pillar: 'all', topics: '', insights: '', breakthroughs: '', challenges: '', therapyGiven: '', mood: '😊', engagement: 7, energy: 7, openness: 7, stories: [], clientGoodThings: ['', '', ''], clientGrowth: { dharma: '', artha: '', kama: '', moksha: '' }, majorWin: '', assignments: '', pendingAssignments: '', privateNotes: '', focusNext: '', nextSessionTime: '', nextWeekAssignments: '', punishments: '', rewards: '', targets: '' });
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

        {/* Quick Notes */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <h3 className="font-semibold text-foreground text-sm mb-2">📝 QUICK NOTES (auto-save)</h3>
          <textarea
            value={liveNotes}
            onChange={e => setLiveNotes(e.target.value)}
            className="w-full min-h-[200px] rounded-lg border border-input bg-background px-3 py-2 text-sm"
            placeholder="Type during session..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={() => setTimerRunning(!timerRunning)} className="px-4 py-2 rounded-xl text-sm font-medium bg-warning-amber/10 text-warning-amber flex items-center gap-2">
            {timerRunning ? '⏸️ Pause' : '▶️ Resume'}
          </button>
          <button onClick={() => endSession(liveSession)} className="px-4 py-2 rounded-xl text-sm font-medium bg-destructive/10 text-destructive flex items-center gap-2">
            ⏹️ End Session
          </button>
        </div>
      </div>
    );
  }

  // Post-session wizard
  if (showPostSession) {
    const session = sessions.find(s => s.id === showPostSession);
    const seeker = SEEKERS.find(s => s.id === session?.seeker_id);
    const TOTAL_STEPS = 8;
    const STEP_LABELS = ['Session Identity', 'Session Summary', 'Client Assessment', 'Client Growth & Wins', 'Stories & Therapy', 'Assignments', 'Next Week Plan', 'Coach Reflection'];

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-card rounded-xl p-4 border border-border">
          <h2 className="text-lg font-bold text-foreground">Post-Session Notes — {seeker?.full_name}</h2>
          <p className="text-sm text-muted-foreground">Session #{session?.session_number} • Step {postStep} of {TOTAL_STEPS}: {STEP_LABELS[postStep - 1]}</p>
          <div className="flex gap-1 mt-3">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map(s => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= postStep ? 'bg-primary' : 'bg-muted'}`} />
            ))}
          </div>
        </div>

        {/* Step 1: Session Identity */}
        {postStep === 1 && (
          <div className="bg-card rounded-xl p-5 border border-border space-y-4">
            <h3 className="font-semibold text-foreground">🏷️ Step 1: Session Identity</h3>
            <div>
              <label className="text-sm font-medium text-foreground">Session Name *</label>
              <input value={postData.sessionName} onChange={e => setPostData(p => ({ ...p, sessionName: e.target.value }))} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="e.g., Leadership Breakthrough Session" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Pillar Focus</label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {[
                  { key: 'dharma', label: '🙏 Dharma', desc: 'Purpose & Duty' },
                  { key: 'artha', label: '💰 Artha', desc: 'Wealth & Career' },
                  { key: 'kama', label: '❤️ Kama', desc: 'Desires & Joy' },
                  { key: 'moksha', label: '🕉️ Moksha', desc: 'Liberation & Growth' },
                  { key: 'all', label: '✨ All', desc: 'Holistic' },
                ].map(p => (
                  <button key={p.key} onClick={() => setPostData(prev => ({ ...prev, pillar: p.key }))} className={`p-3 rounded-xl border text-center transition-all ${postData.pillar === p.key ? 'border-primary bg-primary/10 ring-2 ring-primary/20' : 'border-border hover:border-primary/30'}`}>
                    <span className="text-lg block">{p.label.split(' ')[0]}</span>
                    <span className="text-[10px] text-muted-foreground block mt-1">{p.desc}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Topics Covered (comma-separated)</label>
              <input value={postData.topics} onChange={e => setPostData(p => ({ ...p, topics: e.target.value }))} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="e.g., Delegation, Leadership mindset, Time management" />
            </div>
          </div>
        )}

        {/* Step 2: Session Summary */}
        {postStep === 2 && (
          <div className="bg-card rounded-xl p-5 border border-border space-y-4">
            <h3 className="font-semibold text-foreground">📝 Step 2: Session Summary</h3>
            <div>
              <label className="text-sm font-medium text-foreground">Key Insights</label>
              <textarea value={postData.insights || liveNotes} onChange={e => setPostData(p => ({ ...p, insights: e.target.value }))} className="mt-1 w-full min-h-[80px] rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="What were the key takeaways?" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Breakthroughs</label>
              <textarea value={postData.breakthroughs} onChange={e => setPostData(p => ({ ...p, breakthroughs: e.target.value }))} className="mt-1 w-full min-h-[60px] rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Any breakthrough moments?" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Challenges Discussed</label>
              <textarea value={postData.challenges} onChange={e => setPostData(p => ({ ...p, challenges: e.target.value }))} className="mt-1 w-full min-h-[60px] rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="What challenges came up?" />
            </div>
          </div>
        )}

        {/* Step 3: Client Assessment */}
        {postStep === 3 && (
          <div className="bg-card rounded-xl p-5 border border-border space-y-4">
            <h3 className="font-semibold text-foreground">📊 Step 3: Client Assessment</h3>
            <div>
              <label className="text-sm font-medium text-foreground">Mood</label>
              <div className="flex gap-3 mt-2">
                {['😊', '😐', '😔', '😰', '🔥', '😤'].map(m => (
                  <button key={m} onClick={() => setPostData(p => ({ ...p, mood: m }))} className={`text-2xl p-2 rounded-lg border transition-all ${postData.mood === m ? 'border-primary bg-primary/10 scale-110' : 'border-border'}`}>{m}</button>
                ))}
              </div>
            </div>
            {[
              { key: 'engagement', label: 'Engagement' },
              { key: 'energy', label: 'Energy Level' },
              { key: 'openness', label: 'Openness to Change' },
            ].map(item => (
              <div key={item.key}>
                <label className="text-sm font-medium text-foreground">{item.label}: {(postData as any)[item.key]}/10</label>
                <input type="range" min={1} max={10} value={(postData as any)[item.key] as number} onChange={e => setPostData(p => ({ ...p, [item.key]: Number(e.target.value) }))} className="w-full accent-primary mt-1" />
              </div>
            ))}
          </div>
        )}

        {/* Step 4: Client Growth & Wins */}
        {postStep === 4 && (
          <div className="bg-card rounded-xl p-5 border border-border space-y-4">
            <h3 className="font-semibold text-foreground">🌱 Step 4: Client Growth & Wins</h3>
            <div>
              <label className="text-sm font-medium text-foreground">🏆 One Major Win / Success This Week</label>
              <textarea value={postData.majorWin} onChange={e => setPostData(p => ({ ...p, majorWin: e.target.value }))} className="mt-1 w-full min-h-[60px] rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="What was their biggest win or success recently?" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">🌟 Client's 3 Good Things</label>
              {[0, 1, 2].map(i => (
                <input key={i} value={postData.clientGoodThings[i]} onChange={e => {
                  const updated = [...postData.clientGoodThings];
                  updated[i] = e.target.value;
                  setPostData(p => ({ ...p, clientGoodThings: updated }));
                }} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder={`Good thing ${i + 1}...`} />
              ))}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">📈 Growth Across 4 Pillars</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'dharma', emoji: '🙏', label: 'Dharma (Purpose)' },
                  { key: 'artha', emoji: '💰', label: 'Artha (Wealth)' },
                  { key: 'kama', emoji: '❤️', label: 'Kama (Desire)' },
                  { key: 'moksha', emoji: '🕉️', label: 'Moksha (Liberation)' },
                ].map(pillar => (
                  <div key={pillar.key}>
                    <label className="text-xs text-muted-foreground">{pillar.emoji} {pillar.label}</label>
                    <textarea value={postData.clientGrowth[pillar.key as keyof typeof postData.clientGrowth]} onChange={e => setPostData(p => ({ ...p, clientGrowth: { ...p.clientGrowth, [pillar.key]: e.target.value } }))} className="mt-1 w-full min-h-[50px] rounded-lg border border-input bg-background px-3 py-2 text-xs" placeholder={`Update on ${pillar.label}...`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Stories & Therapy */}
        {postStep === 5 && (
          <div className="bg-card rounded-xl p-5 border border-border space-y-4">
            <h3 className="font-semibold text-foreground">📖 Step 5: Stories & Therapy</h3>
            <div>
              <label className="text-sm font-medium text-foreground">Therapy Given</label>
              <textarea value={postData.therapyGiven} onChange={e => setPostData(p => ({ ...p, therapyGiven: e.target.value }))} className="mt-1 w-full min-h-[80px] rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="What therapy or technique was used?" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Stories Used</label>
              <p className="text-xs text-muted-foreground mb-2">Select stories used during this session</p>
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                {[
                  "Ram's Exile", "Hanuman's Leap", "Sita's Strength", "Lakshman Rekha",
                  "Arjuna's Dilemma", "Karna's Loyalty", "Krishna's Flute", "Eklavya's Dedication",
                  "Vibhishan's Choice", "Ram's Bridge", "Draupadi's Courage", "Bhishma's Vow",
                  "Shabari's Devotion", "Jatayu's Sacrifice", "Ahilya's Redemption", "Krishna's Vishwaroop"
                ].map(story => (
                  <button key={story} onClick={() => setPostData(p => ({
                    ...p,
                    stories: p.stories.includes(story) ? p.stories.filter(s => s !== story) : [...p.stories, story]
                  }))} className={`text-left p-2 rounded-lg text-xs border transition-all ${postData.stories.includes(story) ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/30'}`}>
                    📖 {story}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Assignments */}
        {postStep === 6 && (
          <div className="bg-card rounded-xl p-5 border border-border space-y-4">
            <h3 className="font-semibold text-foreground">📋 Step 6: Assignments</h3>
            <div>
              <label className="text-sm font-medium text-foreground">New Assignments Given (one per line)</label>
              <textarea value={postData.assignments} onChange={e => setPostData(p => ({ ...p, assignments: e.target.value }))} className="mt-1 w-full min-h-[80px] rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Vision Board v2&#10;Daily journaling for 7 days&#10;Read Chapter 5" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Last Week Pending Assignments Review</label>
              <textarea value={postData.pendingAssignments} onChange={e => setPostData(p => ({ ...p, pendingAssignments: e.target.value }))} className="mt-1 w-full min-h-[80px] rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Which assignments were completed? Which are pending? Why?" />
            </div>
          </div>
        )}

        {/* Step 7: Next Week Plan */}
        {postStep === 7 && (
          <div className="bg-card rounded-xl p-5 border border-border space-y-4">
            <h3 className="font-semibold text-foreground">📅 Step 7: Next Week Plan</h3>
            <div>
              <label className="text-sm font-medium text-foreground">Next Session Time</label>
              <input value={postData.nextSessionTime} onChange={e => setPostData(p => ({ ...p, nextSessionTime: e.target.value }))} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="e.g., Thursday 10:00 AM" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Next Week Assignments</label>
              <textarea value={postData.nextWeekAssignments} onChange={e => setPostData(p => ({ ...p, nextWeekAssignments: e.target.value }))} className="mt-1 w-full min-h-[60px] rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Assignments for next week..." />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">🎯 Targets</label>
              <textarea value={postData.targets} onChange={e => setPostData(p => ({ ...p, targets: e.target.value }))} className="mt-1 w-full min-h-[60px] rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Targets for the coming week..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground">🏆 Rewards</label>
                <textarea value={postData.rewards} onChange={e => setPostData(p => ({ ...p, rewards: e.target.value }))} className="mt-1 w-full min-h-[50px] rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Rewards for achieving targets..." />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">⚡ Punishments</label>
                <textarea value={postData.punishments} onChange={e => setPostData(p => ({ ...p, punishments: e.target.value }))} className="mt-1 w-full min-h-[50px] rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Consequences for missing targets..." />
              </div>
            </div>
          </div>
        )}

        {/* Step 8: Coach Reflection */}
        {postStep === 8 && (
          <div className="bg-card rounded-xl p-5 border border-border space-y-4">
            <h3 className="font-semibold text-foreground">🔒 Step 8: Coach's Private Reflection</h3>
            <div>
              <label className="text-sm font-medium text-foreground">Private Notes (only you can see)</label>
              <textarea value={postData.privateNotes} onChange={e => setPostData(p => ({ ...p, privateNotes: e.target.value }))} className="mt-1 w-full min-h-[80px] rounded-lg border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">What to focus on next session?</label>
              <textarea value={postData.focusNext} onChange={e => setPostData(p => ({ ...p, focusNext: e.target.value }))} className="mt-1 w-full min-h-[60px] rounded-lg border border-input bg-background px-3 py-2 text-sm" />
            </div>
          </div>
        )}

        <div className="flex justify-between">
          <button onClick={() => postStep > 1 ? setPostStep(postStep - 1) : setShowPostSession(null)} className="px-4 py-2 rounded-xl text-sm font-medium border border-border text-foreground">
            {postStep === 1 ? 'Cancel' : '← Back'}
          </button>
          {postStep < TOTAL_STEPS ? (
            <button onClick={() => setPostStep(postStep + 1)} className="px-4 py-2 rounded-xl text-sm font-medium gradient-sacred text-primary-foreground">
              Next →
            </button>
          ) : (
            <button onClick={() => completeSession(showPostSession)} className="px-4 py-2 rounded-xl text-sm font-medium gradient-chakravartin text-primary-foreground">
              💾 Save & Complete Session
            </button>
          )}
        </div>
      </div>
    );
  }

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
                      {['completed', 'submitted', 'reviewing', 'approved', 'revision_requested'].includes(session.status) && (
                        <button onClick={() => navigate(`/sessions/${session.id}/review`)} className="px-2 py-1 rounded-lg text-[10px] font-medium bg-chakra-indigo/10 text-chakra-indigo flex items-center gap-1">
                          <Eye className="w-3 h-3" /> Review
                        </button>
                      )}
                      {session.status === 'completed' && (
                        <button onClick={() => navigate(`/sessions/${session.id}/certify`)} className="px-2 py-1 rounded-lg text-[10px] font-medium bg-primary/10 text-primary flex items-center gap-1">
                          <Shield className="w-3 h-3" /> Certify
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
