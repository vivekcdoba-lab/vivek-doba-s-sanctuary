import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Users, CalendarDays, Clock, IndianRupee, Video, MapPin, Plus, PhoneCall, Bell, Target, TrendingUp, TrendingDown, ClipboardList, Clipboard, GraduationCap, FileSignature } from 'lucide-react';
import { MOTIVATIONAL_QUOTES, formatINR, getGreeting } from '@/data/mockData';
import { useSeekerProfiles, useAllProfiles } from '@/hooks/useSeekerProfiles';
import { useDbSessions } from '@/hooks/useDbSessions';
import { useDbAssignments } from '@/hooks/useDbAssignments';
import { usePayments } from '@/hooks/usePayments';
import { useDbLeads } from '@/hooks/useDbLeads';
import { useDbCourses } from '@/hooks/useDbCourses';
import { supabase } from '@/integrations/supabase/client';
import BirthdayAnniversaryReminders from '@/components/BirthdayAnniversaryReminders';
import { SkeletonDashboard } from '@/components/SkeletonCard';
import DonutChart from '@/components/charts/DonutChart';
import FunnelChart from '@/components/charts/FunnelChart';
import ChartWrapper from '@/components/charts/ChartWrapper';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import CoachPerformanceChart from '@/components/dashboard/CoachPerformanceChart';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const CountUp = ({ end, prefix = '' }: { end: number; prefix?: string }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const dur = 1200; const steps = 30; const inc = end / steps; let current = 0;
    const timer = setInterval(() => { current += inc; if (current >= end) { setCount(end); clearInterval(timer); } else setCount(Math.floor(current)); }, dur / steps);
    return () => clearInterval(timer);
  }, [end]);
  return <span>{prefix}{prefix === '₹' ? count.toLocaleString('en-IN') : count}</span>;
};

const StatCard = ({ icon: Icon, label, value, prefix, gradient, trend, trendUp }: any) => (
  <div className="bg-card rounded-2xl shadow-md card-hover overflow-hidden">
    <div className={`h-1.5 ${gradient}`} />
    <div className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${gradient} flex items-center justify-center`}><Icon className="w-5 h-5 text-primary-foreground" /></div>
        {trend && <span className={`text-xs font-medium flex items-center gap-0.5 ${trendUp ? 'text-dharma-green' : 'text-destructive'}`}>{trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />} {trend}</span>}
      </div>
      <p className="text-2xl font-bold text-foreground"><CountUp end={value} prefix={prefix} /></p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const { data: seekers = [], isLoading: seekersLoading } = useSeekerProfiles();
  const { data: allProfiles = [] } = useAllProfiles();
  const coachCount = allProfiles.filter(p => p.role === 'coach' || (p as any).is_also_coach === true).length;
  const adminCount = allProfiles.filter(p => p.role === 'admin').length;
  const { data: sessions = [], isLoading: sessionsLoading } = useDbSessions();
  const { data: assignments = [] } = useDbAssignments();
  const { payments } = usePayments();
  const { data: leads = [] } = useDbLeads();
  const { data: courses = [] } = useDbCourses();
  const quote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];

  const activeSeekers = seekers.length;
  const sessionsThisMonth = sessions.length;
  const pendingTasks = assignments.filter(a => ['assigned', 'overdue'].includes(a.status)).length;
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthRevenue = payments.filter(p => p.status === 'received' && p.payment_date?.startsWith(currentMonth)).reduce((s, p) => s + Number(p.total_amount), 0);
  const todayStr = now.toISOString().split('T')[0];
  const todaysSessions = sessions.filter(s => s.date === todayStr);

  // Session status distribution
  const sessionStatusData = [
    { name: 'Completed', value: sessions.filter(s => ['completed', 'approved'].includes(s.status)).length },
    { name: 'Scheduled', value: sessions.filter(s => s.status === 'scheduled').length },
    { name: 'In Progress', value: sessions.filter(s => s.status === 'in_progress').length },
    { name: 'Missed', value: sessions.filter(s => s.status === 'missed').length },
  ].filter(d => d.value > 0);

  // Lead funnel
  const funnelStages = [
    { name: 'Total Leads', value: leads.length, emoji: '🎯' },
    { name: 'Contacted', value: leads.filter(l => l.stage !== 'new').length, emoji: '📞' },
    { name: 'Interested', value: leads.filter(l => ['interested', 'proposal', 'negotiation', 'converted'].includes(l.stage || '')).length, emoji: '🤝' },
    { name: 'Converted', value: leads.filter(l => l.stage === 'converted').length, emoji: '✅' },
  ];

  // Revenue trend (last 6 months)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const revenueTrend = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const total = payments.filter(p => p.status === 'received' && p.payment_date?.startsWith(key)).reduce((s, p) => s + Number(p.total_amount), 0);
    return { name: monthNames[d.getMonth()], revenue: total };
  });

  // Assignment status breakdown
  const assignmentData = [
    { name: 'Completed', value: assignments.filter(a => a.status === 'reviewed').length },
    { name: 'In Progress', value: assignments.filter(a => a.status === 'in_progress').length },
    { name: 'Assigned', value: assignments.filter(a => a.status === 'assigned').length },
    { name: 'Overdue', value: assignments.filter(a => a.status === 'overdue').length },
  ].filter(d => d.value > 0);

  // Coach performance — live data from profiles with role 'coach' (rating omitted: no session_feedback table yet)
  const coachData = allProfiles
    .filter(p => p.role === 'coach' || (p as any).is_also_coach === true)
    .map(c => ({
      name: c.full_name?.split(' ')[0] || 'Coach',
      seekers: sessions.filter(s => s.seeker_id === c.id).length,
    }));

  // Real activity feed — union of recent notifications, payments, enrollments
  const { data: activityItems = [] } = useQuery({
    queryKey: ['admin-dashboard-activity'],
    queryFn: async () => {
      const [notifRes, payRes, enrolRes] = await Promise.all([
        supabase.from('notifications').select('id,type,title,message,created_at').order('created_at', { ascending: false }).limit(10),
        supabase.from('payments').select('id,total_amount,seeker_id,created_at,status').order('created_at', { ascending: false }).limit(10),
        supabase.from('enrollments').select('id,seeker_id,created_at,status').order('created_at', { ascending: false }).limit(10),
      ]);
      const seekerNameById = new Map(seekers.map(s => [s.id, s.full_name]));
      const items: { id: string; emoji: string; text: string; time: string; ts: string }[] = [];
      (notifRes.data || []).forEach((n: any) => {
        const k = (n.type || '').toLowerCase();
        const emoji = k.includes('payment') ? '💰' : k.includes('reminder') ? '⏰' : k.includes('celebr') || k.includes('streak') ? '🔥' : k.includes('application') ? '📝' : '🔔';
        items.push({ id: `n-${n.id}`, emoji, text: n.title || n.message || 'Notification', time: '', ts: n.created_at });
      });
      (payRes.data || []).forEach((p: any) => {
        const name = seekerNameById.get(p.seeker_id) || 'Seeker';
        items.push({ id: `p-${p.id}`, emoji: '💰', text: `Payment ${p.status === 'received' ? 'received' : 'recorded'} from ${name}${p.total_amount ? ` (₹${Number(p.total_amount).toLocaleString('en-IN')})` : ''}`, time: '', ts: p.created_at });
      });
      (enrolRes.data || []).forEach((e: any) => {
        const name = seekerNameById.get(e.seeker_id) || 'Seeker';
        items.push({ id: `e-${e.id}`, emoji: '🟢', text: `New enrollment: ${name}`, time: '', ts: e.created_at });
      });
      return items
        .filter(i => i.ts)
        .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
        .slice(0, 10)
        .map(i => ({ ...i, time: formatDistanceToNow(new Date(i.ts), { addSuffix: true }) }));
    },
  });

  if (seekersLoading || sessionsLoading) {
    return <div className="p-4"><SkeletonDashboard /></div>;
  }

  return (
    <div className="space-y-6 stagger-children">
      {/* Hero Banner */}
      <div className="gradient-hero rounded-2xl p-6 lg:p-8 text-primary-foreground relative overflow-hidden">
        <div className="absolute top-2 right-6 text-6xl opacity-10">ॐ</div>
        <h1 className="text-2xl lg:text-3xl font-bold">👑 {getGreeting()}, Vivek Sir</h1>
        <p className="text-primary-foreground/70 mt-1">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <p className="text-sm text-primary-foreground/60 mt-3 italic">"{quote.text}" — {quote.author}</p>
        <Link to="/coach-day" className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-xl bg-primary-foreground/20 text-primary-foreground text-sm font-medium hover:bg-primary-foreground/30 transition-colors">
          <Clipboard className="w-4 h-4" /> 📋 My Day
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={Users} label="Active Seekers" value={activeSeekers} gradient="gradient-chakravartin" />
        <StatCard icon={GraduationCap} label="Coaches" value={coachCount} gradient="gradient-sacred" />
        <StatCard icon={Users} label="Admins" value={adminCount} gradient="gradient-hero" />
        <StatCard icon={IndianRupee} label="Revenue (This Month)" value={monthRevenue} prefix="₹" gradient="gradient-growth" trend="+18%" trendUp />
        <StatCard icon={Target} label="Leads" value={leads.length} gradient="gradient-saffron" />
      </div>

      {/* Charts Row 1: Revenue + Enrollment Funnel */}
      <div className="grid lg:grid-cols-2 gap-4">
        <ChartWrapper title="Revenue Trend" emoji="📈" className="lg:col-span-1">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueTrend}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(27, 100%, 60%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(27, 100%, 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => `₹${v.toLocaleString('en-IN')}`} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(27, 100%, 60%)" fill="url(#revGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartWrapper>
        <FunnelChart title="Enrollment Funnel" emoji="📊" stages={funnelStages} />
      </div>

      {/* Charts Row 2: Coach Performance + Activity Feed */}
      <div className="grid lg:grid-cols-2 gap-4">
        <CoachPerformanceChart data={coachData} />
        <ActivityFeed items={activityItems} />
      </div>

      {/* Charts Row 3: Session + Assignment donuts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <DonutChart title="Session Status" emoji="📅" data={sessionStatusData} centerLabel="Total" centerValue={sessions.length} />
        <DonutChart title="Assignment Status" emoji="📋" data={assignmentData} centerLabel="Total" centerValue={assignments.length} />
      </div>

      {/* Programs Summary */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">📚 Programs</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {courses.slice(0, 4).map(c => (
            <div key={c.id} className="bg-card rounded-xl p-4 shadow-sm border border-border card-hover">
              <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{c.tier} • ₹{Number(c.price).toLocaleString('en-IN')}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Schedule */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Today's Schedule</h2>
        {todaysSessions.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-3">
            {todaysSessions.map(session => {
              const seeker = seekers.find(s => s.id === session.seeker_id);
              return (
                <div key={session.id} className="bg-card rounded-xl p-4 shadow-sm border border-border flex items-center gap-4 card-hover">
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{session.start_time}</p>
                    <p className="text-xs text-muted-foreground">{session.end_time}</p>
                  </div>
                  <div className="gold-divider !w-px !h-10" />
                  <div className="flex-1 min-w-0">
                    <Link to={`/seekers/${seeker?.id}`} className="font-medium text-foreground hover:text-primary truncate block">{seeker?.full_name || 'Unknown'}</Link>
                    <p className="text-xs text-muted-foreground">Session #{session.session_number}</p>
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

      <BirthdayAnniversaryReminders />

      {/* Seeker & Assignments */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
          <h3 className="font-semibold text-foreground mb-3">👤 Seeker Overview</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {seekers.map(s => (
              <Link key={s.id} to={`/seekers/${s.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="w-2.5 h-2.5 rounded-full bg-dharma-green" />
                <span className="text-sm font-medium text-foreground flex-1">{s.full_name}</span>
                <span className="text-xs text-muted-foreground">{s.email}</span>
              </Link>
            ))}
            {seekers.length === 0 && <p className="text-sm text-muted-foreground">No seekers yet.</p>}
          </div>
        </div>
        <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
          <h3 className="font-semibold text-foreground mb-3">📝 Recent Assignments</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {assignments.slice(0, 5).map(a => {
              const seeker = seekers.find(s => s.id === a.seeker_id);
              return (
                <div key={a.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                  <span className="text-xs">{a.status === 'overdue' ? '🔴' : a.status === 'assigned' ? '🔵' : '✅'}</span>
                  <p className="text-sm text-foreground flex-1 truncate">{a.title}</p>
                  <span className="text-xs text-muted-foreground">{seeker?.full_name?.split(' ')[0]}</span>
                </div>
              );
            })}
            {assignments.length === 0 && <p className="text-sm text-muted-foreground">No assignments yet.</p>}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Quick Actions</h2>
        <div className="grid grid-cols-3 lg:grid-cols-7 gap-3">
          {[
            { label: 'Add User', icon: Plus, gradient: 'gradient-chakravartin', path: '/admin/add-user' },
            { label: 'Add Lead', icon: Target, gradient: 'bg-lotus-pink', path: '/leads' },
            { label: 'Schedule Session', icon: CalendarDays, gradient: 'gradient-sacred', path: '/sessions' },
            { label: 'Record Payment', icon: IndianRupee, gradient: 'gradient-growth', path: '/admin/record-payment' },
            { label: 'Follow-up', icon: PhoneCall, gradient: 'gradient-saffron', path: '/follow-ups' },
            { label: 'Reports', icon: ClipboardList, gradient: 'gradient-hero', path: '/reports' },
            { label: 'Documents & Signatures', icon: FileSignature, gradient: 'bg-lotus-pink', path: '/admin/documents' },
          ].map(action => (
            <Link key={action.label} to={action.path} className={`${action.gradient} rounded-xl p-4 text-center text-primary-foreground card-hover btn-press`}>
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
