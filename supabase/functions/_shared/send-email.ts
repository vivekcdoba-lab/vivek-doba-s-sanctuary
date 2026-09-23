// Shared compatibility sender for the app's existing dynamic emails.
// Delivery, retries, suppression, and unsubscribe handling are managed by Lovable.
//
// Usage:
//   import { sendEmail } from "../_shared/send-email.ts";
//   const r = await sendEmail(supabaseAdmin, { to, subject, html, text, label });
//   if (!r.ok) console.error("email failed", r.error);

const FROM = "VDBM <info@notify.vivekdoba.com>";
const SENDER_DOMAIN = "notify.vivekdoba.com";

import { EmailAPIError, sendLovableEmail } from "npm:@lovable.dev/email-js@0.1.0";

export interface SendEmailArgs {
  to: string;
  subject: string;
  html: string;
  text?: string;
  /** Free-form label stored in email_send_log (e.g. 'otp', 'invite', 'lgt_report') */
  label?: string;
  /** Override the default From header (must be on a verified Lovable domain) */
  from?: string;
  /** 'transactional' (default) | 'broadcast' */
  purpose?: "transactional" | "broadcast";
}

export interface SendEmailResult {
  ok: boolean;
  message_id?: string;
  error?: string;
}

// supabase: a service-role @supabase/supabase-js client
// (we accept `any` so the same helper works whether the function imports from
// esm.sh or npm:)
export async function sendEmail(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  args: SendEmailArgs,
): Promise<SendEmailResult> {
  if (!args?.to) return { ok: false, error: "missing 'to'" };
  if (!args?.subject) return { ok: false, error: "missing 'subject'" };
  if (!args?.html) return { ok: false, error: "missing 'html'" };

  const messageId = crypto.randomUUID();
  const label = args.label ?? "transactional";

  const logResult = async (status: "sent" | "suppressed" | "failed", errorMessage?: string) => {
    const { error } = await supabase.from("email_send_log").insert({
      message_id: messageId,
      template_name: label,
      recipient_email: args.to,
      status,
      error_message: errorMessage,
    });
    if (error) {
      console.error("Failed to record managed email result", {
        code: error.code,
        message: error.message,
        message_id: messageId,
      });
    }
  };

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

    await sendLovableEmail({
      to: args.to,
      from: args.from ?? FROM,
      sender_domain: SENDER_DOMAIN,
      subject: args.subject,
      html: args.html,
      text: args.text ?? args.subject,
      purpose: args.purpose ?? "transactional",
      label,
      idempotency_key: messageId,
      message_id: messageId,
    }, {
      apiKey,
      sendUrl: Deno.env.get("LOVABLE_SEND_URL"),
    });

    await logResult("sent");
    return { ok: true, message_id: messageId };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    if (e instanceof EmailAPIError && e.code === "recipient_suppressed") {
      await logResult("suppressed", error.slice(0, 1000));
      return { ok: false, message_id: messageId, error: "recipient_suppressed" };
    }
    await logResult("failed", error.slice(0, 1000));
    return { ok: false, message_id: messageId, error };
  }
}
