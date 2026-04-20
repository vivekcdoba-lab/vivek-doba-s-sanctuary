
## Goal
Allow the same email/phone to be reused when creating an **admin** or **coach**, but keep the strict duplicate block for **seekers**.

## Change
Single edit in `supabase/functions/admin-create-user/index.ts`: gate the duplicate check so it only runs when `role === 'seeker'`.

### File: `supabase/functions/admin-create-user/index.ts`
Wrap the existing `check_profile_duplicate` block:

```ts
if (role === 'seeker') {
  const { data: dup } = await admin.rpc('check_profile_duplicate', { _email: email, _phone: phone });
  if (dup === 'email') { return 409 'Email already registered'; }
  if (dup === 'phone') { return 409 'Phone already in use'; }
}
```

For admin/coach, skip the RPC entirely and let `auth.admin.createUser` proceed.

## Edge case: Supabase Auth uniqueness
`auth.users.email` is globally unique in Supabase. If an admin/coach is added with an email that already exists in `auth.users` (e.g. the person is already a seeker), `createUser` will fail with `"User already registered"`. Handle this:

- Detect that specific error from `createErr.message`.
- Return a **409** with a clear message: `"This email already has a login account. Use a different email for the admin/coach role, or change the existing user's role instead."`
- This prevents a confusing 500 and tells the admin exactly what to do.

Phone is NOT unique in `auth.users`, so phone reuse for admin/coach will work without further handling.

## Out of scope
- No DB schema changes (no unique constraint changes on `profiles.email` / `profiles.phone`).
- No change to seeker registration flow or the public `/register` submissions path.
- No change to `check_profile_duplicate` RPC (still used for seekers and registration).
- No UI changes to `AdminAddUser.tsx` — existing error toast already surfaces the edge function's error message.

## Verification
1. Create admin with an email already used by a seeker → if not in `auth.users`, succeeds; if in `auth.users`, returns the new 409 with guidance.
2. Create coach reusing an existing coach's phone → succeeds.
3. Create seeker with an email already in `profiles` → still blocked with `"Email already registered"`.
4. Create seeker with phone already in `profiles` → still blocked with `"Phone already in use"`.
