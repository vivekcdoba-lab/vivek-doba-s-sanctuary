

User wants two things on `/admin/add-user`:
1. **Auto-generate password toggle** — when ON, hides the password fields, server generates a strong temp password (like seeker flow does today), forces password change on first login, and the success toast shows the generated password to the admin.
2. **Welcome email with credentials** — already wired in `admin-create-user` via `sendCredentialsEmail()`. Just need to confirm the toggle path triggers it correctly (it already does — same code path as seeker).

Let me check the AddUser page to understand current shape.

Quick read needed:
- `src/pages/admin/AdminAddUser.tsx` — form structure, current password handling, toast on success.

The edge function `admin-create-user` already supports both modes:
- `role === 'seeker'` → always auto-generates temp password, sends email with `isTemp: true`
- `role === 'admin' | 'coach'` → requires admin-typed password, validates 12+ chars

I need to extend this so admin/coach can ALSO opt into auto-generated temp passwords via a new request flag.

## Plan

### 1. Edge function `supabase/functions/admin-create-user/index.ts`
Add new request body field `auto_generate_password: boolean` (default false). Update password resolution logic:
- If `role === 'seeker'` → always auto-gen (unchanged).
- If `role === 'admin' | 'coach'` AND `auto_generate_password === true` → use `randomPassword()`, set `isTempPassword = true`, `mustChange = true`. Skip the manual-password validation.
- Else (admin/coach with manual password) → existing path, validate PASSWORD_REGEX.
- Email already sends in all paths via `sendCredentialsEmail` — no change needed.
- Return `password` in the JSON response (only when auto-generated) so the admin UI can display it in the toast.

### 2. UI `src/pages/admin/AdminAddUser.tsx`
- Add a `Switch` (from `@/components/ui/switch`) labeled "Auto-generate secure password" near the password fields.
- When ON: hide both password and confirm-password inputs, show a small helper note "A 14-character temporary password will be generated. The user will be required to set their own on first login. You'll see the password in the success message."
- When OFF: existing manual fields with current validation.
- On submit: pass `auto_generate_password: autoGen` and omit `password` when toggle is on.
- On success: if response includes `password` (auto-gen path), show it in a persistent `toast.success` with a Copy button. Use `sonner`'s `toast(..., { duration: 30000, action: { label: 'Copy', onClick: () => navigator.clipboard.writeText(password) } })` so the admin can copy before it disappears.
- Default toggle to OFF for admin/coach (preserves current behavior); for seeker role, hide the toggle entirely (always auto-gen — already enforced server-side).

### 3. Email
No changes — `sendCredentialsEmail` already sends `isTemp: true` notice, login URL, and credentials. The Resend domain `noreply@vivekdoba.com` is already wired with fallback. If domain not verified yet, response includes `email_sent: false` + `email_error` — surface that in the toast as a warning so admin knows to share credentials manually.

### Files touched
- `supabase/functions/admin-create-user/index.ts` (extend password logic + return generated password)
- `src/pages/admin/AdminAddUser.tsx` (add toggle + conditional render + enhanced success toast)

### Will NOT do
- Won't change seeker flow (already auto-gen + emails).
- Won't change `approve-application` (already handles its own credential email).
- Won't bypass password validation for the manual path.

### Verification
1. Toggle ON, create admin → toast shows "User created. Temporary password: `Xy7@kPq2!mLn9R`" with Copy button; user receives email.
2. Toggle OFF, create admin → existing 12-char validation still enforced; user receives email with the typed password.
3. Create seeker → toggle hidden; behavior unchanged; user gets temp-password email.

