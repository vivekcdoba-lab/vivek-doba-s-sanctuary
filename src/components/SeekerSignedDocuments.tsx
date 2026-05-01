import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Loader2, FileSignature } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SignedDoc {
  id: string;
  signed_pdf_path: string;
  verification_id: string;
  signature_date: string;
  signed_at: string;
  documents: { title: string; category: string | null } | null;
}

export default function SeekerSignedDocuments() {
  const { profile } = useAuthStore();
  const { toast } = useToast();
  const [rows, setRows] = useState<SignedDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!profile?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("document_signatures")
      .select("id, signed_pdf_path, verification_id, signature_date, signed_at, documents(title, category)")
      .eq("seeker_id", profile.id)
      .order("signed_at", { ascending: false });
    if (error) toast({ title: "Failed to load", description: error.message, variant: "destructive" });
    else setRows((data ?? []) as any);
    setLoading(false);
  }, [profile?.id, toast]);

  useEffect(() => { load(); }, [load]);

  const download = async (id: string, path: string) => {
    setBusy(id);
    const { data, error } = await supabase.storage.from("signatures").createSignedUrl(path, 60);
    setBusy(null);
    if (error || !data?.signedUrl) {
      toast({ title: "Download failed", description: error?.message, variant: "destructive" });
      return;
    }
    window.open(data.signedUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="bg-card rounded-xl p-6 text-center text-muted-foreground border border-border">
        <Loader2 className="w-5 h-5 animate-spin inline mr-2" /> Loading signed documents…
      </div>
    );
  }

  if (rows.length === 0) return null; // hide section if no signed docs

  return (
    <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
      <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <FileSignature className="w-4 h-4 text-primary" /> Signed Documents / हस्ताक्षरित दस्तावेज
      </h2>
      <div className="space-y-2">
        {rows.map(r => (
          <div key={r.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {r.documents?.title ?? "(deleted document)"}
              </p>
              <div className="flex flex-wrap gap-2 items-center mt-1">
                <Badge variant="outline" className="text-[10px]">
                  ✅ Signed {new Date(r.signed_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                </Badge>
                <span className="text-[10px] text-muted-foreground font-mono">
                  ID: {r.verification_id}
                </span>
              </div>
            </div>
            <Button size="sm" variant="outline" disabled={busy === r.id}
              onClick={() => download(r.id, r.signed_pdf_path)}>
              {busy === r.id
                ? <Loader2 className="w-3 h-3 animate-spin" />
                : <><Download className="w-3 h-3 mr-1" /> Download</>}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
