
Two issues:

1. **`/admin/coaches` shows admins** — `AdminCoaches.tsx` line 21 filters `p.role === 'coach' || p.role === 'admin'`. Should be coaches only.
2. **No UI to reset passwords** — the previously approved `admin-reset-password` edge function + reset UI in `AdminSearchUsers.tsx` was planned but not yet built. Also needs sidebar visibility/navigation so admin can find it.

## Changes

### 1. Fix `/admin/coaches` to show only coaches
**`src/pages/admin/AdminCoaches.tsx`**
- Change filter to `p.role === 'coach'` only (drop admin).
- Update the "Total Seekers Managed" stat card label/logic to stay seeker-count (already correct).
- Remove the "Role" column or keep it (will always show "coach") — keep but simpler.

### 2. Build the password-reset feature (carry-over of prior approved plans)

**a) New Edge Function `supabase/functions/admin-reset-password/index.ts`**
- CORS + JWT validation
- Body (Zod): `{ target_user_id: string (uuid), new_password: string }`
- Password rules match `src/lib/passwordValidation.ts` (≥12, 1 uppercase, 1 number, 1 special)
- Auth rules:
  - Caller must be admin (`is_admin` RPC)
  - If target's role is `admin` → caller must be `super_admin` (`is_super_admin` RPC)
  - If target is `seeker` / `coach` → any admin allowed
  - Block resetting your own password via this endpoint
- Service role: `supabase.auth.admin.updateUserById(target_user_id, { password })`
- Send security email via Resend to target user (subject: "Your VDTS account password was changed", with caller name + IST timestamp + support contact). Email failure logged but non-fatal.
- Insert row into `notifications` table for target user (type: security). Non-fatal.
- Returns `{ success, email_sent, email_error? }`

**b) UI in `src/pages/admin/AdminSearchUsers.tsx`**
- Add `KeyRound` icon button in row actions for every user row.
- Visibility:
  - Seeker / Coach rows → any admin
  - Admin rows → only when current user is `super_admin` (read `profile.admin_level` from `useAuthStore`)
- Dialog:
  - Read-only context (name, email, role badge)
  - New password + Confirm password inputs (with show/hide toggle)
  - `PASSWORD_HELP` hint text
  - Client-side `validatePassword()`
  - Warning: "Communicate the new password to the user securely. They will use it on next login."
- Submit via `supabase.functions.invoke('admin-reset-password', ...)`. Toast reflects email-send status.

**c) Discoverability — make the page easy to find**
- `/admin/search-users` already exists and is now the home for password resets. In `AdminCoaches.tsx` and `AdminAdmins.tsx`, also add the same `KeyRound` reset button per row (same dialog component, extracted into a small shared component `src/components/admin/ResetPasswordDialog.tsx` to avoid duplication). This way admin can reset from any of the three list pages (Search Users, Coaches, Admins).

### 3. Files
- **EDIT** `src/pages/admin/AdminCoaches.tsx` — filter coaches only; add reset button
- **EDIT** `src/pages/admin/AdminAdmins.tsx` — add reset button (super_admin only visibility)
- **EDIT** `src/pages/admin/AdminSearchUsers.tsx` — add reset button + dialog
- **CREATE** `src/components/admin/ResetPasswordDialog.tsx` — shared dialog component
- **CREATE** `supabase/functions/admin-reset-password/index.ts` — edge function

## Out of scope
- No DB schema changes (uses existing `is_admin`, `is_super_admin`, `profiles`, `notifications`)
- No SMS/WhatsApp notification (email + in-app only)
- No password history/reuse prevention
- No changes to user self-service password change flows
- No sidebar nav additions — Search Users, Coaches, Admins already exist in admin nav
