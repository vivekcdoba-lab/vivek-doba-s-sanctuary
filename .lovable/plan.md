## Root Cause

On `/coaching/schedule` (and every other coaching page), the seeker dropdown is empty for non-admin coaches. The `profiles` table SELECT policy is:

```
(user_id = auth.uid()) OR is_admin(auth.uid())
```

So a coach who isn't an admin cannot read any seeker profile → `useSeekerProfiles()` returns `[]` → New Session dropdown is empty.

There is also **no coach↔seeker assignment table** in the database today, so we cannot scope what a non-admin coach sees.

---

## Plan

### 1. Database — new `coach_seekers` assignment table

Migration creates:

- `coach_seekers (id, coach_id uuid → profiles.id, seeker_id uuid → profiles.id, assigned_by uuid, assigned_at timestamptz, is_primary boolean default true, unique(coach_id, seeker_id))`
- Helper SECURITY DEFINER function `is_coach_of(_coach_user_id uuid, _seeker_profile_id uuid) returns boolean` — looks up via `profiles.user_id → profiles.id → coach_seekers`.
- New RLS policy on `profiles`: **Coaches can view their assigned seekers** — `EXISTS (SELECT 1 FROM coach_seekers cs JOIN profiles cp ON cp.id = cs.coach_id WHERE cp.user_id = auth.uid() AND cs.seeker_id = profiles.id)`.
- RLS on `coach_seekers`: admins full CRUD; coaches SELECT their own rows (via `cp.user_id = auth.uid()`).
- New RLS on `assignments`: coaches can INSERT/SELECT/UPDATE rows for seekers they are assigned to (admins keep full access).
- New RLS on `sessions`: coaches can INSERT/SELECT/UPDATE rows where `coach_id` belongs to them OR `seeker_id` is in their `coach_seekers`.

### 2. Hooks

- New `src/hooks/useCoachSeekers.ts`:
  - `useCoachSeekers(coachProfileId)` — list assigned seekers for a coach (admins → all active seekers, coaches → only assigned).
  - `useAssignSeekerToCoach()`, `useUnassignSeekerFromCoach()`, `useReassignSeeker()` mutations (admin-only at UI level; RLS enforces).
- New `src/hooks/useScopedSeekers.ts` — single hook used by all coaching pages: returns all active seekers if `profile.role === 'admin' || is_also_coach`-with-admin OR returns assigned seekers otherwise. Centralizes the role check.

### 3. Coaching UI fixes (read-side)

- `src/pages/coaching/CoachSchedule.tsx`: replace `useSeekerProfiles()` with `useScopedSeekers()`. Show empty-state with helpful message ("No seekers assigned to you. Ask an admin to assign seekers.") if list is empty for a non-admin coach.
- Same swap in: `CoachCreateAssignment.tsx` (so "All Seekers" bulk option only targets seekers the coach owns; admins target everyone), `CoachAllSeekers.tsx`, `CoachPendingSubmissions.tsx`, `CoachReviewedAssignments.tsx`, `CoachPastSessions.tsx`, `CoachSeekersOntrack.tsx`, `CoachBusinesses.tsx`, `CoachSwotReviews.tsx`, `CoachArthaProgress.tsx`, `CoachCompletionRate.tsx`, `CoachDeptHealth.tsx`, `CoachBusinessNotes.tsx`, `CoachProgressReport.tsx`, `CoachGenerateReports.tsx` — every coaching page that currently uses `useSeekerProfiles()`.

### 4. Admin assignment UI (write-side)

- New page `/admin/coach-seekers` (`src/pages/admin/AdminCoachSeekers.tsx`):
  - Two-pane view: left = list of coaches (including admins with `is_also_coach`), right = their assigned seekers with **Add seeker**, **Reassign to another coach**, **Unassign** controls.
  - Bulk "Assign multiple seekers to coach X" multi-select.
  - Search + filter by city/program.
- Add link in `AdminLayout.tsx` sidebar under the Coaches section.
- On the existing `SeekerDetailPage.tsx` (admin Seeker 360), add a "Primary Coach" card that shows current assignment and allows admin to change it inline.

### 5. Bulk assignment verification

- `CoachCreateAssignment.tsx` already supports `assignMode = 'all' | 'course' | 'individual'`. After step 3, scope "all" to the coach's assigned seekers (admins get everyone). The existing loop creating one row per seeker is preserved. Add a confirmation dialog when targets > 10 ("This will create N assignments — confirm?").

### 6. Memory updates

- New `mem://features/coach-seeker-assignments` describing the table, RLS scoping, and admin reassignment workflow.
- Update `mem://auth/access-control-policies` to mention coach-scoped seeker visibility.
- Update `mem://index.md` to reference the new memory.

### 7. Dry-run + smoke test (Playwright)

New test file `e2e/coach-seeker-assignment.spec.ts` covering:

1. **Admin assigns seeker** → log in as admin (`vivek@gmail.com`), open `/admin/coach-seekers`, assign `test01@` to a non-admin coach. Assert toast + row appears.
2. **Coach sees only assigned** → log in as that coach, open `/coaching/schedule` → click **New Session** → assert seeker dropdown contains exactly the assigned seeker(s) and no others.
3. **Coach creates session** → fill form, save → assert it renders on calendar; refetch via DB read query confirms `coach_id` matches.
4. **Bulk assignment** → open `/coaching/create-assignment`, choose "All Seekers", create → assert success toast and `assignments` row count increased by N for that coach's assigned seekers only.
5. **Admin sees everyone** → log in as admin, open `/coaching/schedule` New Session → assert dropdown shows all active seekers.
6. **Reassignment** → admin moves a seeker from Coach A to Coach B; Coach A no longer sees them, Coach B does.

Run via `bunx playwright test e2e/coach-seeker-assignment.spec.ts` and report pass/fail.

---

## Files Affected

**New**
- `supabase/migrations/<ts>_coach_seekers.sql`
- `src/hooks/useCoachSeekers.ts`
- `src/hooks/useScopedSeekers.ts`
- `src/pages/admin/AdminCoachSeekers.tsx`
- `e2e/coach-seeker-assignment.spec.ts`
- `mem://features/coach-seeker-assignments`

**Edited**
- `src/App.tsx` (route)
- `src/components/AdminLayout.tsx` (nav link)
- `src/pages/admin/SeekerDetailPage.tsx` (Primary Coach card)
- `src/pages/coaching/CoachSchedule.tsx` + ~13 other coaching pages (swap to `useScopedSeekers`)
- `src/pages/coaching/CoachCreateAssignment.tsx` (scoped bulk + confirmation)
- `mem://auth/access-control-policies`, `mem://index.md`

**Preservation**: No tables/columns/pages removed. `useSeekerProfiles` retained (still used by admin pages).
