import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ADMIN_EMAIL = "vivekcdoba@gmail.com";

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
  };
  const formType = typeLabels[data.form_type] || data.form_type;
  const details = data.form_data
    ? Object.entries(data.form_data)
        .filter(([_, v]) => v !== "" && v !== null && v !== undefined)
        .map(([k, v]) => {
          const label = k.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
          const val = typeof v === "object" ? JSON.stringify(v) : String(v);
          return `<tr><td style="padding:6px 12px;font-weight:600;color:#333;border-bottom:1px solid #eee;white-space:nowrap">${label}</td><td style="padding:6px 12px;color:#555;border-bottom:1px solid #eee">${val}</td></tr>`;
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
        <h2 style="color:#333;font-size:16px;margin:0 0 12px">Applicant: ${data.applicant_name}</h2>
        <p style="color:#666;font-size:14px;margin:0 0 4px">📧 ${data.applicant_email}</p>
        ${data.applicant_mobile ? `<p style="color:#666;font-size:14px;margin:0 0 16px">📱 ${data.applicant_mobile}</p>` : ""}
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
      message: "We are thrilled to welcome you! Vivek Sir has reviewed your application and approved it. Our team will reach out to you shortly with next steps.",
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
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#B8860B,#FF9933);padding:20px;border-radius:12px 12px 0 0">
        <h1 style="color:#fff;margin:0;font-size:20px">🪷 Vivek Doba Training Solutions</h1>
      </div>
      <div style="background:#fff;padding:24px;border:1px solid #eee;border-top:none;border-radius:0 0 12px 12px">
        <h2 style="color:${status.color};font-size:18px;margin:0 0 12px">${status.icon} ${status.title}</h2>
        <p style="color:#333;font-size:14px">Dear ${data.applicant_name},</p>
        <p style="color:#555;font-size:14px;line-height:1.6">${status.message}</p>
        ${data.admin_notes ? `<div style="margin:16px 0;padding:12px;background:#F3F4F6;border-left:4px solid ${status.color};border-radius:4px"><p style="margin:0;font-size:13px;color:#333"><strong>Notes from Vivek Sir:</strong><br/>${data.admin_notes}</p></div>` : ""}
        <p style="color:#555;font-size:14px;margin-top:20px">For any questions, reach out:<br/>📞 9607050111 | 📧 info@vivekdoba.in</p>
        <p style="color:#999;font-size:12px;margin-top:24px;border-top:1px solid #eee;padding-top:12px">Made with 🙏 for seekers of transformation</p>
      </div>
    </div>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: "RESEND_API_KEY is not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const data: NotificationRequest = await req.json();

    if (data.type === "new_submission") {
      // Send email to admin
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "VDTS Notifications <onboarding@resend.dev>",
          to: [ADMIN_EMAIL],
          subject: `🪷 New ${data.form_type === "discovery_call" ? "Discovery Call" : data.form_type === "workshop" ? "Workshop Registration" : "LGT Application"} — ${data.applicant_name}`,
          html: buildAdminEmailHtml(data),
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(`Resend API error [${res.status}]: ${JSON.stringify(result)}`);
      }

      return new Response(JSON.stringify({ success: true, id: result.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (data.type === "status_update") {
      // Send email to applicant
      const subjectMap: Record<string, string> = {
        approved: "✅ Your Application is Approved — Vivek Doba Training Solutions",
        rejected: "Application Update — Vivek Doba Training Solutions",
        info_requested: "📋 Additional Information Needed — Vivek Doba Training Solutions",
      };

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Vivek Doba Training Solutions <onboarding@resend.dev>",
          to: [data.applicant_email],
          subject: subjectMap[data.status || "approved"],
          html: buildApplicantEmailHtml(data),
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(`Resend API error [${res.status}]: ${JSON.stringify(result)}`);
      }

      return new Response(JSON.stringify({ success: true, id: result.id }), {
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
