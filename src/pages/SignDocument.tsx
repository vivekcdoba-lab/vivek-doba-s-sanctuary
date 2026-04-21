import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const SignDocument = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [place, setPlace] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ verification_id: string } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("get-signature-request", { body: { token } });
        if (error || data?.error) { setError(data?.error ?? "Could not load request"); return; }
        setInfo(data);
        setFullName(data.signer_name ?? "");
      } catch (e: any) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent || !fullName.trim() || !place.trim()) return;
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("submit-signature", {
        body: { token, full_name: fullName.trim(), place: place.trim(), signature_date: date, consent: true, user_agent: navigator.userAgent },
      });
      if (error || data?.error) throw new Error(data?.error ?? "Failed");
      setDone({ verification_id: data.verification_id });
    } catch (e: any) { setError(e.message); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2 text-foreground">
          {error === "expired" ? "Link Expired" : error === "signed" ? "Already Signed" : error === "cancelled" ? "Request Cancelled" : "Invalid Link"}
        </h2>
        <p className="text-muted-foreground">Please contact your coach for a new signing link.</p>
      </Card>
    </div>
  );

  if (done) return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md p-8 text-center">
        <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2 text-foreground">Document Signed! 🙏</h2>
        <p className="text-muted-foreground mb-4">Verification ID:</p>
        <p className="font-mono font-bold text-lg mb-6">{done.verification_id}</p>
        <p className="text-sm text-muted-foreground">Check your email — your signed copy has been sent.</p>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="p-6">
          <h1 className="text-2xl font-bold text-foreground">{info?.document?.title ?? "Document"}</h1>
          {info?.document?.description && <p className="text-muted-foreground mt-2">{info.document.description}</p>}
          {info?.custom_message && <p className="mt-3 italic text-sm bg-muted p-3 rounded">{info.custom_message}</p>}
        </Card>

        {info?.document?.pdf_url && (
          <Card className="p-2 overflow-hidden">
            <iframe src={info.document.pdf_url} className="w-full h-[600px] rounded" title="Document preview" />
          </Card>
        )}

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 text-foreground">Sign Document</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Legal Name *</Label>
              <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} required maxLength={200} />
            </div>
            <div>
              <Label htmlFor="place">Place *</Label>
              <Input id="place" value={place} onChange={(e) => setPlace(e.target.value)} placeholder="e.g. Pune, Maharashtra" required maxLength={200} />
            </div>
            <div>
              <Label htmlFor="date">Date *</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="flex items-start gap-2 pt-2">
              <Checkbox id="consent" checked={consent} onCheckedChange={(v) => setConsent(v === true)} />
              <Label htmlFor="consent" className="text-sm font-normal leading-snug cursor-pointer">
                I confirm the above is my legal electronic signature, I have read the document, and I agree to be bound by its terms under the IT Act, 2000.
              </Label>
            </div>
            <Button type="submit" disabled={!consent || submitting || !fullName.trim() || !place.trim()} className="w-full">
              {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing…</> : "Sign Document"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default SignDocument;
