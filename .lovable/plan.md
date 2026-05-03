## Goal
On `/admin/create-program` (file: `src/pages/admin/AdminCreateProgram.tsx`), add a "Copy Program" option at the top of Step 1 (Basic Info) that lets the admin pick an existing program and pre-fill the wizard form with its values. Created program is still a brand-new record (only the form is pre-filled).

## Changes

### `src/pages/admin/AdminCreateProgram.tsx`
1. Import `useAllDbCourses` from `@/hooks/useDbCourses` and `Select*` (already imported).
2. Add a small section above the "Program Name" field on Step 0:
   - Label: "Copy from existing program (optional)"
   - A `Select` dropdown listing all programs (`useAllDbCourses`) — value = course id, plus a "— None —" option.
   - When a program is selected, populate the wizard `form` state from it:
     - `name` → `"{name} (Copy)"` so the name is unique and obvious
     - `tagline`, `description`, `duration`, `format`, `tier`, `price` (string), `max_participants` (string, default `'50'` if null), `event_date` (`''` — fresh program, don't copy a past date), `location`, `location_type`
     - `gradient_index`: find the closest match in `GRADIENT_PRESETS` by comparing the source's `gradient_colors` array; fall back to `0`.
   - Show a small helper line: "Pre-filled from {source name}. You can edit any field before creating."
3. No DB / route / hook changes. The existing `handleCreate` flow is reused — it always calls `createCourse.mutateAsync` (insert), so a new row is created.

## Notes
- Read-only safe additive change; no existing field/behavior removed (preservation policy respected).
- No backend migration required.
- Empty programs list (loading) → dropdown still renders with just "— None —".
