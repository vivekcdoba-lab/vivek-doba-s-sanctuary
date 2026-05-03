# Three Fixes for Session Rules / Programs

You're on **/admin/session-rules** and the native browser "Delete this rule?" popup is showing (screenshot). Three related fixes:

## 1. Replace browser popup with in-app dialog

The page currently uses `window.confirm("Delete this rule?")`. Replace it with the existing `AlertDialog` component (already in `src/components/ui/alert-dialog.tsx`) so the prompt is styled, themed, and lives inside the app — no more "An embedded page at id-preview… says" browser chrome.

- File: `src/pages/admin/AdminCourseSessionRules.tsx`
- Add `<AlertDialog>` controlled by a `pendingDeleteId` state.
- Trigger from the trash button; Cancel closes, Delete runs the existing `deleteRule` logic.

While here, also upgrade two other native confirms on the same surface area to the same pattern (low-risk, same component):
- `src/pages/admin/AdminEnrollments.tsx` (Delete enrollment)
- `src/pages/admin/AdminDocuments.tsx` (Delete document)

(Other native `confirm()` usages elsewhere in the app are left untouched per Preservation Policy — this request is scoped to the popup the user just saw.)

## 2. Show "Deactivated" rules separately on Session Rules page

Today `AdminCourseSessionRules` shows a single flat table of all rules. Group them by the parent course's `lifecycle_status` so deactivated programs' rules don't pollute the active list, but are still visible/editable.

- Two sections on the page:
  - **Active Rules** — rules whose course is `active` / `upcoming` / `completed`.
  - **Deactivated Rules** — rules whose course is `lifecycle_status = 'deactivated'`, rendered in a collapsed `<details>` block with a muted style and the deactivated badge from `LIFECYCLE_BADGE_CLASSES`.
- Loading uses the existing `useAllDbCourses()` (already loaded) to look up each rule's course status — no new query.

## 3. Never show "Deactivated" programs in dropdown LOVs

`useDbCourses()` already filters `is_active = true`, which excludes deactivated. But three admin screens use `useAllDbCourses()` to populate **selectable dropdowns**, which includes deactivated programs. Filter those dropdowns down to non-deactivated entries while keeping the underlying data available for editing existing records.

Pages to fix (dropdown source only — list/edit views stay unchanged):

| File | Change |
|---|---|
| `src/pages/admin/AdminCourseSessionRules.tsx` | `RuleEditor` Course + Trigger Enrollment selects → filter out `lifecycle_status === 'deactivated'`. |
| `src/components/FeeStructureForm.tsx` | Course picker → filter out deactivated. |
| `src/pages/admin/AdminCreateProgram.tsx` | Any course-picker UI → filter out deactivated (uniqueness checks still use full list). |

Pages that intentionally keep deactivated visible (admin management surfaces — no change):
- `AdminEditPrograms.tsx`, `CoursesPage.tsx` — these are the management views where deactivated programs MUST appear so admins can re-activate them.

## Technical notes

- `AlertDialog` import path: `@/components/ui/alert-dialog` (`AlertDialog`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogCancel`, `AlertDialogAction`).
- Filter helper inline: `courses.filter(c => (c.lifecycle_status ?? 'active') !== 'deactivated')`.
- No DB migrations, no edge function changes, no schema changes.
- Preservation Policy respected: nothing removed; deactivated rules remain editable in their own section.

## Out of scope

- Other native `confirm()` calls across the app (sessions, signatures, linked profiles, etc.) — can be migrated later if desired.
- Changing how `is_active` / `lifecycle_status` interact at the DB layer.
