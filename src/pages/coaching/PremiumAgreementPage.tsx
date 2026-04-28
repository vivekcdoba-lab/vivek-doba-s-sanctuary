import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useFeeStructure, type FeeStructureFields } from "@/hooks/useFeeStructure";
import PremiumAgreementDocument, { type PremiumAgreementClient } from "@/components/PremiumAgreementDocument";
import AgreementSignaturePad from "@/components/AgreementSignaturePad";
import { generatePremiumAgreementPdf } from "@/lib/premiumAgreementPdfExport";
import { Button } from "@/components/ui/button";
import { Loader2, Download, FileText, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface SeekerProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
}

interface AgreementRow {
  id: string;
  client_id: string;
  coach_id: string;
  type: string;
  fields_json: any;
  signed_at: string | null;
  created_at: string;
}

interface SignatureRow {
  id: string;
  agreement_id: string;
  signer_id: string;
  signer_role: string;
  storage_path: string | null;
  typed_name: string | null;
  content_hash: string;
  signed_at: string;
}

export default function PremiumAgreementPage() {
  const { seekerId } = useParams<{ seekerId: string }>();
  const navigate = useNavigate();

  const [seeker, setSeeker] = useState<SeekerProfile | null>(null);
  const [agreement, setAgreement] = useState<AgreementRow | null>(null);
  const [signatures, setSignatures] = useState<SignatureRow[]>([]);
  const [coachProfileId, setCoachProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [seekerSigUrl, setSeekerSigUrl] = useState<string | null>(null);
  const [coachSigUrl, setCoachSigUrl] = useState<string | null>(null);

  const { data: feeRow, isLoading: feeLoading } = useFeeStructure(seekerId);
  const fee: FeeStructureFields | null = (feeRow?.fields_json as any) || null;

  // Load seeker, current user (coach), agreement
  useEffect(() => {
    if (!seekerId) return;
    (async () => {
      setLoading(true);
      try {
        const { data: s } = await supabase
          .from("profiles")
          .select("id, user_id, full_name, email, phone")
          .eq("id", seekerId)
          .single();
        setSeeker(s as any);

        const { data: u } = await supabase.auth.getUser();
        if (u.user) {
          const { data: cp } = await supabase
            .from("profiles")
            .select("id")
            .eq("user_id", u.user.id)
            .single();
          if (cp) setCoachProfileId((cp as any).id);
        }

        const { data: a } = await supabase
          .from("agreements")
          .select("*")
          .eq("client_id", seekerId)
          .eq("type", "premium_agreement")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (a) {
          setAgreement(a as any);
          const { data: sigs } = await supabase
            .from("agreement_signatures" as any)
            .select("*")
            .eq("agreement_id", (a as any).id);
          setSignatures((sigs as any) || []);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [seekerId]);

  // Sign URLs for signature images
  useEffect(() => {
    (async () => {
      const seekerSig = signatures.find((s) => s.signer_role === "seeker");
      const coachSig = signatures.find((s) => s.signer_role === "coach" || s.signer_role === "admin");

      if (seekerSig?.storage_path) {
        const { data } = await supabase.storage.from("signatures").createSignedUrl(seekerSig.storage_path, 3600);
        setSeekerSigUrl(data?.signedUrl || null);
      } else setSeekerSigUrl(null);

      if (coachSig?.storage_path) {
        const { data } = await supabase.storage.from("signatures").createSignedUrl(coachSig.storage_path, 3600);
        setCoachSigUrl(data?.signedUrl || null);
      } else setCoachSigUrl(null);
    })();
  }, [signatures]);

  const client: PremiumAgreementClient = useMemo(
    () => ({
      fullName: seeker?.full_name || "—",
      email: seeker?.email || "—",
      phone: seeker?.phone || "—",
      startDate: fee?.startDate || "",
    }),
    [seeker, fee]
  );

  const seekerSig = signatures.find((s) => s.signer_role === "seeker") || null;
  const coachSig = signatures.find((s) => s.signer_role === "coach" || s.signer_role === "admin") || null;

  const status: "no_fee" | "draft" | "awaiting_seeker" | "awaiting_coach" | "signed" = useMemo(() => {
    if (!fee) return "no_fee";
    if (!agreement) return "draft";
    if (!seekerSig) return "awaiting_seeker";
    if (!coachSig) return "awaiting_coach";
    return "signed";
  }, [fee, agreement, seekerSig, coachSig]);

  const contentHash = useMemo(
    () =>
      JSON.stringify({
        client,
        fee,
        agreementId: agreement?.id || null,
      }),
    [client, fee, agreement]
  );

  const handleCreate = async () => {
    if (!seekerId || !coachProfileId) return;
    setCreating(true);
    try {
      const { data, error } = await supabase
        .from("agreements")
        .insert({
          client_id: seekerId,
          coach_id: coachProfileId,
          type: "premium_agreement",
          fields_json: { generated_at: new Date().toISOString(), status: "awaiting_seeker" },
          signed_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      setAgreement(data as any);
      toast.success("Premium Agreement created. Ready for signatures.");
    } catch (e: any) {
      toast.error(e.message || "Failed to create agreement");
    } finally {
      setCreating(false);
    }
  };

  const refreshSignatures = async () => {
    if (!agreement) return;
    const { data } = await supabase
      .from("agreement_signatures" as any)
      .select("*")
      .eq("agreement_id", agreement.id);
    setSignatures((data as any) || []);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const safeName = (seeker?.full_name || "Seeker").replace(/[^a-zA-Z0-9]+/g, "-");
      const { blob, filename } = await generatePremiumAgreementPdf({
        filename: `Coaching-Agreement-${safeName}-${new Date().toISOString().slice(0, 10)}.pdf`,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Agreement downloaded");
    } catch (e: any) {
      toast.error(e.message || "PDF generation failed");
    } finally {
      setDownloading(false);
    }
  };

  if (loading || feeLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#8B0000]" />
              Premium Coaching Agreement
            </h1>
            <p className="text-sm text-muted-foreground">
              For: <b>{seeker?.full_name}</b> · Status:{" "}
              <span className="font-semibold">
                {{
                  no_fee: "⚠ No Fee Structure",
                  draft: "Draft (not created)",
                  awaiting_seeker: "Awaiting Seeker Signature",
                  awaiting_coach: "Awaiting Coach Signature",
                  signed: "✓ Fully Signed",
                }[status]}
              </span>
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {status === "draft" && (
            <Button onClick={handleCreate} disabled={creating || !coachProfileId}>
              {creating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              Create Agreement
            </Button>
          )}
          {agreement && (
            <Button variant="outline" onClick={handleDownload} disabled={downloading}>
              {downloading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Download className="w-4 h-4 mr-1" />}
              Download PDF
            </Button>
          )}
        </div>
      </div>

      {status === "no_fee" && (
        <div className="p-4 bg-amber-50 border border-amber-400 rounded-lg text-amber-900">
          ⚠ No <b>Fee Structure</b> found for this seeker. Please complete it under
          <b> Seekers → Documents → Fee Structure</b> before generating the Premium Agreement.
        </div>
      )}

      {/* Signing panels — visible once agreement exists */}
      {agreement && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {seeker && (
            <AgreementSignaturePad
              agreementId={agreement.id}
              signerProfileId={seeker.id}
              signerRole="seeker"
              signerName={seeker.full_name}
              contentToHash={contentHash}
              existing={
                seekerSig
                  ? {
                      storage_path: seekerSig.storage_path,
                      typed_name: seekerSig.typed_name,
                      signed_at: seekerSig.signed_at,
                      content_hash: seekerSig.content_hash,
                    }
                  : null
              }
              onSigned={refreshSignatures}
            />
          )}
          {coachProfileId && (
            <AgreementSignaturePad
              agreementId={agreement.id}
              signerProfileId={coachProfileId}
              signerRole="coach"
              signerName="Vivek Doba (Coach)"
              contentToHash={contentHash}
              existing={
                coachSig
                  ? {
                      storage_path: coachSig.storage_path,
                      typed_name: coachSig.typed_name,
                      signed_at: coachSig.signed_at,
                      content_hash: coachSig.content_hash,
                    }
                  : null
              }
              onSigned={refreshSignatures}
            />
          )}
        </div>
      )}

      {/* The full 12-page document preview */}
      <PremiumAgreementDocument
        client={client}
        fee={fee}
        seekerSignature={
          seekerSig
            ? {
                storage_path: seekerSig.storage_path,
                typed_name: seekerSig.typed_name,
                signed_at: seekerSig.signed_at,
              }
            : null
        }
        coachSignature={
          coachSig
            ? {
                storage_path: coachSig.storage_path,
                typed_name: coachSig.typed_name,
                signed_at: coachSig.signed_at,
              }
            : null
        }
        signatureImageUrls={{ seeker: seekerSigUrl, coach: coachSigUrl }}
      />
    </div>
  );
}
