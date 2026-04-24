import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { SendForSignatureDialog } from "@/components/SendForSignatureDialog";
import { SignHereDialog } from "@/components/SignHereDialog";
import { Download, RefreshCw, X, FileSignature, Loader2, PenLine, Mail } from "lucide-react";

interface Props { seekerId: string; }

interface Row {
  id: string;
  status: string;
  sent_at: string | null;
  signed_at: string | null;
  expires_at: string | null;
  custom_message: string | null;
  documents: { id: string; title: string; category: string | null } | null;
  document_signatures: { signed_pdf_path: string | null }[] | null;
}

const statusVariant = (s: string): "default" | "secondary" | "destructive" | "outline" => {
  if (s === "signed") return "default";
  if (s === "pending") return "secondary";
  if (s === "expired" || s === "cancelled") return "destructive";
  return "outline";
};

const fmt = (d: string | null) => d ? new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";

export const SeekerSignaturesTab = ({ seekerId }: Props) => {
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [signOpen, setSignOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("signature_requests")
      .select("id, status, sent_at, signed_at, expires_at, custom_message, documents(id, title, category), document_signatures(signed_pdf_path)")
      .eq("seeker_id", seekerId)
      .order("sent_at", { ascending: false });
    if (error) toast({ title: "Failed to load", description: error.message, variant: "destructive" });
    else setRows((data ?? []) as any);
    setLoading(false);
  }, [seekerId, toast]);

  useEffect(() => { load(); }, [load]);

  const resend = async (id: string) => {
    setBusy(id);
    try {
      const { data, error } = await supabase.functions.invoke("resend-document-signature", { body: { request_id: id } });
      if (error || data?.error) throw new Error(data?.error ?? error?.message ?? "Failed");
      toast({ title: "Email resent" });
      load();
    } catch (e: any) {
      toast({ title: "Resend failed", description: e.message, variant: "destructive" });
    } finally { setBusy(null); }
  };

  const cancel = async (id: string) => {
    if (!confirm("Cancel this signature request?")) return;
    setBusy(id);
    const { error } = await supabase.from("signature_requests").update({ status: "cancelled", cancelled_at: new Date().toISOString() }).eq("id", id);
    setBusy(null);
    if (error) toast({ title: "Cancel failed", description: error.message, variant: "destructive" });
    else { toast({ title: "Request cancelled" }); load(); }
  };

  const download = async (path: string) => {
    const { data, error } = await supabase.storage.from("signatures").createSignedUrl(path, 60);
    if (error || !data?.signedUrl) { toast({ title: "Download failed", description: error?.message, variant: "destructive" }); return; }
    window.open(data.signedUrl, "_blank");
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2"><FileSignature className="w-5 h-5" /> Documents & Signatures</h3>
          <p className="text-sm text-muted-foreground">Send agreements, NDAs and other documents to this seeker for digital signature.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => setSignOpen(true)}>
            <PenLine className="w-4 h-4 mr-2" /> Sign Here
          </Button>
          <Button onClick={() => setOpen(true)}>
            <Mail className="w-4 h-4 mr-2" /> Send Email for Signature
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin inline mr-2" /> Loading…</div>
      ) : rows.length === 0 ? (
        <div className="py-12 text-center border border-dashed rounded-lg">
          <p className="text-muted-foreground">No documents sent yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Click "Send Document for Signature" to get started.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document</TableHead>
              <TableHead>Sent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Signed</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(r => {
              const signedPath = r.document_signatures?.[0]?.signed_pdf_path;
              const expired = r.status === "pending" && r.expires_at && new Date(r.expires_at) < new Date();
              const effective = expired ? "expired" : r.status;
              return (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="font-medium text-foreground">{r.documents?.title ?? "(deleted document)"}</div>
                    {r.documents?.category && <div className="text-xs text-muted-foreground capitalize">{r.documents.category}</div>}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{fmt(r.sent_at)}</TableCell>
                  <TableCell><Badge variant={statusVariant(effective)} className="capitalize">{effective}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{fmt(r.signed_at)}</TableCell>
                  <TableCell className="text-right space-x-1">
                    {effective === "pending" && (
                      <>
                        <Button size="sm" variant="outline" disabled={busy === r.id} onClick={() => resend(r.id)}>
                          <RefreshCw className="w-3 h-3 mr-1" /> Resend
                        </Button>
                        <Button size="sm" variant="ghost" disabled={busy === r.id} onClick={() => cancel(r.id)}>
                          <X className="w-3 h-3 mr-1" /> Cancel
                        </Button>
                      </>
                    )}
                    {effective === "expired" && (
                      <Button size="sm" variant="outline" disabled={busy === r.id} onClick={() => resend(r.id)}>
                        <RefreshCw className="w-3 h-3 mr-1" /> Resend
                      </Button>
                    )}
                    {effective === "signed" && signedPath && (
                      <Button size="sm" variant="outline" onClick={() => download(signedPath)}>
                        <Download className="w-3 h-3 mr-1" /> Download
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      <SendForSignatureDialog open={open} onOpenChange={setOpen} seekerId={seekerId} onSent={load} />
      <SignHereDialog open={signOpen} onOpenChange={setSignOpen} seekerId={seekerId} onSent={load} />
    </Card>
  );
};

export default SeekerSignaturesTab;
