
User wants end-to-end verification of everything built today, with no leftover test records.

## What was built today (to verify)
1. **Strict role-based route access** (`AuthGuard.tsx` + `authStore.ts`)
   - Seeker → only `/seeker/*`
   - Coach → only `/coaching/*`
   - Regular Admin → only `/admin/*` (blocked from coach/seeker)
   - Super Admin → universal access
2. **`/admin/coaches` filter fix** — only `role === 'coach'` shown (no admins)
3. **Password reset feature**
   - Edge function `admin-reset-password` (auth rules, Resend email, in-app notification)
   - Shared `ResetPasswordDialog.tsx`
   - `KeyRound` button in `AdminSearchUsers`, `AdminCoaches`, `AdminAdmins`
   - Super-admin-only visibility for resetting admin accounts

## Test plan (read-only, no data created)

### A. Static / code verification (no browser, no DB writes)
1. Re-read `AuthGuard.tsx` — confirm super_admin override + per-role redirects.
2. Re-read `authStore.ts` — confirm `admin_level` in `Profile` type and select query.
3. Re-read `AdminCoaches.tsx` — confirm filter is `role === 'coach'` only.
4. Re-read `ResetPasswordDialog.tsx` — confirm `validatePassword` use, confirm-password match, show/hide toggle, invokes `admin-reset-password`.
5. Re-read `admin-reset-password/index.ts` — confirm: JWT check, `is_admin` gate, `is_super_admin` gate when target is admin, self-reset block, `updateUserById` call, Resend email, `notifications` insert, all non-fatal failures handled.
6. Re-read `AdminSearchUsers.tsx` and `AdminAdmins.tsx` — confirm super-admin visibility guard on the reset button for admin rows.
7. Run `supabase--linter` to surface any new SQL/security issues.
8. Spot-check edge function logs for `admin-reset-password` (should be none / clean since not yet invoked).

### B. Live data verification (read-only DB queries via `supabase--read_query`)
- Count rows by role in `profiles` to confirm `/admin/coaches` would only render coaches.
- Verify at least one `super_admin` exists so the universal-access path is reachable.
- Confirm no orphan/test users were created today (filter `created_at >= today`).

### C. Edge function smoke test (NO real password change)
- Call `admin-reset-password` via `supabase--curl_edge_functions` with:
  - **No auth header** → expect `401 Unauthorized`
  - **Invalid body** (missing fields) → expect `400` with Zod validation error
  - **Weak password** (e.g. `"short"`) → expect `400` from Zod regex check
- These calls never reach `updateUserById`, so no account is modified and no email is sent.
- Skip any "happy path" call that would actually change a real user's password.

### D. Explicit non-actions (to honor "don't create test records")
- No new users, profiles, sessions, notifications, or any DB inserts.
- No real password resets executed against any account.
- No browser-based UI clicks that would persist data.
- If any test artifact slips in, delete it immediately and report.

## Deliverable
A single summary report listing each item above with PASS / FAIL / NOTES, plus confirmation that zero test records were created.
