import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, PenLine, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  seekerId: string;
  onSent?: () => void;
}

const today = () => new Date().toISOString().slice(0, 10);

export const SignHereDialog = ({ open, onOpenChange, seekerId, onSent }: Props) => {
  const { toast } = useToast();
  const [docs, setDocs] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [seeker, setSeeker] = useState<{ full_name: string; email: string | null } | null>(null);
  const [fullName, setFullName] = useState("");
  const [place, setPlace] = useState("");
  const [date, setDate] = useState(today());
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setErrorMsg(null);
    setSelected([]);
    setPlace("");
    setDate(today());
    setConsent(false);
    supabase.from("documents").select("id, title, category").eq("is_active", true).then(({ data }) => setDocs(data ?? []));
    supabase.from("profiles").select("full_name, email").eq("id", seekerId).maybeSingle().then(({ data }) => {
      setSeeker(data as any);
      setFullName(data?.full_name ?? "");
    });
  }, [open, seekerId]);

  const toggle = (id: string) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const submit = async () => {
    if (selected.length === 0 || !fullName.trim() || !place.trim() || !date || !consent) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const { data, error } = await supabase.functions.invoke("sign-document-inline", {
        body: {
          seeker_id: seekerId,
          document_ids: selected,
          full_name: fullName.trim(),
          place: place.trim(),
          signature_date: date,
        },
      });
      if (error) throw new Error(error.message ?? "Sign failed");
      if (data?.error) throw new Error(data.error);
      const count = data?.signed?.length ?? selected.length;
      toast({
        title: "Document signed",
        description: `${count} document(s) signed${seeker?.email ? ` and emailed to ${seeker.email}` : ""}.`,
      });
      onSent?.();
      onOpenChange(false);
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Failed to sign");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><PenLine className="w-5 h-5" /> Sign Here</DialogTitle></DialogHeader>
        <div className="space-y-4">
          {errorMsg && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium">Could not sign</div>
                <div className="text-xs opacity-90">{errorMsg}</div>
              </div>
            </div>
          )}

          <div>
            <Label>Select documents</Label>
            <div className="space-y-2 mt-2 max-h-48 overflow-y-auto border rounded p-3">
              {docs.length === 0 && <p className="text-sm text-muted-foreground">No active documents in library.</p>}
              {docs.map(d => (
                <label key={d.id} className="flex items-start gap-2 cursor-pointer">
                  <Checkbox checked={selected.includes(d.id)} onCheckedChange={() => toggle(d.id)} />
                  <div className="text-sm">
                    <div className="font-medium text-foreground">{d.title}</div>
                    <div className="text-xs text-muted-foreground capitalize">{d.category}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Full Name *</Label>
            <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Signer's full name" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Place *</Label>
              <Input value={place} onChange={e => setPlace(e.target.value)} placeholder="City / location" />
            </div>
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
          </div>

          <label className="flex items-start gap-2 text-sm cursor-pointer">
            <Checkbox checked={consent} onCheckedChange={(v) => setConsent(!!v)} className="mt-0.5" />
            <span className="text-muted-foreground">
              I confirm the signer is present and consents to digitally sign the selected document(s) under the Information Technology Act, 2000.
            </span>
          </label>

          <Button
            onClick={submit}
            disabled={selected.length === 0 || !fullName.trim() || !place.trim() || !date || !consent || submitting}
            className="w-full"
          >
            {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing…</> : <><PenLine className="w-4 h-4 mr-2" /> Sign & Save {selected.length || ""} Document{selected.length === 1 ? "" : "s"}</>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SignHereDialog;
