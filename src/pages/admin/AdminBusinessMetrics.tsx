import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Users, BookOpen, Calendar, ClipboardCheck, IndianRupee, GraduationCap } from 'lucide-react';

const AdminBusinessMetrics = () => {
  const { data: profiles = [] } = useQuery({ queryKey: ['all-profiles-count'], queryFn: async () => { const { data, error } = await supabase.from('profiles').select('id, role'); if (error) throw error; return data; } });
  const { data: sessions = [] } = useQuery({ queryKey: ['all-sessions-count'], queryFn: async () => { const { data, error } = await supabase.from('sessions').select('id, attendance'); if (error) throw error; return data; } });
  const { data: enrollments = [] } = useQuery({ queryKey: ['all-enrollments-count'], queryFn: async () => { const { data, error } = await supabase.from('enrollments').select('id, status'); if (error) throw error; return data; } });
  const { data: assignments = [] } = useQuery({ queryKey: ['all-assignments-count'], queryFn: async () => { const { data, error } = await supabase.from('assignments').select('id, status'); if (error) throw error; return data; } });
  const { data: payments = [] } = useQuery({ queryKey: ['all-payments-revenue'], queryFn: async () => { const { data, error } = await supabase.from('payments').select('total_amount, status'); if (error) throw error; return data; } });

  const totalRevenue = payments.filter(p => p.status === 'received').reduce((s, p) => s + (p.total_amount || 0), 0);
  const metrics = [
    { icon: Users, label: 'Total Users', value: profiles.length, color: 'text-primary' },
    { icon: Users, label: 'Seekers', value: profiles.filter(p => p.role === 'seeker').length, color: 'text-emerald-600' },
    { icon: GraduationCap, label: 'Active Enrollments', value: enrollments.filter(e => e.status === 'active').length, color: 'text-blue-600' },
    { icon: Calendar, label: 'Total Sessions', value: sessions.length, color: 'text-violet-600' },
    { icon: ClipboardCheck, label: 'Assignments Completed', value: assignments.filter(a => a.status === 'completed').length, color: 'text-amber-600' },
    { icon: IndianRupee, label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, color: 'text-emerald-600' },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">📊 Business Metrics</h1><p className="text-muted-foreground">Key performance indicators at a glance</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map(m => (
          <Card key={m.label}>
            <CardContent className="pt-6 flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-muted ${m.color}`}><m.icon className="w-6 h-6" /></div>
              <div><p className="text-2xl font-bold">{m.value}</p><p className="text-sm text-muted-foreground">{m.label}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminBusinessMetrics;
