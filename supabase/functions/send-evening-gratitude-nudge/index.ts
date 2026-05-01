// Daily 7 PM IST nudge to seekers: complete tasks + write gratitude.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { sendEmail } from "../_shared/send-email.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

type Lang = "en" | "hi" | "mr";
const SITE = "https://www.vivekdoba.com";

const T = {
  subject: { en: "🙏 End your day with gratitude", hi: "🙏 दिन का समापन कृतज्ञता से करें", mr: "🙏 दिवसाचा शेवट कृतज्ञतेने करा" } as Record<Lang,string>,
  hi:      { en: "Namaste", hi: "नमस्ते", mr: "नमस्कार" } as Record<Lang,string>,
  body:    {
    en: "Please complete today's tasks and write 3 things you are grateful for. A few minutes of reflection seals your day with peace.",
    hi: "कृपया आज के कार्य पूरे करें और 3 बातें लिखें जिनके लिए आप कृतज्ञ हैं। कुछ क्षणों का चिंतन आपके दिन को शांति से सजाता है।",
    mr: "कृपया आजची कामे पूर्ण करा आणि 3 गोष्टी लिहा ज्यांसाठी तुम्ही कृतज्ञ आहात. काही क्षणांचे चिंतन तुमचा दिवस शांततेने पूर्ण करते.",
  } as Record<Lang,string>,
  cta:     { en: "Open Gratitude Wall", hi: "कृतज्ञता दीवार खोलें", mr: "कृतज्ञता भिंत उघडा" } as Record<Lang,string>,
  footer:  { en: "To stop these emails, manage notifications in your profile.", hi: "ये ईमेल बंद करने के लिए प्रोफ़ाइल में नोटिफिकेशन प्रबंधित करें।", mr: "हे ईमेल थांबवण्यासाठी प्रोफाइलमध्ये सूचना व्यवस्थापित करा." } as Record<Lang,string>,
};

function html(name: string, lang: Lang) {
  return `<!doctype html><html><body style="font-family:system-ui,sans-serif;background:#fff7ed;padding:24px">
  <div style="max-width:560px;margin:auto;background:#fff;border-radius:12px;padding:28px;box-shadow:0 4px 20px rgba(0,0,0,0.06)">
    <h2 style="color:#c2410c;margin:0 0 8px">${T.hi[lang]} ${name} 🙏</h2>
    <p style="color:#374151;line-height:1.6">${T.body[lang]}</p>
    <p style="text-align:center;margin:28px 0">
      <a href="${SITE}/seeker/gratitude-wall" style="background:#ea580c;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600">${T.cta[lang]} →</a>
    </p>
    <p style="color:#9ca3af;font-size:12px;text-align:center;margin-top:24px">${T.footer[lang]}</p>
  </div></body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const today = new Date().toISOString().slice(0, 10);

  const { data: seekers, error } = await supabase
    .from("profiles")
    .select("id,full_name,email,preferred_language,daily_progress_email_enabled")
    .eq("role", "seeker")
    .not("email", "is", null);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }

  let sent = 0, skipped = 0, failed = 0;

  for (const s of seekers ?? []) {
    if (s.daily_progress_email_enabled === false) { skipped++; continue; }

    // Skip if already has a gratitude entry today
    const { count: gratCount } = await supabase
      .from("gratitude_entries")
      .select("id", { count: "exact", head: true })
      .eq("seeker_id", s.id)
      .gte("created_at", `${today}T00:00:00Z`);
    if ((gratCount ?? 0) > 0) { skipped++; continue; }

    // Idempotency: skip if we already sent this nudge today
    const { count: sentCount } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", s.id)
      .eq("type", "evening_gratitude_nudge")
      .gte("created_at", `${today}T00:00:00Z`);
    if ((sentCount ?? 0) > 0) { skipped++; continue; }

    const lang = (s.preferred_language as Lang) || "en";
    const name = s.full_name || "Sadhak";

    const r = await sendEmail(supabase, {
      to: s.email,
      subject: T.subject[lang],
      html: html(name, lang),
      label: "evening_gratitude_nudge",
    });

    if (r.ok) {
      sent++;
      await supabase.from("notifications").insert({
        user_id: s.id,
        type: "evening_gratitude_nudge",
        title: T.subject[lang],
        message: T.body[lang],
        action_url: "/seeker/gratitude-wall",
      });
    } else {
      failed++;
      console.error("[evening-gratitude] failed", s.email, r.error);
    }
  }

  return new Response(JSON.stringify({ sent, skipped, failed }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
