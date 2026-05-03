import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAllDbCourses } from "@/hooks/useDbCourses";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Save, Settings2 } from "lucide-react";
import { LIFECYCLE_BADGE_CLASSES, LIFECYCLE_LABELS } from "@/lib/programLifecycle";

interface Rule {
  id: string;
  course_id: string;
  free_sessions: number;
  discounted_sessions: number;
  discounted_rate_inr: number;
  paid_after: number;
  trigger_enrollment_course_id: string | null;
  is_active: boolean;
  notes: string | null;
}

const emptyRule = (course_id: string): Omit<Rule, "id"> => ({
  course_id,
  free_sessions: 0,
  discounted_sessions: 0,
  discounted_rate_inr: 0,
  paid_after: 0,
  trigger_enrollment_course_id: null,
  is_active: true,
  notes: "",
});

export default function AdminCourseSessionRules() {
  const { toast } = useToast();
  const { data: courses = [] } = useAllDbCourses();
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [draft, setDraft] = useState<Omit<Rule, "id"> | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // Dropdown source: never show deactivated programs in LOVs
  const selectableCourses = useMemo(
    () => courses.filter(c => (c.lifecycle_status ?? "active") !== "deactivated"),
    [courses]
  );

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("course_session_rules")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast({ title: "Failed to load", description: error.message, variant: "destructive" });
    else setRules((data ?? []) as any);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const courseName = (id: string | null) =>
    id ? courses.find(c => c.id === id)?.name ?? "(unknown)" : "—";

  const courseStatus = (id: string | null): string =>
    id ? (courses.find(c => c.id === id)?.lifecycle_status ?? "active") : "active";

  const updateRule = (id: string, patch: Partial<Rule>) =>
    setRules(rs => rs.map(r => r.id === id ? { ...r, ...patch } : r));

  const saveRule = async (r: Rule) => {
    setSaving(r.id);
    const { error } = await supabase
      .from("course_session_rules")
      .update({
        course_id: r.course_id,
        free_sessions: r.free_sessions,
        discounted_sessions: r.discounted_sessions,
        discounted_rate_inr: r.discounted_rate_inr,
        paid_after: r.paid_after,
        trigger_enrollment_course_id: r.trigger_enrollment_course_id,
        is_active: r.is_active,
        notes: r.notes,
      })
      .eq("id", r.id);
    setSaving(null);
    if (error) toast({ title: "Save failed", description: error.message, variant: "destructive" });
    else toast({ title: "Rule saved" });
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    setPendingDeleteId(null);
    const { error } = await supabase.from("course_session_rules").delete().eq("id", id);
    if (error) toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    else { toast({ title: "Rule deleted" }); load(); }
  };

  const createRule = async () => {
    if (!draft || !draft.course_id) {
      toast({ title: "Course required", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("course_session_rules").insert(draft);
    if (error) toast({ title: "Create failed", description: error.message, variant: "destructive" });
    else { toast({ title: "Rule created" }); setDraft(null); load(); }
  };

  const activeRules = rules.filter(r => courseStatus(r.course_id) !== "deactivated");
  const deactivatedRules = rules.filter(r => courseStatus(r.course_id) === "deactivated");

  const renderTable = (list: Rule[], muted = false) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Course</TableHead>
          <TableHead>Free</TableHead>
          <TableHead>Discounted</TableHead>
          <TableHead>Disc. Rate (₹)</TableHead>
          <TableHead>Paid After</TableHead>
          <TableHead>Trigger Enrollment</TableHead>
          <TableHead>Active</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {list.map(r => {
          const status = courseStatus(r.course_id);
          return (
            <TableRow key={r.id} className={muted ? "opacity-70" : ""}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2 flex-wrap">
                  <span>{courseName(r.course_id)}</span>
                  {status === "deactivated" && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${LIFECYCLE_BADGE_CLASSES.deactivated}`}>
                      {LIFECYCLE_LABELS.deactivated}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Input type="number" min={0} value={r.free_sessions}
                  onChange={(e) => updateRule(r.id, { free_sessions: +e.target.value || 0 })}
                  className="w-20" />
              </TableCell>
              <TableCell>
                <Input type="number" min={0} value={r.discounted_sessions}
                  onChange={(e) => updateRule(r.id, { discounted_sessions: +e.target.value || 0 })}
                  className="w-20" />
              </TableCell>
              <TableCell>
                <Input type="number" min={0} value={r.discounted_rate_inr}
                  onChange={(e) => updateRule(r.id, { discounted_rate_inr: +e.target.value || 0 })}
                  className="w-24" />
              </TableCell>
              <TableCell>
                <Input type="number" min={0} value={r.paid_after}
                  onChange={(e) => updateRule(r.id, { paid_after: +e.target.value || 0 })}
                  className="w-20" />
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {courseName(r.trigger_enrollment_course_id)}
              </TableCell>
              <TableCell>
                <Switch checked={r.is_active}
                  onCheckedChange={(v) => updateRule(r.id, { is_active: v })} />
              </TableCell>
              <TableCell className="text-right space-x-1">
                <Button size="sm" variant="outline" disabled={saving === r.id}
                  onClick={() => saveRule(r)}>
                  <Save className="w-3 h-3 mr-1" /> Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setPendingDeleteId(r.id)}>
                  <Trash2 className="w-3 h-3 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Settings2 className="w-6 h-6" /> Session Rules
          </h1>
          <p className="text-sm text-muted-foreground">
            Define free / discounted / paid session tiers per course (e.g., free if enrolled in another course).
          </p>
        </div>
        {!draft && (
          <Button onClick={() => setDraft(emptyRule(selectableCourses[0]?.id ?? ""))}>
            <Plus className="w-4 h-4 mr-2" /> Add Rule
          </Button>
        )}
      </div>

      {draft && (
        <Card className="p-5 border-primary/40">
          <h3 className="font-semibold mb-4">New Session Rule</h3>
          <RuleEditor
            value={draft}
            courses={selectableCourses}
            onChange={(p) => setDraft({ ...draft, ...p })}
          />
          <div className="flex gap-2 mt-4">
            <Button onClick={createRule}><Save className="w-4 h-4 mr-2" /> Create</Button>
            <Button variant="ghost" onClick={() => setDraft(null)}>Cancel</Button>
          </div>
        </Card>
      )}

      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin inline mr-2" /> Loading…
          </div>
        ) : activeRules.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">No active session rules configured yet.</div>
        ) : (
          renderTable(activeRules)
        )}
      </Card>

      {!loading && deactivatedRules.length > 0 && (
        <Card className="p-0 overflow-hidden border-dashed">
          <details>
            <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-2">
              <span className={`text-[10px] px-2 py-0.5 rounded ${LIFECYCLE_BADGE_CLASSES.deactivated}`}>
                {LIFECYCLE_LABELS.deactivated}
              </span>
              Deactivated Program Rules ({deactivatedRules.length})
            </summary>
            <div className="border-t border-border">
              {renderTable(deactivatedRules, true)}
            </div>
          </details>
        </Card>
      )}

      <AlertDialog open={!!pendingDeleteId} onOpenChange={(o) => !o && setPendingDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this rule?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The session rule will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function RuleEditor({
  value, courses, onChange,
}: {
  value: Omit<Rule, "id">;
  courses: { id: string; name: string }[];
  onChange: (p: Partial<Omit<Rule, "id">>) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label>Course</Label>
        <Select value={value.course_id} onValueChange={(v) => onChange({ course_id: v })}>
          <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
          <SelectContent>
            {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Trigger Enrollment (optional)</Label>
        <Select
          value={value.trigger_enrollment_course_id ?? "none"}
          onValueChange={(v) => onChange({ trigger_enrollment_course_id: v === "none" ? null : v })}
        >
          <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None — applies always</SelectItem>
            {courses.map(c => <SelectItem key={c.id} value={c.id}>If enrolled in: {c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div><Label>Free Sessions</Label>
        <Input type="number" min={0} value={value.free_sessions}
          onChange={(e) => onChange({ free_sessions: +e.target.value || 0 })} /></div>
      <div><Label>Discounted Sessions</Label>
        <Input type="number" min={0} value={value.discounted_sessions}
          onChange={(e) => onChange({ discounted_sessions: +e.target.value || 0 })} /></div>
      <div><Label>Discounted Rate (₹ per session)</Label>
        <Input type="number" min={0} value={value.discounted_rate_inr}
          onChange={(e) => onChange({ discounted_rate_inr: +e.target.value || 0 })} /></div>
      <div><Label>Paid After (session #)</Label>
        <Input type="number" min={0} value={value.paid_after}
          onChange={(e) => onChange({ paid_after: +e.target.value || 0 })} /></div>
      <div className="md:col-span-2">
        <Label>Notes</Label>
        <Textarea rows={2} value={value.notes ?? ""}
          onChange={(e) => onChange({ notes: e.target.value })}
          placeholder="e.g., Law of Attraction is free for AGT Premium enrollees" />
      </div>
      <div className="md:col-span-2 flex items-center gap-2">
        <Switch checked={value.is_active}
          onCheckedChange={(v) => onChange({ is_active: v })} />
        <Label className="cursor-pointer">Active</Label>
      </div>
    </div>
  );
}
