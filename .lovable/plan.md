
## Problem

User gets "Auth session missing!" when submitting new password on `/reset-password`. This means `supabase.auth.updateUser({ password })` runs without an active session.

## Root Cause

Looking at the auth logs and code flow:

1. User clicks reset email link → Supabase `/verify` endpoint → 303 redirect to `/reset-password#access_token=...&type=recovery`
2. Supabase JS client should auto-exchange the hash for a session
3. **But**: `src/integrations/supabase/client.ts` does NOT set `detectSessionInUrl: true` explicitly. While it defaults to `true`, the combination with our `authStore.ts` running `supabase.auth.signOut()` + `clearAllAuthStorage()` on init when no stored session ID exists is destroying the recovery session immediately after Supabase establishes it.

Look at `authStore.ts`:
```ts
supabase.auth.getSession().then(async ({ data: { session } }) => {
  const user = session?.user ?? null;
  if (user) {
    await validateSessionOnInit(...);  // calls signOut if no vdts_session_id!
  } else {
    clearAllAuthStorage();
    ...
  }
});
```

And `validateSessionOnInit`:
```ts
if (!storedSessionId) {
  await supabase.auth.signOut();   // ← KILLS THE RECOVERY SESSION
  ...
}
```

So when the user lands on `/reset-password` from email:
- Supabase establishes recovery session ✓
- authStore init runs → no `vdts_session_id` in localStorage → calls `signOut()` ✗
- By the time user submits the form → no session → "Auth session missing!"

The `ResetPassword` page's own session detection might briefly succeed (within 800ms), set `hasSession=true`, and let the form render — but the underlying session has already been wiped by authStore.

## Fix

Skip authStore's session validation entirely on the `/reset-password` route, the same way `/login` is already special-cased.

In `src/store/authStore.ts`, the bottom of the file has:
```ts
if (window.location.pathname === '/login') {
  _initialized = true;
  useAuthStore.setState({ loading: false });
} else {
  supabase.auth.getSession().then(async ({ data: { session } }) => { ... })
}
```

Add `/reset-password` to the same bypass list so the recovery session is preserved:
```ts
const skipSessionValidation =
  window.location.pathname === '/login' ||
  window.location.pathname === '/reset-password';
```

Also — defensively, in `ResetPassword.tsx`, before calling `updateUser`, re-check the session and show a clear error if it's gone, so the user understands they need to click the link again rather than seeing a cryptic "Auth session missing!".

## Files to update

- `src/store/authStore.ts` — bypass init validation on `/reset-password` so the recovery session survives
- `src/pages/ResetPassword.tsx` — pre-flight session check inside `handleReset`; if missing, show "Reset link expired — please request a new one" with a button back to login

## Out of scope

- No changes to email templates or Supabase redirect URLs
- No changes to `LoginPage.tsx`
- No changes to `client.ts` (auto-generated)
