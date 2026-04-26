## Goal
Re-send the full 57-email Jan 1 – May 31 2026 dry-run lifecycle from **`info@vivekdoba.com`** to all three recipients:
- `vivekcdoba@gmail.com` (admin)
- `coachviveklgt@gmail.com` (coach)
- `crwanare@gmail.com` (seeker)

→ 57 emails × 3 recipients = up to **171 sends**, throttled at 600 ms (~2 min).

## Blocker — domain not yet verified for email
Resend will reject any `from: info@vivekdoba.com` send until `vivekdoba.com` is verified for email (SPF / DKIM / DMARC DNS records). Right now the workspace has **no email domain configured**, so the previous run could only deliver to the Resend account owner.

This is a one-time, ~5-minute setup using the dialog below — Lovable + Resend auto-generate the DNS records, you paste them at your registrar, verification typically completes within minutes.

## Plan (what happens after you click the dialog and verify)
1. **You** click "Set up email domain" below → choose `vivekdoba.com` → paste the auto-generated SPF/DKIM/DMARC records at your DNS provider → wait for "verified".
2. **I** update `supabase/functions/seed-test-notifications/index.ts`:
   - `FROM = 'VDTS Testing <info@vivekdoba.com>'`
   - `RECIPIENTS = ['vivekcdoba@gmail.com', 'coachviveklgt@gmail.com', 'crwanare@gmail.com']` (already set)
3. **I** redeploy the `seed-test-notifications` edge function and invoke it once.
4. All 57 "Testing — …" emails (enrollment, 5 monthly payments of ₹11,800, 6 badges, 21 weekly session reminders, 21 progress summaries with the ↑↑↑→→→↑↑↑↓↓↓→→→↑↑↑↑↑↑ growth pattern, 3 missed-worksheet alerts) land in all three inboxes.

## What I will NOT change (Preservation Policy)
- The 57-email content, ordering, growth pattern, or "Testing — " subject prefix.
- Any seeded database rows from the prior run.
- Any other edge functions, auth flows, or app behavior.

## Action needed from you
Click the button below to start domain verification. Once Lovable confirms the domain is verified, approve this plan and I'll redeploy + invoke in one shot.

<lov-actions>
<lov-open-email-setup>Set up email domain</lov-open-email-setup>
</lov-actions>
