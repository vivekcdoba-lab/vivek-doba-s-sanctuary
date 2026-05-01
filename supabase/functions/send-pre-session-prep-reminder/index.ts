// Hourly job. For seekers whose next session falls 23–25 hours from now,
// send a "complete prep before session" email with links to weekly review,
// challenges, and gratitude wall. One email per session per seeker.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { sendEmail } from "../_shared/send-email.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

type Lang = "en" | "hi" | "mr";
const SITE = "https://www.vivekdoba.com";

const T = {
  subject: {
    en: "📅 Session tomorrow — please complete your prep",
    hi: "📅 कल आपका सत्र है — कृपया तैयारी पूरी करें",
    mr: "📅 उद्या तुमचे सत्र आहे — कृपया तयारी पूर्ण करा",
  } as Record<Lang,string>,
  hi: { en: "Namaste", hi: "नमस्ते", mr: "नमस्कार" } as Record<Lang,string>,
  intro: {
    en: "Your next session is tomorrow. Please finish the following before we meet:",
    hi: "आपका अगला सत्र कल है। मिलने से पहले कृपया ये पूरा करें:",
    mr: "तुमचे पुढील सत्र उद्या आहे. भेटण्यापूर्वी कृपया खालील पूर्ण करा:",
  } as Record<Lang,string>,
  weekly: { en: "Complete Weekly Review", hi: "साप्ताहिक समीक्षा पूरी करें", mr: "साप्ताहिक आढावा पूर्ण करा" } as Record<Lang,string>,
  chal:   { en: "Finish Active Challenge",  hi: "सक्रिय चुनौती पूरी करें",      mr: "सक्रिय चॅलेंज पूर्ण करा" } as Record<Lang,string>,
  grat:   { en: "Write Today's Gratitude",  hi: "आज की कृतज्ञता लिखें",        mr: "आजची कृतज्ञता लिहा" } as Record<Lang,string>,
  footer: { en: "See you in the session 🙏", hi: "सत्र में मिलते हैं 🙏",         mr: "सत्रात भेटूया 🙏" } as Record<Lang,string>,
};

function html(name: string, lang: Lang, when: string) {
  const item = (label: string, href: string, emoji: string) => `
    <tr><td style="padding:8px 0">
      <a href="${SITE}${href}" style="display:block;background:#fff7ed;border-left:4px solid #ea580c;padding:14px 18px;border-radius:8px;text-decoration:none;color:#9a3412;font-weight:600">${emoji} ${label} →</a>
    </td></tr>`;
  return `<!doctype html><html><body style="font-family:system-ui,sans-serif;background:#fef3c7;padding:24px">
    <div style="max-width:580px;margin:auto;background:#fff;border-radius:12px;padding:28px;box-shadow:0 4px 20px rgba(0,0,0,0.06)">
      <h2 style="color:#c2410c;margin:0 0 4px">${T.hi[lang]} ${name} 🙏</h2>
      <p style="color:#6b7280;margin:0 0 16px;font-size:14px">${when}</p>
      <p style="color:#374151;line-height:1.6">${T.intro[lang]}</p>
      <table style="width:100%;border-collapse:collapse;margin:12px 0">
        ${item(T.weekly[lang], "/seeker/weekly-review", "📝")}
        ${item(T.chal[lang],   "/seeker/challenges",    "🏆")}
        ${item(T.grat[lang],   "/seeker/gratitude-wall","🙏")}
      </table>
      <p style="color:#9ca3af;font-size:13px;text-align:center;margin-top:20px">${T.footer[lang]}</p>
    </div></body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Window: sessions starting between 23h and 25h from now
  const now = Date.now();
  const fromIso = new Date(now + 23 * 3600 * 1000).toISOString();
  const toIso   = new Date(now + 25 * 3600 * 1000).toISOString();

  const { data: sessions, error } = await supabase
    .from("sessions")
    .select("id,seeker_id,start_at,date,start_time,session_name")
    .gte("start_at", fromIso)
    .lt("start_at", toIso)
    .not("seeker_id", "is", null);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }

  let sent = 0, skipped = 0, failed = 0;

  for (const sess of sessions ?? []) {
    // Idempotency — already sent for this session?
    const { count: existing } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", sess.seeker_id)
      .eq("type", "pre_session_prep")
      .like("action_url", `%${sess.id}%`);
    if ((existing ?? 0) > 0) { skipped++; continue; }

    const { data: p } = await supabase
      .from("profiles")
      .select("full_name,email,preferred_language,daily_progress_email_enabled")
      .eq("id", sess.seeker_id)
      .maybeSingle();
    if (!p?.email) { skipped++; continue; }
    if (p.daily_progress_email_enabled === false) { skipped++; continue; }

    const lang = (p.preferred_language as Lang) || "en";
    const name = p.full_name || "Sadhak";
    const when = sess.start_at
      ? new Date(sess.start_at).toLocaleString("en-IN", { dateStyle: "full", timeStyle: "short", timeZone: "Asia/Kolkata" })
      : `${sess.date} ${sess.start_time ?? ""}`;

    const r = await sendEmail(supabase, {
      to: p.email,
      subject: T.subject[lang],
      html: html(name, lang, when),
      label: "pre_session_prep",
    });

    if (r.ok) {
      sent++;
      await supabase.from("notifications").insert({
        user_id: sess.seeker_id,
        type: "pre_session_prep",
        title: T.subject[lang],
        message: T.intro[lang],
        action_url: `/seeker/weekly-review#session=${sess.id}`,
      });
    } else {
      failed++;
      console.error("[pre-session-prep] failed", p.email, r.error);
    }
  }

  return new Response(JSON.stringify({ sent, skipped, failed, scanned: sessions?.length ?? 0 }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
