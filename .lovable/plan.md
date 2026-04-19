
User wants all transactional emails (admin-create-user credentials, and any future emails) sent from `noreply@vivekdoba.com`. The codebase already supports this via the `RESEND_FROM` env var override I added previously — just needs the domain verified in Resend + the secret set.

Per memory `mem://config/primary-domain`, primary domain is `vivekdoba.com`. I should use Lovable's email setup flow rather than manual Resend dashboard work — the email_domain tools handle DNS + verification cleanly and Lovable Emails is the recommended path.

## Plan

### Step 1 — Check current email configuration
Use `email_domain--get_project_custom_domain` and `email_domain--list_email_domains` to see if `vivekdoba.com` (or a subdomain like `noreply.vivekdoba.com`) is already configured in this workspace.

### Step 2 — Two outcomes

**A) If a domain IS already configured for this project:**
- Confirm DNS verification status via `email_domain--check_email_domain_status`
- Set the `RESEND_FROM` runtime secret to `VDTS <noreply@vivekdoba.com>` so the existing `admin-create-user` edge function picks it up
- Re-deploy `admin-create-user` so the new env var is active
- Test by creating a user → confirm Resend logs show 200 from `noreply@vivekdoba.com`

**B) If no domain is configured yet:**
- Open the email setup dialog (`<lov-open-email-setup>`) so user can add `vivekdoba.com` and get DNS records to paste into their DNS provider
- Once dialog completes, the backend auto-configures the domain
- Then set `RESEND_FROM` secret + redeploy `admin-create-user` as in case A
- Tell user DNS verification can take minutes to hours; until verified, sends from this domain will fail and the existing fallback (`onboarding@resend.dev` — sandbox) keeps working only for the Resend account owner address

### Step 3 — Update other places that send email
Search for any other edge functions that hardcode `from:` addresses (likely candidates: `send-notification`, `send-otp`, `daily-session-report`, `approve-application`). For each, switch to read `Deno.env.get('RESEND_FROM') || 'VDTS <noreply@vivekdoba.com>'` so they all use the same sender.

### Step 4 — Memory update
Update `mem://notifications/email-service` to record `noreply@vivekdoba.com` as the canonical sender.

### Files likely touched
- `supabase/functions/send-notification/index.ts`
- `supabase/functions/send-otp/index.ts`
- `supabase/functions/daily-session-report/index.ts`
- `supabase/functions/approve-application/index.ts`
- `supabase/functions/admin-create-user/index.ts` (already supports override — minor: change default fallback to `noreply@vivekdoba.com`)
- New runtime secret: `RESEND_FROM`
- `mem://notifications/email-service` (memory)

### Will NOT do
- Will not switch the project to Lovable Emails (different system) unless user asks — staying on existing direct-Resend setup since it's already wired and working for one address.
- Will not bypass DNS verification — if domain isn't verified yet, emails to non-owner addresses will fail and I'll surface the exact Resend error (already logged after the previous fix).

### Verification
After changes: create a test admin → check `admin-create-user` logs for `[email] sending { from: 'VDTS <noreply@vivekdoba.com>' }` and `[email] resend ok` → confirm recipient inbox received the message.
