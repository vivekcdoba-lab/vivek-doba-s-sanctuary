import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { sendEmail } from "../_shared/send-email.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const APP_URL = "https://vivekdoba.com";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Validate caller is admin
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: profile } = await admin
      .from("profiles")
      .select("role, full_name")
      .eq("user_id", userData.user.id)
      .maybeSingle();
    if (!profile || profile.role !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const seekerId: string | undefined = body?.seekerId;
    if (!seekerId || typeof seekerId !== "string") {
      return new Response(JSON.stringify({ error: "seekerId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Load seeker profile
    const { data: seeker, error: seekerErr } = await admin
      .from("profiles")
      .select("id, full_name, email, role")
      .eq("id", seekerId)
      .maybeSingle();
    if (seekerErr || !seeker) {
      return new Response(JSON.stringify({ error: "Seeker not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!seeker.email) {
      return new Response(JSON.stringify({ error: "Seeker has no email on file" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate secure token (UUID v4 — sufficient entropy)
    const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
    const now = new Date().toISOString();

    // Upsert lgt_application row (status stays 'pending'; clear stale tokens)
    const { error: upsertErr } = await admin
      .from("lgt_applications")
      .upsert(
        {
          seeker_id: seekerId,
          status: "pending",
          invite_token: token,
          invite_token_expires_at: expiresAt,
          invited_by: userData.user.id,
          invited_at: now,
          invite_email_sent_at: now,
        },
        { onConflict: "seeker_id" },
      );
    if (upsertErr) {
      console.error("Upsert error:", upsertErr);
      return new Response(JSON.stringify({ error: upsertErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const link = `${APP_URL}/lgt-form/${token}`;
    const seekerName = seeker.full_name || "Seeker";

    const html = `
<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#FFF8F0;font-family:'Segoe UI',Arial,sans-serif;color:#1f2937;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFF8F0;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(128,0,32,0.08);">
        <tr><td style="background:linear-gradient(135deg,#FFD700,#7B1FA2);padding:32px 24px;text-align:center;color:#ffffff;">
          <div style="font-size:42px;line-height:1;">👑</div>
          <h1 style="margin:12px 0 4px;font-size:22px;font-weight:700;">Life's Golden Triangle</h1>
          <p style="margin:0;font-size:13px;opacity:0.9;">Personal Mastery · Professional Excellence · Spiritual Wellbeing</p>
        </td></tr>
        <tr><td style="padding:28px 28px 8px;">
          <p style="margin:0 0 12px;font-size:16px;">🙏 Namaste ${escapeHtml(seekerName)},</p>
          <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#374151;">
            Vivek Sir has invited you to complete your <strong>Life's Golden Triangle Application</strong>. This detailed intake helps us tailor your 180-day transformation journey to your exact life context.
          </p>
          <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#374151;">
            Please set aside <strong>20–30 minutes</strong> in a quiet space and answer with full honesty. Your responses are confidential and reviewed personally by Vivek Sir.
          </p>
        </td></tr>
        <tr><td style="padding:8px 28px 24px;text-align:center;">
          <a href="${link}" style="display:inline-block;padding:14px 32px;background:#FF6B00;color:#ffffff;text-decoration:none;border-radius:12px;font-weight:600;font-size:15px;">Open My Application Form →</a>
          <p style="margin:14px 0 0;font-size:11px;color:#6b7280;">Or copy this link:<br/><span style="color:#7B1FA2;word-break:break-all;">${link}</span></p>
        </td></tr>
        <tr><td style="padding:0 28px 28px;">
          <div style="background:#FFF8F0;border-left:3px solid #FFD700;padding:12px 14px;border-radius:6px;font-size:12px;color:#6b7280;line-height:1.5;">
            🔒 This is a secure, single-use link valid for <strong>14 days</strong>. After you submit, the link will deactivate automatically.
          </div>
          <p style="margin:18px 0 0;font-size:12px;color:#6b7280;text-align:center;">
            Questions? Reply to this email or WhatsApp <a href="https://wa.me/919607050111" style="color:#FF6B00;text-decoration:none;">+91 96070 50111</a>
          </p>
        </td></tr>
        <tr><td style="background:#800020;padding:14px;text-align:center;color:#ffffff;font-size:11px;">
          Vivek Doba Training Solutions · vivekdoba.com
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

    const sendRes = await sendEmail(admin, {
      to: seeker.email,
      subject: "👑 Your Life's Golden Triangle Application — Personal Invitation",
      html,
      label: "lgt_invite",
    });

    if (!sendRes.ok) {
      console.error("LGT invite email enqueue failed:", sendRes.error);
      return new Response(
        JSON.stringify({ success: true, token, link, warning: `Email send failed: ${sendRes.error}` }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ success: true, token, link, sentTo: seeker.email, queue_id: sendRes.queue_id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("send-lgt-invite error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
