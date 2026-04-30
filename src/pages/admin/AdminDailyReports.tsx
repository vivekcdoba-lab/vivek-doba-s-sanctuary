import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Mail, Loader2, Send, Clock, CheckCircle2, XCircle, AlertCircle, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { formatDateDMY, toIsoDate } from "@/lib/dateFormat";

interface Settings {
  id: string;
  enabled: boolean;
  send_hour: number;
  send_minute: number;
}

interface LogRow {
  id: string;
  seeker_id: string;
  sent_date: string;
  status: "sent" | "skipped" | "failed";
  error: string | null;
  created_at: string;
}

interface SeekerProfile {
  full_name: string | null;
  email: string | null;
}

export default function AdminDailyReports() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  const [profiles, setProfiles] = useState<Record<string, SeekerProfile>>({});
  const [filterDate, setFilterDate] = useState<Date>(new Date());

  const load = async (dateOverride?: Date) => {
    setLoading(true);
    const targetDate = dateOverride ?? filterDate;
    const dateStr = formatDateDMY(targetDate);
    const [{ data: s }, { data: l }] = await Promise.all([
      supabase.from("daily_report_settings").select("*").maybeSingle(),
      supabase
        .from("daily_progress_email_log")
        .select("id, seeker_id, sent_date, status, error, created_at")
        .eq("sent_date", dateStr)
        .order("created_at", { ascending: false })
        .limit(500),
    ]);
    if (s) setSettings(s as Settings);
    const rows = (l as LogRow[]) || [];
    setLogs(rows);

    const ids = Array.from(new Set(rows.map((r) => r.seeker_id))).filter(Boolean);
    if (ids.length) {
      const { data: p } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", ids);
      const map: Record<string, SeekerProfile> = {};
      (p || []).forEach((row: any) => {
        map[row.id] = { full_name: row.full_name, email: row.email };
      });
      setProfiles(map);
    } else {
      setProfiles({});
    }
    setLoading(false);
  };

  useEffect(() => {
    load(filterDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterDate]);

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    const { error } = await supabase
      .from("daily_report_settings")
      .update({
        enabled: settings.enabled,
        send_hour: settings.send_hour,
        send_minute: settings.send_minute,
        updated_at: new Date().toISOString(),
      })
      .eq("id", settings.id);
    setSaving(false);
    if (error) toast({ title: "Failed to save", description: error.message, variant: "destructive" });
    else toast({ title: "Saved", description: "Daily report settings updated." });
  };

  const sendTest = async () => {
    setSending(true);
    const { data, error } = await supabase.functions.invoke("send-daily-seeker-reports", {
      body: { test: true },
    });
    setSending(false);
    if (error) {
      toast({ title: "Test failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Test sent", description: `Sent ${(data as any)?.sent ?? 0}, skipped ${(data as any)?.skipped ?? 0}` });
      load();
    }
  };

  const runNow = async () => {
    setSending(true);
    const { data, error } = await supabase.functions.invoke("send-daily-seeker-reports", { body: {} });
    setSending(false);
    if (error) {
      toast({ title: "Run failed", description: error.message, variant: "destructive" });
    } else {
      const r: any = data;
      toast({ title: "Run complete", description: `Total ${r?.total} • Sent ${r?.sent} • Skipped ${r?.skipped} • Failed ${r?.failed}` });
      load();
    }
  };

  if (loading || !settings) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const counts = {
    sent: logs.filter((l) => l.status === "sent").length,
    skipped: logs.filter((l) => l.status === "skipped").length,
    failed: logs.filter((l) => l.status === "failed").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Mail className="w-6 h-6 text-primary" /> Daily Seeker Progress Reports
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Each evening, every active seeker receives a personalized recap of their worksheet, LGT scores, streak and tomorrow's focus.
        </p>
      </div>

      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-semibold">Enable daily progress emails</Label>
            <p className="text-xs text-muted-foreground mt-1">Master switch — when off, no seeker emails are sent.</p>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={(v) => setSettings({ ...settings, enabled: v })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-sm">
          <div>
            <Label className="text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> Send hour (UTC)</Label>
            <Input
              type="number"
              min={0}
              max={23}
              value={settings.send_hour}
              onChange={(e) => setSettings({ ...settings, send_hour: parseInt(e.target.value || "0") })}
            />
            <p className="text-[10px] text-muted-foreground mt-1">15 UTC ≈ 20:30 IST</p>
          </div>
          <div>
            <Label className="text-xs">Send minute</Label>
            <Input
              type="number"
              min={0}
              max={59}
              value={settings.send_minute}
              onChange={(e) => setSettings({ ...settings, send_minute: parseInt(e.target.value || "0") })}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Save settings
          </Button>
          <Button variant="outline" onClick={sendTest} disabled={sending}>
            {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
            Send test to me
          </Button>
          <Button variant="secondary" onClick={runNow} disabled={sending}>
            {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
            Run for all seekers now
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 border-l-4 border-green-500">
          <div className="text-xs text-muted-foreground flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-600" /> Sent (recent)</div>
          <div className="text-2xl font-bold text-foreground mt-1">{counts.sent}</div>
        </Card>
        <Card className="p-4 border-l-4 border-amber-500">
          <div className="text-xs text-muted-foreground flex items-center gap-1"><AlertCircle className="w-3 h-3 text-amber-600" /> Skipped</div>
          <div className="text-2xl font-bold text-foreground mt-1">{counts.skipped}</div>
        </Card>
        <Card className="p-4 border-l-4 border-red-500">
          <div className="text-xs text-muted-foreground flex items-center gap-1"><XCircle className="w-3 h-3 text-red-600" /> Failed</div>
          <div className="text-2xl font-bold text-foreground mt-1">{counts.failed}</div>
        </Card>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Delivery log</h2>
          <p className="text-xs text-muted-foreground">
            Showing {logs.length} record{logs.length === 1 ? "" : "s"} for {formatDateDMY(filterDate)}
            {toIsoDate(filterDate) === toIsoDate(new Date()) ? " (today)" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-[220px] justify-start text-left font-normal")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formatDateDMY(filterDate)}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={filterDate}
                onSelect={(d) => d && setFilterDate(d)}
                disabled={(d) => d > new Date()}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          <Button variant="ghost" size="sm" onClick={() => setFilterDate(new Date())}>Today</Button>
        </div>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left p-3 text-xs font-semibold text-muted-foreground">When</th>
              <th className="text-left p-3 text-xs font-semibold text-muted-foreground">Seeker</th>
              <th className="text-left p-3 text-xs font-semibold text-muted-foreground">Date</th>
              <th className="text-left p-3 text-xs font-semibold text-muted-foreground">Status</th>
              <th className="text-left p-3 text-xs font-semibold text-muted-foreground">Error</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No emails sent yet.</td></tr>
            )}
            {logs.map((row) => (
              <tr key={row.id} className="border-b border-border/50 hover:bg-muted/20">
                <td className="p-3 text-xs text-muted-foreground">{new Date(row.created_at).toLocaleString()}</td>
                <td className="p-3 text-xs">
                  <div className="font-semibold text-foreground">{profiles[row.seeker_id]?.full_name || "Unknown seeker"}</div>
                  <div className="text-[11px] text-muted-foreground">{profiles[row.seeker_id]?.email || `${row.seeker_id.slice(0, 8)}…`}</div>
                </td>
                <td className="p-3 text-xs">{row.sent_date}</td>
                <td className="p-3">
                  <Badge
                    className={
                      row.status === "sent" ? "bg-green-500 text-white"
                      : row.status === "skipped" ? "bg-amber-500 text-white"
                      : "bg-red-500 text-white"
                    }
                  >
                    {row.status}
                  </Badge>
                </td>
                <td className="p-3 text-xs text-red-600 truncate max-w-xs">{row.error || ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
