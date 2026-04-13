import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Settings, Save } from "lucide-react";

const assessmentMeta: Record<string, { emoji: string; name: string }> = {
  wheel_of_life: { emoji: "🎡", name: "Wheel of Life" },
  swot: { emoji: "📋", name: "SWOT Analysis" },
  lgt: { emoji: "△", name: "LGT Dimension" },
  purusharthas: { emoji: "🕉️", name: "Purusharthas" },
  happiness: { emoji: "😊", name: "Happiness Index" },
  mooch: { emoji: "🧠", name: "MOOCH Patterns" },
  firob: { emoji: "👥", name: "FIRO-B" },
};

const spokes = [
  { emoji: "💼", name: "Career & Work" },
  { emoji: "💰", name: "Finance & Wealth" },
  { emoji: "❤️", name: "Health & Fitness" },
  { emoji: "👨‍👩‍👧‍👦", name: "Family & Relationships" },
  { emoji: "💑", name: "Romance & Intimacy" },
  { emoji: "🎯", name: "Personal Growth" },
  { emoji: "🎉", name: "Fun & Recreation" },
  { emoji: "🏠", name: "Physical Environment" },
];

const AdminAssessmentConfig = () => {
  const [configs, setConfigs] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({ frequency: "monthly", autoReminders: true, coachAlerts: true, dangerThreshold: 4 });
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [configRes, settingsRes] = await Promise.all([
      supabase.from("assessment_config").select("*").order("created_at"),
      supabase.from("system_settings").select("*").eq("category", "assessments").single(),
    ]);
    if (configRes.data) setConfigs(configRes.data);
    if (settingsRes.data) {
      setSettings(settingsRes.data.settings as any);
      setSettingsId(settingsRes.data.id);
    }
    setLoading(false);
  };

  const toggleAssessment = async (id: string, current: boolean) => {
    const { error } = await supabase.from("assessment_config").update({ is_active: !current }).eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setConfigs(prev => prev.map(c => c.id === id ? { ...c, is_active: !current } : c));
    toast({ title: "Updated", description: "Assessment status changed." });
  };

  const saveSettings = async () => {
    if (!settingsId) return;
    const { error } = await supabase.from("system_settings").update({ settings }).eq("id", settingsId);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Settings Saved", description: "Global assessment settings updated." });
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Settings className="w-6 h-6 text-primary" /> Configure Assessments</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage global assessment settings and toggle individual assessments</p>
      </div>

      {/* Global Settings */}
      <Card>
        <CardHeader><CardTitle className="text-lg">⚙️ Global Settings</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div><p className="font-medium text-sm">Assessment Frequency</p><p className="text-xs text-muted-foreground">How often seekers should take assessments</p></div>
            <select className="border rounded-md px-3 py-1.5 text-sm bg-background" value={settings.frequency} onChange={e => setSettings((s: any) => ({ ...s, frequency: e.target.value }))}>
              <option value="weekly">Weekly</option><option value="biweekly">Every 2 Weeks</option><option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div><p className="font-medium text-sm">Auto Reminders</p><p className="text-xs text-muted-foreground">Send automatic assessment reminders</p></div>
            <Switch checked={settings.autoReminders} onCheckedChange={v => setSettings((s: any) => ({ ...s, autoReminders: v }))} />
          </div>
          <div className="flex items-center justify-between">
            <div><p className="font-medium text-sm">Coach Danger Zone Alerts</p><p className="text-xs text-muted-foreground">Notify coaches when seekers hit danger zones</p></div>
            <Switch checked={settings.coachAlerts} onCheckedChange={v => setSettings((s: any) => ({ ...s, coachAlerts: v }))} />
          </div>
          <div className="flex items-center justify-between">
            <div><p className="font-medium text-sm">Danger Zone Threshold</p><p className="text-xs text-muted-foreground">Score at or below which triggers danger zone</p></div>
            <select className="border rounded-md px-3 py-1.5 text-sm bg-background" value={settings.dangerThreshold} onChange={e => setSettings((s: any) => ({ ...s, dangerThreshold: Number(e.target.value) }))}>
              <option value={3}>3 or below</option><option value={4}>4 or below</option><option value={5}>5 or below</option>
            </select>
          </div>
          <Button onClick={saveSettings} className="gap-2"><Save className="w-4 h-4" /> Save Settings</Button>
        </CardContent>
      </Card>

      {/* Assessment Type Toggles */}
      <Card>
        <CardHeader><CardTitle className="text-lg">📋 Assessment Types</CardTitle><CardDescription>Toggle assessments on or off for seekers</CardDescription></CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {configs.map(c => {
              const meta = assessmentMeta[c.assessment_type] || { emoji: "📝", name: c.assessment_type };
              return (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{meta.emoji}</span>
                    <div>
                      <p className="font-medium text-sm">{meta.name}</p>
                      <Badge variant={c.is_active ? "default" : "secondary"} className="text-[10px] mt-0.5">{c.is_active ? "Active" : "Inactive"}</Badge>
                    </div>
                  </div>
                  <Switch checked={c.is_active} onCheckedChange={() => toggleAssessment(c.id, c.is_active)} />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Wheel of Life Spoke Config */}
      <Card>
        <CardHeader><CardTitle className="text-lg">🎡 Wheel of Life Configuration</CardTitle><CardDescription>Configure the 8 spokes and their descriptions</CardDescription></CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {spokes.map((spoke, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg border bg-card">
                <span className="text-lg">{spoke.emoji}</span>
                <Input defaultValue={spoke.name} className="flex-1 h-9" readOnly />
                <Button variant="outline" size="sm">Edit Details</Button>
              </div>
            ))}
          </div>
          <Button variant="outline" className="mt-3 w-full">+ Add Custom Spoke</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAssessmentConfig;
