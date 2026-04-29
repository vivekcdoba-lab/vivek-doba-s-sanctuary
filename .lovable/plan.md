# Fix: Emails Failing — "notify.vivekdoba.com domain is not verified"

## What's actually wrong

The error in your screenshot is **not a code bug**. It's a domain configuration mismatch:

- **Lovable Emails** is set up and **fully verified** for `notify.vivekdoba.com` (NS records delegated to `ns3.lovable.cloud` / `ns4.lovable.cloud`).
- However, **most of our edge functions still send via Resend's API directly** (`api.resend.com/emails`) using `from: info@vivekdoba.com` or `noreply@vivekdoba.com`.
- Because `notify.vivekdoba.com` is NS-delegated to Lovable, **Resend cannot verify any domain on `vivekdoba.com`** — so Resend rejects every send with `403 validation_error` and falls back to test mode (which only allows sending to `vivekcdoba@gmail.com`).
- That's exactly the dual error in your screenshot: "Primary 403 not verified" + "Fallback 403 testing only".

Only `send-test-email` uses the correct path (Lovable Emails queue via `enqueue_email`) — and that's the one that works.

## The fix: migrate all senders to Lovable Emails

Lovable Emails is already wired up (`process-email-queue` cron + `enqueue_email` RPC + `email_send_log`). We just need to route all the Resend `fetch()` calls through it instead, using the verified `notify.vivekdoba.com` sender.

### Functions to migrate (15 total)

Direct Resend → Lovable Emails queue (`enqueue_email` RPC, sender `VDTS <info@notify.vivekdoba.com>`):

1. `admin-create-user` — welcome email with temp password
2. `admin-reset-password` — password reset notification
3. `super-admin-change-own-password` — password change confirmation
4. `approve-application` — LGT approval email
5. `send-otp` — OTP delivery (keep < 30s latency note)
6. `send-notification` — generic notification dispatch
7. `send-session-invite` — session invite email
8. `send-lgt-invite` — LGT invitation
9. `send-lgt-report` — LGT report PDF email
10. `daily-session-report` — daily report digest
11. `request-document-signature` — signature request email
12. `resend-document-signature` — resend signature link
13. `submit-signature` — signature confirmation + admin notification
14. `sign-document-inline` — inline signing confirmation
15. `seed-test-notifications` — test seeding (keep but switch sender)

### Standard pattern applied to each function

Replace this:
```ts
await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: { Authorization: `Bearer ${RESEND_API_KEY}`, ... },
  body: JSON.stringify({ from: "Vivek Doba <info@vivekdoba.com>", to, subject, html }),
});
```

With this:
```ts
const messageId = crypto.randomUUID();
// fetch/create unsubscribe token for `to`
const { data, error } = await supabase.rpc('enqueue_email', {
  queue_name: 'transactional_emails',
  payload: {
    message_id: messageId,
    to, from: 'VDTS <info@notify.vivekdoba.com>',
    sender_domain: 'notify.vivekdoba.com',
    subject, html, text,
    purpose: 'transactional',
    label: '<function-specific-label>',
    idempotency_key: messageId,
    unsubscribe_token: token,
    queued_at: new Date().toISOString(),
  },
});
```

### Shared helper

To avoid 15 copies of the same boilerplate, I'll add `supabase/functions/_shared/send-email.ts` exporting one helper:

```ts
export async function sendEmail(supabase, { to, subject, html, text, label })
```

It handles unsubscribe-token lookup/creation + `enqueue_email`. Each function becomes a one-liner.

### What stays the same

- All function names, signatures, callers — no frontend change required
- All RLS, auth checks, business logic
- `send-test-email` (already correct — used as the reference pattern)
- The `RESEND_API_KEY` secret stays in place as a fallback but is no longer used in the hot path

### After deploy

Emails will be sent via Lovable's verified `notify.vivekdoba.com` sender, which means:
- All recipients receive emails (no more "test mode" restriction)
- Status visible in **Cloud → Emails** and `email_send_log` table
- ~30s queue latency (cron runs every 30s) — acceptable for all current flows including OTP

## Out of scope

- Removing the `RESEND_API_KEY` secret (kept as safety net)
- Changing auth emails (signup/recovery) — Lovable handles those by default already
- Verifying `vivekdoba.com` (root) on Resend — not needed since we're switching providers

## Files changed

- New: `supabase/functions/_shared/send-email.ts`
- Edited: 15 edge function `index.ts` files listed above (replace Resend `fetch` blocks with helper call)
- No frontend, no migration, no schema change
