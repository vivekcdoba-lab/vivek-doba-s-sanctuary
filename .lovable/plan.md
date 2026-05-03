
# Couple Sessions — Dual Form Tabs

Goal: when a session is marked **Couple**, the create/review forms expose **two tabs** (Seeker 1 — Primary, Seeker 2 — Partner). Each tab captures its own session content. Submitting saves data for both seekers individually and emails each seeker. Individual sessions and the existing approval workflow remain unchanged.

## Approach (data model)

Today, a couple session = **one** `sessions` row + entries in `session_participants`. All notes/insights live on that single row, so per-seeker data isn't possible.

We will create **two linked session rows** for couple bookings — one per seeker — joined by a new `couple_group_id uuid` column on `sessions`. Each row owns its own `session_notes`, `key_insights`, `breakthroughs`, `targets`, etc., and flows through the existing per-session approval pipeline independently.

- Individual sessions: unchanged (1 row, no `couple_group_id`).
- Couple sessions: 2 rows sharing a `couple_group_id`, each `session_type='couple'`, with `seeker_id` set to that seeker (primary/partner). `session_participants` continues to be written for backward compatibility.

```text
booking_type=couple
   ├── sessions row A   seeker_id=Chandrakant   couple_group_id=G   session_role=primary
   └── sessions row B   seeker_id=Sunita        couple_group_id=G   session_role=partner
```

## Changes

### 1. Database migration
- Add columns to `public.sessions`:
  - `couple_group_id uuid null`
  - `couple_role text null` (`'primary' | 'partner'`)
- Index on `couple_group_id`.
- No RLS changes (existing seeker/coach/admin policies already filter by `seeker_id`).

### 2. Create flow — `src/pages/admin/SessionsPage.tsx`
- When `booking_type='couple'`, on submit:
  - Generate `couple_group_id = crypto.randomUUID()`.
  - Insert two `sessions` rows (one per seeker) with the same date/time/coach/course/duration/location, each tagged with `couple_group_id` and the appropriate `couple_role`.
  - Continue to insert `session_participants` for each row.
  - Send calendar invite for each row (existing `send-session-invite` already emails the row's seeker).
- Individual flow unchanged.
- Recurring + couple: each occurrence creates its own pair of linked rows sharing a per-occurrence `couple_group_id`.

### 3. Review flow — `src/pages/admin/SessionReviewPage.tsx`
- On load, if `session.couple_group_id` is set, fetch the **sibling session** (same `couple_group_id`, different `id`).
- Render a `Tabs` component above the content sections:
  - Tab 1: Seeker 1 (Primary) — name from primary row's seeker.
  - Tab 2: Seeker 2 (Partner) — name from partner row's seeker.
- Switching tabs swaps the active session row being edited; all existing section editors, comments, audit log, approve/revision/delete buttons operate on the active row.
- Approve / Request Revision / Certify & Sign apply only to the active tab's row (each seeker has independent status). A small banner shows the partner row's status for context.
- Individual sessions (no `couple_group_id`) render exactly as today — no tabs.

### 4. Coach review pages (if they reach review page via `/sessions/:id`)
Same `SessionReviewPage` is reused, so coach-side gets dual tabs automatically.

### 5. Emails
No new email code: the existing `send-session-invite` and review notifications already key off `session.seeker_id`, so creating two rows automatically yields one email per seeker.

### 6. Types
Regenerate `src/integrations/supabase/types.ts` after migration (auto).

## Out of scope / preserved
- Individual sessions: zero changes.
- Existing `session_participants`, attendance counters, RLS, approval workflow, audit log — all unchanged.
- Historical couple sessions (single-row) keep working in single-form mode (no `couple_group_id` → no tabs).

## Files touched
- `supabase/migrations/<new>.sql` (add columns + index)
- `src/pages/admin/SessionsPage.tsx` (couple submit creates two linked rows)
- `src/pages/admin/SessionReviewPage.tsx` (load sibling, render tabs, scope actions to active row)
- `src/hooks/useDbSessions.ts` (small helper to create a linked pair; optional)
