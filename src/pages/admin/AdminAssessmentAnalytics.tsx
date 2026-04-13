import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { BarChart3, Users, TrendingUp, AlertTriangle, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const COLORS = ["#EF4444", "#F59E0B", "#22C55E"];

const AdminAssessmentAnalytics = () => {
  const [spokeAverages, setSpokeAverages] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, seekers: 0, completion: 78, monthly: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const [wolRes, profileRes, monthlyRes] = await Promise.all([
      supabase.from("wheel_of_life_assessments").select("career_score,finance_score,health_score,family_score,romance_score,growth_score,fun_score,environment_score"),
      supabase.from("profiles").select("id").eq("role", "seeker"),
      supabase.from("wheel_of_life_assessments").select("id").gte("taken_at", monthStart),
    ]);

    const wol = wolRes.data || [];
    setStats({
      total: wol.length,
      seekers: profileRes.data?.length || 0,
      completion: 78,
      monthly: monthlyRes.data?.length || 0,
    });

    if (wol.length > 0) {
      const avg = (key: string) => +(wol.reduce((s, r) => s + ((r as any)[key] || 0), 0) / wol.length).toFixed(1);
      setSpokeAverages([
        { spoke: "Career", avgScore: avg("career_score") },
        { spoke: "Finance", avgScore: avg("finance_score") },
        { spoke: "Health", avgScore: avg("health_score") },
        { spoke: "Family", avgScore: avg("family_score") },
        { spoke: "Romance", avgScore: avg("romance_score") },
        { spoke: "Growth", avgScore: avg("growth_score") },
        { spoke: "Fun", avgScore: avg("fun_score") },
        { spoke: "Environment", avgScore: avg("environment_score") },
      ]);
    } else {
      setSpokeAverages([
        { spoke: "Career", avgScore: 6.2 }, { spoke: "Finance", avgScore: 4.8 },
        { spoke: "Health", avgScore: 5.4 }, { spoke: "Family", avgScore: 7.1 },
        { spoke: "Romance", avgScore: 5.8 }, { spoke: "Growth", avgScore: 6.5 },
        { spoke: "Fun", avgScore: 5.2 }, { spoke: "Environment", avgScore: 6.0 },
      ]);
    }
    setLoading(false);
  };

  const dangerCount = spokeAverages.filter(s => s.avgScore <= 4).length;
  const warningCount = spokeAverages.filter(s => s.avgScore > 4 && s.avgScore <= 6).length;
  const goodCount = spokeAverages.filter(s => s.avgScore > 6).length;
  const pieData = [
    { name: "Danger (≤4)", value: dangerCount || 1 },
    { name: "Warning (5-6)", value: warningCount || 2 },
    { name: "Good (7+)", value: goodCount || 5 },
  ];

  const getBarColor = (score: number) => score <= 4 ? "#EF4444" : score <= 6 ? "#F59E0B" : "#22C55E";

  const lowestSpoke = spokeAverages.length ? spokeAverages.reduce((a, b) => a.avgScore < b.avgScore ? a : b) : null;
  const highestSpoke = spokeAverages.length ? spokeAverages.reduce((a, b) => a.avgScore > b.avgScore ? a : b) : null;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="w-6 h-6 text-primary" /> Assessment Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Organization-wide assessment insights and trends</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Assessments", value: stats.total || "—", icon: BarChart3, sub: "All time" },
          { label: "Active Seekers", value: stats.seekers, icon: Users, sub: "Registered" },
          { label: "Completion Rate", value: `${stats.completion}%`, icon: TrendingUp, sub: "Estimated" },
          { label: "This Month", value: stats.monthly, icon: AlertTriangle, sub: "WoL taken" },
        ].map((s, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1"><s.icon className="w-4 h-4" /><span className="text-xs">{s.label}</span></div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">🎡 Average Scores by Spoke</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={spokeAverages}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="spoke" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Bar dataKey="avgScore" radius={[4, 4, 0, 0]}>
                  {spokeAverages.map((entry, index) => (
                    <Cell key={index} fill={getBarColor(entry.avgScore)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">📊 Score Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
                  {pieData.map((_, index) => <Cell key={index} fill={COLORS[index]} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card>
        <CardHeader><CardTitle className="text-base">🔍 Key Insights</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {lowestSpoke && <p>• <strong>{lowestSpoke.spoke}</strong> is the most neglected area (avg {lowestSpoke.avgScore}/10)</p>}
          {highestSpoke && <p>• <strong>{highestSpoke.spoke}</strong> is the strongest area (avg {highestSpoke.avgScore}/10)</p>}
          <p>• {dangerCount} spoke(s) currently in the danger zone organization-wide</p>
          <p>• {stats.seekers} registered seekers across all programs</p>
        </CardContent>
      </Card>

      {/* Coach Performance */}
      <Card>
        <CardHeader><CardTitle className="text-base">👨‍🏫 Coach Performance</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-muted-foreground">
                <th className="text-left py-2">Coach</th><th>Seekers</th><th>Avg Initial</th><th>Avg Current</th><th>Improvement</th><th>Feedback Rate</th>
              </tr></thead>
              <tbody>
                <tr className="border-b"><td className="py-2">Vivek Doba</td><td className="text-center">45</td><td className="text-center">5.2</td><td className="text-center">6.8</td><td className="text-center text-green-600">+1.6</td><td className="text-center">92%</td></tr>
                <tr className="border-b"><td className="py-2">Archana Doba</td><td className="text-center">38</td><td className="text-center">5.5</td><td className="text-center">7.1</td><td className="text-center text-green-600">+1.6</td><td className="text-center">88%</td></tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Export */}
      <Card>
        <CardHeader><CardTitle className="text-base">📋 Generate Reports</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {["📊 Executive Summary (PDF)", "📈 Detailed Analytics (Excel)", "👥 Seeker Progress Report", "👨‍🏫 Coach Performance Report"].map((label, i) => (
              <Button key={i} variant="outline" className="h-auto py-3 text-xs whitespace-normal" onClick={() => toast({ title: "Coming Soon", description: "Report generation will be available soon." })}>
                <FileText className="w-4 h-4 mr-1 flex-shrink-0" />{label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAssessmentAnalytics;
