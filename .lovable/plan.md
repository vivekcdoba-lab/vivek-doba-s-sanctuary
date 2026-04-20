
## Goal
Make every outgoing email use `info@vivekdoba.com` as the sender by default, fixing the cases where it's still hardcoded to other addresses.

## Current state
- `app_settings.key='email_from'` already exists (managed in Admin → Settings → Email Sender). Default: `VDTS <info@vivekdoba.com>`.
- `admin-create-user` and `send-otp` likely read this value already.
- `admin-reset-password` was previously updated to use the verified domain.
- Other functions still hardcode senders and need to be aligned.

## Changes

### 1. `supabase/functions/_shared/getEmailFrom.ts` (new shared helper)
Single source of truth so we don't repeat the lookup logic:
```ts
export async function getEmailFrom(admin): Promise<string> {
  const { data } = await admin.from('app_settings')
    .select('value').eq('key','email_from').maybeSingle();
  const v = data?.value;
  return (typeof v === 'string' && v.trim()) ? v.trim() : 'VDTS <info@vivekdoba.com>';
}
```

### 2. Audit + update every edge function that calls Resend
For each function below: import `getEmailFrom`, replace any hardcoded `from:` with the resolved value, fall back to `VDTS <info@vivekdoba.com>` if the lookup fails.

- `supabase/functions/admin-create-user/index.ts` — verify it uses the helper (already reads email_from; switch to shared helper).
- `supabase/functions/admin-reset-password/index.ts` — switch to shared helper.
- `supabase/functions/send-otp/index.ts` — verify/switch to shared helper.
- `supabase/functions/approve-application/index.ts` — replace hardcoded sender.
- `supabase/functions/daily-session-report/index.ts` — replace hardcoded sender.
- `supabase/functions/send-notification/index.ts` — replace hardcoded sender.
- `supabase/functions/delete-seeker/index.ts` — only if it sends email; otherwise skip.

(Exact list confirmed by reading each file before editing — no other touched logic.)

### 3. Admin UI confirmation
`src/pages/admin/SettingsPage.tsx` already has the Email Sender tab. No changes needed — but the Save handler will be left as-is so admins can override if they ever switch domains.

### 4. Recipients
Already correct everywhere — every function sends to the user's profile email (`to: [user.email]`). No change needed. The previous "all emails go to owner" issue was strictly a Resend test-mode restriction caused by `onboarding@resend.dev` sender; switching to the verified `info@vivekdoba.com` resolves it.

## Out of scope
- No DB schema changes.
- No UI changes.
- No changes to email body/content/templates.
- No changes to who receives the emails.

## Prerequisite (one-time, by user)
`vivekdoba.com` must already be verified in Resend (it is, based on the prior reset-password fix working). If not verified, emails will fail with a clear Resend error.

## Verification
1. Open Admin → Settings → Email Sender → confirm value is `VDTS <info@vivekdoba.com>` (or set it).
2. Trigger each flow and confirm the recipient receives email from `info@vivekdoba.com`:
   - Create a new admin/coach/seeker (admin-create-user)
   - Reset a user's password (admin-reset-password)
   - Send OTP at registration (send-otp)
   - Approve a pending application (approve-application)
   - Send a notification (send-notification)
   - Wait for / manually trigger daily-session-report
3. Check Resend dashboard logs — every send should show `from: info@vivekdoba.com` and a non-owner `to:` address succeeding.
