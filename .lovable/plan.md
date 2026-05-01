# Make Win Journal, Gratitude Wall, Streaks & Batches Actionable

Currently four pages are read-only / passive. Add interaction so users can actually log entries and admins can manage batches.

## 1. `/seeker/win-journal` — Add "Log a Win" button + dialog

**File:** `src/pages/seeker/SeekerWinJournal.tsx`

- Add a primary **"+ Log a Win"** button in the hero bar.
- Clicking opens a dialog with:
  - Win text (textarea, required)
  - Size: Small / Medium / Big (radio)
  - Dimension: Dharma / Artha / Kama / Moksha (radio with emojis)
  - Date (defaults to today)
- On submit: upsert into `daily_worksheets` for that date — write the win into the first empty `todays_win_1/2/3` slot. Tag `dimension` & `size` are saved as a prefix marker in the win text so existing classifier still works (or kept as inferred).
- After save: invalidate `['win-journal']` query and toast success.
- Keep all existing read-only display & filters intact.

## 2. `/seeker/gratitude-wall` — Add "Add Gratitude" button + dialog

**File:** `src/pages/seeker/SeekerGratitudeWall.tsx`

- Add **"+ Add Gratitude"** button in hero.
- Dialog: gratitude text (textarea, required) + emoji picker (12 presets, default 🙏) + date (defaults to today) + optional pillar (Dharma/Artha/Kama/Moksha).
- On submit: upsert today's row in `daily_worksheets` and write into the first empty `gratitude_1..5` slot.
- Invalidate `['gratitude-wall']` and `useStreakCount` queries.

## 3. `/seeker/streaks` — Add primary CTAs

**File:** `src/pages/seeker/SeekerStreaks.tsx`

- Below the hero, always-visible CTA bar with three buttons:
  - **Fill Today's Worksheet** → `/seeker/worksheet`
  - **Add Gratitude** → `/seeker/gratitude-wall`
  - **Log a Win** → `/seeker/win-journal`
- Currently the "Restart your journey" CTA only appears when `currentStreak === 0 && totalDays > 0`. Keep that, but add the always-visible CTAs so the page is never a dead-end.

## 4. Admin → Batch Management — Make CRUD-capable

**File:** `src/pages/admin/AdminBatches.tsx`

The existing `public.batches` table (id, name, course_id, start_date, capacity, status) is fully RLS-writable by admins but the page never uses it. Rebuild the page so it:

1. **Lists real batches** from `public.batches` (with course join), in addition to the existing auto-derived enrollment timeline (kept under a "Auto-grouped from enrollments" section so we don't break the current view).
2. **"+ Add Batch" button** opens a dialog: name, course (select from `useDbCourses`), start date, capacity (int), status (planned / active / completed / cancelled).
3. Each batch card has an **Edit** (pencil) and **Delete** action. Edit reopens the same dialog pre-filled. Delete confirms and removes.
4. Show enrollment count per batch by counting enrollments with matching `course_id` and `start_date` in the same month (current heuristic) — no schema change required for now.

Uses TanStack Query mutations + `supabase.from('batches')`. Toast on success/error. Invalidate `['batches']` query.

## Out of Scope

- No DB schema changes. The `batches.id` ↔ `enrollments` link is left for a future task; we'll keep the month-based enrollment heuristic for showing seeker counts under each batch card.
- No changes to `daily_worksheets` schema — we reuse existing `todays_win_*` and `gratitude_*` columns.
- The console warning from `RuleEditor` (Radix Select needing forwardRef on a wrapper div) is unrelated to these requests; not addressed here.
