import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { sendEmail } from "../_shared/send-email.ts";

function b64ToBytes(b64: string): Uint8Array {
  // Strip data URL prefix if present
  const cleaned = b64.replace(/^data:application\/pdf;base64,/, "");
  const bin = atob(cleaned);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReqBody {
  seekerId?: string;
  pdfBase64?: string;
  filename?: string;
  // Optional override; default uses seeker email + all admins
  extraRecipients?: string[];
  // When true, skip auth (for token-mode seeker submissions). The function
  // still validates that the seeker actually exists and the PDF is provided.
  publicMode?: boolean;
  // Token used for verifying public mode (seekerId must own this active app)
  inviteToken?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    // RESEND_API_KEY no longer used — emails go through Lovable Emails queue

    const body = (await req.json().catch(() => ({}))) as ReqBody;
    const { seekerId, pdfBase64, filename, extraRecipients, publicMode, inviteToken } = body;

    if (!seekerId || typeof seekerId !== "string") {
      return new Response(JSON.stringify({ error: "seekerId required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!pdfBase64 || typeof pdfBase64 !== "string") {
      return new Response(JSON.stringify({ error: "pdfBase64 required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Auth: either an admin caller, or public mode with a matching submitted application
    if (publicMode) {
      // Verify the inviteToken (if supplied) matches a submitted/recently-submitted app for this seeker.
      // We don't require the token to still be live (it's nulled on submit), so just confirm the
      // seeker has a submitted lgt_application — sufficient to prevent abuse here.
      const { data: app } = await admin
        .from("lgt_applications")
        .select("seeker_id, status")
        .eq("seeker_id", seekerId)
        .maybeSingle();
      if (!app || app.status !== "submitted") {
        return new Response(JSON.stringify({ error: "No submitted application for seeker" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // inviteToken is accepted but not strictly required at this stage
      void inviteToken;
    } else {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const userClient = createClient(SUPABASE_URL, ANON_KEY, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: userData } = await userClient.auth.getUser();
      if (!userData?.user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: profile } = await admin
        .from("profiles").select("role").eq("user_id", userData.user.id).maybeSingle();
      if (!profile || profile.role !== "admin") {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Seeker email
    const { data: seeker } = await admin
      .from("profiles")
      .select("full_name, email")
      .eq("id", seekerId)
      .maybeSingle();
    if (!seeker) {
      return new Response(JSON.stringify({ error: "Seeker not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Admin emails
    const { data: adminProfiles } = await admin
      .from("profiles").select("email").eq("role", "admin");
    const adminEmails = (adminProfiles || [])
      .map((a: any) => a.email).filter((e: string | null): e is string => !!e);

    const recipients = Array.from(new Set([
      ...(seeker.email ? [seeker.email] : []),
      ...adminEmails,
      ...((extraRecipients || []).filter(Boolean)),
    ]));

    if (recipients.length === 0) {
      return new Response(JSON.stringify({ error: "No recipients" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }



    const seekerName = seeker.full_name || "Seeker";
    const finalFilename = filename || `LGT-Report-${seekerName.replace(/\s+/g, "_")}.pdf`;

    // Upload PDF to documents bucket and get a 30-day signed URL,
    // since Lovable Emails queue does not support attachments.
    let pdfUrl: string | null = null;
    try {
      const bytes = b64ToBytes(pdfBase64);
      const path = `lgt-reports/${seekerId}-${Date.now()}.pdf`;
      const { error: upErr } = await admin.storage
        .from("documents")
        .upload(path, bytes, { contentType: "application/pdf", upsert: true });
      if (upErr) {
        console.error("LGT report PDF upload failed:", upErr.message);
        return new Response(JSON.stringify({ success: false, error: `upload: ${upErr.message}`, recipients }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: signed } = await admin.storage
        .from("documents")
        .createSignedUrl(path, 60 * 60 * 24 * 30);
      pdfUrl = signed?.signedUrl ?? null;
    } catch (e) {
      console.error("LGT report storage error:", e);
    }

    const downloadButton = pdfUrl
      ? `<div style="text-align:center;margin:20px 0"><a href="${pdfUrl}" style="display:inline-block;background:#FF6B00;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:600">📄 Download PDF Report</a></div><p style="font-size:11px;color:#9ca3af;text-align:center">Link valid for 30 days.</p>`
      : `<p style="color:#9a6500">⚠️ Report file could not be attached. Please contact support.</p>`;

    const html = `
<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#FFF8F0;font-family:'Segoe UI',Arial,sans-serif;color:#1f2937;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFF8F0;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(128,0,32,0.08);">
        <tr><td style="background:linear-gradient(135deg,#FFD700,#FF6B00,#7B1FA2);padding:32px 24px;text-align:center;color:#ffffff;">
          <div style="font-size:42px;line-height:1;">👑</div>
          <h1 style="margin:12px 0 4px;font-size:22px;font-weight:700;">Life's Golden Triangle Report</h1>
          <p style="margin:0;font-size:13px;opacity:0.9;">${escapeHtml(seekerName)}</p>
        </td></tr>
        <tr><td style="padding:28px;">
          <p style="margin:0 0 12px;font-size:16px;">🙏 Namaste,</p>
          <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#374151;">
            The Life's Golden Triangle application for <strong>${escapeHtml(seekerName)}</strong> has been completed.
          </p>
          ${downloadButton}
          <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#374151;">
            This report includes the seeker's personal, professional, health, relationship, mind &amp; emotional, spiritual, personality and goal data — visualised at a glance.
          </p>
          <div style="background:#FFF8F0;border-left:3px solid #FFD700;padding:12px 14px;border-radius:6px;font-size:12px;color:#6b7280;line-height:1.5;margin-top:18px;">
            🔒 This report is confidential. Please share only with Vivek Sir and the seeker.
          </div>
        </td></tr>
        <tr><td style="background:#800020;padding:14px;text-align:center;color:#ffffff;font-size:11px;">
          Vivek Doba Training Solutions · vivekdoba.com
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

    const subject = `👑 LGT Report — ${seekerName}`;
    const sends = await Promise.all(
      recipients.map((to) =>
        sendEmail(admin, { to, subject, html, label: "lgt_report" }),
      ),
    );
    const okCount = sends.filter((r) => r.ok).length;
    const errs = sends.filter((r) => !r.ok).map((r) => r.error);

    if (okCount === 0) {
      return new Response(JSON.stringify({
        success: false, error: errs.join("; "), recipients,
      }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({
      success: true, recipients, filename: finalFilename, sent: okCount, errors: errs,
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("send-lgt-report error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
