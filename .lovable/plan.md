
## Status: Already Done ✅

All three passes (A, B, C) were **already implemented** in the previous turn as part of the "Final Fix-it Pass." Verified against current state:

### Pass A — sessions.coach_id + RLS for pure coaches ✅
Migration `20260420144047_c14aa8ba…sql` already applied:
- `sessions.coach_id` column + `idx_sessions_coach_id` index
- `public.is_coach(_user_id)` SECURITY DEFINER helper
- RLS policies "Coaches view their sessions" / "Coaches update their sessions" on `sessions`
- RLS policy "Coaches view assigned seekers assessments" on all 7 assessment tables (wheel_of_life, lgt, happiness, firo_b, mooch, purusharthas, swot)

### Pass B — UI/edge fixes ✅
- `src/pages/admin/AdminCoaches.tsx` — `getAssignedSeekersCount` now filters by `s.coach_id === coachId` (verified in current file content above)
- `src/pages/seeker/SeekerLiveSession.tsx` — `'confirmed'` removed from status filter
- `supabase/functions/send-notification/index.ts` — `validateAdmin` accepts `is_also_coach === true` (verified in current file content above)

### Pass C — is_also_coach escalation guard ✅
`prevent_admin_level_escalation()` already extended (visible in `<db-functions>`):
```sql
IF NEW.is_also_coach IS DISTINCT FROM OLD.is_also_coach
   AND OLD.user_id <> caller
   AND NOT caller_is_super THEN
  NEW.is_also_coach := OLD.is_also_coach;
END IF;
```

### One remaining gap — backfill
The original Pass A plan mentioned "backfill where possible." This was **not** executed because no deterministic mapping exists (sessions had no historic coach attribution; `coach_private_notes` and other text fields don't reliably identify a coach). All existing sessions therefore have `coach_id = NULL`. Backfill must happen organically as new sessions are scheduled with the coach picker, or via a one-off admin reassignment UI later.

## Recommendation
No new code/migrations needed. If you want, the next move is to **add a coach picker to the session create/edit dialogs** so new sessions get `coach_id` populated from day one — this is the only thing missing to make per-coach analytics light up with real data.

<lov-actions>
<lov-suggestion message="Add a coach picker dropdown to the session create and edit dialogs (admin + coach surfaces) so every new session gets coach_id populated. Default to the logged-in coach when a coach is creating the session.">Add coach picker to session dialogs</lov-suggestion>
<lov-suggestion message="Run a fresh seed → validate → cleanup smoke test specifically targeting a pure coach login (coachviveklgt@gmail.com) to prove the new RLS policies let them read their assigned sessions and assessments end-to-end.">Re-test pure coach RLS end-to-end</lov-suggestion>
<lov-suggestion message="Build a one-off admin tool at /admin/sessions-backfill that lists sessions with coach_id IS NULL and lets a super admin bulk-assign them to a coach.">Build session coach backfill tool</lov-suggestion>
</lov-actions>
