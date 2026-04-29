import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { sendEmail } from "../_shared/send-email.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "info@vivekdoba.com";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Auth check — only admins (or cron with shared secret) may invoke
    const cronSecret = Deno.env.get("CRON_SECRET");
    const providedCronSecret = req.headers.get("x-cron-secret");
    const authHeader = req.headers.get("Authorization");

    let authorized = false;

    if (cronSecret && providedCronSecret && providedCronSecret === cronSecret) {
      authorized = true;
    } else if (authHeader?.startsWith("Bearer ")) {
      const userClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );
      const token = authHeader.replace("Bearer ", "");
      const { data: userData } = await userClient.auth.getUser(token);
      if (userData?.user) {
        const { data: profile } = await userClient
          .from("profiles")
          .select("role")
          .eq("user_id", userData.user.id)
          .single();
        if (profile?.role === "admin") authorized = true;
      }
    }

    if (!authorized) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Step 1: Cleanup old sessions (>30 days)
    const { data: deletedCount } = await supabaseAdmin.rpc("cleanup_old_sessions");
    console.log(`Cleaned up ${deletedCount} old sessions`);

    // Step 2: Get daily report
    const { data: report, error: reportError } = await supabaseAdmin.rpc("get_daily_session_report");
    if (reportError) throw reportError;

    const r = report as {
      report_date: string;
      total_sessions: number;
      unique_users: number;
      avg_duration_minutes: number;
      active_now: number;
      logout_reasons: Record<string, number>;
      top_users: Array<{ full_name: string; role: string; session_count: number; avg_min: number }>;
    };

    // Step 3: Build HTML email
    const reasonRows = Object.entries(r.logout_reasons || {})
      .map(([reason, count]) => `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee;text-transform:capitalize">${reason}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:center">${count}</td></tr>`)
      .join("");

    const userRows = (r.top_users || [])
      .map((u) => `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee">${u.full_name}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;text-transform:capitalize">${u.role}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:center">${u.session_count}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:center">${u.avg_min} min</td></tr>`)
      .join("");

    const html = `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#B8860B,#FF9933);padding:20px;border-radius:12px 12px 0 0">
        <h1 style="color:#fff;margin:0;font-size:20px">📊 Daily Session Report</h1>
        <p style="color:rgba(255,255,255,0.85);margin:4px 0 0;font-size:14px">VDTS Platform — ${r.report_date}</p>
      </div>
      <div style="background:#fff;padding:24px;border:1px solid #eee;border-top:none;border-radius:0 0 12px 12px">
        
        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:20px">
          <div style="flex:1;min-width:120px;background:#F0FDF4;padding:16px;border-radius:8px;text-align:center">
            <div style="font-size:28px;font-weight:700;color:#065F46">${r.total_sessions}</div>
            <div style="font-size:12px;color:#666;margin-top:4px">Total Sessions</div>
          </div>
          <div style="flex:1;min-width:120px;background:#EFF6FF;padding:16px;border-radius:8px;text-align:center">
            <div style="font-size:28px;font-weight:700;color:#1D4ED8">${r.unique_users}</div>
            <div style="font-size:12px;color:#666;margin-top:4px">Unique Users</div>
          </div>
          <div style="flex:1;min-width:120px;background:#FFFBEB;padding:16px;border-radius:8px;text-align:center">
            <div style="font-size:28px;font-weight:700;color:#92400E">${r.avg_duration_minutes}</div>
            <div style="font-size:12px;color:#666;margin-top:4px">Avg Duration (min)</div>
          </div>
          <div style="flex:1;min-width:120px;background:#FEF2F2;padding:16px;border-radius:8px;text-align:center">
            <div style="font-size:28px;font-weight:700;color:#991B1B">${r.active_now}</div>
            <div style="font-size:12px;color:#666;margin-top:4px">Active Now</div>
          </div>
        </div>

        ${reasonRows ? `
        <h3 style="font-size:14px;color:#333;margin:20px 0 8px">Logout Reasons</h3>
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <tr style="background:#F9FAFB"><th style="padding:8px 12px;text-align:left">Reason</th><th style="padding:8px 12px;text-align:center">Count</th></tr>
          ${reasonRows}
        </table>` : ""}

        ${userRows ? `
        <h3 style="font-size:14px;color:#333;margin:20px 0 8px">Top Active Users</h3>
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <tr style="background:#F9FAFB"><th style="padding:8px 12px;text-align:left">Name</th><th style="padding:8px 12px;text-align:left">Role</th><th style="padding:8px 12px;text-align:center">Sessions</th><th style="padding:8px 12px;text-align:center">Avg Duration</th></tr>
          ${userRows}
        </table>` : ""}

        <div style="margin-top:20px;padding:12px;background:#F3F4F6;border-radius:8px">
          <p style="margin:0;font-size:12px;color:#666">🧹 Cleaned up <strong>${deletedCount || 0}</strong> sessions older than 30 days.</p>
        </div>

        <p style="color:#999;font-size:11px;margin-top:20px;border-top:1px solid #eee;padding-top:12px">
          Auto-generated by VDTS Platform at ${new Date().toISOString()}
        </p>
      </div>
    </div>`;

    // Step 4: Send email via Lovable Emails queue
    const sendRes = await sendEmail(supabaseAdmin, {
      to: ADMIN_EMAIL,
      subject: `📊 Daily Session Report — ${r.report_date} | ${r.total_sessions} sessions, ${r.unique_users} users`,
      html,
      label: "daily_session_report",
    });

    if (!sendRes.ok) {
      throw new Error(`Email enqueue failed: ${sendRes.error}`);
    }

    return new Response(
      JSON.stringify({ success: true, queue_id: sendRes.queue_id, message_id: sendRes.message_id, report: r, cleaned: deletedCount }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Daily report error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
