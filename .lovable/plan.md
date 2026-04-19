
User wants three distinct flows:

1. **Seeker creation** (by admin): Auto-generate temp password → email it to seeker → force password change on first login
2. **Admin creation** (by admin): Admin types 12-char password → email both email+password to new admin → optional password change on first login
3. **Coach creation** (by admin): Same as admin — admin types 12-char password → email credentials → optional password change

Login flow needs `must_change_password` enforcement only for seekers; admins/coaches see a one-time prompt they can dismiss.

## Plan

### 1. DB migration
Add to `profiles`:
- `must_change_password boolean default false` — true=forced (seekers), used to redirect to /reset-password until cleared
- `password_change_prompted boolean default false` — track if optional prompt was shown to admin/coach (so we don't nag)

### 2. Edge function `admin-create-user/index.ts` — branch by role
- **role=seeker**: ignore any `password` from client; always auto-generate 12-char password (matching the regex). Set `must_change_password=true`. Send welcome email with temp password + login link via Resend.
- **role=admin / coach**: require admin-typed password (already validated 12-char). Set `must_change_password=false`, but `password_change_prompted=false` so login can offer optional change. Send credentials email (email + password + login link).
- All emails via existing `RESEND_API_KEY`. Single helper `sendCredentialsEmail({to, name, role, password, isTemp})` with simple HTML template (VDTS branding, ॐ, "Begin your sacred session" copy).
- Response no longer returns `temp_password` to admin UI (now delivered by email). Toast becomes "User created — credentials emailed to {email}".

### 3. `AdminAddUser.tsx`
- When role=seeker: hide the Password / Confirm Password fields entirely; show info banner "A temporary password will be emailed to the seeker. They'll set their own on first login."
- When role=admin/coach: keep password fields (already 12-char enforced). Show note "Login credentials will be emailed to the user."
- Step 3 review reflects which path was taken.

### 4. `LoginPage.tsx` + new logic
After successful login, fetch `must_change_password` + `password_change_prompted`:
- If `must_change_password === true` → redirect to `/reset-password?forced=1`. /reset-password hides "back" link, requires new password, then on success calls `update profiles set must_change_password=false`.
- Else if role in (admin, coach) AND `password_change_prompted === false` → show one-time dialog: "Change your password now? (Recommended)" with "Change Now" / "Keep Current" buttons. Either choice sets `password_change_prompted=true`. "Change Now" routes to /reset-password.

### 5. `ResetPassword.tsx` enhancement
- Read `?forced=1` query param. When forced: hide "Back to login", disable closing/skipping, show banner "You must set a new password to continue."
- After successful `auth.updateUser({password})`, also update `profiles.must_change_password=false` for current user.

### 6. New helper file
`src/lib/firstLoginFlow.ts` — exports `checkFirstLoginAction(profile)` returning `'forced' | 'prompt' | 'none'` so login + AuthGuard share logic.

### Files
- New: `supabase/migrations/<ts>.sql` (2 columns + default)
- New: `src/lib/firstLoginFlow.ts`
- Edit: `supabase/functions/admin-create-user/index.ts` (role branch + email send + flag set)
- Edit: `src/pages/admin/AdminAddUser.tsx` (conditional password block, updated toast)
- Edit: `src/pages/LoginPage.tsx` (post-login flag check, forced redirect, optional prompt dialog)
- Edit: `src/pages/ResetPassword.tsx` (forced mode + clear flag)

Nothing existing removed. Public `/register` flow untouched (still goes through approval queue — no password set there).
