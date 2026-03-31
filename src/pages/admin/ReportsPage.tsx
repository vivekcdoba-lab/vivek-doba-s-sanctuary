import { useState } from 'react';
import { SEEKERS, PAYMENTS, SESSIONS, ASSIGNMENTS, formatINR } from '@/data/mockData';
import { Users, TrendingUp, IndianRupee, CalendarDays, BarChart3 } from 'lucide-react';

const sections = ['Seeker Progress', 'Course Performance', 'Revenue Analytics', 'Attendance', 'Daily Tracking', 'Lead Conversion'];

const ReportsPage = () => {
  const [expanded, setExpanded] = useState<number | null>(0);
  const activeSeekers = SEEKERS.filter(s => s.enrollment?.status === 'active');
  const totalRevenue = PAYMENTS.filter(p => p.status === 'received').reduce((s, p) => s + p.total_amount, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border text-center">
          <Users className="w-5 h-5 mx-auto mb-1 text-primary" />
          <p className="text-xl font-bold text-foreground">{activeSeekers.length}</p>
          <p className="text-xs text-muted-foreground">Active Seekers</p>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border text-center">
          <CalendarDays className="w-5 h-5 mx-auto mb-1 text-chakra-indigo" />
          <p className="text-xl font-bold text-foreground">{SESSIONS.filter(s => s.status === 'completed').length}</p>
          <p className="text-xs text-muted-foreground">Sessions Completed</p>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border text-center">
          <IndianRupee className="w-5 h-5 mx-auto mb-1 text-dharma-green" />
          <p className="text-xl font-bold text-foreground">{formatINR(totalRevenue)}</p>
          <p className="text-xs text-muted-foreground">Total Revenue</p>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border text-center">
          <TrendingUp className="w-5 h-5 mx-auto mb-1 text-saffron" />
          <p className="text-xl font-bold text-foreground">{Math.round(activeSeekers.reduce((s, sk) => s + sk.growth_score, 0) / activeSeekers.length)}%</p>
          <p className="text-xs text-muted-foreground">Avg Growth Score</p>
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
                    <table className="w-full text-sm">
                      <thead><tr className="border-b border-border">
                        <th className="text-left p-2 text-muted-foreground">Seeker</th>
                        <th className="text-left p-2 text-muted-foreground">Course</th>
                        <th className="text-left p-2 text-muted-foreground">Growth</th>
                        <th className="text-left p-2 text-muted-foreground">Sessions</th>
                        <th className="text-left p-2 text-muted-foreground">Streak</th>
                      </tr></thead>
                      <tbody>
                        {activeSeekers.map(s => (
                          <tr key={s.id} className="border-b border-border last:border-0">
                            <td className="p-2 font-medium text-foreground">{s.full_name}</td>
                            <td className="p-2 text-muted-foreground">{s.course?.name?.slice(0, 20)}</td>
                            <td className="p-2 text-foreground">{s.growth_score}%</td>
                            <td className="p-2 text-muted-foreground">{s.sessions_completed}/{s.total_sessions}</td>
                            <td className="p-2 text-foreground">{s.streak}🔥</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {i !== 0 && (
                  <p className="text-sm text-muted-foreground italic">Detailed {section.toLowerCase()} charts and data will be rendered here with Recharts integration. 📊</p>
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
