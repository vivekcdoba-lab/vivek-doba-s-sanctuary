
Two reported bugs after creating an admin:

## Bug 1 — Email not received

Auth logs show `POST /admin/users 200` succeeded (user `chandrakant.wanare@gmail.com` created at 12:37:02), but `admin-create-user` edge function logs show only Boot/Shutdown — no log lines from `sendCredentialsEmail`. Two likely causes:

1. **Resend sandbox restriction** — the function uses `from: 'VDTS <onboarding@resend.dev>'`. With an unverified domain Resend only delivers to the account owner's email; sends to other addresses return a 403/422 error. The function swallows this (only logs locally — and we have no `console.log` calls so nothing surfaces).
2. **No observability** — `sendCredentialsEmail` returns `{ok:false, error}` but we never `console.log` it; the response includes `email_sent`/`email_error` but the admin UI doesn't surface it either.

**Fix:**
- Add `console.log`/`console.error` around the Resend call so failures show in function logs.
- In `AdminAddUser.tsx` success handler, read `data.email_sent` and `data.email_error` and show a warning toast if email failed (e.g. "User created, but email could not be sent: …").
- Switch sender to a verified domain. Per memory `mem://config/primary-domain` the project uses `vivekdoba.com`. Use `from: 'VDTS <noreply@vivekdoba.com>'` if that domain is verified in Resend; otherwise instruct user to verify it. As a safe interim, also try `noreply@vivekdoba.com` and fall back with a clear error message.

## Bug 2 — "Set Password & Continue" not working on `/reset-password?forced=1`

Auth logs show three consecutive `PUT /user 422` failures at 12:40:03/13/19 from this same session — that's `supabase.auth.updateUser({ password })` rejecting the new password. Status 422 from GoTrue's `/user` with a password change is almost always:

- **"New password should be different from the old password"** (the admin set the same password they're now trying to "change" to), OR
- **HIBP weak-password rejection** ("Password is known to be compromised"), OR
- **"Password should be at least N characters"** if Supabase auth password policy is stricter than our client validator.

Currently `ResetPassword.tsx` does:
```ts
if (error) { toast.error(error.message); return; }
```
…but the toast may be getting hidden by the modal/overlay, OR the user is dismissing it. We need to surface the error inline on the form so the user can read it.

**Fix:**
- Replace silent toast-only error with an inline red error banner above the button that persists until the user types again.
- Also `console.error` the full error for debugging.
- Add a defensive check: if the new password equals the temp/current pattern, show a friendly hint "Please choose a different password than the one you currently use."
- Verify the button's `onClick` is firing — the session replay shows the button click + spinner + revert, so the handler IS running; this confirms the 422 hypothesis.

## Plan

### Files to edit
1. **`supabase/functions/admin-create-user/index.ts`**
   - Add `console.log('[email] sending to', email)` and `console.error('[email] failed', error)` around `sendCredentialsEmail`.
   - Change `from` to `'VDTS <noreply@vivekdoba.com>'` (with comment that domain must be verified in Resend; falls back to `onboarding@resend.dev` if a `RESEND_FROM` secret is not set — no new secret required, just env-driven override).
   - Actually simpler: keep `onboarding@resend.dev` as default but read optional `Deno.env.get('RESEND_FROM')` override, so user can set it later without code change.

2. **`src/pages/admin/AdminAddUser.tsx`**
   - In the success branch of the create-user call, check `data.email_sent`. If false, show `toast.warning` with the `data.email_error` plus the password (so admin can copy & share manually as a fallback).

3. **`src/pages/ResetPassword.tsx`**
   - Add `const [errorMsg, setErrorMsg] = useState<string|null>(null)`.
   - On `updateUser` error: `setErrorMsg(error.message)` and keep toast — but render an inline red Alert above the button that stays visible.
   - `console.error('[reset-password]', error)`.
   - Clear `errorMsg` whenever `password` or `confirm` changes.
   - Add a hint line under the password input: "Must be different from your current/temporary password."

### Will NOT do
- Will not change Supabase auth password policy (that's a dashboard setting; if 422 turns out to be HIBP, I'll explain in chat after the fix surfaces the real message).
- Will not bypass the policy — surfacing the real error is the correct fix.

### Verification after the fix lands
1. Reload `/reset-password?forced=1`, type a clearly-different strong password, click button → if it still fails, the inline message will tell us exactly why (e.g. HIBP, length, sameness) so we can address it precisely.
2. Create another test admin → toast will now show whether email actually sent and the exact Resend error if not.
3. Check `admin-create-user` logs — new `[email]` log lines will be visible.
