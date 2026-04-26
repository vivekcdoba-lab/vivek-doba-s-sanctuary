## Goal
Deliver the same 57 "Testing —" lifecycle emails (enrollment, 5 payments, 6 badges, 21 weekly session reminders, 21 weekly progress summaries, 3 missed-worksheet alerts) to **all three** test recipients:
- `vivekcdoba@gmail.com` (admin)
- `coachviveklgt@gmail.com` (coach)
- `crwanare@gmail.com` (seeker)

## Why the previous run only reached 1 inbox
The `seed-test-notifications` edge function uses Resend's sandbox sender `onboarding@resend.dev`. Resend's policy with that sender only allows delivery to **the email address that owns the Resend account** (`vivekcdoba@gmail.com`). That is why the seeker and coach inboxes received nothing — Resend silently filtered them.

To deliver to other recipients, we need a verified sending domain in Resend.

## Recommended path — verify `vivekdoba.com` for email (one-time, ~5 min)
The project already has the custom domain `vivekdoba.com` connected. We add the standard SPF/DKIM/DMARC DNS records via the Lovable email setup dialog, Resend verifies them, then the function can send `from: VDTS Testing <noreply@vivekdoba.com>` to any address.

Steps once approved:
1. Open the email setup dialog (button below) — you paste the auto-generated DNS records into your domain registrar. Lovable + Resend handle the rest.
2. I update `supabase/functions/seed-test-notifications/index.ts`:
   - Change `FROM` to `VDTS Testing <noreply@vivekdoba.com>`
   - Change `RECIPIENTS` to all three addresses
3. Redeploy + invoke the function → 57 emails × 3 recipients = up to 171 sends (throttled at 600 ms each, ~2 min total). Same "Testing — " subject prefix preserved.

## Faster fallback — if you don't want to verify a domain right now
Resend will also let you add `coachviveklgt@gmail.com` and `crwanare@gmail.com` as **test recipients** on the sandbox sender, but only if you have access to the Resend dashboard. This is brittle (still uses the sandbox sender, lower deliverability, no branding).

If you prefer this route, log in to Resend → "Audiences" → add both addresses as verified test contacts, then tell me and I'll just update `RECIPIENTS` and redeploy — no domain verification needed.

## What I will NOT change
- The 57-email content, ordering, growth pattern (↑↑↑→→→↑↑↑↓↓↓→→→↑↑↑↑↑↑), or "Testing — " subject prefix.
- Any of the seeded database rows from the previous run.
- Any other edge functions or app behavior (Preservation Policy).

## Decision needed
Pick one:
- **A. Verify `vivekdoba.com`** (recommended, branded, scales to real production emails later) → click the email setup button below, then approve this plan.
- **B. Use sandbox + manually verify the two extra test addresses in Resend** → tell me once done and I'll redeploy.

<lov-actions>
<lov-open-email-setup>Set up email domain</lov-open-email-setup>
</lov-actions>
