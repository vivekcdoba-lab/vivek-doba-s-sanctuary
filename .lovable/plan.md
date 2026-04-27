# Email Domain Verified — Send Test Emails

`notify.vivekdoba.com` is **verified** and ready. Now I'll wire the project to use it as the sender and send test notifications to all three recipients.

## What's already in place
- Email queue + dispatcher cron (from previous setup)
- `process-email-queue` edge function (deployed, uses Lovable Emails — no Resend key needed)
- `daily-session-report` and `seed-test-notifications` functions exist
- Verified sender: `notify.vivekdoba.com`

## Plan

### 1. Set the project sender address
Insert/update `app_settings.email_from` row to:
```
VDTS <info@notify.vivekdoba.com>
```
This is the value `daily-session-report` already reads at runtime, so no code change needed there.

### 2. Update `seed-test-notifications` to send real emails
Currently it only writes in-app notifications. I'll extend it to also enqueue a branded test email via the `auth_emails` / `transactional_emails` queue (using `enqueue_email` RPC) for each of:
- `vivekcdoba@gmail.com` (admin)
- `coachviveklgt@gmail.com` (coach)
- `crwanare@gmail.com` (seeker)

Each email will be a simple branded "VDTS test notification" with role-specific subject line, queued with `from: info@notify.vivekdoba.com` and `sender_domain: notify.vivekdoba.com`.

### 3. Deploy & trigger
- Deploy `seed-test-notifications`
- Invoke it once
- Wait ~30s for the dispatcher cron, then read `email_send_log` to confirm `status='sent'` for all three recipients

### 4. Report back
Show the `email_send_log` rows (recipient, status, message_id, timestamp) so you can verify delivery in your inbox.

## Technical details
- Migration: 1 row upsert into `public.app_settings (key='email_from', value='"VDTS <info@notify.vivekdoba.com>"')`
- Edit: `supabase/functions/seed-test-notifications/index.ts` — add 3 `enqueue_email` calls
- Deploy: `seed-test-notifications`
- Verification query: `select recipient_email, status, error_message, created_at from email_send_log order by created_at desc limit 10;`

## Out of scope (can do next)
- Branded auth email templates (signup, password reset) via `scaffold_auth_email_templates`
- Wiring `daily-session-report` cron to run nightly
