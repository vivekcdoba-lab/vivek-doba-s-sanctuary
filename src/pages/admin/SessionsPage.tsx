import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SESSIONS, SEEKERS, COURSES, formatTime12 } from '@/data/mockData';
import { JOURNEY_STAGES } from '@/types';
import { calculateRiskScore, getRiskEmoji } from '@/lib/riskEngine';
import { Plus, Video, MapPin, Bell, Play, X, RotateCcw, AlertTriangle, Check, Clock } from 'lucide-react';
import SendReminderModal from '@/components/SendReminderModal';

const SESSION_STATUS_CONFIG: Record<string, { label: string; emoji: string; color: string }> = {
  requested: { label: 'Requested', emoji: '📋', color: 'bg-muted text-muted-foreground' },
  scheduled: { label: 'Scheduled', emoji: '📅', color: 'bg-sky-blue/10 text-sky-blue' },
  confirmed: { label: 'Confirmed', emoji: '✅', color: 'bg-chakra-indigo/10 text-chakra-indigo' },
  in_progress: { label: 'In Progress', emoji: '▶️', color: 'bg-saffron/10 text-saffron animate-pulse' },
  completed: { label: 'Completed', emoji: '✅', color: 'bg-dharma-green/10 text-dharma-green' },
  missed: { label: 'Missed', emoji: '❌', color: 'bg-destructive/10 text-destructive' },
  rescheduled: { label: 'Rescheduled', emoji: '🔄', color: 'bg-warning-amber/10 text-warning-amber' },
  cancelled: { label: 'Cancelled', emoji: '🚫', color: 'bg-muted text-muted-foreground' },
};

const STATUS_FILTERS = ['all', 'scheduled', 'confirmed', 'in_progress', 'completed', 'missed', 'rescheduled', 'cancelled'];

const SessionsPage = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [sessions, setSessions] = useState(SESSIONS);
  const [reminder, setReminder] = useState<{ seeker: typeof SEEKERS[0]; session: typeof SESSIONS[0] } | null>(null);
  const [liveSession, setLiveSession] = useState<string | null>(null);
  const [liveNotes, setLiveNotes] = useState('');
  const [liveTimer, setLiveTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showPostSession, setShowPostSession] = useState<string | null>(null);
  const [postStep, setPostStep] = useState(1);
  const [postData, setPostData] = useState({
    topics: '',
    insights: '',
    breakthroughs: '',
    challenges: '',
    mood: '😊',
    engagement: 7,
    energy: 7,
    openness: 7,
    stories: [] as string[],
    assignments: '',
    privateNotes: '',
    focusNext: '',
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
    setPostData({ topics: '', insights: '', breakthroughs: '', challenges: '', mood: '😊', engagement: 7, energy: 7, openness: 7, stories: [], assignments: '', privateNotes: '', focusNext: '' });
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

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-card rounded-xl p-4 border border-border">
          <h2 className="text-lg font-bold text-foreground">Post-Session Notes — {seeker?.full_name}</h2>
          <p className="text-sm text-muted-foreground">Session #{session?.session_number} • Step {postStep} of 5</p>
          <div className="flex gap-1 mt-3">
            {[1, 2, 3, 4, 5].map(s => (
              <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= postStep ? 'bg-primary' : 'bg-muted'}`} />
            ))}
          </div>
        </div>

        {postStep === 1 && (
          <div className="bg-card rounded-xl p-5 border border-border space-y-4">
            <h3 className="font-semibold text-foreground">Step 1: Session Summary</h3>
            <div>
              <label className="text-sm font-medium text-foreground">Topics Covered (comma-separated)</label>
              <input value={postData.topics} onChange={e => setPostData(p => ({ ...p, topics: e.target.value }))} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="e.g., Delegation, Leadership mindset" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Key Insights</label>
              <textarea value={postData.insights || liveNotes} onChange={e => setPostData(p => ({ ...p, insights: e.target.value }))} className="mt-1 w-full min-h-[80px] rounded-lg border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Breakthroughs</label>
              <textarea value={postData.breakthroughs} onChange={e => setPostData(p => ({ ...p, breakthroughs: e.target.value }))} className="mt-1 w-full min-h-[60px] rounded-lg border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Challenges</label>
              <textarea value={postData.challenges} onChange={e => setPostData(p => ({ ...p, challenges: e.target.value }))} className="mt-1 w-full min-h-[60px] rounded-lg border border-input bg-background px-3 py-2 text-sm" />
            </div>
          </div>
        )}

        {postStep === 2 && (
          <div className="bg-card rounded-xl p-5 border border-border space-y-4">
            <h3 className="font-semibold text-foreground">Step 2: Seeker Assessment</h3>
            <div>
              <label className="text-sm font-medium text-foreground">Mood</label>
              <div className="flex gap-3 mt-2">
                {['😊', '😐', '😔', '😰'].map(m => (
                  <button key={m} onClick={() => setPostData(p => ({ ...p, mood: m }))} className={`text-2xl p-2 rounded-lg border ${postData.mood === m ? 'border-primary bg-primary/10' : 'border-border'}`}>{m}</button>
                ))}
              </div>
            </div>
            {[
              { key: 'engagement', label: 'Engagement' },
              { key: 'energy', label: 'Energy Level' },
              { key: 'openness', label: 'Openness to Change' },
            ].map(item => (
              <div key={item.key}>
                <label className="text-sm font-medium text-foreground">{item.label}: {postData[item.key as keyof typeof postData]}/10</label>
                <input type="range" min={1} max={10} value={postData[item.key as keyof typeof postData] as number} onChange={e => setPostData(p => ({ ...p, [item.key]: Number(e.target.value) }))} className="w-full accent-primary mt-1" />
              </div>
            ))}
          </div>
        )}

        {postStep === 3 && (
          <div className="bg-card rounded-xl p-5 border border-border space-y-4">
            <h3 className="font-semibold text-foreground">Step 3: Stories & Teaching Used</h3>
            <p className="text-xs text-muted-foreground">Select stories used during this session</p>
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
              {[
                "Ram's Exile", "Hanuman's Leap", "Sita's Strength", "Lakshman Rekha",
                "Arjuna's Dilemma", "Karna's Loyalty", "Krishna's Flute", "Eklavya's Dedication",
                "Vibhishan's Choice", "Ram's Bridge", "Draupadi's Courage", "Bhishma's Vow"
              ].map(story => (
                <button key={story} onClick={() => setPostData(p => ({
                  ...p,
                  stories: p.stories.includes(story) ? p.stories.filter(s => s !== story) : [...p.stories, story]
                }))} className={`text-left p-2 rounded-lg text-xs border ${postData.stories.includes(story) ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}>
                  📖 {story}
                </button>
              ))}
            </div>
          </div>
        )}

        {postStep === 4 && (
          <div className="bg-card rounded-xl p-5 border border-border space-y-4">
            <h3 className="font-semibold text-foreground">Step 4: Action Items & Next Steps</h3>
            <div>
              <label className="text-sm font-medium text-foreground">New Assignments (one per line)</label>
              <textarea value={postData.assignments} onChange={e => setPostData(p => ({ ...p, assignments: e.target.value }))} className="mt-1 w-full min-h-[80px] rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Vision Board v2&#10;Daily journaling for 7 days" />
            </div>
          </div>
        )}

        {postStep === 5 && (
          <div className="bg-card rounded-xl p-5 border border-border space-y-4">
            <h3 className="font-semibold text-foreground">Step 5: Coach's Private Reflection</h3>
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
          {postStep < 5 ? (
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
        <button className="gradient-sacred text-primary-foreground px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2 hover:opacity-90">
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
    </div>
  );
};

export default SessionsPage;
