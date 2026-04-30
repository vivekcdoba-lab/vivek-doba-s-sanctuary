// Send a calendar invite (.ics) email for a coaching session.
// Sends to the seeker (and partner if couple session) + coach as ATTENDEEs.
// Uses stable UID + SEQUENCE so calendar clients update existing events on reschedule.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { sendEmail } from "../_shared/send-email.ts";

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

    // Load primary seeker
    const { data: seeker } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("id", session.seeker_id)
      .single();

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
    const summary = `${isCancel ? "[Cancelled] " : ""}VDTS Session: ${courseName}`;
    const location =
      session.location_type === "in_person"
        ? "In-Person (details from your coach)"
        : session.meeting_link || "Online (link will be shared)";
    const description = [
      `Session with ${coach?.full_name || "your coach"}`,
      session.meeting_link ? `Join: ${session.meeting_link}` : null,
      session.session_notes ? `Notes: ${session.session_notes}` : null,
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

    const icsB64 = btoa(ics);

    const subject = isCancel
      ? `Cancelled: ${courseName} on ${session.date}`
      : action === "rescheduled"
      ? `Updated: ${courseName} on ${session.date}`
      : `Invite: ${courseName} on ${session.date}`;

    const html = `
      <div style="font-family: Inter, system-ui, sans-serif; max-width: 560px; margin: 0 auto; color:#1f2937">
        <h2 style="color:#FF6B00; margin-bottom: 4px">${escapeIcs(summary)}</h2>
        <p style="margin: 4px 0; color:#6b7280">${session.date} • ${session.start_time?.slice(0, 5)} – ${session.end_time?.slice(0, 5)} ${session.timezone || 'Asia/Kolkata'} <em style="color:#9ca3af">(your calendar will show this in your local timezone)</em></p>
        <p>${isCancel ? "This session has been cancelled." : action === "rescheduled" ? "Your session time has been updated." : "You have a new coaching session scheduled."}</p>
        <p><strong>Location:</strong> ${escapeIcs(location)}</p>
        ${coach?.full_name ? `<p><strong>Coach:</strong> ${escapeIcs(coach.full_name)}</p>` : ""}
        <p style="margin-top:16px">The attached <code>.ics</code> file will add this to your Google Calendar, Outlook, or Apple Calendar in one click.</p>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb"/>
        <p style="font-size:12px;color:#9ca3af">Vivek Doba Training Solutions</p>
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
