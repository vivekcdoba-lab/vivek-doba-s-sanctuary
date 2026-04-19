
User wants the admin to set a custom password (instead of auto-generated temp password) when creating users via `/admin/add-user`, AND apply the same 12-character password rule that's already used on the public `/register` page.

Current state:
- `RegisterPage.tsx` already enforces: min 12 chars, 1 uppercase, 1 number, 1 special char `(@#$%&*!?_-+=)` ✓
- `AdminAddUser.tsx` does NOT collect a password — edge function generates a random temp one
- Edge function `admin-create-user/index.ts` always generates `temp_password`

## Plan

### 1. Shared password validator — `src/lib/passwordValidation.ts` (new)
Single source of truth so admin form and register page stay in sync.
```ts
export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$%&*!?_\-+=]).{12,}$/;
export const PASSWORD_HELP = 'Min 12 chars, 1 uppercase, 1 number, 1 special character (@#$%&*!?_-+=)';
export function validatePassword(pwd: string): string | null { /* returns error message or null */ }
```

### 2. `RegisterPage.tsx` — refactor to use shared validator
Replace inline regex with import from new lib. Same UX, same rules. (Keeps "only add and enhance" — no behavior change, just dedup.)

### 3. `AdminAddUser.tsx` — add password fields in Step 1
Add two new inputs after Phone:
- **Password \*** (type=password) with helper text showing the rule
- **Confirm Password \*** (type=password)

Update form state with `password` + `confirm_password`. Update `canNext()` for step 0 to also require password to pass `validatePassword` and match confirm. Show inline error helper.

Pass `password` to edge function. Update Step 3 review to show "Password: ●●●●●●●● (set by admin)".

### 4. Edge function `supabase/functions/admin-create-user/index.ts`
- Accept optional `password` field in body
- If provided: server-side validate against same regex (defense-in-depth) — reject 400 if invalid
- Use provided password instead of generating one
- Response: if admin set password, return `{ password_set_by_admin: true }` instead of `temp_password`; otherwise keep current behavior (fallback for any other caller)

Frontend toast adapts: "User created with the password you set" vs the existing temp-password message.

### Files
- **New**: `src/lib/passwordValidation.ts`
- **Edit**: `src/pages/RegisterPage.tsx` (use shared validator)
- **Edit**: `src/pages/admin/AdminAddUser.tsx` (add password + confirm fields, validation, send to edge fn)
- **Edit**: `supabase/functions/admin-create-user/index.ts` (accept + validate password, skip auto-gen when provided)

Nothing removed. Coach/Seeker creation via the same admin form gets the password field too — applies to all 3 roles as requested. Public `/register` keeps its existing flow (submission → admin approval) unchanged in behavior, just shares the validator.
