import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { SEEKERS, SESSIONS, ASSIGNMENTS, FOLLOW_UPS, PAYMENTS, formatINR, getGreeting, formatTime12 } from '@/data/mockData';
import { calculateRiskScore, getRiskEmoji } from '@/lib/riskEngine';
import { JOURNEY_STAGES } from '@/types';
import { Play, Phone, MessageSquare, RotateCcw, Bell, CheckCircle2, AlertTriangle, Clock, Calendar, ChevronRight } from 'lucide-react';

const today = '2025-03-31';

const CoachDayView = () => {
  const todaySessions = SESSIONS.filter(s => s.date === today).sort((a, b) => a.start_time.localeCompare(b.start_time));
  const overdueFollowUps = FOLLOW_UPS.filter(f => f.status === 'overdue' || (f.status === 'pending' && f.due_date <= today));
  const overdueAssignments = ASSIGNMENTS.filter(a => a.status === 'overdue');
  const pendingPayments = PAYMENTS.filter(p => p.status === 'pending' || p.status === 'overdue');

  const atRiskSeekers = SEEKERS
    .filter(s => s.enrollment?.status === 'active')
    .map(s => ({ ...s, risk: calculateRiskScore(s) }))
    .filter(s => s.risk.level === 'high' || s.risk.level === 'critical')
    .sort((a, b) => b.risk.score - a.risk.score);

  const [sadhana, setSadhana] = useState({ meditation: false, prep: true, reflection: false });
  const [energy, setEnergy] = useState(7);

  const actionItems = [
    ...overdueAssignments.slice(0, 3).map(a => {
      const seeker = SEEKERS.find(s => s.id === a.seeker_id);
      return { text: `Review ${seeker?.full_name}'s submitted assignment: "${a.title}"`, urgent: true };
    }),
    ...overdueFollowUps.slice(0, 3).map(f => {
      const seeker = SEEKERS.find(s => s.id === f.seeker_id);
      return { text: `Follow-up ${f.type} with ${seeker?.full_name}`, urgent: f.status === 'overdue' };
    }),
    ...pendingPayments.slice(0, 2).map(p => {
      const seeker = SEEKERS.find(s => s.id === p.seeker_id);
      return { text: `Record payment ${formatINR(p.total_amount)} from ${seeker?.full_name}`, urgent: false };
    }),
  ];

  return (
    <div className="space-y-6 stagger-children">
      {/* Header */}
      <div className="gradient-hero rounded-2xl p-6 text-primary-foreground relative overflow-hidden">
        <div className="absolute top-2 right-6 text-5xl opacity-10">🙏</div>
        <h1 className="text-2xl font-bold">{getGreeting()}, Vivek Sir</h1>
        <p className="text-primary-foreground/70 mt-1">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <p className="text-sm text-primary-foreground/80 mt-2">
          You have <strong>{todaySessions.length} sessions</strong> today | <strong>{overdueFollowUps.length} follow-ups</strong> due | <strong>{atRiskSeekers.length} seekers</strong> need attention
        </p>
      </div>

      {/* Today's Sessions Timeline */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" /> Today's Sessions
        </h2>
        {todaySessions.length > 0 ? (
          <div className="space-y-4 relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border hidden md:block" />
            {todaySessions.map((session) => {
              const seeker = SEEKERS.find(s => s.id === session.seeker_id);
              if (!seeker) return null;
              const risk = calculateRiskScore(seeker);
              const stage = JOURNEY_STAGES.find(j => j.key === (seeker.journey_stage || 'awakening'));
              const prevSession = SESSIONS.filter(s => s.seeker_id === seeker.id && s.status === 'completed').sort((a, b) => b.date.localeCompare(a.date))[0];
              const isConfirmed = session.status === 'confirmed';

              return (
                <div key={session.id} className="md:ml-12 relative">
                  <div className="hidden md:flex absolute -left-12 top-4 w-8 h-8 rounded-full bg-primary text-primary-foreground text-xs font-bold items-center justify-center z-10">
                    {formatTime12(session.start_time).split(':')[0]}
                  </div>
                  <div className={`bg-card rounded-xl p-5 shadow-sm border ${!isConfirmed && session.status === 'scheduled' ? 'border-warning-amber/50' : 'border-border'}`}>
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
                          Session #{session.session_number} — {seeker.course?.name?.split('—')[0]} — {session.duration_minutes} min
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          isConfirmed ? 'bg-chakra-indigo/10 text-chakra-indigo' : 'bg-warning-amber/10 text-warning-amber'
                        }`}>
                          {isConfirmed ? '✅ Confirmed' : '📅 Not confirmed'}
                        </span>
                        <div className="flex items-center gap-1 justify-end text-xs">
                          <span>{stage?.emoji}</span>
                          <span className="text-muted-foreground">{stage?.name}</span>
                        </div>
                        <div className="flex items-center gap-1 justify-end text-xs">
                          <span>{getRiskEmoji(risk.level)}</span>
                          <span className="text-muted-foreground">Streak: {seeker.streak}🔥</span>
                        </div>
                      </div>
                    </div>

                    {/* Prep Notes */}
                    <div className="bg-muted/50 rounded-lg p-3 mb-3 text-xs space-y-1">
                      <p className="font-semibold text-foreground text-xs mb-1">📋 PREP NOTES:</p>
                      {prevSession && (
                        <p className="text-muted-foreground">• Last session: #{prevSession.session_number} on {prevSession.date} — {prevSession.topics_covered?.join(', ') || 'No topics recorded'}</p>
                      )}
                      {prevSession?.key_insights && <p className="text-muted-foreground">• Key insight: "{prevSession.key_insights}"</p>}
                      <p className="text-muted-foreground">• Pending assignments: {ASSIGNMENTS.filter(a => a.seeker_id === seeker.id && ['assigned', 'submitted'].includes(a.status)).length}</p>
                      <p className="text-muted-foreground">• Daily log streak: {seeker.streak} days</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap">
                      <Link to={`/sessions?start=${session.id}`} className="px-3 py-1.5 rounded-lg text-xs font-medium gradient-sacred text-primary-foreground flex items-center gap-1">
                        <Play className="w-3 h-3" /> Start Session
                      </Link>
                      {!isConfirmed && (
                        <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-warning-amber/10 text-warning-amber flex items-center gap-1">
                          <Bell className="w-3 h-3" /> Send Confirmation
                        </button>
                      )}
                      <a href={`tel:${seeker.phone}`} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-dharma-green/10 text-dharma-green flex items-center gap-1">
                        <Phone className="w-3 h-3" /> Call
                      </a>
                      <a href={`https://wa.me/91${seeker.phone}`} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg text-xs font-medium bg-dharma-green/10 text-dharma-green flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" /> WhatsApp
                      </a>
                    </div>
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

      {/* At-Risk Seekers */}
      {atRiskSeekers.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" /> At-Risk Seekers
          </h2>
          <div className="space-y-3">
            {atRiskSeekers.map(seeker => (
              <div key={seeker.id} className="bg-card rounded-xl p-4 border-2 border-destructive/30 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <Link to={`/seekers/${seeker.id}`} className="font-semibold text-foreground hover:text-primary">{seeker.full_name}</Link>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${seeker.risk.level === 'critical' ? 'bg-foreground text-background' : 'bg-destructive/10 text-destructive'}`}>
                    {getRiskEmoji(seeker.risk.level)} {seeker.risk.level.toUpperCase()} — {seeker.risk.score}/100
                  </span>
                </div>
                <div className="flex gap-2 flex-wrap text-xs text-muted-foreground mb-2">
                  {seeker.risk.factors.map((f, i) => (
                    <span key={i} className="bg-destructive/5 text-destructive px-2 py-0.5 rounded-full">{f}</span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <a href={`tel:${seeker.phone}`} className="px-2 py-1 rounded-lg text-[10px] font-medium bg-dharma-green/10 text-dharma-green flex items-center gap-1">
                    <Phone className="w-3 h-3" /> Call Now
                  </a>
                  <a href={`https://wa.me/91${seeker.phone}`} target="_blank" rel="noreferrer" className="px-2 py-1 rounded-lg text-[10px] font-medium bg-dharma-green/10 text-dharma-green flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> WhatsApp
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Sessions Today', value: todaySessions.length, emoji: '📅' },
          { label: 'Pending Follow-ups', value: overdueFollowUps.length, emoji: '📞' },
          { label: 'At-Risk Seekers', value: atRiskSeekers.length, emoji: '⚠️' },
          { label: 'Active Seekers', value: SEEKERS.filter(s => s.enrollment?.status === 'active').length, emoji: '👥' },
          { label: 'This Month Revenue', value: formatINR(PAYMENTS.filter(p => p.status === 'received' && p.payment_date.startsWith('2025-03')).reduce((s, p) => s + p.total_amount, 0)), emoji: '💰' },
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
              <input
                type="checkbox"
                checked={sadhana[item.key as keyof typeof sadhana]}
                onChange={() => setSadhana(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof sadhana] }))}
                className="rounded border-input w-4 h-4"
              />
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
