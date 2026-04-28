## Add Lifecycle Status to Training Programs

Add a manual lifecycle status (Active / Upcoming / Completed / Deactivated) to every program, with status tabs on the Training Programs listing and a status selector inside the Edit Program form.

### Database (migration)

Add a `lifecycle_status` column to `public.courses`:

- Type: `text`, NOT NULL, default `'active'`
- Allowed values (CHECK): `'active'`, `'upcoming'`, `'completed'`, `'deactivated'`
- Backfill: existing rows where `is_active = false` → `'deactivated'`; all others → `'active'`
- Keep `is_active` (Preservation Policy). When status is set to `deactivated`, also set `is_active = false`; for the other three, set `is_active = true`. This keeps existing queries working.

### Data hook (`src/hooks/useDbCourses.ts`)

- Add `lifecycle_status` to the `DbCourse` interface.
- Change `useDbCourses()` to drop the `.eq('is_active', true)` filter so all programs (including Completed/Deactivated) are returned. Existing seeker-facing pages that need only active programs will be updated to filter by `lifecycle_status` (see below).
- Add an optional `useDbCoursesActiveOnly()` helper that filters `lifecycle_status in ('active','upcoming')` for seeker-facing surfaces, so nothing breaks.

### Training Programs listing — `src/pages/admin/CoursesPage.tsx`

- Add 4 status tabs above the grid: **Active**, **Upcoming**, **Completed**, **Deactivated** (with counts).
- Filter the grid by the selected tab.
- Show a colored status badge on each card (green/blue/gray/red).
- In the Add/Edit modal, add a **Lifecycle Status** selector (defaults to `active` on add).
- Save handler writes `lifecycle_status` and the matching `is_active` flag.

### Edit Programs page — `src/pages/admin/AdminEditPrograms.tsx`

- Same 4 status tabs at top with counts.
- Card shows a status badge.
- Edit dialog gets a **Lifecycle Status** dropdown (Active / Upcoming / Completed / Deactivated).
- Existing "Deactivate" button stays (Preservation Policy) — it now sets `lifecycle_status = 'deactivated'` and `is_active = false`.

### Safety check

After changing `useDbCourses()` to return all programs, audit the few seeker-facing usages (course discovery, enrollment) and switch them to the active-only helper so Completed/Deactivated programs don't appear to seekers.

### Status colors

```text
active       → green   (emerald)
upcoming     → blue
completed    → gray
deactivated  → red / muted
```

No changes to `program_trainers`, `enrollments`, or any other table.