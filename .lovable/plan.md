

## Plan: Fix Remaining Security Findings (Fresh Scan)

The user's listed items are mostly already fixed/ignored. A fresh scan reveals **4 real new issues** + 2 outdated lints. Plan addresses each.

### 1. ERROR — `session_signatures` exposes IP/user-agent to seekers
The current SELECT policy lets a seeker see `ip_address` + `user_agent` of coaches/admins who signed their session. Fix: restrict SELECT of those two columns to admins only.

**Approach** (preserves data, "Only Add and Enhance" policy):
- Replace the seeker SELECT policy with one that excludes the sensitive fields by routing seekers through a new `session_signatures_safe` SECURITY DEFINER view (id, session_id, signer_id, signer_role, storage_path, typed_name, content_hash, signed_at — no IP/UA).
- Keep admin ALL policy untouched.
- New seeker SELECT policy: `is_admin(auth.uid())` only on the base table.
- Update any frontend reads of `session_signatures` to use the view (`DigitalSignature.tsx`, session detail pages).

### 2. ERROR — `personal_swot_assessments` ownership check is broken
Policies compare `seeker_id = auth.uid()` but `seeker_id` references `profiles.id` (a different UUID). Currently seekers cannot read their own SWOT — confirmed in `useSwotAssessment.ts` (sends `profile.id`).

**Fix**: Drop the 3 broken policies and recreate them with the standard `profiles` join pattern used everywhere else:
```sql
seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
```
Add admin override on each.

### 3. WARN — `session_audit_log` accepts forged session_ids
INSERT policy only checks `actor_id` belongs to caller; any valid session UUID can be referenced.

**Fix**: Tighten INSERT policy to also require the `session_id` belongs to a session where the actor is the seeker, or the actor is an admin.

### 4. WARN — `swot_entries` has no explicit non-admin policy
Default-deny works, but scanner wants intent declared.

**Fix**: Add explicit `USING (false)` SELECT policy for `authenticated`/`anon` to make admin-only intent explicit and self-documenting.

### 5. WARN (outdated) — `RLS Policy Always True` & `Public Bucket Allows Listing`
Both are stale lints already covered by previous ignores. Re-mark as ignored after the new scan.

---

### Files to change
| File | Change |
|------|--------|
| `supabase/migrations/<new>.sql` | All RLS fixes above + create `session_signatures_safe` view |
| `src/integrations/supabase/types.ts` | Auto-regenerated after migration |
| `src/components/DigitalSignature.tsx` | Read from `session_signatures_safe` instead of `session_signatures` (only for non-admin reads) |
| `src/components/SessionReviewStatus.tsx` (and similar consumers) | Same swap if they read signature rows |
| Security findings | Mark 4 new items as "fixed" with explanation; re-mark 2 outdated lints as "ignored" |

### Verification
- Re-run scan → expect 0 errors, 0 new warnings (only the 2 outdated lints, ignored)
- Manually test: seeker views their SWOT history (should now actually return rows), admin views session signatures (full data), seeker views session signatures (no IP/UA leaked)

