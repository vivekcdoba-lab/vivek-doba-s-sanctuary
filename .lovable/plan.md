
## Root Cause

The `delete-seeker` edge function calls `userClient.auth.getClaims(token)` — **this method doesn't exist in `@supabase/supabase-js@2.45.0`**. Direct test returned:
```
500: "userClient.auth.getClaims is not a function"
```

So when admin clicks **Delete Permanently**, the function errors out → toast shows generic "Delete failed" → user is never deleted.

## Fix

Replace `getClaims` with the standard `auth.getUser(token)` API in `supabase/functions/delete-seeker/index.ts`:

```ts
const { data: userData, error: userErr } = await userClient.auth.getUser(token);
if (userErr || !userData?.user) { /* 401 */ }
const callerId = userData.user.id;
```

That's the only required change — everything else (admin role check, target seeker check, `auth.admin.deleteUser`) is correct.

## Verification After Fix

1. Re-test via curl on the seeker `Test Discovery User` (id `1121c626-...`) → expect `{ success: true }`
2. Confirm the row is gone from `profiles` (cascade)
3. Click Delete in the UI → confirm seeker disappears from list

## Files to Change

- `supabase/functions/delete-seeker/index.ts` — swap `getClaims` → `getUser`

No DB migration, no client changes needed.
