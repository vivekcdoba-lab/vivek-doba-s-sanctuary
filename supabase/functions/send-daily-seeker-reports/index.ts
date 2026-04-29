import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { sendEmail } from "../_shared/send-email.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

type Lang = "en" | "hi" | "mr";

const T: Record<string, Record<Lang, string>> = {
  greeting:        { en: "Namaste",                hi: "नमस्ते",                  mr: "नमस्कार" },
  subject_recap:   { en: "Your Day in Review",     hi: "आज का सार",              mr: "आजचा आढावा" },
  subject_nudge:   { en: "We missed you today",    hi: "आज हमने आपको miss किया", mr: "आज तुमची आठवण आली" },
  todays_snapshot: { en: "Today's Snapshot",       hi: "आज की झलक",              mr: "आजची झलक" },
  worksheet:       { en: "Worksheet",              hi: "वर्कशीट",                mr: "वर्कशीट" },
  submitted:       { en: "Submitted",              hi: "जमा हुई",                mr: "सादर केली" },
  not_submitted:   { en: "Not submitted",          hi: "जमा नहीं हुई",            mr: "सादर केली नाही" },
  mood:            { en: "Mood",                   hi: "मनःस्थिति",              mr: "मनःस्थिती" },
  energy:          { en: "Energy",                 hi: "ऊर्जा",                  mr: "ऊर्जा" },
  streak:          { en: "Streak",                 hi: "श्रृंखला",                mr: "सलग दिवस" },
  days:            { en: "days",                   hi: "दिन",                    mr: "दिवस" },
  lgt_today:       { en: "Life's Golden Triangle — Today",  hi: "आज का LGT",     mr: "आजचा LGT" },
  pending:         { en: "Pending Assignments",    hi: "बाकी असाइनमेंट",         mr: "प्रलंबित असाइनमेंट" },
  next_session:    { en: "Next Session",           hi: "अगला सत्र",              mr: "पुढील सत्र" },
  tomorrow:        { en: "Tomorrow's Sankalp",     hi: "कल का संकल्प",           mr: "उद्याचा संकल्प" },
  open_worksheet:  { en: "Open Today's Worksheet", hi: "आज की वर्कशीट खोलें",     mr: "आजची वर्कशीट उघडा" },
  view_journey:    { en: "View Full Journey",      hi: "पूरी यात्रा देखें",        mr: "पूर्ण प्रवास पहा" },
  manage_notif:    { en: "Manage Notifications",   hi: "नोटिफिकेशन प्रबंधित करें", mr: "सूचना व्यवस्थापित करा" },
  affirm_today:    { en: "Today's Affirmation",    hi: "आज का संकल्प",           mr: "आजचे प्रेरणावचन" },
  nudge_body:      { en: "We didn't see your worksheet today. A small step daily creates the temple of transformation 🙏",
                     hi: "आज आपकी वर्कशीट नहीं मिली। रोज़ का छोटा कदम परिवर्तन का मंदिर बनाता है 🙏",
                     mr: "आज तुमची वर्कशीट दिसली नाही. रोजचे छोटे पाऊल परिवर्तनाचे मंदिर घडवते 🙏" },
  recap_intro:     { en: "Here is your gentle reflection for today.",
                     hi: "आज के लिए आपका कोमल चिंतन।",
                     mr: "आजचे तुमचे शांत चिंतन." },
  footer_unsub:    { en: "To stop these emails, manage notifications above.",
                     hi: "ये ईमेल बंद करने के लिए, ऊपर नोटिफिकेशन प्रबंधित करें।",
                     mr: "हे ईमेल थांबवण्यासाठी, वर सूचना व्यवस्थापित करा." },
};

const AFFIRMATIONS: Record<Lang, string[]> = {
  en: [
    "I am the witness, calm and clear.",
    "Every breath is a chance to begin again.",
    "Dharma walks with me today.",
    "I align action with awareness.",
    "My peace is my power.",
  ],
  hi: [
    "मैं साक्षी हूँ — शांत और स्पष्ट।",
    "हर साँस एक नई शुरुआत है।",
    "धर्म आज मेरे साथ चलता है।",
    "मैं कर्म को जागरूकता से जोड़ता हूँ।",
    "मेरी शांति ही मेरी शक्ति है।",
  ],
  mr: [
    "मी साक्षी आहे — शांत आणि स्पष्ट.",
    "प्रत्येक श्वास नवीन सुरुवात आहे.",
    "धर्म आज माझ्यासोबत चालतो.",
    "मी कर्म जाणीवेशी जोडतो.",
    "माझी शांती हीच माझी शक्ती आहे.",
  ],
};

function t(key: string, lang: Lang): string {
  return T[key]?.[lang] ?? T[key]?.en ?? key;
}

function fontFamily(lang: Lang): string {
  return lang === "en" ? "'Poppins', Arial, sans-serif" : "'Noto Sans Devanagari', 'Poppins', Arial, sans-serif";
}

function buildHtml(summary: any, lang: Lang, appUrl: string): { subject: string; html: string } {
  const firstName = (summary.full_name || "Sadhak").split(" ")[0];
  const ws = summary.worksheet;
  const lgtToday = summary.lgt_today;
  const lgtAvg = summary.lgt_7d_avg || {};
  const streak = summary.streak_days || 0;
  const date = summary.date;
  const isNudge = !ws || !ws.submitted;
  const aff = AFFIRMATIONS[lang][new Date(date).getDate() % AFFIRMATIONS[lang].length];
  const ff = fontFamily(lang);

  const subject = `🪔 ${isNudge ? t("subject_nudge", lang) : t("subject_recap", lang)} — ${date}${streak > 0 ? ` | 🔥 ${streak} ${t("days", lang)}` : ""}`;

  const trend = (cur: number | null | undefined, avg: number) => {
    if (cur == null) return "";
    if (avg === 0) return "";
    if (cur > avg + 0.5) return "<span style='color:#15803d'>▲</span>";
    if (cur < avg - 0.5) return "<span style='color:#b91c1c'>▼</span>";
    return "<span style='color:#9ca3af'>—</span>";
  };

  const lgtRow = lgtToday ? `
    <table style="width:100%;border-collapse:collapse;margin-top:8px;font-size:13px">
      <tr style="background:#FFF7ED">
        <th style="padding:8px;text-align:left;color:#7c2d12">🕉️ Dharma</th>
        <th style="padding:8px;text-align:left;color:#7c2d12">💰 Artha</th>
        <th style="padding:8px;text-align:left;color:#7c2d12">❤️ Kama</th>
        <th style="padding:8px;text-align:left;color:#7c2d12">☀️ Moksha</th>
      </tr>
      <tr>
        <td style="padding:8px;border-bottom:1px solid #FED7AA"><b>${lgtToday.dharma ?? "—"}</b> ${trend(lgtToday.dharma, Number(lgtAvg.dharma)||0)}</td>
        <td style="padding:8px;border-bottom:1px solid #FED7AA"><b>${lgtToday.artha ?? "—"}</b> ${trend(lgtToday.artha, Number(lgtAvg.artha)||0)}</td>
        <td style="padding:8px;border-bottom:1px solid #FED7AA"><b>${lgtToday.kama ?? "—"}</b> ${trend(lgtToday.kama, Number(lgtAvg.kama)||0)}</td>
        <td style="padding:8px;border-bottom:1px solid #FED7AA"><b>${lgtToday.moksha ?? "—"}</b> ${trend(lgtToday.moksha, Number(lgtAvg.moksha)||0)}</td>
      </tr>
    </table>` : ws ? `
    <table style="width:100%;border-collapse:collapse;margin-top:8px;font-size:13px">
      <tr style="background:#FFF7ED">
        <th style="padding:8px;text-align:left;color:#7c2d12">🕉️ Dharma</th>
        <th style="padding:8px;text-align:left;color:#7c2d12">💰 Artha</th>
        <th style="padding:8px;text-align:left;color:#7c2d12">❤️ Kama</th>
        <th style="padding:8px;text-align:left;color:#7c2d12">☀️ Moksha</th>
      </tr>
      <tr>
        <td style="padding:8px;border-bottom:1px solid #FED7AA"><b>${ws.dharma ?? "—"}</b></td>
        <td style="padding:8px;border-bottom:1px solid #FED7AA"><b>${ws.artha ?? "—"}</b></td>
        <td style="padding:8px;border-bottom:1px solid #FED7AA"><b>${ws.kama ?? "—"}</b></td>
        <td style="padding:8px;border-bottom:1px solid #FED7AA"><b>${ws.moksha ?? "—"}</b></td>
      </tr>
    </table>` : "";

  const snapshotRows = ws ? `
    <tr><td style="padding:6px 0;color:#6b7280">${t("worksheet", lang)}</td>
        <td style="padding:6px 0;text-align:right"><b>${ws.submitted ? "✅ " + t("submitted", lang) : "⏳ " + t("not_submitted", lang)}</b> ${ws.completion ? `(${Math.round(Number(ws.completion))}%)` : ""}</td></tr>
    ${ws.mood ? `<tr><td style="padding:6px 0;color:#6b7280">${t("mood", lang)}</td><td style="padding:6px 0;text-align:right">${ws.mood}</td></tr>` : ""}
    ${ws.energy ? `<tr><td style="padding:6px 0;color:#6b7280">${t("energy", lang)}</td><td style="padding:6px 0;text-align:right">${ws.energy}/10</td></tr>` : ""}
    <tr><td style="padding:6px 0;color:#6b7280">🔥 ${t("streak", lang)}</td><td style="padding:6px 0;text-align:right"><b>${streak} ${t("days", lang)}</b></td></tr>
  ` : `<tr><td style="padding:6px 0;color:#6b7280">🔥 ${t("streak", lang)}</td><td style="padding:6px 0;text-align:right"><b>${streak} ${t("days", lang)}</b></td></tr>`;

  const next = summary.next_session;
  const nextSessionBlock = next ? `
    <div style="margin-top:16px;padding:12px;background:#FEF3C7;border-radius:8px;border-left:4px solid #D97706">
      <div style="font-size:12px;color:#92400E;font-weight:600">${t("next_session", lang)}</div>
      <div style="font-size:14px;color:#1f2937;margin-top:4px">${next.name || "Session"} — ${next.date}${next.start_time ? " at " + next.start_time : ""}</div>
    </div>` : "";

  const pendingBlock = summary.pending_assignments > 0 ? `
    <div style="margin-top:8px;padding:10px;background:#FEE2E2;border-radius:8px;font-size:13px;color:#991B1B">
      📝 ${t("pending", lang)}: <b>${summary.pending_assignments}</b>
    </div>` : "";

  const sankalpBlock = ws?.tomorrow_sankalp ? `
    <div style="margin-top:16px;padding:12px;background:#ECFDF5;border-radius:8px;border-left:4px solid #059669">
      <div style="font-size:12px;color:#065F46;font-weight:600">${t("tomorrow", lang)}</div>
      <div style="font-size:14px;color:#1f2937;margin-top:4px;font-style:italic">"${ws.tomorrow_sankalp}"</div>
    </div>` : "";

  const html = `
    <div style="font-family:${ff};max-width:640px;margin:0 auto;background:#FFFBF5">
      <div style="background:linear-gradient(135deg,#B8860B,#FF9933);padding:20px;border-radius:12px 12px 0 0">
        <h1 style="color:#fff;margin:0;font-size:22px">🪔 ${t("greeting", lang)}, ${firstName}</h1>
        <p style="color:rgba(255,255,255,0.9);margin:6px 0 0;font-size:14px">${date} • ${isNudge ? t("subject_nudge", lang) : t("subject_recap", lang)}</p>
      </div>

      <div style="background:#fff;padding:24px;border:1px solid #FED7AA;border-top:none;border-radius:0 0 12px 12px">
        <p style="color:#4b5563;font-size:14px;margin:0 0 16px">${isNudge ? t("nudge_body", lang) : t("recap_intro", lang)}</p>

        <h3 style="font-size:14px;color:#7c2d12;margin:0 0 8px">${t("todays_snapshot", lang)}</h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px">${snapshotRows}</table>

        ${(lgtToday || ws) ? `<h3 style="font-size:14px;color:#7c2d12;margin:20px 0 0">${t("lgt_today", lang)}</h3>${lgtRow}` : ""}

        ${nextSessionBlock}
        ${pendingBlock}
        ${sankalpBlock}

        <div style="margin-top:20px;padding:14px;background:#FFF7ED;border-radius:8px;border-left:4px solid #FF9933">
          <div style="font-size:12px;color:#7c2d12;font-weight:600">🕉️ ${t("affirm_today", lang)}</div>
          <div style="font-size:15px;color:#1f2937;margin-top:6px;font-style:italic">${aff}</div>
        </div>

        <div style="margin-top:24px;text-align:center">
          <a href="${appUrl}/seeker/daily-worksheet" style="display:inline-block;padding:10px 18px;background:#FF6B00;color:#fff;text-decoration:none;border-radius:8px;font-size:13px;font-weight:600;margin:4px">${t("open_worksheet", lang)}</a>
          <a href="${appUrl}/seeker/journey" style="display:inline-block;padding:10px 18px;background:#fff;color:#FF6B00;text-decoration:none;border:1px solid #FF6B00;border-radius:8px;font-size:13px;font-weight:600;margin:4px">${t("view_journey", lang)}</a>
        </div>

        <p style="color:#9ca3af;font-size:11px;margin-top:24px;border-top:1px solid #FED7AA;padding-top:12px;text-align:center">
          <a href="${appUrl}/seeker/help" style="color:#9ca3af">${t("manage_notif", lang)}</a> • ${t("footer_unsub", lang)}
        </p>
      </div>
    </div>`;

  return { subject, html };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const isTest: boolean = !!body.test;
    const testSeekerId: string | undefined = body.seeker_id;

    const cronSecret = Deno.env.get("CRON_SECRET");
    const providedCronSecret = req.headers.get("x-cron-secret");
    const authHeader = req.headers.get("Authorization");

    let authorized = false;
    let callerUserId: string | null = null;

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
        callerUserId = userData.user.id;
        const { data: prof } = await userClient.from("profiles").select("role").eq("user_id", userData.user.id).single();
        if (prof?.role === "admin") authorized = true;
      }
    }

    if (!authorized) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Settings gate (skipped if test)
    if (!isTest) {
      const { data: settings } = await supabaseAdmin.from("daily_report_settings").select("enabled").maybeSingle();
      if (settings && settings.enabled === false) {
        return new Response(JSON.stringify({ ok: true, skipped: "feature_disabled" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    const today = new Date().toISOString().slice(0, 10);
    const appUrl = "https://vivekdoba.com";

    // Pick recipients
    let seekerIds: string[] = [];
    if (isTest && testSeekerId) {
      seekerIds = [testSeekerId];
    } else if (isTest && callerUserId) {
      const { data: me } = await supabaseAdmin.from("profiles").select("id").eq("user_id", callerUserId).single();
      if (me?.id) seekerIds = [me.id];
    } else {
      // Active seekers = role 'seeker' + opted-in + has at least one non-terminated, non-expired enrollment
      const { data: rows } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("role", "seeker")
        .eq("daily_progress_email_enabled", true);
      const candidateIds = (rows || []).map((r: any) => r.id);

      if (candidateIds.length === 0) {
        seekerIds = [];
      } else {
        const { data: enrolls } = await supabaseAdmin
          .from("enrollments")
          .select("seeker_id, status, end_date")
          .in("seeker_id", candidateIds);

        const TERMINATED = new Set(["completed", "cancelled", "canceled", "dropped", "refunded", "expired"]);
        const activeSet = new Set<string>();
        (enrolls || []).forEach((e: any) => {
          const status = (e.status || "").toLowerCase();
          const ended = e.end_date && e.end_date < today;
          if (TERMINATED.has(status)) return;
          if (ended) return;
          activeSet.add(e.seeker_id);
        });

        seekerIds = candidateIds.filter((id: string) => activeSet.has(id));
      }
    }

    let sent = 0, skipped = 0, failed = 0;
    const errors: string[] = [];

    for (const sid of seekerIds) {
      try {
        const { data: summary, error: rpcErr } = await supabaseAdmin.rpc("get_seeker_daily_summary", { _seeker_id: sid, _date: today });
        if (rpcErr || !summary) { skipped++; continue; }
        const s: any = summary;
        if (!s.email) { skipped++; await supabaseAdmin.from("daily_progress_email_log").insert({ seeker_id: sid, sent_date: today, status: "skipped", error: "no_email" }); continue; }
        if (!isTest && s.enabled === false) { skipped++; continue; }

        const lang: Lang = (["en", "hi", "mr"].includes(s.language) ? s.language : "en") as Lang;
        const { subject, html } = buildHtml(s, lang, appUrl);

        const res = await sendEmail(supabaseAdmin, {
          to: s.email,
          subject,
          html,
          label: "daily_seeker_progress",
        });

        if (!res.ok) {
          failed++;
          errors.push(`${sid}: ${res.error}`);
          await supabaseAdmin.from("daily_progress_email_log").insert({ seeker_id: sid, sent_date: today, status: "failed", summary: s, error: String(res.error) });
        } else {
          sent++;
          await supabaseAdmin.from("daily_progress_email_log").insert({ seeker_id: sid, sent_date: today, status: "sent", summary: s });
        }
      } catch (err) {
        failed++;
        errors.push(`${sid}: ${String(err)}`);
      }
    }

    return new Response(
      JSON.stringify({ ok: true, date: today, total: seekerIds.length, sent, skipped, failed, errors: errors.slice(0, 10) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("daily-seeker-reports error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
