
## Goal
Final pre-launch audit. Identify any remaining gaps/bugs across schema, RLS, edge functions, and critical user flows — then fix them.

## Audit findings (verified against current state)

### ✅ Confirmed working
- Identity model clean: 1 super admin, 2 admins, 2 pure coaches, 1 seeker — no email/phone overlap
- `sessions.coach_id` column + index live
- `is_coach()` helper + RLS for coaches on sessions and 7 assessment tables live
- `prevent_admin_level_escalation` guards `is_also_coach`
- `AdminCoaches.getAssignedSeekersCount` filters by `coach_id`
- `SeekerLiveSession` status filter cleaned up
- `send-notification` recognizes dual-role admins
- `admin-create-user` has phone-duplicate pre-check (returns 409 instead of 500)

### 🔴 Bugs found in this audit

**Bug #1 — `db-triggers` shows "no triggers" (CRITICAL)**
The `<db-triggers>` introspection reports zero triggers in the database. That means the validation/escalation functions (`prevent_admin_level_escalation`, `prevent_role_escalation`, `validate_*_scores`, `handle_new_user`, `validate_seeker_session_update`, `check_single_assessment_rate_limit`, `update_updated_at_column`) exist as **functions** but are **not attached to any table**. Without triggers:
- `is_also_coach` escalation guard never runs
- Admin level escalation never runs
- Score validations never fire
- New auth users never get a `profiles` row → next signup will silently fail downstream
- Seekers can update coach-only session fields

This is the single biggest pre-launch risk. Needs a migration to (re)attach all triggers.

**Bug #2 — `handle_new_user` writes `phone` as empty string (HIGH)**
`COALESCE(NEW.raw_user_meta_data->>'phone', '')` inserts `''` when phone is missing. Combined with `profiles_phone_unique`, the **second** signup without a phone will collide on the empty string and fail with the original 500 error. Fix: insert `NULL` instead of `''` for phone (and city/state/company/occupation while we're at it, to stay consistent).

**Bug #3 — `check_profile_duplicate` blocks empty-phone signups by accident (MEDIUM)**
Same root cause as #2. If two profiles end up with `phone=''`, the function returns `'phone'` for every new attempt. Fix: treat `NULL` and `''` as "no phone" and skip the dup check.

**Bug #4 — `admin-create-user` doesn't normalize empty phone (MEDIUM)**
The edge function passes phone through unchanged. If the form submits `""`, the same collision happens. Fix: convert `""` → `null` before insert and skip the dup check when null.

**Bug #5 — RLS for assessment-coach view uses subquery on every row (LOW perf)**
The seven `"Coaches view assigned seekers assessments"` policies re-run a `SELECT DISTINCT … FROM sessions` per row. At current scale it's fine; flag for future optimization (wrap in a SECURITY DEFINER helper `coach_has_seeker(coach_user, seeker_id)`). Not fixing now — out of scope for launch.

**Gap #6 — No coach picker in session create/edit UI (MEDIUM)**
`coach_id` exists but no UI writes to it. New sessions still land with `coach_id=NULL`, so coach dashboards stay empty. Already flagged in the previous turn — surfacing again as a launch blocker for coach-facing analytics. Recommend deferring to a follow-up unless you want it included now.

## Fixes in this pass

### Migration: re-attach triggers + normalize empty strings
```sql
-- 1. Attach handle_new_user to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Attach escalation guards to profiles
DROP TRIGGER IF EXISTS profiles_prevent_role_escalation ON public.profiles;
CREATE TRIGGER profiles_prevent_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_escalation();

DROP TRIGGER IF EXISTS profiles_prevent_admin_escalation ON public.profiles;
CREATE TRIGGER profiles_prevent_admin_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_admin_level_escalation();

-- 3. Attach updated_at triggers to profiles + sessions + enrollments + assessments
-- (one CREATE TRIGGER per table that has updated_at)

-- 4. Attach score validators to each assessment table
CREATE TRIGGER validate_wol BEFORE INSERT OR UPDATE ON public.wheel_of_life_assessments
  FOR EACH ROW EXECUTE FUNCTION public.validate_wol_scores();
-- repeat for lgt, happiness, firo_b, mooch, purusharthas

-- 5. Attach session field guard
CREATE TRIGGER sessions_validate_seeker_update
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.validate_seeker_session_update();

-- 6. Fix handle_new_user to use NULL not ''
CREATE OR REPLACE FUNCTION public.handle_new_user() ...
  -- replace COALESCE(..., '') with NULLIF(COALESCE(...), '')

-- 7. Fix check_profile_duplicate to treat '' as no-phone
CREATE OR REPLACE FUNCTION public.check_profile_duplicate(...) ...
  -- IF _phone IS NOT NULL AND _phone <> '' AND EXISTS(...)
```

### Edge function fix
`supabase/functions/admin-create-user/index.ts` — coerce `phone === ''` to `null` before any check or insert.

### Smoke test (after migration)
1. Create a brand-new admin user **without phone** via `/admin/add-user` → should succeed (currently fails on second attempt).
2. Try to set `is_also_coach=true` on another admin while logged in as a regular admin → flag should revert to false.
3. Submit a wheel-of-life assessment with score 11 → should reject.
4. As a seeker, attempt to PATCH `coach_private_notes` on own session → should silently revert.
5. Re-query `<db-triggers>` → should now list 12+ triggers.

## Out of scope (deferred)
- Coach picker in session UI (Gap #6) — separate feature
- RLS perf optimization (Bug #5) — premature
- New tests, new pages, new charts

## Final report after fixes
- List of triggers re-attached (with table names)
- Confirmation that signup-without-phone now works repeatedly
- Confirmation that escalation guard fires
- Green-light for launch or list of remaining blockers
