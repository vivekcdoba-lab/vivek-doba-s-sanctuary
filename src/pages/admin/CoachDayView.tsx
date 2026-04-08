import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSeekerProfiles } from '@/hooks/useSeekerProfiles';
import { useDbSessions } from '@/hooks/useDbSessions';
import { useDbAssignments } from '@/hooks/useDbAssignments';
import { useDbFollowUps } from '@/hooks/useDbFollowUps';
import { usePayments } from '@/hooks/usePayments';
import { Play, Phone, MessageSquare, Bell, CheckCircle2, AlertTriangle, Clock, Calendar, Loader2 } from 'lucide-react';

const formatTime12 = (t: string) => { if (!t) return ''; const [h, m] = t.split(':').map(Number); return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`; };
const formatINR = (n: number) => `₹${n.toLocaleString('en-IN')}`;
const getGreeting = () => { const h = new Date().getHours(); if (h < 5) return '🌙 Shubh Ratri'; if (h < 12) return '🙏 Shubh Prabhat'; if (h < 17) return '☀️ Shubh Dopahar'; return '🌅 Shubh Sandhya'; };

const CoachDayView = () => {
  const { data: seekers = [], isLoading: sl } = useSeekerProfiles();
  const { data: allSessions = [], isLoading: ssl } = useDbSessions();
  const { data: allAssignments = [] } = useDbAssignments();
  const { data: followUps = [] } = useDbFollowUps();
  const { payments } = usePayments();

  const [sadhana, setSadhana] = useState({ meditation: false, prep: true, reflection: false });
  const [energy, setEnergy] = useState(7);

  if (sl || ssl) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const today = new Date().toISOString().split('T')[0];
  const todaySessions = allSessions.filter(s => s.date === today).sort((a, b) => a.start_time.localeCompare(b.start_time));
  const overdueFollowUps = followUps.filter(f => f.status === 'overdue' || (f.status === 'pending' && f.due_date <= today));
  const overdueAssignments = allAssignments.filter(a => a.status === 'overdue');
  const pendingPayments = payments.filter(p => p.status === 'pending' || p.status === 'overdue');
  const activeSeekers = seekers.length;

  const seekerMap = new Map(seekers.map(s => [s.id, s]));

  const actionItems = [
    ...overdueAssignments.slice(0, 3).map(a => {
      const seeker = seekerMap.get(a.seeker_id);
      return { text: `Review ${seeker?.full_name || 'Unknown'}'s assignment: "${a.title}"`, urgent: true };
    }),
    ...overdueFollowUps.slice(0, 3).map(f => {
      const seeker = seekerMap.get(f.seeker_id);
      return { text: `Follow-up ${f.type} with ${seeker?.full_name || 'Unknown'}`, urgent: f.status === 'overdue' };
    }),
    ...pendingPayments.slice(0, 2).map(p => {
      const seeker = seekerMap.get(p.seeker_id);
      return { text: `Record payment ${formatINR(Number(p.total_amount))} from ${seeker?.full_name || 'Unknown'}`, urgent: false };
    }),
  ];

  const thisMonthRevenue = payments
    .filter(p => p.status === 'received' && p.payment_date?.startsWith(today.slice(0, 7)))
    .reduce((s, p) => s + Number(p.total_amount), 0);

  return (
    <div className="space-y-6 stagger-children">
      {/* Header */}
      <div className="gradient-hero rounded-2xl p-6 text-primary-foreground relative overflow-hidden">
        <div className="absolute top-2 right-6 text-5xl opacity-10">🙏</div>
        <h1 className="text-2xl font-bold">{getGreeting()}, Coach</h1>
        <p className="text-primary-foreground/70 mt-1">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <p className="text-sm text-primary-foreground/80 mt-2">
          You have <strong>{todaySessions.length} sessions</strong> today | <strong>{overdueFollowUps.length} follow-ups</strong> due
        </p>
      </div>

      {/* Today's Sessions */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" /> Today's Sessions
        </h2>
        {todaySessions.length > 0 ? (
          <div className="space-y-4">
            {todaySessions.map((session) => {
              const seeker = seekerMap.get(session.seeker_id);
              if (!seeker) return null;
              const prevSession = allSessions.filter(s => s.seeker_id === seeker.id && (s.status === 'completed' || s.status === 'approved')).sort((a, b) => b.date.localeCompare(a.date))[0];
              const pendingAssignmentCount = allAssignments.filter(a => a.seeker_id === seeker.id && ['assigned', 'submitted'].includes(a.status)).length;

              return (
                <div key={session.id} className="bg-card rounded-xl p-5 shadow-sm border border-border">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-foreground">{formatTime12(session.start_time)}</span>
                        <span className="text-muted-foreground">—</span>
                        <span className="text-sm text-muted-foreground">{formatTime12(session.end_time)}</span>
                      </div>
                      <Link to={`/seekers/${seeker.id}`} className="text-lg font-semibold text-foreground hover:text-primary mt-1 block">
                        {seeker.full_name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        Session #{session.session_number} — {session.duration_minutes || 60} min
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      session.status === 'confirmed' ? 'bg-chakra-indigo/10 text-chakra-indigo' : 'bg-warning-amber/10 text-warning-amber'
                    }`}>
                      {session.status === 'confirmed' ? '✅ Confirmed' : '📅 ' + session.status}
                    </span>
                  </div>

                  {/* Prep Notes */}
                  <div className="bg-muted/50 rounded-lg p-3 mb-3 text-xs space-y-1">
                    <p className="font-semibold text-foreground text-xs mb-1">📋 PREP NOTES:</p>
                    {prevSession && (
                      <p className="text-muted-foreground">• Last session: #{prevSession.session_number} on {prevSession.date} — {Array.isArray(prevSession.topics_covered) ? (prevSession.topics_covered as string[]).join(', ') : 'No topics recorded'}</p>
                    )}
                    {prevSession?.key_insights && <p className="text-muted-foreground">• Key insight: "{prevSession.key_insights}"</p>}
                    <p className="text-muted-foreground">• Pending assignments: {pendingAssignmentCount}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap">
                    <Link to={`/sessions?start=${session.id}`} className="px-3 py-1.5 rounded-lg text-xs font-medium gradient-sacred text-primary-foreground flex items-center gap-1">
                      <Play className="w-3 h-3" /> Start Session
                    </Link>
                    {seeker.phone && (
                      <>
                        <a href={`tel:${seeker.phone}`} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-dharma-green/10 text-dharma-green flex items-center gap-1">
                          <Phone className="w-3 h-3" /> Call
                        </a>
                        <a href={`https://wa.me/91${seeker.phone}`} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg text-xs font-medium bg-dharma-green/10 text-dharma-green flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" /> WhatsApp
                        </a>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-card rounded-xl p-8 text-center border border-border">
            <span className="text-4xl block mb-2">🧘</span>
            <p className="text-muted-foreground">No sessions scheduled today</p>
          </div>
        )}
      </div>

      {/* Action Items */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-primary" /> Today's Action Items
        </h2>
        <div className="bg-card rounded-xl p-4 border border-border space-y-2">
          {actionItems.length > 0 ? actionItems.map((item, i) => (
            <div key={i} className={`flex items-center gap-3 p-2.5 rounded-lg ${item.urgent ? 'bg-destructive/5 border-l-[3px] border-destructive' : 'bg-muted/30'}`}>
              <input type="checkbox" className="rounded border-input" />
              <p className="text-sm text-foreground flex-1">{item.text}</p>
              {item.urgent && <span className="text-[10px] bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">Urgent</span>}
            </div>
          )) : (
            <p className="text-sm text-muted-foreground text-center py-4">All caught up! 🎉</p>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Sessions Today', value: todaySessions.length, emoji: '📅' },
          { label: 'Pending Follow-ups', value: overdueFollowUps.length, emoji: '📞' },
          { label: 'Overdue Assignments', value: overdueAssignments.length, emoji: '⚠️' },
          { label: 'Active Seekers', value: activeSeekers, emoji: '👥' },
          { label: 'This Month Revenue', value: formatINR(thisMonthRevenue), emoji: '💰' },
        ].map(stat => (
          <div key={stat.label} className="bg-card rounded-xl p-4 border border-border text-center">
            <span className="text-xl">{stat.emoji}</span>
            <p className="text-xl font-bold text-foreground mt-1">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Coach's Sadhana */}
      <div className="bg-card rounded-xl p-5 border-2 border-primary/20">
        <h3 className="font-semibold text-foreground mb-3">✨ Your Practice Today</h3>
        <div className="space-y-2 mb-4">
          {[
            { key: 'meditation', label: 'Morning Meditation' },
            { key: 'prep', label: 'Session Preparation' },
            { key: 'reflection', label: 'Evening Reflection' },
          ].map(item => (
            <label key={item.key} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={sadhana[item.key as keyof typeof sadhana]} onChange={() => setSadhana(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof sadhana] }))} className="rounded border-input w-4 h-4" />
              <span className={`text-sm ${sadhana[item.key as keyof typeof sadhana] ? 'text-dharma-green line-through' : 'text-foreground'}`}>{item.label}</span>
            </label>
          ))}
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Energy Level Today: {energy}/10</p>
          <input type="range" min={1} max={10} value={energy} onChange={e => setEnergy(Number(e.target.value))} className="w-full accent-primary" />
          {energy < 5 && <p className="text-xs text-warning-amber mt-1">⚠️ Low energy — consider lighter sessions or rescheduling non-urgent ones</p>}
        </div>
      </div>
    </div>
  );
};

export default CoachDayView;
