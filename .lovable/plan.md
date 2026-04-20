

## Goal
Add a **Coach picker** to the two session create dialogs so every new session gets `coach_id` populated. This unblocks coach dashboards / per-coach analytics that already rely on `sessions.coach_id`.

## Scope
Touch only the two existing "Schedule Session / New Session" dialogs. No new pages, no schema change (`coach_id` and the coach RLS already exist).

## Files to change

### 1. `src/hooks/useDbSessions.ts`
Add optional `coach_id` to the `useCreateSession` mutation input, and add a new `useCoaches()` query helper that returns everyone with `role='coach' OR is_also_coach=true` (id, full_name, avatar_url).

### 2. `src/pages/admin/SessionsPage.tsx` — admin "Schedule New Session" dialog
- Add `coach_id` to `newSession` state (default `''`)
- Insert a **Coach \*** `<select>` between Seeker and Course populated from `useCoaches()`
- Pass `coach_id` into `createSession.mutate(...)` and require it in the validation guard
- Reset to `''` after success

### 3. `src/pages/coaching/CoachSchedule.tsx` — coach "New Session" dialog
- Add `coach_id` to `newForm` state, **default to the logged-in coach's profile id** (read from `useAuthStore`)
- Show the picker only if the logged-in user is a super admin or dual-role admin (so a pure coach just sees their own name pre-selected and locked); otherwise render a read-only "Coach: <my name>" line
- Pass `coach_id` in `createSession.mutate(...)`

### 4. (No DB migration needed)
`sessions.coach_id` column, index, and RLS policies already exist from migration `20260420144047`.

## UX details
- Picker label: "Coach \*" (English) / "कोच \*" (Hindi) — required
- Empty option text: "Select Coach"
- Show coach `full_name` only (no email) for cleanliness
- If exactly one coach exists in the system, auto-select them
- Validation toast if coach not chosen: "Please select a coach"

## Smoke test after change
1. As **admin** at `/sessions` → Schedule Session → coach picker lists 2 coaches → save → `sessions.coach_id` populated (verify with read query)
2. As **pure coach** at `/coaching/schedule` → New Session → coach field pre-locked to self → save → `sessions.coach_id = self`
3. Log in as that coach → confirm the new session appears in their dashboard via the existing `is_coach()` RLS

## Out of scope
- Editing `coach_id` on existing sessions (no edit dialog touches this field today)
- Backfill of historical NULL coach_ids (none exist; 0 sessions currently)
- Reassignment / transfer-of-coach UI

