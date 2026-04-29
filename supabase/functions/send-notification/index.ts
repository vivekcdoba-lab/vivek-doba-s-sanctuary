import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { sendEmail } from "../_shared/send-email.ts";

function getCorsHeaders(_origin: string | null) {
  // Allow all origins — preview, custom domains, and lovable.app subdomains all need access.
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

// RESEND_API_KEY no longer used — emails go through Lovable Emails queue
const ADMIN_EMAIL = "info@vivekdoba.com";

function escapeHtml(v: unknown): string {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeSubject(v: unknown): string {
  return String(v ?? "").replace(/[\r\n]+/g, " ").slice(0, 200);
}

async function getFromAddress(adminClient: any): Promise<string> {
  try {
    const { data } = await adminClient.from('app_settings').select('value').eq('key', 'email_from').maybeSingle();
    if (data?.value && typeof data.value === 'string') return data.value;
  } catch (e) {
    console.warn('[email] app_settings lookup failed', (e as Error).message);
  }
  return Deno.env.get('RESEND_FROM') || 'VDTS <info@vivekdoba.com>';
}

interface NotificationRequest {
  type: "new_submission" | "status_update";
  form_type: string;
  applicant_name: string;
  applicant_email: string;
  applicant_mobile?: string;
  status?: string;
  admin_notes?: string;
  form_data?: Record<string, unknown>;
  submission_id?: string;
}

function buildAdminEmailHtml(data: NotificationRequest): string {
  const typeLabels: Record<string, string> = {
    discovery_call: "📞 Discovery Call",
    workshop: "🎯 Workshop Registration",
    lgt_application: "👑 LGT Application",
    registration: "📝 New Account Registration",
  };
  const formType = typeLabels[data.form_type] || escapeHtml(data.form_type);
  const details = data.form_data
    ? Object.entries(data.form_data)
        .filter(([k, v]) => v !== "" && v !== null && v !== undefined && k !== "password")
        .map(([k, v]) => {
          const label = k.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
          const val = typeof v === "object" ? JSON.stringify(v) : String(v);
          return `<tr><td style="padding:6px 12px;font-weight:600;color:#333;border-bottom:1px solid #eee;white-space:nowrap">${escapeHtml(label)}</td><td style="padding:6px 12px;color:#555;border-bottom:1px solid #eee">${escapeHtml(val)}</td></tr>`;
        })
        .join("")
    : "";

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#B8860B,#FF9933);padding:20px;border-radius:12px 12px 0 0">
        <h1 style="color:#fff;margin:0;font-size:20px">🪷 New ${formType}</h1>
        <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;font-size:14px">Vivek Doba Training Solutions</p>
      </div>
      <div style="background:#fff;padding:20px;border:1px solid #eee;border-top:none;border-radius:0 0 12px 12px">
        <h2 style="color:#333;font-size:16px;margin:0 0 12px">Applicant: ${escapeHtml(data.applicant_name)}</h2>
        <p style="color:#666;font-size:14px;margin:0 0 4px">📧 ${escapeHtml(data.applicant_email)}</p>
        ${data.applicant_mobile ? `<p style="color:#666;font-size:14px;margin:0 0 16px">📱 ${escapeHtml(data.applicant_mobile)}</p>` : ""}
        <table style="width:100%;border-collapse:collapse;font-size:13px">${details}</table>
        <div style="margin-top:20px;padding:12px;background:#FFF3CD;border-radius:8px">
          <p style="margin:0;font-size:13px;color:#856404">⏳ This application is pending your review. Log in to the admin panel to approve, reject, or request more information.</p>
        </div>
      </div>
    </div>`;
}

function buildApplicantEmailHtml(data: NotificationRequest): string {
  const statusMap: Record<string, { icon: string; title: string; color: string; message: string }> = {
    approved: {
      icon: "✅",
      title: "Congratulations! Your Application is Approved",
      color: "#065F46",
      message: data.form_type === "registration"
        ? "We are thrilled to welcome you! Your account has been approved. You can now log in with the email and password you used during registration."
        : "We are thrilled to welcome you! Vivek Sir has reviewed your application and approved it. Our team will reach out to you shortly with next steps.",
    },
    rejected: {
      icon: "🙏",
      title: "Application Update",
      color: "#991B1B",
      message: "Thank you for your interest. After careful review, we are unable to proceed with your application at this time.",
    },
    info_requested: {
      icon: "📋",
      title: "Additional Information Needed",
      color: "#1D4ED8",
      message: "Vivek Sir has reviewed your application and would like some additional information before making a decision.",
    },
  };

  const status = statusMap[data.status || "approved"];
  const safeNotes = data.admin_notes ? escapeHtml(data.admin_notes).replace(/\n/g, "<br/>") : "";
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#B8860B,#FF9933);padding:20px;border-radius:12px 12px 0 0">
        <h1 style="color:#fff;margin:0;font-size:20px">🪷 Vivek Doba Training Solutions</h1>
      </div>
      <div style="background:#fff;padding:24px;border:1px solid #eee;border-top:none;border-radius:0 0 12px 12px">
        <h2 style="color:${status.color};font-size:18px;margin:0 0 12px">${status.icon} ${status.title}</h2>
        <p style="color:#333;font-size:14px">Dear ${escapeHtml(data.applicant_name)},</p>
        <p style="color:#555;font-size:14px;line-height:1.6">${status.message}</p>
        ${safeNotes ? `<div style="margin:16px 0;padding:12px;background:#F3F4F6;border-left:4px solid ${status.color};border-radius:4px"><p style="margin:0;font-size:13px;color:#333"><strong>Notes from Vivek Sir:</strong><br/>${safeNotes}</p></div>` : ""}
        <p style="color:#555;font-size:14px;margin-top:20px">For any questions, reach out:<br/>📞 9607050111 | 📧 info@vivekdoba.com</p>
        <p style="color:#999;font-size:12px;margin-top:24px;border-top:1px solid #eee;padding-top:12px">Made with 🙏 for seekers of transformation</p>
      </div>
    </div>`;
}

async function validateAdmin(req: Request): Promise<{ authorized: boolean; error?: string }> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { authorized: false, error: "Missing authorization header" };
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const token = authHeader.replace("Bearer ", "");
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) {
    return { authorized: false, error: "Invalid token" };
  }

  // Check admin/coach role (including dual-role admins with is_also_coach=true)
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role, is_also_coach")
    .eq("user_id", data.user.id)
    .single();

  if (!profile || (profile.role !== "admin" && profile.role !== "coach" && profile.is_also_coach !== true)) {
    return { authorized: false, error: "Insufficient permissions" };
  }

  return { authorized: true };
}

serve(async (req) => {
  const origin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Lovable Emails queue is used — no per-request RESEND_API_KEY check needed

  // Auth check — only admin/coach can send notifications
  const auth = await validateAdmin(req);
  if (!auth.authorized) {
    return new Response(JSON.stringify({ error: auth.error }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const data: NotificationRequest = await req.json();

    if (data.type === "new_submission") {
      const typeSubjects: Record<string, string> = {
        discovery_call: "Discovery Call",
        workshop: "Workshop Registration",
        lgt_application: "LGT Application",
        registration: "Account Registration",
      };
      const subjectLabel = typeSubjects[data.form_type] || data.form_type;

      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      const r = await sendEmail(supabaseAdmin, {
        to: ADMIN_EMAIL,
        subject: sanitizeSubject(`🪷 New ${subjectLabel} — ${data.applicant_name}`),
        html: buildAdminEmailHtml(data),
        label: "admin_new_submission",
      });
      if (!r.ok) throw new Error(`Email enqueue failed: ${r.error}`);

      return new Response(JSON.stringify({ success: true, message_id: r.message_id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (data.type === "status_update") {
      const subjectMap: Record<string, string> = {
        approved: "✅ Your Application is Approved — Vivek Doba Training Solutions",
        rejected: "Application Update — Vivek Doba Training Solutions",
        info_requested: "📋 Additional Information Needed — Vivek Doba Training Solutions",
      };

      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      const r = await sendEmail(supabaseAdmin, {
        to: data.applicant_email,
        subject: subjectMap[data.status || "approved"],
        html: buildApplicantEmailHtml(data),
        label: `status_update_${data.status || "approved"}`,
      });
      if (!r.ok) throw new Error(`Email enqueue failed: ${r.error}`);

      // Also send WhatsApp notification if mobile number is available
      if (data.applicant_mobile) {
        try {
          const supabaseAdmin = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
          );

          const whatsappMessages: Record<string, string> = {
            approved: `🪷 Namaste ${data.applicant_name}!\n\n✅ Great news! Your application with Vivek Doba Training Solutions has been *approved*.\n\n${data.form_type === "registration" ? "You can now log in to your account using the email and password you registered with." : "Our team will reach out to you shortly with next steps."}\n\nFor questions: 📞 9607050111\n\n🙏 Welcome to your transformation journey!`,
            rejected: `🪷 Namaste ${data.applicant_name},\n\n🙏 Thank you for your interest in Vivek Doba Training Solutions.\n\nAfter careful review, we are unable to proceed with your application at this time.${data.admin_notes ? `\n\nNote: ${data.admin_notes}` : ""}\n\nFor questions: 📞 9607050111`,
            info_requested: `🪷 Namaste ${data.applicant_name},\n\n📋 We need some additional information regarding your application.\n\n${data.admin_notes || "Please check your email for details."}\n\nFor questions: 📞 9607050111`,
          };

          const message = whatsappMessages[data.status || "approved"];
          if (message) {
            await supabaseAdmin.functions.invoke("send-whatsapp", {
              body: { to: data.applicant_mobile, message },
            });
          }
        } catch (whatsappErr) {
          console.error("WhatsApp notification error:", whatsappErr);
        }
      }

      return new Response(JSON.stringify({ success: true, message_id: r.message_id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid notification type" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error sending notification:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
