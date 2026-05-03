// Send a calendar invite (.ics) email for a coaching session.
// Sends to the seeker (and partner if couple session) + coach as ATTENDEEs.
// Uses stable UID + SEQUENCE so calendar clients update existing events on reschedule.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { sendEmail } from "../_shared/send-email.ts";
import { formatDateDMY, type Lang } from "../_shared/date-format.ts";

// In-person venue location (Google Maps deep link)
const IN_PERSON_VENUE_MAP_URL = "https://maps.app.goo.gl/eAj5thQ2aSDJs4827";
// Default fallback Zoom link (kept in sync with CoachSchedule.tsx)
const DEFAULT_ZOOM_LINK = "https://us06web.zoom.us/j/86310221885?pwd=LdIaVqMxx7tbavIqggTVegh01kL8HB.1";
// Public app base
const APP_BASE_URL = "https://vivekdoba.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface InvitePayload {
  session_id: string;
  action?: "created" | "rescheduled" | "cancelled";
  sequence?: number; // optional override; otherwise we derive from updated_at
}

function escapeIcs(s: string): string {
  return (s || "")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function toIcsDate(date: string, time: string): string {
  // Floating local time fallback (legacy rows without start_at).
  const t = (time || "00:00").split(":");
  const hh = (t[0] || "00").padStart(2, "0");
  const mm = (t[1] || "00").padStart(2, "0");
  const ss = (t[2] || "00").padStart(2, "0");
  return `${date.replace(/-/g, "")}T${hh}${mm}${ss}`;
}

function toIcsUtc(iso: string): string {
  // YYYYMMDDTHHMMSSZ from a UTC ISO timestamp.
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

function nowUtcStamp(): string {
  return new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function buildIcs(opts: {
  uid: string;
  sequence: number;
  method: "REQUEST" | "CANCEL";
  status: "CONFIRMED" | "CANCELLED";
  summary: string;
  description: string;
  location: string;
  date: string;
  start_time: string;
  end_time: string;
  start_at?: string | null;
  end_at?: string | null;
  organizerEmail: string;
  organizerName: string;
  attendees: { name: string; email: string }[];
}): string {
  // Prefer absolute UTC from start_at/end_at so calendar clients render in the
  // recipient's local timezone automatically. Fall back to TZID=Asia/Kolkata
  // floating time for legacy rows that pre-date timezone support.
  const useUtc = !!(opts.start_at && opts.end_at);
  const dtStart = useUtc ? toIcsUtc(opts.start_at!) : toIcsDate(opts.date, opts.start_time);
  const dtEnd = useUtc ? toIcsUtc(opts.end_at!) : toIcsDate(opts.date, opts.end_time);
  const dtStamp = nowUtcStamp();
  const attendeeLines = opts.attendees
    .filter((a) => a.email)
    .map(
      (a) =>
        `ATTENDEE;CN=${escapeIcs(a.name)};RSVP=TRUE;PARTSTAT=NEEDS-ACTION:mailto:${a.email}`,
    )
    .join("\r\n");

  const tzBlock = useUtc
    ? []
    : [
        "BEGIN:VTIMEZONE",
        "TZID:Asia/Kolkata",
        "BEGIN:STANDARD",
        "DTSTART:19700101T000000",
        "TZOFFSETFROM:+0530",
        "TZOFFSETTO:+0530",
        "TZNAME:IST",
        "END:STANDARD",
        "END:VTIMEZONE",
      ];

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Vivek Doba Training Solutions//Sessions//EN",
    "CALSCALE:GREGORIAN",
    `METHOD:${opts.method}`,
    ...tzBlock,
    "BEGIN:VEVENT",
    `UID:${opts.uid}`,
    `SEQUENCE:${opts.sequence}`,
    `DTSTAMP:${dtStamp}`,
    useUtc ? `DTSTART:${dtStart}` : `DTSTART;TZID=Asia/Kolkata:${dtStart}`,
    useUtc ? `DTEND:${dtEnd}` : `DTEND;TZID=Asia/Kolkata:${dtEnd}`,
    `SUMMARY:${escapeIcs(opts.summary)}`,
    `DESCRIPTION:${escapeIcs(opts.description)}`,
    `LOCATION:${escapeIcs(opts.location)}`,
    `STATUS:${opts.status}`,
    `ORGANIZER;CN=${escapeIcs(opts.organizerName)}:mailto:${opts.organizerEmail}`,
    attendeeLines,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    // RESEND_API_KEY no longer used — emails go through Lovable Emails queue
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // ---- Auth guard: require admin or assigned coach ----
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const callerId = userData.user.id;

    const body = (await req.json()) as InvitePayload;
    if (!body?.session_id) {
      return new Response(JSON.stringify({ error: "session_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const action = body.action || "created";

    // Load session
    const { data: session, error: sErr } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", body.session_id)
      .single();
    if (sErr || !session) {
      return new Response(JSON.stringify({ error: "session not found", details: sErr?.message }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Authorization: admin OR assigned coach for this session's seeker
    const { data: isAdminData } = await supabase.rpc("is_admin", { _user_id: callerId });
    let allowed = !!isAdminData;
    if (!allowed) {
      const { data: assigned } = await supabase.rpc("is_assigned_coach", {
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

    // Load primary seeker
    const { data: seeker } = await supabase
      .from("profiles")
      .select("id, full_name, email, preferred_language")
      .eq("id", session.seeker_id)
      .single();
    const seekerLang: Lang = ((seeker?.preferred_language as Lang) || "en");
    const sessionDateDisplay = formatDateDMY(session.date, seekerLang);

    // Load participants (for couple/group)
    const { data: participants } = await supabase
      .from("session_participants")
      .select("seeker_id, role, profiles:seeker_id(full_name, email)")
      .eq("session_id", session.id);

    // Load coach
    let coach: { full_name?: string; email?: string } | null = null;
    if (session.coach_id) {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", session.coach_id)
        .single();
      coach = data;
    }

    // Load course name (optional)
    let courseName = "Coaching Session";
    if (session.course_id) {
      const { data: course } = await supabase
        .from("courses")
        .select("name")
        .eq("id", session.course_id)
        .single();
      if (course?.name) courseName = course.name;
    }

    // Build attendee list (dedupe by email)
    const attendeeMap = new Map<string, { name: string; email: string }>();
    if (seeker?.email) {
      attendeeMap.set(seeker.email.toLowerCase(), {
        name: seeker.full_name || "Seeker",
        email: seeker.email,
      });
    }
    for (const p of participants || []) {
      const prof = (p as any).profiles;
      if (prof?.email) {
        attendeeMap.set(prof.email.toLowerCase(), {
          name: prof.full_name || "Participant",
          email: prof.email,
        });
      }
    }
    if (coach?.email) {
      attendeeMap.set(coach.email.toLowerCase(), {
        name: coach.full_name || "Coach",
        email: coach.email,
      });
    }
    const attendees = Array.from(attendeeMap.values());

    if (attendees.length === 0) {
      return new Response(
        JSON.stringify({ error: "no recipients with email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const uid = `session-${session.id}@vivekdoba.com`;
    // Derive sequence from updated_at (rough): seconds since created
    const created = new Date(session.created_at || Date.now()).getTime();
    const updated = new Date(session.updated_at || created).getTime();
    const sequence = body.sequence ?? Math.max(0, Math.floor((updated - created) / 1000));

    const isCancel = action === "cancelled";
    const isOnline = session.location_type !== "in_person";
    const joinLink = session.meeting_link || (isOnline ? DEFAULT_ZOOM_LINK : "");
    const summary = `${isCancel ? "[Cancelled] " : ""}VDTS Session: ${courseName}`;
    const location = isOnline
      ? (joinLink || "Online (link will be shared)")
      : `In-Person Venue — ${IN_PERSON_VENUE_MAP_URL}`;
    const description = [
      `Session with ${coach?.full_name || "your coach"}`,
      `Date: ${sessionDateDisplay}`,
      isOnline
        ? `Join Zoom: ${joinLink}`
        : `Venue (Google Maps): ${IN_PERSON_VENUE_MAP_URL}`,
      !isOnline
        ? "Parking: Free roadside parking. Please do NOT park in front of gates or near 'No Parking' boards."
        : null,
      session.session_notes ? `Notes: ${session.session_notes}` : null,
      "",
      "Pre-meeting checklist:",
      "• Prepare your questions in advance",
      "• Carry/keep ALL your notebooks ready to take notes",
      "• Complete pending assignments, assessments & activities",
      "",
      "— Vivek Doba Training Solutions",
    ]
      .filter(Boolean)
      .join("\n");

    const ics = buildIcs({
      uid,
      sequence,
      method: isCancel ? "CANCEL" : "REQUEST",
      status: isCancel ? "CANCELLED" : "CONFIRMED",
      summary,
      description,
      location,
      date: session.date,
      start_time: session.start_time,
      end_time: session.end_time,
      start_at: session.start_at,
      end_at: session.end_at,
      organizerEmail: "info@vivekdoba.com",
      organizerName: "Vivek Doba Training Solutions",
      attendees,
    });

    // UTF-8 safe base64 (btoa() throws on non-Latin1 chars like Devanagari)
    const _icsBytes = new TextEncoder().encode(ics);
    let _bin = "";
    for (let i = 0; i < _icsBytes.length; i++) _bin += String.fromCharCode(_icsBytes[i]);
    const icsB64 = btoa(_bin);

    const subject = isCancel
      ? `Cancelled: ${courseName} on ${sessionDateDisplay}`
      : action === "rescheduled"
      ? `Updated: ${courseName} on ${sessionDateDisplay}`
      : `Invite: ${courseName} on ${sessionDateDisplay}`;

    // ---- Pull pending counts to nudge seeker before the meeting ----
    let pendingAssignments = 0;
    let pendingWorksheets = 0;
    if (seeker?.id) {
      const { count: aCount } = await supabase
        .from("assignments")
        .select("*", { count: "exact", head: true })
        .eq("seeker_id", seeker.id)
        .in("status", ["pending", "assigned", "in_progress"]);
      pendingAssignments = aCount || 0;

      const { count: wCount } = await supabase
        .from("daily_worksheets")
        .select("*", { count: "exact", head: true })
        .eq("seeker_id", seeker.id)
        .eq("is_submitted", false);
      pendingWorksheets = wCount || 0;
    }

    const firstName = (seeker?.full_name || "Seeker").split(" ")[0];
    const greetingMap: Record<Lang, string> = {
      en: `Namaste ${firstName} 🙏`,
      hi: `नमस्ते ${firstName} 🙏`,
      mr: `नमस्ते ${firstName} 🙏`,
    };
    const introMap: Record<Lang, string> = {
      en: isCancel
        ? "Your upcoming coaching session has been cancelled."
        : action === "rescheduled"
        ? "Your coaching session time has been updated. Please find the new details below."
        : "Your next coaching session is confirmed. Here are all the details to help you arrive ready and grounded.",
      hi: isCancel
        ? "आपका आगामी कोचिंग सत्र रद्द कर दिया गया है।"
        : action === "rescheduled"
        ? "आपके सत्र का समय अपडेट किया गया है। कृपया नीचे नई जानकारी देखें।"
        : "आपका अगला कोचिंग सत्र पुष्टि हो चुका है। कृपया नीचे सभी विवरण देखें।",
      mr: isCancel
        ? "तुमचा आगामी कोचिंग सत्र रद्द करण्यात आला आहे."
        : action === "rescheduled"
        ? "तुमच्या सत्राची वेळ अपडेट केली आहे. कृपया खालील नवीन माहिती पहा."
        : "तुमचा पुढील कोचिंग सत्र निश्चित झाला आहे. खालील सर्व माहिती पहा.",
    };

    const locationBlock = isOnline
      ? `
        <div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:12px;padding:16px;margin:16px 0">
          <p style="margin:0 0 8px;font-weight:700;color:#1E3A8A">🎥 Online Meeting (Zoom)</p>
          <p style="margin:0 0 12px;font-size:13px;color:#1f2937;word-break:break-all">
            <a href="${joinLink}" style="color:#2563EB;text-decoration:underline">${joinLink}</a>
          </p>
          <a href="${joinLink}" style="display:inline-block;background:#2563EB;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:600">Join Zoom Meeting</a>
          <p style="margin:12px 0 0;font-size:12px;color:#6b7280">Tip: Test your camera & mic 5 minutes before the session.</p>
        </div>`
      : `
        <div style="background:#FFF7ED;border:1px solid #FED7AA;border-radius:12px;padding:16px;margin:16px 0">
          <p style="margin:0 0 8px;font-weight:700;color:#9A3412">📍 In-Person Venue</p>
          <a href="${IN_PERSON_VENUE_MAP_URL}" style="display:inline-block;background:#FF6B00;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:600;margin-bottom:10px">Open in Google Maps</a>
          <div style="background:#fff;border:1px dashed #FDBA74;border-radius:8px;padding:12px;margin-top:10px">
            <p style="margin:0 0 6px;font-weight:600;color:#9A3412">🚗 Parking Instructions</p>
            <ul style="margin:0;padding-left:18px;color:#1f2937;font-size:13px;line-height:1.6">
              <li><strong>Roadside parking is FREE</strong> — pick the best available spot.</li>
              <li>Do <strong>NOT</strong> park in front of any gates.</li>
              <li>Do <strong>NOT</strong> park in "No Parking" zones or near "No Parking" boards.</li>
            </ul>
          </div>
        </div>`;

    const actionItems: string[] = [];
    if (pendingAssignments > 0) {
      actionItems.push(
        `<li style="margin:6px 0">📝 <strong>${pendingAssignments}</strong> pending assignment${pendingAssignments > 1 ? "s" : ""} — <a href="${APP_BASE_URL}/seeker/assignments" style="color:#FF6B00;font-weight:600">Complete now</a></li>`,
      );
    }
    if (pendingWorksheets > 0) {
      actionItems.push(
        `<li style="margin:6px 0">📒 <strong>${pendingWorksheets}</strong> pending daily activity / worksheet — <a href="${APP_BASE_URL}/seeker/activities" style="color:#FF6B00;font-weight:600">Complete now</a></li>`,
      );
    }
    actionItems.push(
      `<li style="margin:6px 0">🧪 Pending assessments — <a href="${APP_BASE_URL}/seeker/assessments" style="color:#FF6B00;font-weight:600">Take assessments</a></li>`,
    );
    actionItems.push(
      `<li style="margin:6px 0">📊 Your remaining activities & progress report — <a href="${APP_BASE_URL}/seeker/reports" style="color:#FF6B00;font-weight:600">View report</a></li>`,
    );

    const checklistItems = [
      "✍️ <strong>Prepare your questions</strong> in advance — write them down",
      isOnline
        ? "📚 Keep <strong>all your notebooks/journals</strong> ready beside you to take notes"
        : "📚 <strong>Carry ALL your notebooks/journals</strong> with you to take notes",
      "🤫 Find a quiet, distraction-free space",
      "🖊️ Carry a pen and water bottle",
      isOnline ? "🔋 Ensure your device is fully charged & internet is stable" : "⏰ Arrive 5–10 minutes early",
    ];

    const html = `
      <div style="font-family: Inter, system-ui, sans-serif; max-width: 620px; margin: 0 auto; color:#1f2937; padding:8px">
        <div style="text-align:center;padding:14px 0;border-bottom:3px solid #FF6B00">
          <h2 style="color:#FF6B00; margin:0">${escapeIcs(summary)}</h2>
        </div>

        <p style="margin:18px 0 6px;font-size:16px">${greetingMap[seekerLang]},</p>
        <p style="margin:0 0 14px;color:#374151">${introMap[seekerLang]}</p>

        <div style="background:#F9FAFB;border-radius:12px;padding:14px 16px;margin:14px 0">
          <p style="margin:0 0 6px"><strong>📅 Date:</strong> ${sessionDateDisplay}</p>
          <p style="margin:0 0 6px"><strong>⏰ Time:</strong> ${session.start_time?.slice(0, 5)} – ${session.end_time?.slice(0, 5)} (${session.timezone || "Asia/Kolkata"})</p>
          ${coach?.full_name ? `<p style="margin:0 0 6px"><strong>👤 Coach:</strong> ${escapeIcs(coach.full_name)}</p>` : ""}
          ${courseName ? `<p style="margin:0"><strong>🎯 Program:</strong> ${escapeIcs(courseName)}</p>` : ""}
        </div>

        ${!isCancel ? locationBlock : ""}

        ${!isCancel ? `
        <div style="margin:18px 0">
          <h3 style="color:#9A3412;margin:0 0 8px;font-size:16px">✅ Action Items Before the Session</h3>
          <p style="margin:0 0 8px;color:#374151;font-size:13px">Please update or complete the following so we can make the most of our time together:</p>
          <ul style="margin:0;padding-left:18px;font-size:14px;line-height:1.6">
            ${actionItems.join("")}
          </ul>
        </div>

        <div style="background:#FEF3C7;border-left:4px solid #F59E0B;border-radius:8px;padding:14px 16px;margin:18px 0">
          <p style="margin:0 0 8px;font-weight:700;color:#92400E">🧘 Pre-Meeting Checklist</p>
          <ul style="margin:0;padding-left:18px;font-size:13px;line-height:1.7;color:#1f2937">
            ${checklistItems.map((c) => `<li>${c}</li>`).join("")}
          </ul>
        </div>
        ` : ""}

        <p style="margin-top:18px;font-size:13px;color:#6b7280">📎 The attached <code>.ics</code> file will add this to your Google Calendar, Outlook, or Apple Calendar in one click.</p>

        <hr style="margin:24px 0; border:none; border-top:1px solid #e5e7eb"/>
        <p style="text-align:center;font-size:13px;color:#6b7280;margin:0">🙏 With gratitude,<br/><strong style="color:#FF6B00">Vivek Doba Training Solutions</strong></p>
        <p style="text-align:center;font-size:11px;color:#9ca3af;margin:6px 0 0">${APP_BASE_URL}</p>
      </div>`;

    let email_sent = false;
    let email_error: string | undefined;
    let icsUrl: string | null = null;

    // Upload .ics to documents bucket and embed a signed-URL link in the email,
    // since Lovable Emails queue does not support attachments.
    try {
      const icsBytes = new TextEncoder().encode(ics);
      const path = `session-invites/${session.id}-${Date.now()}.ics`;
      const { error: upErr } = await supabase.storage
        .from("documents")
        .upload(path, icsBytes, {
          contentType: `text/calendar; charset=utf-8; method=${isCancel ? "CANCEL" : "REQUEST"}`,
          upsert: true,
        });
      if (!upErr) {
        const { data: signed } = await supabase.storage
          .from("documents")
          .createSignedUrl(path, 60 * 60 * 24 * 30); // 30 days
        if (signed?.signedUrl) icsUrl = signed.signedUrl;
      } else {
        console.warn("ics upload failed:", upErr.message);
      }
    } catch (e) {
      console.warn("ics storage error:", (e as Error).message);
    }

    const htmlWithLink = icsUrl
      ? html.replace(
          "in one click.",
          `in one click. <br/><br/><a href="${icsUrl}" style="display:inline-block;background:#FF6B00;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:600">📅 Download calendar invite (.ics)</a>`,
        )
      : html;

    try {
      // Send to all attendees in parallel
      const sends = await Promise.all(
        attendees.map((a) =>
          sendEmail(supabase, {
            to: a.email,
            subject,
            html: htmlWithLink,
            label: `session_invite_${action}`,
          }),
        ),
      );
      email_sent = sends.some((r) => r.ok);
      const errs = sends.filter((r) => !r.ok).map((r) => r.error).filter(Boolean);
      if (errs.length) email_error = errs.join("; ");
    } catch (e) {
      email_error = String(e);
      console.error("send-session-invite error", e);
    }

    // Audit log into notifications
    try {
      await supabase.from("notifications").insert({
        user_id: seeker?.id || null,
        type: "session_invite",
        title: subject,
        message: email_sent
          ? `Calendar invite sent to ${attendees.length} recipient(s)`
          : `Invite send failed: ${email_error}`,
        data: { session_id: session.id, action, recipients: attendees.map((a) => a.email) },
      } as any);
    } catch (_) {
      // notifications table may have stricter shape; ignore audit failure
    }

    return new Response(
      JSON.stringify({ success: true, email_sent, email_error, recipients: attendees.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("send-session-invite fatal", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
