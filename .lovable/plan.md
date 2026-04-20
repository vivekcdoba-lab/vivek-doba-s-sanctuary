
## Goal
Make `vivekcdoba@gmail.com` and `dobaarchana@gmail.com` **admin-only** (no coach hat). Remove their coach status and any standalone coach records.

## Current state (verified)
Both accounts have `role='admin'` with `is_also_coach=true`. There are no separate `role='coach'` rows for them — the dual hat comes solely from the `is_also_coach` flag.

## Changes

### 1. Flip the coach flag off (data update via insert tool)
```sql
UPDATE profiles
SET is_also_coach = false
WHERE email IN ('vivekcdoba@gmail.com', 'dobaarchana@gmail.com');
```

### 2. Delete any pure coach rows for these emails (safety net)
```sql
DELETE FROM profiles
WHERE email IN ('vivekcdoba@gmail.com', 'dobaarchana@gmail.com')
  AND role = 'coach';
```
(Expected: 0 rows — confirmed none exist today, but included for completeness in case any get created before execution.)

### 3. No code changes
`AdminCoaches.tsx` already filters on `role === 'coach' || is_also_coach === true`. Once the flag is false and no coach row exists, both users automatically disappear from `/admin/coaches` and remain visible only on `/admin/admins`. AuthGuard already routes them to admin-only surfaces when `is_also_coach` is false.

## Verification (read-only after the update)
1. `SELECT email, role, is_also_coach FROM profiles WHERE email IN (...)` → both rows show `role='admin'`, `is_also_coach=false`.
2. `/admin/coaches` no longer lists Vivek or Archana.
3. `/admin/admins` still lists both with their existing admin level/permissions.
4. `/admin/search-users` shows only the Admin badge (no Coach badge) for these two.
5. Logging in as either account routes to `/admin/dashboard` and the `/coaching/*` routes redirect away (AuthGuard).

## Out of scope
- No changes to other admins or coaches.
- No schema changes, no RLS changes, no edge function changes.
- Their admin permissions, super-admin status, sessions history, and audit trail are untouched.
