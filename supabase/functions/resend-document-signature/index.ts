import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const APP_URL = Deno.env.get("APP_PUBLIC_URL") ?? "https://vivekdoba.com";

function randomToken(len = 48) {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes)).replace(/[^A-Za-z0-9]/g, "").slice(0, 48);
}
async function sha256(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } });
    const { data: claimData, error: claimErr } = await supabase.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (claimErr || !claimData?.claims) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: caller } = await admin.from("profiles").select("role, is_also_coach").eq("user_id", claimData.claims.sub).maybeSingle();
    if (!caller || (caller.role !== "admin" && caller.role !== "coach" && !caller.is_also_coach)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { request_id } = await req.json();
    if (!request_id) return new Response(JSON.stringify({ error: "request_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: reqRow } = await admin.from("signature_requests").select("id, seeker_id, document_id, status").eq("id", request_id).maybeSingle();
    if (!reqRow) return new Response(JSON.stringify({ error: "not_found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (reqRow.status === "signed") return new Response(JSON.stringify({ error: "already_signed" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const token = randomToken();
    const tokenHash = await sha256(token);
    await admin.from("signature_requests").update({
      token_hash: tokenHash,
      status: "pending",
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      sent_at: new Date().toISOString(),
    }).eq("id", request_id);

    const { data: seeker } = await admin.from("profiles").select("full_name, email").eq("id", reqRow.seeker_id).single();
    const { data: doc } = await admin.from("documents").select("title").eq("id", reqRow.document_id).single();

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const link = `${APP_URL}/sign/${token}`;

    if (RESEND_API_KEY && LOVABLE_API_KEY && seeker?.email) {
      await fetch("https://connector-gateway.lovable.dev/resend/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${LOVABLE_API_KEY}`, "X-Connection-Api-Key": RESEND_API_KEY },
        body: JSON.stringify({
          from: "Vivek Doba <onboarding@resend.dev>",
          to: [seeker.email],
          subject: `Reminder: Sign your ${doc?.title}`,
          html: `<p>Dear ${seeker.full_name},</p><p>This is a reminder to sign your <strong>${doc?.title}</strong>.</p>
            <p><a href="${link}" style="background:#FF6B00;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none">Sign Now</a></p>
            <p style="font-size:12px;color:#6b7280">Link expires in 7 days.</p>`,
        }),
      });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
