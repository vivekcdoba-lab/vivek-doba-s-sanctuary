## Goal

Let admins assign **multiple coaches** to each program with roles (`lead`, `co_coach`, `assistant`), and have the system **auto-link** coaches to any seeker enrolled in those programs — so coaches automatically see the right seekers in the schedule, session creation, and assignment flows.

Reuses the existing dormant `program_trainers` table (`program_id`, `trainer_id`, `role`, `display_order`).

---

## 1. Database migration

**Activate `program_trainers`:**
- Enable RLS. Policies:
  - Admins: full CRUD (`is_admin(auth.uid())`).
  - Coaches: SELECT rows where `trainer_id` is their own profile (so they can see which programs they're on).
- Add `UNIQUE (program_id, trainer_id)` to prevent duplicates.
- Constrain `role` to `('lead','co_coach','assistant')` with default `'co_coach'`.

**Auto-link trigger — `enrollments` → `coach_seekers`:**
- New trigger `auto_link_coaches_on_enrollment` on `INSERT` to `enrollments`:
  - For each row in `program_trainers` matching `NEW.course_id`, upsert a `coach_seekers` row (`coach_id = trainer_id`, `seeker_id = NEW.seeker_id`, `is_primary = (role = 'lead')`, `assigned_by = NULL`) — `ON CONFLICT (coach_id, seeker_id) DO NOTHING`.
- New trigger `auto_link_seekers_on_program_trainer_insert` on `INSERT` to `program_trainers`:
  - For each existing enrollment in that `program_id`, upsert into `coach_seekers` the same way. This back-fills assignments when a new coach is added to an existing program.
- **No auto-unlink** on enrollment deletion or trainer removal — admins keep manual control via `/admin/coach-seekers` (preserves the "Only Add and Enhance" memory rule).

**Backfill migration step:** one-time `INSERT … SELECT … ON CONFLICT DO NOTHING` to populate `coach_seekers` from the cross-product of existing `enrollments` × `program_trainers`.

---

## 2. Hooks

New `src/hooks/useProgramTrainers.ts`:
- `useProgramTrainers(programId?)` → list trainers for a program (with profile join: name, avatar, role).
- `useTrainerPrograms(trainerProfileId?)` → list programs a coach is on (used on coach profile).
- `useAssignTrainerToProgram()` mutation `{ program_id, trainer_id, role }`.
- `useUpdateTrainerRole()` mutation `{ id, role, display_order? }`.
- `useRemoveTrainerFromProgram()` mutation `{ id }`.
- All invalidate `['program-trainers']`, `['trainer-programs']`, and `['coach-seekers']` (since the back-fill trigger may have added rows).

---

## 3. Admin UI

**New page `/admin/program-coaches`** (`src/pages/admin/AdminProgramCoaches.tsx`):
- Two-pane layout matching `/admin/coach-seekers` style for consistency.
- Left: list of programs (from `useDbCourses`) with badge showing `# coaches assigned`.
- Right: selected program's trainers table — coach name, role dropdown (`lead`/`co_coach`/`assistant`), display order, remove button. "Add Coach" combobox lists profiles where `role='coach' OR is_also_coach=true`. Toast on save: *"Added [name] as [role]. N enrolled seekers auto-linked."*
- Sidebar link in `AdminLayout.tsx` under the Coaches section, next to "Coach Assignments".

**Existing program edit page** (`src/pages/admin/AdminEditPrograms.tsx`):
- Add a small "Coaches" summary chip on each program card showing count + a "Manage" button that deep-links to `/admin/program-coaches?program=<id>`. No inline editing here — keeps the edit dialog focused on program details.

---

## 4. Coach profile UI

The user picked **Coach profile page** as the home for assignment visibility (read-only for the coach):

- On `src/pages/admin/AdminCoaches.tsx` (or the coach detail row, depending on existing structure — will inspect first), add a **"Programs"** column / expandable section showing the programs each coach is assigned to with their role badge.
- On the coach's own settings page `src/pages/coaching/CoachSettings.tsx`, add a read-only **"My Programs"** card showing assigned programs + role, so the coach knows their scope.

Admin write-side stays on `/admin/program-coaches` (clearer separation than burying it in coach edit forms).

---

## 5. Coaching schedule + session creation scoping

`useScopedSeekers` already returns assigned seekers via `coach_seekers`. With the auto-link trigger in place, any seeker enrolled in one of the coach's programs will automatically appear — **no code change needed in the 16 coaching pages already migrated**.

Verify the dropdown in:
- `src/pages/coaching/CoachSchedule.tsx` → New Session
- `src/pages/coaching/CoachCreateAssignment.tsx` → bulk + individual

Both already use `useScopedSeekers`, so they pick this up for free.

**One enhancement** in `CoachSchedule.tsx`: add an optional **"Filter by program"** chip row above the seeker dropdown, populated from `useTrainerPrograms()` for the current coach. Selecting a program narrows the seeker dropdown to enrollees in that program. Admins see all programs.

---

## 6. Memory updates

- Update `mem://features/program-structure` — note that programs now have a multi-coach assignment model with roles.
- New `mem://features/coach-program-assignments` documenting the `program_trainers` activation, role enum, auto-link trigger, and admin UI location.
- Update `mem://index.md` to reference the new memory.

---

## 7. Dry-run + smoke test (Playwright)

New file `e2e/coach-program-assignment.spec.ts`:

1. **Admin assigns lead coach to program** — login as `vivek@gmail.com`, open `/admin/program-coaches`, select TATHASTU, add coach "test-coach@" as `lead`. Assert toast mentions auto-linked seekers count.
2. **Auto-link verification** — DB read query: `SELECT COUNT(*) FROM coach_seekers WHERE coach_id = <test-coach profile id>` matches enrolled seekers in TATHASTU.
3. **Coach sees enrolled seekers** — login as test-coach, open `/coaching/schedule` → New Session → assert seeker dropdown contains exactly TATHASTU's enrollees.
4. **New enrollment auto-links** — admin enrolls a fresh seeker in TATHASTU via `/admin/new-enrollment`; re-login as coach, refresh schedule, assert the new seeker now appears.
5. **Adding co-coach back-fills** — admin adds a second coach as `co_coach` to TATHASTU; that coach now sees the same enrollees on first login.
6. **Admin scope unchanged** — login as admin, dropdown still shows all active seekers.
7. **Program filter** — coach selects a different program in the schedule filter; seeker list narrows correctly.

Run via `bunx playwright test e2e/coach-program-assignment.spec.ts`.

---

## Files affected

**New**
- `supabase/migrations/<ts>_program_trainers_activation.sql`
- `src/hooks/useProgramTrainers.ts`
- `src/pages/admin/AdminProgramCoaches.tsx`
- `e2e/coach-program-assignment.spec.ts`
- `mem://features/coach-program-assignments`

**Edited**
- `src/App.tsx` (route)
- `src/components/AdminLayout.tsx` (nav link)
- `src/pages/admin/AdminEditPrograms.tsx` (coach count chip + deep link)
- `src/pages/admin/AdminCoaches.tsx` (programs column)
- `src/pages/coaching/CoachSettings.tsx` (My Programs read-only card)
- `src/pages/coaching/CoachSchedule.tsx` (program filter chips)
- `mem://features/program-structure`, `mem://index.md`

**Preservation**: No tables, columns, or pages removed. `coach_seekers` manual assignments still work alongside the auto-link.