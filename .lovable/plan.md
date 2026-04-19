
The user clicked the password reset link from their email, landed on `/reset-password`, and got "Invalid Reset Link / This password reset link is invalid or has expired."

From the auth logs:
- `user_recovery_requested` succeeded (200)
- User clicked email link → hit `/verify` → got 303 redirect → landed at `https://...lovableproject.com/reset-password`
- The redirect from Supabase's `/verify` endpoint returns the recovery token in the **URL hash** (`#access_token=...&type=recovery`)

In `src/pages/ResetPassword.tsx`:
```ts
const hash = window.location.hash;
if (hash.includes('type=recovery')) setIsRecovery(true);
```

This check runs **once on mount**. But Supabase's JS client auto-detects the hash, exchanges it for a session, and **strips it from the URL** — so depending on timing, `window.location.hash` may already be empty when the effect runs. Also, it relies on the `PASSWORD_RECOVERY` event from `onAuthStateChange`, but if the listener attaches after the event already fired, it's missed.

Result: `isRecovery` stays `false` → "Invalid Reset Link" screen even though the session is valid.

## Fix

Make `/reset-password` accept the recovery flow more robustly:

1. **Treat an active session as valid** — if the user landed on `/reset-password` and `supabase.auth.getSession()` returns a session (regardless of hash detection), allow them to set a new password. This is exactly what the `forced` branch already does.

2. **Keep listening for `PASSWORD_RECOVERY`** — but also fall back to checking `getSession()` so we don't miss the event due to listener timing.

3. **Show a brief loading state** while we determine session status, instead of immediately rendering "Invalid Reset Link".

## Files to update
- `src/pages/ResetPassword.tsx` — replace the brittle hash-only check with: check session on mount + listen for `PASSWORD_RECOVERY` + show loading state → only show "Invalid" if both fail after the check completes.

## Out of scope
- No changes to Supabase redirect URLs (already correct: `${window.location.origin}/reset-password`)
- No changes to `LoginPage.tsx`
- No email template changes
