import { useState } from 'react';
import { SEEKERS } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast as sonnerToast } from 'sonner';

const monthlyData = [
  { month: 'Month 1', personal: 5.0, professional: 5.5, spiritual: 5.0, relationships: 4.5, health: 5.0, overall: 45 },
  { month: 'Month 2', personal: 6.2, professional: 6.0, spiritual: 6.5, relationships: 5.2, health: 6.0, overall: 55 },
  { month: 'Month 3', personal: 7.5, professional: 6.8, spiritual: 8.2, relationships: 6.0, health: 7.0, overall: 72 },
];

const categories = [
  { key: 'personal', label: '🌱 Personal Growth', color: 'hsl(var(--dharma-green))', metrics: ['Self-Confidence', 'Communication', 'Emotional Intelligence', 'Decision Making', 'Time Management', 'Stress Management', 'Mindset Shift', 'Habit Consistency'] },
  { key: 'professional', label: '💼 Professional Growth', color: 'hsl(var(--chakra-indigo))', metrics: ['Leadership', 'Team Management', 'Strategic Thinking', 'Business Growth', 'Networking', 'Public Speaking', 'Negotiation', 'Innovation'] },
  { key: 'spiritual', label: '🕉️ Spiritual Growth', color: 'hsl(var(--saffron))', metrics: ['Inner Peace', 'Purpose Clarity', 'Dharma Alignment', 'Meditation Consistency', 'Gratitude Practice'] },
  { key: 'life', label: '❤️ Life Quality', color: 'hsl(var(--lotus-pink))', metrics: ['Family Relations', 'Professional Relations', 'Social Connections', 'Physical Health', 'Mental Health', 'Energy Levels', 'Sleep Quality'] },
];

const GrowthMatrixPage = () => {
  const [selectedSeeker, setSelectedSeeker] = useState('s1');
  const [selectedMonth, setSelectedMonth] = useState(2);
  const { toast } = useToast();
  const seeker = SEEKERS.find(s => s.id === selectedSeeker);
  const current = monthlyData[selectedMonth];
  const prev = monthlyData[selectedMonth - 1];
  const baseline = monthlyData[0];

  const radarData = [
    { dim: 'Personal', score: current?.personal || 0 },
    { dim: 'Professional', score: current?.professional || 0 },
    { dim: 'Spiritual', score: current?.spiritual || 0 },
    { dim: 'Relations', score: current?.relationships || 0 },
    { dim: 'Health', score: current?.health || 0 },
  ];

  const bestGrowth = ['personal', 'professional', 'spiritual', 'relationships', 'health']
    .map(k => ({ key: k, change: (current?.[k as keyof typeof current] as number || 0) - (baseline?.[k as keyof typeof baseline] as number || 0) }))
    .sort((a, b) => b.change - a.change);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-foreground">Growth Matrix</h1>
        <div className="flex gap-2">
          <select value={selectedSeeker} onChange={e => setSelectedSeeker(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm">
            {SEEKERS.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
          </select>
          <button onClick={() => toast({ title: '📊 Record saved!' })} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium text-sm">📊 Record New Month</button>
        </div>
      </div>

      {/* Month Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {monthlyData.map((m, i) => (
          <button key={i} onClick={() => setSelectedMonth(i)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${selectedMonth === i ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{m.month}</button>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground mb-3">Overall Growth Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="overall" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground mb-3">Current Month Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="dim" tick={{ fontSize: 11 }} />
              <Radar dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-card rounded-xl p-4 border-l-4 border-green-500 shadow-sm">
          <p className="text-xs text-muted-foreground">🌟 Best Growth In</p>
          <p className="text-sm font-bold text-foreground capitalize">{bestGrowth[0]?.key} (+{bestGrowth[0]?.change.toFixed(1)} since Month 1)</p>
        </div>
        <div className="bg-card rounded-xl p-4 border-l-4 border-red-500 shadow-sm">
          <p className="text-xs text-muted-foreground">⚠️ Needs Work In</p>
          <p className="text-sm font-bold text-foreground capitalize">{bestGrowth[bestGrowth.length - 1]?.key} ({current?.[bestGrowth[bestGrowth.length - 1]?.key as keyof typeof current]} — lowest area)</p>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border">
            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Category</th>
            {monthlyData.map((m, i) => <th key={i} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{m.month}</th>)}
            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Change</th>
          </tr></thead>
          <tbody>
            {['personal', 'professional', 'spiritual', 'relationships', 'health'].map(key => (
              <tr key={key} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium text-foreground capitalize">{key}</td>
                {monthlyData.map((m, i) => <td key={i} className="px-4 py-3 text-foreground">{(m as any)[key]}</td>)}
                <td className="px-4 py-3">
                  {(() => {
                    const change = ((current as any)?.[key] || 0) - ((baseline as any)?.[key] || 0);
                    return <span className={change > 1.5 ? 'text-green-500' : change > 0 ? 'text-yellow-500' : 'text-red-500'}>↑ +{change.toFixed(1)} {change > 1.5 ? '🟢' : '🟡'}</span>;
                  })()}
                </td>
              </tr>
            ))}
            <tr className="font-bold border-t-2 border-border">
              <td className="px-4 py-3 text-foreground">Overall</td>
              {monthlyData.map((m, i) => <td key={i} className="px-4 py-3 text-foreground">{m.overall}%</td>)}
              <td className="px-4 py-3 text-green-500">↑ +{(current?.overall || 0) - (baseline?.overall || 0)}% 🟢</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Category Sections */}
      {categories.map(cat => (
        <details key={cat.key} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <summary className="px-4 py-3 cursor-pointer font-semibold text-foreground hover:bg-muted/30">{cat.label}</summary>
          <div className="px-4 pb-4 space-y-2">
            {cat.metrics.map(m => (
              <div key={m} className="flex items-center gap-3">
                <span className="text-sm text-foreground w-40">{m}</span>
                <input type="range" min="1" max="10" defaultValue={Math.floor(Math.random() * 4) + 5} className="flex-1 accent-primary" />
                <span className="text-sm font-semibold text-primary w-8 text-right">{Math.floor(Math.random() * 4) + 5}</span>
              </div>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
};

export default GrowthMatrixPage;
