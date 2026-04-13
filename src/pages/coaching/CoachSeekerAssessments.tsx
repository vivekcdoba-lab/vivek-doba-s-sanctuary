import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, AlertTriangle, Eye, MessageSquare, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface SeekerData {
  id: string;
  name: string;
  email: string;
  program: string;
  dayCount: number;
  streak: number;
  wheelScore: number;
  lgtScore: number;
  dangerZones: string[];
  lastAssessment: string;
  status: string;
}

const CoachSeekerAssessments = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [seekers, setSeekers] = useState<SeekerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSeekers: 0,
    assessmentsThisMonth: 0,
    avgWheelScore: 0,
    dangerZoneSeekers: 0,
  });

  useEffect(() => {
    fetchSeekerData();
  }, []);

  const fetchSeekerData = async () => {
    try {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email, role")
        .eq("role", "seeker");

      if (!profiles || profiles.length === 0) {
        setSeekers([
          {
            id: "1", name: "Rajesh Kumar", email: "rajesh@example.com",
            program: "LGT Platinum", dayCount: 45, streak: 12,
            wheelScore: 5.2, lgtScore: 68, dangerZones: ["Finance", "Health"],
            lastAssessment: "2026-04-10", status: "danger",
          },
          {
            id: "2", name: "Priya Sharma", email: "priya@example.com",
            program: "LGT Platinum", dayCount: 90, streak: 30,
            wheelScore: 7.8, lgtScore: 82, dangerZones: [],
            lastAssessment: "2026-04-12", status: "on-track",
          },
          {
            id: "3", name: "Amit Patel", email: "amit@example.com",
            program: "Workshop", dayCount: 20, streak: 5,
            wheelScore: 6.1, lgtScore: 55, dangerZones: ["Romance"],
            lastAssessment: "2026-04-08", status: "needs-attention",
          },
        ]);
        setStats({ totalSeekers: 3, assessmentsThisMonth: 8, avgWheelScore: 6.4, dangerZoneSeekers: 1 });
        setLoading(false);
        return;
      }

      const mapped: SeekerData[] = profiles.map((p) => ({
        id: p.id,
        name: p.full_name || "Unknown",
        email: p.email || "",
        program: "LGT Platinum",
        dayCount: 0,
        streak: 0,
        wheelScore: 0,
        lgtScore: 0,
        dangerZones: [],
        lastAssessment: "-",
        status: "needs-attention",
      }));

      setSeekers(mapped);
      setStats({
        totalSeekers: mapped.length,
        assessmentsThisMonth: 0,
        avgWheelScore: 0,
        dangerZoneSeekers: 0,
      });
    } catch (err) {
      console.error("Error fetching seekers:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "danger":
        return <Badge className="bg-destructive text-destructive-foreground">🚨 Danger Zone</Badge>;
      case "needs-attention":
        return <Badge className="bg-[hsl(var(--saffron))] text-primary-foreground">⚠️ Needs Attention</Badge>;
      case "on-track":
        return <Badge className="bg-green-600 text-white">✅ On Track</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const filteredSeekers = seekers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">📊 Seeker Assessment Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor, analyze, and guide your seekers' transformation journey
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Seekers", value: stats.totalSeekers, sub: "👥 Assigned to you" },
          { label: "Assessments This Month", value: stats.assessmentsThisMonth, sub: "📝 All types" },
          { label: "Avg Wheel Score", value: `${stats.avgWheelScore}/10`, sub: "🎡 Across seekers" },
          { label: "Danger Zone Seekers", value: stats.dangerZoneSeekers, sub: "🚨 Need attention" },
        ].map((s) => (
          <Card key={s.label} className="p-4 text-center">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{s.sub}</p>
          </Card>
        ))}
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search seekers by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </Card>

      {/* Seekers List */}
      <div className="space-y-3">
        {loading ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Loading seekers...</p>
          </Card>
        ) : filteredSeekers.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No seekers found</p>
          </Card>
        ) : (
          filteredSeekers.map((seeker) => (
            <Card key={seeker.id} className="p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {seeker.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground">{seeker.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {seeker.program} • Day {seeker.dayCount} • {seeker.streak} 🔥 streak
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Wheel</p>
                    <p className={`font-bold ${seeker.wheelScore <= 4 ? "text-destructive" : seeker.wheelScore <= 6 ? "text-[hsl(var(--saffron))]" : "text-green-600"}`}>
                      {seeker.wheelScore}/10
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">LGT</p>
                    <p className="font-bold text-foreground">{seeker.lgtScore}%</p>
                  </div>
                </div>

                <div>{getStatusBadge(seeker.status)}</div>

                {seeker.dangerZones.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-destructive">
                    <AlertTriangle className="w-3 h-3" />
                    {seeker.dangerZones.join(", ")}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => navigate(`/coaching/seeker-assessments/${seeker.id}`)}>
                    <Eye className="w-3 h-3 mr-1" /> View
                  </Button>
                  <Button size="sm" variant="outline">
                    <MessageSquare className="w-3 h-3 mr-1" /> Message
                  </Button>
                  <Button size="sm" variant="outline">
                    <Calendar className="w-3 h-3 mr-1" /> Schedule
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default CoachSeekerAssessments;
