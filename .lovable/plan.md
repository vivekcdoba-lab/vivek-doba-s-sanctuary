

## Goal
Allow the **Super Admin** to change their own password while logged in (with current-password re-auth), and notify **all admins** via email that the Super Admin's password was changed.

## Where it goes
A new **"Security"** tab in `src/pages/admin/SettingsPage.tsx`, visible **only when the logged-in user is a Super Admin**. Regular admins, coaches, and seekers don't see it.

```
Settings tabs: General | Email Sender | Notifications | Automation Rules | Business Info | Appearance | 🔐 Security  ← new, super-admin-only
```

The Security tab shows a single form: **Current password**, **New password**, **Confirm new password**, with the same `PASSWORD_HELP` rules used elsewhere and a show/hide toggle. Submit calls a new edge function.

## New edge function: `supabase/functions/super-admin-change-own-password`

Why a dedicated function (instead of `supabase.auth.updateUser` from the client):
1. We must **verify the current password** before allowing the change (defense against a hijacked session).
2. We must **email every admin** server-side using the service role + Resend, with the same `app_settings.email_from` source the rest of the system uses.
3. We must enforce that the caller is actually a **Super Admin**, not just any admin.

Function logic:
1. CORS + JWT validation against `SUPABASE_ANON_KEY` to resolve `caller_user_id`.
2. Validate body with Zod: `{ current_password: string, new_password: string }`. New password must pass the same regex as `admin-reset-password` (12+ chars, upper, digit, symbol).
3. Reject if `current_password === new_password`.
4. Confirm caller is super admin via `admin.rpc('is_super_admin', { _user_id: caller_user_id })`. Return `403` if not.
5. Re-authenticate: fetch caller's email from `profiles`, then `admin.auth.signInWithPassword({ email, password: current_password })` using a fresh client. If it fails → `401 "Current password is incorrect"`.
6. `admin.auth.admin.updateUserById(caller_user_id, { password: new_password })`. Map HIBP/weak errors to the same friendly message used in `admin-reset-password`.
7. **Notify every admin (excluding the caller)**:
   - Query `profiles` for `role = 'admin'` and `email IS NOT NULL`, exclude `user_id = caller_user_id`.
   - Insert an in-app `notifications` row for each (`type: 'system'`, title `"Super Admin password changed"`).
   - Send a single Resend email per admin (loop, not BCC, so each lands in their own inbox cleanly). Use `app_settings.email_from` lookup, fall back to `RESEND_FROM` env or `VDTS <info@vivekdoba.com>`.
   - Email body uses `escapeHtml()` for the super admin's name and IST timestamp (same helper pattern as `send-notification`).
   - Subject: `"Security notice: Super Admin password was changed"`.
   - Email + notification failures are non-fatal; collect counts and return them.
8. Response: `{ success: true, notified: <count>, emailed: <count>, email_errors?: [...] }`.
9. `supabase/config.toml`: deploys with default `verify_jwt = false` like other admin functions; we validate JWT inline.

## Frontend changes

**`src/pages/admin/SettingsPage.tsx`**
- Add `useAuthStore` to read `profile`. Compute `isSuperAdmin = profile?.role === 'admin' && profile?.admin_level === 'super_admin'`.
- Append `'Security'` to `tabs` only when `isSuperAdmin`.
- Add a new `{activeTab === 'Security' && isSuperAdmin && <SecuritySection />}` block.
- `SecuritySection` (defined in the same file or a small new component `src/components/admin/ChangeOwnPasswordForm.tsx` — prefer the latter for clarity):
  - Three inputs (current / new / confirm), eye toggle, `PASSWORD_HELP` hint text, submit button.
  - Client-side validation: `validatePassword(new)`, new === confirm, new !== current.
  - Calls `supabase.functions.invoke('super-admin-change-own-password', { body: { current_password, new_password } })`.
  - On success: toast `"Password changed. {notified} admins notified."`, clear the form. Do NOT sign out — Supabase keeps the session valid after `updateUserById`.
  - On error: toast the server message verbatim (covers HIBP, wrong current pw, etc.).

## Out of scope
- No changes to seeker/coach password flows.
- No changes to the existing `admin-reset-password` (others-reset-others) flow.
- No changes to the forced first-login flow at `/reset-password?forced=1`.
- No DB schema changes.

## Verification
1. Sign in as super admin → Settings → Security tab visible. Sign in as regular admin → tab hidden, even if you change `activeTab` in dev tools the section guards on `isSuperAdmin`.
2. Submit with wrong current password → `"Current password is incorrect"`.
3. Submit with weak/HIBP password → friendly error toast.
4. Submit valid → toast confirms, form clears, session stays alive, all other admins receive (a) an in-app notification and (b) an email titled "Security notice: Super Admin password was changed" with the super admin's name and IST timestamp.
5. Sign out / sign back in with the new password → works.

