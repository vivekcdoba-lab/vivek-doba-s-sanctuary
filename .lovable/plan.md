## Goal

Complete the email migration started earlier. Move the **remaining 5 edge functions** off direct Resend (`api.resend.com/emails` with `info@vivekdoba.com`) and onto the shared `sendEmail()` helper that enqueues to `transactional_emails` via the verified `notify.vivekdoba.com` sender. This eliminates the "domain not verified" failures.

## Functions to migrate

1. `submit-signature` — sends signed-PDF email to seeker + notification to admins/coaches
2. `sign-document-inline` — sends signed-PDF email to seeker (in-person flow)
3. `daily-session-report` — sends daily admin digest
4. `send-lgt-invite` — sends LGT application invite link
5. `seed-test-notifications` — sends bulk test emails (dry-run seed)

## Changes

### Common pattern for all 5
- Add `import { sendEmail } from "../_shared/send-email.ts";`
- Remove `RESEND_API_KEY` env reads and `fetch("https://api.resend.com/emails", …)` calls.
- Replace each call with `await sendEmail(supabaseAdmin, { to, subject, html, label })`.
- Check `result.ok`; log `result.error` on failure (never throw — keep the function's main flow successful).

### Attachment handling (signature functions)

The Lovable queue does not support attachments. The signed PDF is already uploaded to the private `signatures` bucket. For `submit-signature` and `sign-document-inline`:
- After upload, generate a 7-day signed URL: `admin.storage.from("signatures").createSignedUrl(signedPath, 60*60*24*7)`.
- Embed a "Download your signed copy" button in the email HTML pointing at that URL.
- Drop the base64 attachment encoding (saves CPU + memory in the function).

### Per-function specifics

**`submit-signature`** (lines 172-226)
- Two emails: (a) seeker thank-you with signed-URL download link, label `"signature_signed_seeker"`; (b) admin/coach notice, label `"signature_signed_admin"`.
- Keep the existing in-app `notifications` insert.

**`sign-document-inline`** (lines 178, 222-261)
- One email per signed doc → seeker, with signed-URL download link, label `"signature_signed_inline"`.
- Track success in `email_sent` / `email_error` exactly as today (now driven by `result.ok`).

**`daily-session-report`** (lines 8, 134-170)
- Replace the Resend block with `sendEmail(supabaseAdmin, { to: "info@vivekdoba.com", subject, html, label: "daily_session_report" })`.
- Drop `app_settings.email_from` lookup and the `RESEND_FROM` env override — sender is now fixed to the verified Lovable address.
- Return `{ success: true, queue_id, report: r, cleaned: deletedCount }`.

**`send-lgt-invite`** (lines 27, 153-188)
- Replace Resend block with `sendEmail(admin, { to: seeker.email, subject, html, label: "lgt_invite" })`.
- If enqueue fails, return `{ success: true, token, link, warning: result.error }` — token row is already saved, so the admin can resend.

**`seed-test-notifications`** (lines 8, 89-107, 145-156)
- Rewrite `sendOne()` to loop over each recipient and call `sendEmail()` per address (queue helper takes a single `to`). Aggregate per-recipient ok/err.
- Use label `"seed_test"`. Remove `RESEND_API_KEY` check from the main handler.
- Persist each enqueue result into `email_log` as today (`status`, `resend_message_id` becomes `queue_id`/`message_id`, `error_message`).

## Out of scope

- No DB schema changes (queue/RPC and `email_unsubscribe_tokens` already exist and are used by the 10 already-migrated functions).
- No frontend changes.
- `RESEND_API_KEY` secret stays in place — it's still referenced by the queue worker (`process-email-queue`) and as a fallback elsewhere.

## Files to edit

- `supabase/functions/submit-signature/index.ts`
- `supabase/functions/sign-document-inline/index.ts`
- `supabase/functions/daily-session-report/index.ts`
- `supabase/functions/send-lgt-invite/index.ts`
- `supabase/functions/seed-test-notifications/index.ts`

## Verification after deploy

1. Check `pgmq` `transactional_emails` queue picks up new messages (already polled by `process-email-queue`).
2. Trigger one signature signing in preview → confirm seeker receives email with download-link button (no attachment), admins receive notice.
3. Manually invoke `daily-session-report` once → confirm digest arrives at `info@vivekdoba.com`.
4. Re-run security/email scan — no remaining direct `api.resend.com` calls outside `process-email-queue`.
