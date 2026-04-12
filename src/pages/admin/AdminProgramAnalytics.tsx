import { useDbCourses } from '@/hooks/useDbCourses';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, Users, DollarSign, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];
const formatINR = (n: number) => `₹${n.toLocaleString('en-IN')}`;

const AdminProgramAnalytics = () => {
  const { data: courses = [], isLoading: coursesLoading } = useDbCourses();
  const { data: enrollments = [], isLoading: enrollLoading } = useQuery({
    queryKey: ['all-enrollments'],
    queryFn: async () => {
      const { data, error } = await supabase.from('enrollments').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const isLoading = coursesLoading || enrollLoading;
  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const totalRevenue = courses.reduce((sum, c) => {
    const enrolled = enrollments.filter(e => e.course_id === c.id).length;
    return sum + enrolled * Number(c.price);
  }, 0);

  const enrollmentByCourse = courses.map(c => ({
    name: c.name.length > 15 ? c.name.slice(0, 15) + '…' : c.name,
    enrollments: enrollments.filter(e => e.course_id === c.id).length,
    revenue: enrollments.filter(e => e.course_id === c.id).length * Number(c.price),
  }));

  const tierData = Object.entries(
    courses.reduce((acc, c) => { acc[c.tier] = (acc[c.tier] || 0) + 1; return acc; }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const statusData = Object.entries(
    enrollments.reduce((acc, e) => { acc[e.status] = (acc[e.status] || 0) + 1; return acc; }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Program Analytics</h1>
        <p className="text-sm text-muted-foreground">Performance insights across all programs</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6 text-center">
          <BarChart3 className="w-6 h-6 mx-auto text-primary mb-1" />
          <p className="text-2xl font-bold">{courses.length}</p>
          <p className="text-xs text-muted-foreground">Active Programs</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <Users className="w-6 h-6 mx-auto text-blue-500 mb-1" />
          <p className="text-2xl font-bold">{enrollments.length}</p>
          <p className="text-xs text-muted-foreground">Total Enrollments</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <DollarSign className="w-6 h-6 mx-auto text-green-500 mb-1" />
          <p className="text-2xl font-bold">{formatINR(totalRevenue)}</p>
          <p className="text-xs text-muted-foreground">Estimated Revenue</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <TrendingUp className="w-6 h-6 mx-auto text-orange-500 mb-1" />
          <p className="text-2xl font-bold">{enrollments.filter(e => e.status === 'completed').length}</p>
          <p className="text-xs text-muted-foreground">Completions</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Enrollments by Program</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={enrollmentByCourse}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Bar dataKey="enrollments" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Programs by Tier</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={tierData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                  {tierData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Enrollment Status</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Revenue by Program</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={enrollmentByCourse} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} stroke="hsl(var(--muted-foreground))" />
                <Tooltip formatter={(v: number) => formatINR(v)} />
                <Bar dataKey="revenue" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminProgramAnalytics;
