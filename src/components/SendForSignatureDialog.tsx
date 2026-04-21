import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  seekerId: string;
  onSent?: () => void;
}

export const SendForSignatureDialog = ({ open, onOpenChange, seekerId, onSent }: Props) => {
  const { toast } = useToast();
  const [docs, setDocs] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open) return;
    supabase.from("documents").select("id, title, category").eq("is_active", true).then(({ data }) => setDocs(data ?? []));
  }, [open]);

  const toggle = (id: string) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const send = async () => {
    if (selected.length === 0) return;
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("request-document-signature", {
        body: { seeker_id: seekerId, document_ids: selected, custom_message: message.trim() || null },
      });
      if (error || data?.error) throw new Error(data?.error ?? "Failed");
      toast({ title: "Sent for signature", description: `${data.created.length} email(s) sent` });
      onOpenChange(false); setSelected([]); setMessage(""); onSent?.();
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    } finally { setSending(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Send Document for Signature</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Select documents</Label>
            <div className="space-y-2 mt-2 max-h-60 overflow-y-auto border rounded p-3">
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
          <div>
            <Label>Custom message (optional)</Label>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} placeholder="Add a personal note to the email…" />
          </div>
          <Button onClick={send} disabled={selected.length === 0 || sending} className="w-full">
            {sending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending…</> : <><Send className="w-4 h-4 mr-2" /> Send {selected.length || ""} Email{selected.length === 1 ? "" : "s"}</>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
