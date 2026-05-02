// Notify a seeker (email + in-app notification) that their coach has submitted
// a session for review. The seeker must complete Session Notes + Post-Session
// Reflection before the coach can approve.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { sendEmail } from "../_shared/send-email.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const APP_PUBLIC_URL =
  Deno.env.get("APP_PUBLIC_URL") || "https://www.vivekdoba.com";

function escapeHtml(v: unknown): string {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

interface Body {
  session_id?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    // Authenticate caller
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const callerId = userData.user.id;

    const body: Body = await req.json().catch(() => ({}));
    const sessionId = body.session_id;
    if (!sessionId || typeof sessionId !== "string") {
      return new Response(
        JSON.stringify({ error: "session_id required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Authorization: admin OR assigned coach
    const { data: isAdminData } = await admin.rpc("is_admin", {
      _user_id: callerId,
    });
    let allowed = !!isAdminData;
    let sessionRow: any = null;

    const { data: session } = await admin
      .from("sessions")
      .select(
        "id, session_number, session_name, date, start_time, pillar, key_insights, next_session_time, seeker_id, course_id",
      )
      .eq("id", sessionId)
      .maybeSingle();
    if (!session) {
      return new Response(JSON.stringify({ error: "session not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    sessionRow = session;

    if (!allowed) {
      const { data: assigned } = await admin.rpc("is_assigned_coach", {
        _user_id: callerId,
        _seeker_profile_id: session.seeker_id,
      });
      allowed = !!assigned;
    }
    if (!allowed) {
      return new Response(JSON.stringify({ error: "forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Load seeker profile
    const { data: seeker } = await admin
      .from("profiles")
      .select("id, user_id, full_name, email")
      .eq("id", session.seeker_id)
      .maybeSingle();

    const sessionLabel =
      sessionRow.session_name || `Session #${sessionRow.session_number}`;
    const reviewUrl = `${APP_PUBLIC_URL}/seeker/sessions/${sessionRow.id}`;

    console.log("notify-session-submitted", {
      session_id: sessionRow.id,
      seeker_id: session.seeker_id,
      has_user_id: !!seeker?.user_id,
      has_email: !!seeker?.email,
    });

    // In-app notification — try the specific type, fall back to 'system' if a
    // CHECK constraint rejects it (so the email path still runs).
    let inAppResult: any = { skipped: true };
    if (seeker?.user_id) {
      const baseRow = {
        user_id: seeker.user_id,
        title: `📝 ${sessionLabel} — Action Required`,
        message:
          "Your coach has submitted this session. Please complete your Session Notes and Post-Session Reflection.",
        action_url: `/seeker/sessions/${sessionRow.id}`,
      };
      const first = await admin
        .from("notifications")
        .insert({ ...baseRow, type: "session_submitted" });
      if (first.error) {
        console.warn("notification insert failed, falling back to type=system", first.error.message);
        const second = await admin
          .from("notifications")
          .insert({ ...baseRow, type: "system" });
        inAppResult = second.error ? { ok: false, error: second.error.message } : { ok: true, type: "system" };
      } else {
        inAppResult = { ok: true, type: "session_submitted" };
      }
    }

    // Email
    let emailResult: any = { skipped: "no_email" };
    if (seeker?.email) {
      const html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333">
          <div style="background:linear-gradient(135deg,#B8860B,#FF9933);padding:20px;border-radius:12px 12px 0 0">
            <h1 style="color:#fff;margin:0;font-size:20px">🪷 Your Session Has Been Submitted</h1>
            <p style="color:rgba(255,255,255,0.9);margin:4px 0 0;font-size:14px">Vivek Doba Training Solutions</p>
          </div>
          <div style="background:#fff;padding:20px;border:1px solid #eee;border-top:none;border-radius:0 0 12px 12px">
            <p>Namaste ${escapeHtml(seeker.full_name || "Seeker")},</p>
            <p>Your coach has just submitted <b>${escapeHtml(sessionLabel)}</b> from <b>${escapeHtml(sessionRow.date)}</b> for your review.</p>
            ${sessionRow.key_insights ? `<div style="background:#fffbe6;border:1px solid #ffe58f;border-radius:8px;padding:12px;margin:12px 0"><p style="margin:0 0 6px;font-weight:600">💡 Key Insights</p><p style="margin:0;white-space:pre-wrap">${escapeHtml(sessionRow.key_insights)}</p></div>` : ""}
            ${sessionRow.next_session_time ? `<p>📅 <b>Next Session:</b> ${escapeHtml(sessionRow.next_session_time)}</p>` : ""}
            <div style="background:#f0f9ff;border:1px solid #93c5fd;border-radius:8px;padding:14px;margin:18px 0">
              <p style="margin:0 0 8px;font-weight:600;color:#1d4ed8">Action Required</p>
              <p style="margin:0 0 6px">Please open your session and complete:</p>
              <ul style="margin:0 0 0 18px;padding:0">
                <li>Session Notes</li>
                <li>Your Post-Session Reflection</li>
              </ul>
              <p style="margin:8px 0 0;font-size:13px;color:#555">Once you click <b>Save Reflection</b>, your coach can approve and certify the session.</p>
            </div>
            <div style="text-align:center;margin:20px 0">
              <a href="${reviewUrl}" style="display:inline-block;background:linear-gradient(135deg,#B8860B,#FF9933);color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600">Open Session →</a>
            </div>
            <p style="font-size:12px;color:#888;margin-top:20px">— Team VDTS</p>
          </div>
        </div>`;

      emailResult = await sendEmail(admin, {
        to: seeker.email,
        subject: `${sessionLabel} submitted — please complete your reflection`,
        html,
        label: "session_submitted",
      });
    }

    return new Response(
      JSON.stringify({ ok: true, email: emailResult }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
