## Plan: Reliable password-reset emails + heartbeat token hardening

Two small, additive fixes. Nothing existing is removed (Preservation Policy).

---

### Part 1 — Password-reset emails actually arrive

**Root cause:** `admin-reset-password` sends from `info@vivekdoba.com`. If that domain isn't fully verified in the Resend workspace, Resend returns a 4xx and the email is silently dropped (DB password update still succeeds, hence "reset worked but no email"). This is exactly what happened to `coachviveklgt@gmail.com`.

**Fix in `supabase/functions/admin-reset-password/index.ts`:**
1. Try sending from `VDTS <info@vivekdoba.com>` first.
2. If Resend responds with a domain/verification error (403 / `validation_error` / `from` field issue), automatically retry with Resend's always-verified sender `VDTS <onboarding@resend.dev>` and a clear note in the email body that this is a temporary sender.
3. Log the full Resend response body to function logs for diagnostics (status + parsed JSON).
4. Return a richer payload: `{ password_updated: true, email_sent: bool, email_error?: string, email_sender_used?: string }`.

**Fix in `src/components/admin/ResetPasswordDialog.tsx`:**
- Show two distinct toasts:
  - ✅ green: "Password updated for {name}"
  - ✉️ separate: success / warning depending on `email_sent`, including the actual `email_error` so the admin can act (verify domain, contact user out-of-band).
- If `email_sender_used === 'onboarding@resend.dev'`, show an info hint to verify the domain in Resend.

### Part 2 — Heartbeat token edge case (`invalid_token` on `/`)

The earlier fix only suppresses 401 on `/reset-password`. The same race can fire once after login or after a token refresh on any route, surfacing as a runtime error in the console.

**Fix in `src/hooks/useSessionHeartbeat.ts`:**
- Before sending the heartbeat, refresh the session if `expires_at` is within 60s (`supabase.auth.refreshSession()` with a single retry).
- On `401` with body `reason: 'invalid_token'`, do **one** silent `refreshSession()` retry before deciding to force-logout. Only logout if the retry also returns 401.
- Treat the response parsing failure as non-fatal (already partially done) — keep the existing 5xx tolerance.

### Files modified
- `supabase/functions/admin-reset-password/index.ts` (fallback sender + verbose logging + richer return)
- `src/components/admin/ResetPasswordDialog.tsx` (split toasts, surface email error)
- `src/hooks/useSessionHeartbeat.ts` (proactive refresh + one-shot 401 retry)

### Out of scope
- Adding/verifying the Resend domain itself (admin action in Resend dashboard) — but we surface the error clearly so it's actionable.
- Rewriting any other Edge Function's email path (can copy this pattern later if needed).

### Risk / mitigations
- **Fallback sender deliverability:** `onboarding@resend.dev` is Resend's reserved verified sender, so it's guaranteed to send. Recipients will see "via resend.dev" in some clients — acceptable as a stop-gap.
- **Heartbeat retry loop:** Bounded to exactly one retry per tick, so no infinite loop.
- **Backward compatibility:** Both server return shape and toast messages remain superset of current.
