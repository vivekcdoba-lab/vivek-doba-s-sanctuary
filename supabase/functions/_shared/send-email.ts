// Shared email sender — routes all transactional emails through Lovable Emails
// using the verified `notify.vivekdoba.com` sender. Replaces direct Resend calls
// which fail because notify.vivekdoba.com is NS-delegated to Lovable.
//
// Usage:
//   import { sendEmail } from "../_shared/send-email.ts";
//   const r = await sendEmail(supabaseAdmin, { to, subject, html, text, label });
//   if (!r.ok) console.error("email failed", r.error);

const FROM = "VDTS <info@notify.vivekdoba.com>";
const SENDER_DOMAIN = "notify.vivekdoba.com";

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
  queue_id?: number;
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

  try {
    // 1. Get-or-create unsubscribe token (token kept for legacy URL compatibility,
    //    token_hash is what we look up against in new flows so the raw value is
    //    not required at rest going forward).
    let unsubToken: string | null = null;
    const { data: existing } = await supabase
      .from("email_unsubscribe_tokens")
      .select("token, token_hash")
      .eq("email", args.to)
      .maybeSingle();

    if (existing?.token) {
      unsubToken = existing.token;
    } else {
      const newToken =
        crypto.randomUUID().replace(/-/g, "") +
        crypto.randomUUID().replace(/-/g, "");
      // Compute token_hash server-side via the existing hash_token RPC
      const { data: tokenHash } = await supabase.rpc("hash_token", { _token: newToken });
      const { data: inserted, error: insErr } = await supabase
        .from("email_unsubscribe_tokens")
        .insert({ email: args.to, token: newToken, token_hash: tokenHash })
        .select("token")
        .single();
      if (insErr) {
        return { ok: false, error: `unsubscribe_token: ${insErr.message}` };
      }
      unsubToken = inserted.token;
    }

    // 2. Enqueue
    const messageId = crypto.randomUUID();
    const payload = {
      message_id: messageId,
      to: args.to,
      from: args.from ?? FROM,
      sender_domain: SENDER_DOMAIN,
      subject: args.subject,
      html: args.html,
      text: args.text ?? args.subject,
      purpose: args.purpose ?? "transactional",
      label: args.label ?? "transactional",
      idempotency_key: messageId,
      unsubscribe_token: unsubToken,
      queued_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.rpc("enqueue_email", {
      queue_name: "transactional_emails",
      payload,
    });

    if (error) return { ok: false, error: error.message };
    return { ok: true, message_id: messageId, queue_id: data as number };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
