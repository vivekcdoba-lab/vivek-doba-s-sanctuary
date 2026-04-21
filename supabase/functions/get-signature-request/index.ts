import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sha256(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { token } = await req.json();
    if (!token || typeof token !== "string" || token.length < 16) {
      return new Response(JSON.stringify({ error: "Invalid token" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const tokenHash = await sha256(token);
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: reqRow, error } = await admin
      .from("signature_requests")
      .select("id, seeker_id, document_id, status, expires_at, custom_message, signer_name")
      .eq("token_hash", tokenHash)
      .maybeSingle();
    if (error || !reqRow) {
      return new Response(JSON.stringify({ error: "not_found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (reqRow.status !== "pending") {
      return new Response(JSON.stringify({ error: reqRow.status }), { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (new Date(reqRow.expires_at) < new Date()) {
      await admin.from("signature_requests").update({ status: "expired" }).eq("id", reqRow.id);
      return new Response(JSON.stringify({ error: "expired" }), { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: doc } = await admin.from("documents").select("title, description, storage_path").eq("id", reqRow.document_id).single();
    let pdfUrl: string | null = null;
    if (doc?.storage_path) {
      const { data: signed } = await admin.storage.from("documents").createSignedUrl(doc.storage_path, 60 * 30);
      pdfUrl = signed?.signedUrl ?? null;
    }

    return new Response(JSON.stringify({
      request_id: reqRow.id,
      signer_name: reqRow.signer_name,
      custom_message: reqRow.custom_message,
      document: { title: doc?.title, description: doc?.description, pdf_url: pdfUrl },
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
