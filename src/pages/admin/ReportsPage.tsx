import { useState } from 'react';
import { useSeekerProfiles } from '@/hooks/useSeekerProfiles';
import { usePayments } from '@/hooks/usePayments';
import { useDbSessions } from '@/hooks/useDbSessions';
import { useDbAssignments } from '@/hooks/useDbAssignments';
import { Users, TrendingUp, IndianRupee, CalendarDays, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const sections = ['Seeker Progress', 'Revenue Analytics', 'Session Stats', 'Assignment Stats'];
const CHART_COLORS = ['hsl(var(--primary))', 'hsl(var(--saffron))', 'hsl(var(--dharma-green))', 'hsl(var(--chakra-indigo))', 'hsl(var(--lotus-pink))'];

const ReportsPage = () => {
  const [expanded, setExpanded] = useState<number | null>(0);
  const { data: seekers = [], isLoading: sl } = useSeekerProfiles();
  const { payments, isLoading: pl } = usePayments();
  const { data: sessions = [], isLoading: ssl } = useDbSessions();
  const { data: assignments = [] } = useDbAssignments();

  if (sl || pl || ssl) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const totalRevenue = payments.filter(p => p.status === 'received').reduce((s, p) => s + Number(p.total_amount), 0);
  const completedSessions = sessions.filter(s => s.status === 'completed' || s.status === 'approved').length;
  const completedAssignments = assignments.filter(a => a.status === 'reviewed' || a.status === 'completed').length;

  // Revenue by month
  const revenueByMonth: Record<string, number> = {};
  payments.filter(p => p.status === 'received' && p.payment_date).forEach(p => {
    const m = p.payment_date!.slice(0, 7);
    revenueByMonth[m] = (revenueByMonth[m] || 0) + Number(p.total_amount);
  });
  const revenueChartData = Object.entries(revenueByMonth).sort().slice(-6).map(([month, amount]) => ({ month, amount }));

  // Session status breakdown
  const statusCounts: Record<string, number> = {};
  sessions.forEach(s => { statusCounts[s.status] = (statusCounts[s.status] || 0) + 1; });
  const sessionPieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  // Assignment status breakdown
  const assignmentStatusCounts: Record<string, number> = {};
  assignments.forEach(a => { assignmentStatusCounts[a.status] = (assignmentStatusCounts[a.status] || 0) + 1; });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border text-center">
          <Users className="w-5 h-5 mx-auto mb-1 text-primary" />
          <p className="text-xl font-bold text-foreground">{seekers.length}</p>
          <p className="text-xs text-muted-foreground">Total Seekers</p>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border text-center">
          <CalendarDays className="w-5 h-5 mx-auto mb-1 text-chakra-indigo" />
          <p className="text-xl font-bold text-foreground">{completedSessions}</p>
          <p className="text-xs text-muted-foreground">Sessions Completed</p>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border text-center">
          <IndianRupee className="w-5 h-5 mx-auto mb-1 text-dharma-green" />
          <p className="text-xl font-bold text-foreground">₹{totalRevenue.toLocaleString('en-IN')}</p>
          <p className="text-xs text-muted-foreground">Total Revenue</p>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border text-center">
          <TrendingUp className="w-5 h-5 mx-auto mb-1 text-saffron" />
          <p className="text-xl font-bold text-foreground">{completedAssignments}</p>
          <p className="text-xs text-muted-foreground">Tasks Completed</p>
        </div>
      </div>

      <div className="space-y-3">
        {sections.map((section, i) => (
          <div key={section} className="bg-card rounded-xl border border-border overflow-hidden">
            <button onClick={() => setExpanded(expanded === i ? null : i)} className="w-full p-4 text-left flex items-center justify-between hover:bg-muted/30 transition-colors">
              <h3 className="font-semibold text-foreground">{section}</h3>
              <span className="text-muted-foreground">{expanded === i ? '▼' : '▶'}</span>
            </button>
            {expanded === i && (
              <div className="p-4 border-t border-border">
                {i === 0 && (
                  <div className="overflow-x-auto">
                    {seekers.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No seekers yet.</p>
                    ) : (
                      <table className="w-full text-sm">
                        <thead><tr className="border-b border-border">
                          <th className="text-left p-2 text-muted-foreground">Seeker</th>
                          <th className="text-left p-2 text-muted-foreground">Email</th>
                          <th className="text-left p-2 text-muted-foreground">Sessions</th>
                          <th className="text-left p-2 text-muted-foreground">Joined</th>
                        </tr></thead>
                        <tbody>
                          {seekers.map(s => {
                            const seekerSessions = sessions.filter(sess => sess.seeker_id === s.id);
                            return (
                              <tr key={s.id} className="border-b border-border last:border-0">
                                <td className="p-2 font-medium text-foreground">{s.full_name}</td>
                                <td className="p-2 text-muted-foreground">{s.email}</td>
                                <td className="p-2 text-foreground">{seekerSessions.length}</td>
                                <td className="p-2 text-muted-foreground">{s.created_at?.slice(0, 10)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
                {i === 1 && (
                  <div>
                    {revenueChartData.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No revenue data yet.</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={revenueChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip formatter={(v: number) => `₹${v.toLocaleString('en-IN')}`} />
                          <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                )}
                {i === 2 && (
                  <div>
                    {sessionPieData.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No session data yet.</p>
                    ) : (
                      <div className="flex flex-col md:flex-row items-center gap-4">
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie data={sessionPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                              {sessionPieData.map((_, idx) => <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-1">
                          {sessionPieData.map((d, idx) => (
                            <div key={d.name} className="flex items-center gap-2 text-xs">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                              <span className="text-foreground capitalize">{d.name}: {d.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {i === 3 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(assignmentStatusCounts).map(([status, count]) => (
                      <div key={status} className="bg-muted/30 rounded-lg p-3 text-center">
                        <p className="text-lg font-bold text-foreground">{count}</p>
                        <p className="text-xs text-muted-foreground capitalize">{status}</p>
                      </div>
                    ))}
                    {Object.keys(assignmentStatusCounts).length === 0 && (
                      <p className="col-span-4 text-sm text-muted-foreground text-center py-4">No assignment data yet.</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportsPage;
