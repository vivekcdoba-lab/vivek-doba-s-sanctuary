import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Phone, Mail, Calendar, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell,
} from "recharts";
import { SeekerSignaturesTab } from "@/components/SeekerSignaturesTab";

const CoachSeekerDetail = () => {
  const { seekerId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [seeker, setSeeker] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [coachNotes, setCoachNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Try fetching real data, fall back to sample
    const fetchData = async () => {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", seekerId!)
          .single();

        if (profile) {
          // Try to get latest wheel assessment
          const { data: wol } = await supabase
            .from("wheel_of_life_assessments")
            .select("*")
            .eq("seeker_id", seekerId!)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          setSeeker({
            id: profile.id,
            name: profile.full_name || "Unknown",
            email: profile.email || "",
            phone: profile.phone || "+91 XXXXX XXXXX",
            program: "LGT Platinum",
            dayCount: 0,
            streak: 0,
            startDate: profile.created_at?.slice(0, 10) || "-",
            wheelScores: wol
              ? {
                  career: wol.career_score, finance: wol.finance_score,
                  health: wol.health_score, family: wol.family_score,
                  romance: wol.romance_score, growth: wol.growth_score,
                  fun: wol.fun_score, environment: wol.environment_score,
                }
              : { career: 5, finance: 5, health: 5, family: 5, romance: 5, growth: 5, fun: 5, environment: 5 },
            notes: wol?.notes || {},
          });
        } else {
          loadSampleData();
        }
      } catch {
        loadSampleData();
      } finally {
        setLoading(false);
      }
    };

    const loadSampleData = () => {
      setSeeker({
        id: seekerId,
        name: "Rajesh Kumar",
        email: "rajesh@example.com",
        phone: "+91 98765 43210",
        program: "LGT Platinum",
        dayCount: 45,
        streak: 12,
        startDate: "2026-03-01",
        wheelScores: {
          career: 6, finance: 3, health: 4, family: 7,
          romance: 5, growth: 6, fun: 5, environment: 6,
        },
        notes: { finance: "Struggling with debt", health: "No exercise routine" },
      });
    };

    fetchData();
  }, [seekerId]);

  const getChartData = () => {
    if (!seeker) return [];
    const names = ["Career", "Finance", "Health", "Family", "Romance", "Growth", "Fun", "Environment"];
    const ids = ["career", "finance", "health", "family", "romance", "growth", "fun", "environment"];
    return names.map((name, i) => ({ spoke: name, score: seeker.wheelScores[ids[i]], target: 8 }));
  };

  const getScoreColor = (score: number) => {
    if (score <= 4) return "hsl(var(--destructive))";
    if (score <= 6) return "hsl(var(--saffron))";
    return "#22C55E";
  };

  const getDangerZones = () => {
    if (!seeker) return [];
    return Object.entries(seeker.wheelScores)
      .filter(([_, score]) => (score as number) <= 4)
      .map(([spoke, score]) => ({ spoke, score }));
  };

  const handleSaveNotes = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!profile) throw new Error("Profile not found");

      const { error } = await supabase.from("coach_assessment_feedback").insert({
        coach_id: profile.id,
        seeker_id: seekerId!,
        assessment_type: "wheel_of_life",
        general_notes: coachNotes,
        shared_with_seeker: false,
      });

      if (error) throw error;

      toast({ title: "Notes Saved! ✅", description: "Your coaching notes have been recorded." });
      setCoachNotes("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to save notes", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  if (!seeker) return <div className="p-8 text-center text-muted-foreground">Seeker not found</div>;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate("/coaching/seeker-assessments")}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Seekers
      </Button>

      {/* Header */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                {seeker.name.split(" ").map((n: string) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold text-foreground">{seeker.name}</h1>
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
                <span><Mail className="w-3 h-3 inline mr-1" />{seeker.email}</span>
                <span><Phone className="w-3 h-3 inline mr-1" />{seeker.phone}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {seeker.program} • Started: {seeker.startDate} • Day {seeker.dayCount} • {seeker.streak} 🔥
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline"><MessageSquare className="w-4 h-4 mr-1" /> Message</Button>
            <Button size="sm" variant="outline"><Calendar className="w-4 h-4 mr-1" /> Schedule</Button>
            <Button size="sm" variant="outline"><Phone className="w-4 h-4 mr-1" /> Call</Button>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="wheel">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="wheel">🎡 Wheel of Life</TabsTrigger>
          <TabsTrigger value="swot">📋 SWOT</TabsTrigger>
          <TabsTrigger value="lgt">△ LGT</TabsTrigger>
          <TabsTrigger value="documents">📄 Documents</TabsTrigger>
          <TabsTrigger value="overview">📈 Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="documents">
          <SeekerSignaturesTab seekerId={seekerId!} />
        </TabsContent>

        <TabsContent value="wheel" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-4">
              <h3 className="font-semibold text-foreground mb-4">🕸️ Life Balance Wheel</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={getChartData()}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="spoke" className="text-xs" />
                  <PolarRadiusAxis domain={[0, 10]} />
                  <Radar name="Target" dataKey="target" stroke="hsl(var(--muted-foreground))" fill="transparent" strokeDasharray="5 5" />
                  <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.4} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold text-foreground mb-4">📊 Score Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="spoke" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    {getChartData().map((entry, index) => (
                      <Cell key={index} fill={getScoreColor(entry.score)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {getDangerZones().length > 0 && (
            <Card className="p-4 border-l-4 border-l-destructive">
              <h3 className="font-semibold text-destructive mb-3">🚨 Danger Zones - Coach Feedback Required</h3>
              <div className="space-y-3">
                {getDangerZones().map(({ spoke, score }) => (
                  <div key={spoke} className="p-3 rounded-lg bg-destructive/5">
                    <div className="flex justify-between items-center">
                      <span className="font-medium capitalize text-foreground">{spoke}</span>
                      <span className="text-sm font-bold text-destructive">{score as number}/10</span>
                    </div>
                    {seeker.notes[spoke] && (
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        Seeker's note: "{seeker.notes[spoke]}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card className="p-4">
            <h3 className="font-semibold text-foreground mb-4">📝 Coaching Notes</h3>
            <Textarea
              value={coachNotes}
              onChange={(e) => setCoachNotes(e.target.value)}
              placeholder="Add your coaching observations, recommendations, and follow-up items..."
              className="min-h-[150px]"
            />
            <div className="flex gap-2 mt-4">
              <Button onClick={handleSaveNotes} disabled={saving || !coachNotes.trim()}>
                {saving ? "Saving..." : "💾 Save Notes"}
              </Button>
              <Button variant="outline">📤 Share Summary with Seeker</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="swot">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">SWOT Assessment view coming soon</p>
          </Card>
        </TabsContent>

        <TabsContent value="lgt">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">LGT Assessment view coming soon</p>
          </Card>
        </TabsContent>

        <TabsContent value="overview">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Combined overview coming soon</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CoachSeekerDetail;
