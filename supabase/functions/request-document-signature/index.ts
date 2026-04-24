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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const callerId = user.id;

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: callerProfile } = await admin.from("profiles").select("id, role, is_also_coach").eq("user_id", callerId).maybeSingle();
    if (!callerProfile || (callerProfile.role !== "admin" && callerProfile.role !== "coach" && !callerProfile.is_also_coach)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await req.json();
    const { seeker_id, document_ids, session_id, custom_message } = body ?? {};
    if (!seeker_id || !Array.isArray(document_ids) || document_ids.length === 0) {
      return new Response(JSON.stringify({ error: "seeker_id and document_ids[] required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: seeker, error: seekerErr } = await admin.from("profiles").select("id, full_name, email").eq("id", seeker_id).single();
    if (seekerErr || !seeker) {
      return new Response(JSON.stringify({ error: "Seeker not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!seeker.email) {
      return new Response(JSON.stringify({ error: "Seeker has no email on file" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: docs, error: docsErr } = await admin.from("documents").select("id, title, description").in("id", document_ids).eq("is_active", true);
    if (docsErr || !docs || docs.length === 0) {
      return new Response(JSON.stringify({ error: "No active documents" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const created: any[] = [];

    for (const doc of docs) {
      const token = randomToken();
      const tokenHash = await sha256(token);
      const { data: req, error: reqErr } = await admin.from("signature_requests").insert({
        seeker_id, document_id: doc.id, session_id: session_id ?? null,
        signer_name: seeker.full_name, token_hash: tokenHash,
        custom_message: custom_message ?? null, created_by: callerProfile.id,
      }).select("id").single();
      if (reqErr) { console.error(reqErr); continue; }

      const link = `${APP_URL}/sign/${token}`;
      const html = `
        <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1f2937">
          <p>Dear ${seeker.full_name ?? "Seeker"},</p>
          <p>I hope this message finds you well.</p>
          <p>Please review and sign the attached agreement document at your earliest convenience. If you have any questions or need any clarification, feel free to reach out.</p>
          <p style="background:#FFF8F0;padding:16px;border-radius:8px;border-left:4px solid #FF6B00">
            <strong>${doc.title}</strong><br/>
            <span style="color:#6b7280;font-size:14px">${doc.description ?? ""}</span>
          </p>
          ${custom_message ? `<p style="font-style:italic;color:#374151">"${custom_message}"</p>` : ""}
          <p style="text-align:center;margin:32px 0">
            <a href="${link}" style="background:#FF6B00;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600">Open Signing Page</a>
          </p>
          <p style="font-size:13px;color:#6b7280">This link expires in 7 days. If the button doesn't work, copy this URL: <br/><span style="word-break:break-all">${link}</span></p>
          <p>Looking forward to your confirmation.</p>
          <p>Best regards,<br/>VDTS</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
          <p style="font-size:12px;color:#9ca3af">Vivek Doba Training Solutions</p>
        </div>`;

      if (RESEND_API_KEY && LOVABLE_API_KEY) {
        try {
          await fetch("https://connector-gateway.lovable.dev/resend/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${LOVABLE_API_KEY}`,
              "X-Connection-Api-Key": RESEND_API_KEY,
            },
            body: JSON.stringify({
              from: "Vivek Doba <onboarding@resend.dev>",
              to: [seeker.email],
              subject: "Request to Sign Agreement Document",
              html,
            }),
          });
        } catch (e) { console.error("email send failed", e); }
      }
      created.push({ request_id: req.id, document: doc.title });
    }

    return new Response(JSON.stringify({ success: true, created }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
