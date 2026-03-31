import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { SEEKERS, SESSIONS, ASSIGNMENTS, PAYMENTS, formatINR, formatDate, formatTime12, getHealthColor, getTierBadgeClass } from '@/data/mockData';
import { Phone, MessageSquare, Mail, Edit, Archive, Calendar, ClipboardList, TrendingUp, CreditCard, Flame, ArrowLeft } from 'lucide-react';

const tabs = ['Overview', 'Sessions', 'Assignments', 'Payments', 'Timeline'];

const SeekerDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState(0);
  const seeker = SEEKERS.find((s) => s.id === id);

  if (!seeker) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <span className="text-5xl mb-4">🧘</span>
        <h2 className="text-xl font-bold text-foreground mb-2">Seeker Not Found</h2>
        <p className="text-muted-foreground mb-4">This seeker profile doesn't exist.</p>
        <Link to="/seekers" className="text-primary hover:underline">← Back to Seekers</Link>
      </div>
    );
  }

  const seekerSessions = SESSIONS.filter((s) => s.seeker_id === id);
  const seekerAssignments = ASSIGNMENTS.filter((a) => a.seeker_id === id);
  const seekerPayments = PAYMENTS.filter((p) => p.seeker_id === id);
  const daysSinceJoin = Math.floor((Date.now() - new Date(seeker.created_at).getTime()) / 86400000);

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link to="/seekers" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Back to Seekers
      </Link>

      {/* Header */}
      <div className="bg-card rounded-2xl p-6 shadow-md border border-border">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-primary-foreground flex-shrink-0 ${
            seeker.enrollment?.tier === 'chakravartin' ? 'shimmer-gold' :
            seeker.enrollment?.tier === 'platinum' ? 'bg-gradient-to-br from-gray-400 to-gray-200 text-foreground' :
            seeker.enrollment?.tier === 'premium' ? 'gradient-sacred' : 'gradient-chakravartin'
          }`}>
            {seeker.full_name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-foreground">{seeker.full_name}</h1>
              <div className={`w-3 h-3 rounded-full ${getHealthColor(seeker.health)}`} />
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getTierBadgeClass(seeker.enrollment?.tier || '')}`}>
                {seeker.enrollment?.tier === 'chakravartin' ? '✦ Chakravartin' : seeker.enrollment?.tier?.toUpperCase()}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                seeker.enrollment?.status === 'active' ? 'bg-dharma-green/10 text-dharma-green' :
                seeker.enrollment?.status === 'paused' ? 'bg-warning-amber/10 text-warning-amber' :
                seeker.enrollment?.status === 'completed' ? 'bg-sky-blue/10 text-sky-blue' :
                'bg-muted text-muted-foreground'
              }`}>
                {seeker.enrollment?.status}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{seeker.course?.name} · {seeker.city} · Day {daysSinceJoin}</p>
            <p className="text-xs text-muted-foreground">{seeker.occupation}{seeker.company ? ` at ${seeker.company}` : ''}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <a href={`tel:${seeker.phone}`} className="p-2 rounded-lg bg-dharma-green/10 text-dharma-green hover:bg-dharma-green/20"><Phone className="w-4 h-4" /></a>
            <a href={`https://wa.me/91${seeker.phone}`} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-dharma-green/10 text-dharma-green hover:bg-dharma-green/20"><MessageSquare className="w-4 h-4" /></a>
            <a href={`mailto:${seeker.email}`} className="p-2 rounded-lg bg-sky-blue/10 text-sky-blue hover:bg-sky-blue/20"><Mail className="w-4 h-4" /></a>
            <button className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20"><Edit className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Sessions', value: `${seeker.sessions_completed}/${seeker.total_sessions}`, icon: Calendar, color: 'text-chakra-indigo' },
          { label: 'Growth', value: `${seeker.growth_score}%`, icon: TrendingUp, color: 'text-dharma-green' },
          { label: 'Streak', value: `${seeker.streak}🔥`, icon: Flame, color: 'text-saffron' },
          { label: 'Assignments', value: `${seekerAssignments.filter(a => a.status === 'reviewed').length}/${seekerAssignments.length}`, icon: ClipboardList, color: 'text-wisdom-purple' },
          { label: 'Paid', value: formatINR(seekerPayments.filter(p => p.status === 'received').reduce((s, p) => s + p.total_amount, 0)), icon: CreditCard, color: 'text-primary' },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl p-4 shadow-sm border border-border text-center">
            <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
            <p className="text-lg font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {tabs.map((tab, i) => (
          <button key={tab} onClick={() => setActiveTab(i)} className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
            activeTab === i ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}>{tab}</button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          {/* Personal Info */}
          <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
            <h3 className="font-semibold text-foreground mb-3">Personal Information</h3>
            <div className="space-y-2 text-sm">
              {[
                ['Email', seeker.email],
                ['Phone', seeker.phone],
                ['City', `${seeker.city}, ${seeker.state}`],
                ['Occupation', seeker.occupation],
                ['Company', seeker.company],
                ['Revenue Range', seeker.revenue_range],
                ['Joined', formatDate(seeker.created_at)],
              ].filter(([, v]) => v).map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="text-foreground font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Recent Activity */}
          <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
            <h3 className="font-semibold text-foreground mb-3">Recent Activity</h3>
            <div className="space-y-3">
              {seekerSessions.slice(0, 3).map((s) => (
                <div key={s.id} className="flex items-center gap-3 text-sm">
                  <div className={`w-2 h-2 rounded-full ${s.status === 'completed' ? 'bg-dharma-green' : 'bg-sky-blue'}`} />
                  <span className="text-foreground">Session #{s.session_number} — {s.status}</span>
                  <span className="text-muted-foreground ml-auto">{formatDate(s.date)}</span>
                </div>
              ))}
              {seekerAssignments.slice(0, 3).map((a) => (
                <div key={a.id} className="flex items-center gap-3 text-sm">
                  <div className={`w-2 h-2 rounded-full ${a.status === 'overdue' ? 'bg-destructive' : a.status === 'reviewed' ? 'bg-dharma-green' : 'bg-warning-amber'}`} />
                  <span className="text-foreground">{a.title} — {a.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 1 && (
        <div className="bg-card rounded-xl border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border">
              <th className="text-left p-3 font-medium text-muted-foreground">#</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Time</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Attendance</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Engagement</th>
            </tr></thead>
            <tbody>
              {seekerSessions.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0">
                  <td className="p-3 text-foreground font-medium">{s.session_number}</td>
                  <td className="p-3 text-muted-foreground">{formatDate(s.date)}</td>
                  <td className="p-3 text-muted-foreground">{formatTime12(s.start_time)}</td>
                  <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs ${s.status === 'completed' ? 'bg-dharma-green/10 text-dharma-green' : 'bg-sky-blue/10 text-sky-blue'}`}>{s.status}</span></td>
                  <td className="p-3 text-muted-foreground capitalize">{s.attendance || '—'}</td>
                  <td className="p-3 text-foreground">{s.engagement_score ? `${s.engagement_score}/10` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 2 && (
        <div className="space-y-3">
          {seekerAssignments.map((a) => (
            <div key={a.id} className="bg-card rounded-xl p-4 shadow-sm border border-border">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-foreground">{a.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{a.description}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  a.status === 'overdue' ? 'bg-destructive/10 text-destructive' :
                  a.status === 'reviewed' ? 'bg-dharma-green/10 text-dharma-green' :
                  a.status === 'submitted' ? 'bg-sky-blue/10 text-sky-blue' :
                  'bg-warning-amber/10 text-warning-amber'
                }`}>{a.status}</span>
              </div>
              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                <span>Due: {formatDate(a.due_date)}</span>
                <span>Priority: {a.priority}</span>
                {a.score && <span>Score: {a.score}/100</span>}
              </div>
            </div>
          ))}
          {seekerAssignments.length === 0 && (
            <div className="text-center py-12">
              <span className="text-4xl block mb-3">📝</span>
              <p className="text-muted-foreground">No assignments yet.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 3 && (
        <div className="bg-card rounded-xl border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border">
              <th className="text-left p-3 font-medium text-muted-foreground">Invoice</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Amount</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Method</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
            </tr></thead>
            <tbody>
              {seekerPayments.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="p-3 text-foreground font-medium">{p.invoice_number}</td>
                  <td className="p-3 text-muted-foreground">{p.payment_date ? formatDate(p.payment_date) : p.due_date ? `Due: ${formatDate(p.due_date)}` : '—'}</td>
                  <td className="p-3 text-foreground font-medium">{formatINR(p.total_amount)}</td>
                  <td className="p-3 text-muted-foreground capitalize">{p.method.replace('_', ' ')}</td>
                  <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs ${
                    p.status === 'received' ? 'bg-dharma-green/10 text-dharma-green' :
                    p.status === 'overdue' ? 'bg-destructive/10 text-destructive' :
                    'bg-warning-amber/10 text-warning-amber'
                  }`}>{p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 4 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Complete chronological activity feed</p>
          {[...seekerSessions.map(s => ({ type: 'session' as const, date: s.date, text: `Session #${s.session_number} — ${s.status}`, color: 'bg-chakra-indigo' })),
            ...seekerAssignments.map(a => ({ type: 'assignment' as const, date: a.due_date, text: `${a.title} — ${a.status}`, color: a.status === 'overdue' ? 'bg-destructive' : 'bg-saffron' })),
            ...seekerPayments.map(p => ({ type: 'payment' as const, date: p.payment_date || p.due_date || '', text: `${p.invoice_number} — ${formatINR(p.total_amount)} — ${p.status}`, color: 'bg-dharma-green' })),
          ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border">
              <div className={`w-2 h-2 rounded-full ${item.color}`} />
              <span className="text-sm text-foreground flex-1">{item.text}</span>
              <span className="text-xs text-muted-foreground">{item.date ? formatDate(item.date) : ''}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SeekerDetailPage;
