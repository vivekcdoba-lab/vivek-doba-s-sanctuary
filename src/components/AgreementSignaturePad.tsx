import { useState, useRef, useCallback } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Eraser, Undo2, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  agreementId: string;
  signerProfileId: string;
  signerRole: "seeker" | "coach" | "admin";
  signerName: string;
  contentToHash: string;
  existing?: {
    storage_path?: string | null;
    typed_name?: string | null;
    signed_at?: string | null;
    content_hash?: string | null;
  } | null;
  onSigned?: () => void;
}

async function sha256(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function fetchIP(): Promise<string | null> {
  try {
    const r = await fetch("https://api.ipify.org?format=json");
    const j = await r.json();
    return j.ip;
  } catch {
    return null;
  }
}

export default function AgreementSignaturePad({
  agreementId,
  signerProfileId,
  signerRole,
  signerName,
  contentToHash,
  existing,
  onSigned,
}: Props) {
  const canvasRef = useRef<SignatureCanvas>(null);
  const [typedName, setTypedName] = useState("");
  const [useTyped, setUseTyped] = useState(false);
  const [saving, setSaving] = useState(false);
  const [signed, setSigned] = useState(!!existing?.storage_path || !!existing?.typed_name);

  const clearCanvas = useCallback(() => canvasRef.current?.clear(), []);
  const undoStroke = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const data = c.toData();
    if (data.length > 0) {
      data.pop();
      c.fromData(data);
    }
  }, []);

  const handleSign = async () => {
    if (!useTyped && canvasRef.current?.isEmpty()) {
      toast.error("Please draw your signature or type your name");
      return;
    }
    if (useTyped && !typedName.trim()) {
      toast.error("Please type your full name");
      return;
    }

    setSaving(true);
    try {
      let blob: Blob;
      if (useTyped) {
        const t = document.createElement("canvas");
        t.width = 400;
        t.height = 150;
        const ctx = t.getContext("2d")!;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 400, 150);
        ctx.font = 'italic 36px "Dancing Script", cursive, serif';
        ctx.fillStyle = "#1a1a2e";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(typedName, 200, 75);
        blob = await new Promise<Blob>((res) => t.toBlob((b) => res(b!), "image/png"));
      } else {
        const dataUrl = canvasRef.current!.getTrimmedCanvas().toDataURL("image/png");
        const res = await fetch(dataUrl);
        blob = await res.blob();
      }

      const signedAt = new Date().toISOString();
      const contentHash = await sha256(contentToHash + signedAt);
      const ip = await fetchIP();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const path = `${user.id}/agreement-${agreementId}-${signerRole}.png`;
      const { error: upErr } = await supabase.storage
        .from("signatures")
        .upload(path, blob, { contentType: "image/png", upsert: true });
      if (upErr) throw upErr;

      const { error: dbErr } = await supabase.from("agreement_signatures" as any).insert({
        agreement_id: agreementId,
        signer_id: signerProfileId,
        signer_role: signerRole,
        storage_path: path,
        typed_name: useTyped ? typedName : null,
        ip_address: ip,
        user_agent: navigator.userAgent,
        content_hash: contentHash,
        signed_at: signedAt,
      });
      if (dbErr) throw dbErr;

      setSigned(true);
      toast.success(`Signed by ${signerName}`);
      onSigned?.();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to save signature");
    } finally {
      setSaving(false);
    }
  };

  if (signed) {
    return (
      <div className="p-3 rounded-lg border-2 border-green-500/40 bg-green-50 dark:bg-green-950/20 text-sm">
        <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-semibold">
          <Check className="w-4 h-4" /> Signed by {signerName}
        </div>
        {existing?.signed_at && (
          <div className="text-xs text-muted-foreground mt-1">
            {new Date(existing.signed_at).toLocaleString("en-IN")}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-3 rounded-lg border border-border bg-card space-y-3">
      <p className="text-sm font-semibold">✍️ {signerName} — please sign below</p>
      {!useTyped ? (
        <div className="space-y-2">
          <div className="border-2 border-dashed border-border rounded-lg bg-background overflow-hidden touch-none">
            <SignatureCanvas
              ref={canvasRef}
              penColor="#1a1a2e"
              canvasProps={{ width: 380, height: 150, className: "w-full h-[150px]", style: { touchAction: "none" } }}
            />
          </div>
          <div className="flex gap-2">
            <button onClick={clearCanvas} className="px-2.5 py-1 rounded text-xs bg-muted hover:bg-muted/80 flex items-center gap-1">
              <Eraser className="w-3 h-3" /> Clear
            </button>
            <button onClick={undoStroke} className="px-2.5 py-1 rounded text-xs bg-muted hover:bg-muted/80 flex items-center gap-1">
              <Undo2 className="w-3 h-3" /> Undo
            </button>
          </div>
        </div>
      ) : (
        <input
          type="text"
          value={typedName}
          onChange={(e) => setTypedName(e.target.value)}
          placeholder="Type your full name"
          className="w-full px-3 py-3 rounded-lg border border-input bg-background text-center text-lg italic"
          style={{ fontFamily: '"Dancing Script", cursive, serif' }}
        />
      )}
      <button onClick={() => setUseTyped(!useTyped)} className="text-xs text-primary hover:underline">
        {useTyped ? "Switch to draw signature" : "Or type your full name"}
      </button>
      <button
        onClick={handleSign}
        disabled={saving}
        className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
      >
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Signing...
          </>
        ) : (
          <>
            <Check className="w-4 h-4" /> Sign Agreement
          </>
        )}
      </button>
    </div>
  );
}
