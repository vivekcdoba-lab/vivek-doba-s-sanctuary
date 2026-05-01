## Goal

Add a "Recurring meeting" option to the New Session scheduler used in both **Coach Schedule** (`src/pages/coaching/CoachSchedule.tsx`) and **Admin Sessions** (`src/pages/admin/SessionsPage.tsx`). When enabled, the system creates the original session plus a configurable series of follow-up sessions (e.g. weekly for 4 weeks). Existing single-session behavior is preserved (Only Add and Enhance).

## UX

In the New Session dialog, below the Date/Time/Timezone block, add a collapsible "Repeat" section:

1. **Repeat toggle** (default OFF — single session, current behavior).
2. When ON, show:
   - **Frequency**: Daily / Weekly / Bi-weekly / Monthly (default: Weekly)
   - **Repeat count**: number input, 2–24 occurrences (default: 4)
   - **End date** (read-only preview, auto-calculated from frequency × count)
3. Below the form summary line:
   _"This will create 4 sessions: every Monday from 06 May 2026 to 27 May 2026, 10:00–11:00 IST."_
4. Submit button label switches from "Schedule Session" → "Schedule 4 Sessions" when recurring.

Validation:
- Recurring requires all the same mandatory fields as a single session.
- For couple sessions, the same partner is used for every occurrence.
- Skip dates that fall on already-booked slots? → No, just create them all; coach can edit/delete individually later (matches existing edit/delete flow).

## Backend / Data

No schema change required — each occurrence is a separate row in `public.sessions`. To allow grouping/management later, add an optional `recurrence_group_id uuid` column on `public.sessions` (nullable). All occurrences in one series share the same UUID. This is purely additive.

Migration:
```sql
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS recurrence_group_id uuid;
CREATE INDEX IF NOT EXISTS idx_sessions_recurrence_group
  ON public.sessions(recurrence_group_id);
```

## Code Changes

### 1. `src/hooks/useDbSessions.ts`
Add a new mutation `useCreateRecurringSessions` that:
- Accepts the same payload as `useCreateSession` plus `{ frequency: 'daily'|'weekly'|'biweekly'|'monthly'; count: number }`.
- Generates one `recurrence_group_id` (via `crypto.randomUUID()`).
- Builds an array of session payloads by incrementing the date (date-fns `addDays`/`addWeeks`/`addMonths`) while keeping start/end times and timezone identical, recomputing `start_at`/`end_at` (UTC) per occurrence using `toUtcIso`.
- Inserts all sessions in one `.insert([...])` call, then bulk-inserts participants for all `data` rows returned.
- Fires `send-session-invite` for each created session id (non-blocking, in parallel).
- Invalidates `db-sessions` query.

Keep `useCreateSession` unchanged for single-session callers.

### 2. `src/pages/coaching/CoachSchedule.tsx`
- Extend `newForm` state with `repeat: false`, `frequency: 'weekly'`, `repeat_count: 4`.
- Add the Repeat UI block in the dialog.
- In the submit handler: if `repeat` → call `useCreateRecurringSessions`, else current `createSession.mutate`.
- Reset these fields on dialog close/success.
- Toast: `"4 sessions scheduled — invites sent"`.

### 3. `src/pages/admin/SessionsPage.tsx`
Same additions as Coach Schedule, using the same hook.

### 4. `src/components/common/DateTimeTzInput.tsx`
No change required (it already handles single date/time). The Repeat UI lives in the parent dialog so each scheduler stays in control.

## Out of Scope

- Editing the entire series at once ("apply to all future occurrences") — for now coaches edit/delete each occurrence individually, which already works.
- Calendar RRULE export (the `.ics` invite from `send-session-invite` will continue to send one event per session). Can be added later if needed.

## Files Touched

- `supabase/migrations/<new>.sql` — add `recurrence_group_id` column + index
- `src/hooks/useDbSessions.ts` — add `useCreateRecurringSessions`
- `src/pages/coaching/CoachSchedule.tsx` — repeat UI + branch
- `src/pages/admin/SessionsPage.tsx` — repeat UI + branch
