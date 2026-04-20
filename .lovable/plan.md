
The Resend test-mode error happens because `admin-reset-password` hardcodes `from: 'VDTS Security <onboarding@resend.dev>'`, which Resend restricts to the account owner's email only.

## Fix
Switch the sender to your verified domain so emails reach the actual recipient.

### File: `supabase/functions/admin-reset-password/index.ts`
- Change the `from` field in the Resend payload from:
  - `'VDTS Security <onboarding@resend.dev>'`
  - to: `'VDTS Security <info@vivekdoba.com>'`
- Keep `to: [targetProfile.email]` (already correct — sends to the user being reset).
- Optional resilience: read an override from env (`RESEND_FROM`) with `info@vivekdoba.com` as the fallback default, mirroring the pattern used in `supabase/functions/send-otp/index.ts` (which already resolves a from-address dynamically).

## Prerequisite (must be true, otherwise Resend will 403 again)
- The domain `vivekdoba.com` must be **verified** in Resend (DNS records: SPF, DKIM, DMARC published and Resend shows "Verified").
- If not yet verified, the same 403 will occur with a different message ("domain not verified"). In that case the user must complete domain verification at resend.com/domains before this fix takes effect.

## Out of scope
- No other edge functions touched. `send-otp` already uses a configurable from-address and does not need changes.
- No DB or UI changes.
- No password reset logic changes.

## Verification (after deploy)
- Trigger a password reset for a non-owner email from `/admin/search-users`.
- Expect toast: "Password reset for <name>. Email notification sent."
- Recipient receives the email from `info@vivekdoba.com`.
