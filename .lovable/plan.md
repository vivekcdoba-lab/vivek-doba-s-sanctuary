

## Why "two coaches not created"

Logs prove the **auth users WERE created/updated successfully** (`PUT /admin/users/...` 200 for both `dobaarchana@gmail.com` and `vivekcdoba@gmail.com`). Their `profiles` rows also exist. The function then crashed at the email step:

```
[email] exception Cannot read properties of undefined (reading 'replace')
```

…which the function catches and returns to the UI as a failure toast — making it *look like* the coaches weren't created. They were. Their `role` is just still `admin` in profiles because the profile update either didn't happen on the reuse path, or you tried to convert existing admins → coaches and the email crash short-circuited the success messaging.

Root cause: `escapeHtml(s)` calls `s.replace(...)` with no null guard. When `name`/`email`/`role` is undefined (happens on the reused-auth-user path or with certain payloads), it throws.

## Fix — single file: `supabase/functions/admin-create-user/index.ts`

1. **Null-safe `escapeHtml`**
   ```ts
   function escapeHtml(s: unknown) {
     const str = s == null ? '' : String(s);
     return str.replace(/[&<>"']/g, (c) => ({
       '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
     }[c]!));
   }
   ```

2. **Defensive `buildEmail`** — coerce all fields:
   ```ts
   const safeName = String(name || 'Seeker');
   const safeEmail = String(email || '');
   const safePassword = String(password || '');
   const safeRole = String(role || 'user');
   const roleLabel = safeRole.charAt(0).toUpperCase() + safeRole.slice(1);
   ```
   Use these in the template instead of the raw destructured values.

3. **Better logging** — before returning email failure, log which field was empty so future regressions are obvious:
   ```ts
   console.error('[email] buildEmail inputs', { name: !!opts.name, email: !!opts.to, role: !!opts.role });
   ```

4. **Ensure profile role flips on reused-user path** — verify the existing `updatePayload` runs for reused users (it does in current code, just confirming no early return skips it). No code change unless verification finds a gap.

## After the fix
- Re-trigger "Create Coach" for `dobaarchana@gmail.com` and `vivekcdoba@gmail.com` → the profile `role` will update to `coach`, no email crash, success toast.
- If you want them to remain admins, just leave them — they already exist as admin.

## Out of scope
- No DB migration.
- No UI changes.
- No changes to duplicate-handling logic, role gating, or email content.

## Verification
1. Edge function logs no longer show `Cannot read properties of undefined (reading 'replace')`.
2. After re-creating the two coaches: `select role from profiles where email in ('dobaarchana@gmail.com','vivekcdoba@gmail.com')` returns `coach` for both.
3. Both recipients receive the credentials email from `info@vivekdoba.com`.
4. Creating a brand-new coach with a fresh email still works end-to-end.

