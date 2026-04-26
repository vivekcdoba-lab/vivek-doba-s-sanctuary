import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useScopedSeekers } from '@/hooks/useScopedSeekers';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

const DEPT_EMOJIS: Record<string, string> = {
  Sales: '💰', Operations: '⚙️', Finance: '📊', HR: '👥',
  Product: '📦', 'Customer Success': '🤝', Technology: '💻', Leadership: '👑',
};

export default function CoachDeptHealth() {
  const { data: seekers = [] } = useScopedSeekers();
  const [selectedSeeker, setSelectedSeeker] = useState('');

  const { data: businesses = [] } = useQuery({
    queryKey: ['dept-businesses', selectedSeeker],
    enabled: !!selectedSeeker,
    queryFn: async () => {
      const { data, error } = await supabase.from('business_profiles').select('id, business_name').eq('seeker_id', selectedSeeker);
      if (error) throw error;
      return data || [];
    },
  });

  const businessId = businesses[0]?.id;

  const { data: deptData = [] } = useQuery({
    queryKey: ['dept-health', businessId],
    enabled: !!businessId,
    queryFn: async () => {
      const { data, error } = await supabase.from('department_health').select('*').eq('business_id', businessId!).order('year', { ascending: false }).order('month', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const latestMonth = deptData.length > 0 ? { year: deptData[0].year, month: deptData[0].month } : null;
  const latestDepts = latestMonth ? deptData.filter(d => d.year === latestMonth.year && d.month === latestMonth.month) : [];
  const chartData = latestDepts.map(d => ({ department: d.department_name, score: d.health_score }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Activity className="w-6 h-6 text-[#FF6B00]" /> Department Health
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Monitor department health across seeker businesses</p>
      </div>

      <Card className="p-4">
        <label className="text-sm font-medium mb-2 block">Select Seeker</label>
        <Select value={selectedSeeker} onValueChange={setSelectedSeeker}>
          <SelectTrigger className="max-w-md"><SelectValue placeholder="Choose a seeker..." /></SelectTrigger>
          <SelectContent>
            {seekers.map(s => <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>)}
          </SelectContent>
        </Select>
      </Card>

      {selectedSeeker && !businessId && (
        <Card className="p-8 text-center"><p className="text-muted-foreground">No business profile found for this seeker.</p></Card>
      )}

      {businessId && (
        <>
          <p className="text-sm font-medium text-foreground">🏢 {businesses[0]?.business_name}</p>

          {chartData.length > 0 && (
            <Card className="p-4">
              <h3 className="font-medium text-foreground mb-3">📊 Department Radar ({latestMonth?.month}/{latestMonth?.year})</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={chartData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="department" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis domain={[0, 10]} />
                  <Radar name="Score" dataKey="score" stroke="#FF6B00" fill="#FF6B00" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {latestDepts.map(dept => {
              const color = dept.health_score >= 7 ? 'text-green-500' : dept.health_score >= 4 ? 'text-amber-500' : 'text-red-500';
              return (
                <Card key={dept.id} className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span>{DEPT_EMOJIS[dept.department_name] || '📋'}</span>
                    <h4 className="text-sm font-medium text-foreground">{dept.department_name}</h4>
                  </div>
                  <p className={`text-2xl font-bold ${color}`}>{dept.health_score}/10</p>
                  {dept.challenges && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">⚠️ {dept.challenges}</p>}
                  {dept.action_plan && <p className="text-xs text-[#FF6B00] mt-1 line-clamp-2">📋 {dept.action_plan}</p>}
                </Card>
              );
            })}
          </div>

          {latestDepts.length === 0 && (
            <Card className="p-8 text-center"><p className="text-muted-foreground">No department health data recorded yet.</p></Card>
          )}
        </>
      )}
    </div>
  );
}
