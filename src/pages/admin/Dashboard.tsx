import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, CalendarDays, Clock, IndianRupee, Video, MapPin, Plus, PhoneCall, Bell, Target, TrendingUp, TrendingDown, ExternalLink, ClipboardList, AlertTriangle, Clipboard } from 'lucide-react';
import { SEEKERS, SESSIONS, ASSIGNMENTS, PAYMENTS, MOTIVATIONAL_QUOTES, formatINR, getGreeting, getHealthColor } from '@/data/mockData';
import { calculateRiskScore, getRiskEmoji } from '@/lib/riskEngine';
import { JOURNEY_STAGES } from '@/types';

const CountUp = ({ end, prefix = '' }: { end: number; prefix?: string }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const dur = 1200;
    const steps = 30;
    const inc = end / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += inc;
      if (current >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, dur / steps);
    return () => clearInterval(timer);
  }, [end]);
  return <span>{prefix}{prefix === '₹' ? count.toLocaleString('en-IN') : count}</span>;
};

const StatCard = ({ icon: Icon, label, value, prefix, gradient, trend, trendUp }: any) => (
  <div className="bg-card rounded-2xl shadow-md card-hover overflow-hidden">
    <div className={`h-1.5 ${gradient}`} />
    <div className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${gradient} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-primary-foreground" />
        </div>
        {trend && (
          <span className={`text-xs font-medium flex items-center gap-0.5 ${trendUp ? 'text-dharma-green' : 'text-destructive'}`}>
            {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />} {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-foreground"><CountUp end={value} prefix={prefix} /></p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const activeSeekers = SEEKERS.filter((s) => s.enrollment?.status === 'active').length;
  const sessionsThisMonth = SESSIONS.length;
  const pendingTasks = ASSIGNMENTS.filter((a) => ['assigned', 'overdue'].includes(a.status)).length;
  const monthRevenue = PAYMENTS.filter((p) => p.status === 'received' && p.payment_date.startsWith('2025-03')).reduce((s, p) => s + p.total_amount, 0);
  const todaysSessions = SESSIONS.filter((s) => s.date === '2025-03-31');
  const quote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
  const overdueAssignments = ASSIGNMENTS.filter((a) => a.status === 'overdue');
  const pendingPayments = PAYMENTS.filter((p) => p.status === 'pending' || p.status === 'overdue');
  const atRiskSeekers = SEEKERS
    .filter(s => s.enrollment?.status === 'active')
    .map(s => ({ ...s, risk: calculateRiskScore(s) }))
    .filter(s => s.risk.level === 'high' || s.risk.level === 'critical');

  return (
    <div className="space-y-6 stagger-children">
      {/* Hero Banner */}
      <div className="gradient-hero rounded-2xl p-6 lg:p-8 text-primary-foreground relative overflow-hidden">
        <div className="absolute top-2 right-6 text-6xl opacity-10">ॐ</div>
        <h1 className="text-2xl lg:text-3xl font-bold">{getGreeting()}, Vivek Sir</h1>
        <p className="text-primary-foreground/70 mt-1">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <p className="text-sm text-primary-foreground/60 mt-3 italic">"{quote.text}" — {quote.author}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Active Seekers" value={activeSeekers} gradient="gradient-chakravartin" trend="↑12%" trendUp />
        <StatCard icon={CalendarDays} label="Sessions This Month" value={sessionsThisMonth} gradient="gradient-sacred" trend="↑8%" trendUp />
        <StatCard icon={Clock} label="Pending Tasks" value={pendingTasks} gradient="gradient-saffron" trend="↓5%" trendUp={false} />
        <StatCard icon={IndianRupee} label="Revenue (This Month)" value={monthRevenue} prefix="₹" gradient="gradient-growth" trend="↑22%" trendUp />
      </div>

      {/* Today's Schedule */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Today's Schedule</h2>
        {todaysSessions.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-3">
            {todaysSessions.map((session) => {
              const seeker = SEEKERS.find((s) => s.id === session.seeker_id);
              return (
                <div key={session.id} className="bg-card rounded-xl p-4 shadow-sm border border-border flex items-center gap-4 card-hover">
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{session.start_time}</p>
                    <p className="text-xs text-muted-foreground">{session.end_time}</p>
                  </div>
                  <div className="gold-divider !w-px !h-10" />
                  <div className="flex-1 min-w-0">
                    <Link to={`/seekers/${seeker?.id}`} className="font-medium text-foreground hover:text-primary truncate block">{seeker?.full_name}</Link>
                    <p className="text-xs text-muted-foreground">{seeker?.course?.name} · Session #{session.session_number}</p>
                  </div>
                  <button className={`px-3 py-1.5 rounded-lg text-xs font-medium text-primary-foreground ${session.location_type === 'online' ? 'bg-sky-blue' : 'bg-dharma-green'}`}>
                    {session.location_type === 'online' ? <><Video className="w-3 h-3 inline mr-1" />Join</> : <><MapPin className="w-3 h-3 inline mr-1" />In-Person</>}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-card rounded-xl p-8 text-center shadow-sm border border-border">
            <span className="text-4xl mb-3 block">🧘</span>
            <p className="text-muted-foreground">No sessions today. Enjoy your free time!</p>
          </div>
        )}
      </div>

      {/* Alerts + Health */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Alerts */}
        <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
          <h3 className="font-semibold text-foreground mb-3">Alerts & Actions</h3>
          <div className="space-y-2">
            {overdueAssignments.slice(0, 3).map((a) => {
              const seeker = SEEKERS.find((s) => s.id === a.seeker_id);
              return (
                <div key={a.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-destructive/5 border-l-[3px] border-destructive">
                  <span className="text-xs">🔴</span>
                  <p className="text-sm text-foreground flex-1">{seeker?.full_name}: "{a.title}" overdue</p>
                  <Link to="/assignments" className="text-xs text-primary hover:underline">Take Action →</Link>
                </div>
              );
            })}
            {pendingPayments.slice(0, 2).map((p) => {
              const seeker = SEEKERS.find((s) => s.id === p.seeker_id);
              return (
                <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-warning-amber/5 border-l-[3px] border-warning-amber">
                  <span className="text-xs">🟡</span>
                  <p className="text-sm text-foreground flex-1">{seeker?.full_name}: {formatINR(p.total_amount)} {p.status}</p>
                  <Link to="/payments" className="text-xs text-primary hover:underline">View →</Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Seeker Health */}
        <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
          <h3 className="font-semibold text-foreground mb-3">Seeker Health Overview</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {SEEKERS.filter((s) => s.enrollment?.status === 'active').map((s) => (
              <Link key={s.id} to={`/seekers/${s.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className={`w-2.5 h-2.5 rounded-full ${getHealthColor(s.health)}`} />
                <span className="text-sm font-medium text-foreground flex-1">{s.full_name}</span>
                <span className="text-xs text-muted-foreground">{s.course?.name?.slice(0, 20)}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Quick Actions</h2>
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Add Seeker', icon: Plus, gradient: 'gradient-chakravartin', path: '/seekers' },
            { label: 'Schedule Session', icon: CalendarDays, gradient: 'gradient-sacred', path: '/sessions' },
            { label: 'Create Assignment', icon: ClipboardList, gradient: 'gradient-saffron', path: '/assignments' },
            { label: 'Quick Follow-up', icon: PhoneCall, gradient: 'gradient-growth', path: '/follow-ups' },
            { label: 'Send Reminder', icon: Bell, gradient: 'gradient-hero', path: '/messages' },
            { label: 'Add Lead', icon: Target, gradient: 'bg-lotus-pink', path: '/leads' },
          ].map((action) => (
            <Link key={action.label} to={action.path} className={`${action.gradient} rounded-xl p-4 text-center text-primary-foreground card-hover`}>
              <action.icon className="w-6 h-6 mx-auto mb-2" />
              <p className="text-xs font-medium">{action.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
