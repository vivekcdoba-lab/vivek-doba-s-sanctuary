## Plan: #1 Auto-Email Invites (.ics) + #4 Couple Sessions

Preserves all existing behavior — strictly additive (per Preservation Policy).

---

### Part 1 — Auto-Email Invites with Calendar Attachment (.ics)

**Goal:** When a session is created/rescheduled by an admin or coach, automatically email the seeker (and coach) a calendar invite they can add to Google Calendar / Outlook / Apple Calendar with one click.

**1.1 New Edge Function: `send-session-invite`**
- Input: `{ session_id, action: 'created' | 'rescheduled' | 'cancelled' }`
- Loads the session, seeker profile (name, email), coach profile, and course name via service role.
- Builds an RFC 5545 `.ics` file:
  - `UID = session-{session_id}@vivekdoba.com` (stable so calendar updates replace the prior event)
  - `SEQUENCE` increments on reschedule; `METHOD:CANCEL` for cancellations
  - `DTSTART`/`DTEND` in `Asia/Kolkata` TZ
  - `SUMMARY` = "VDTS Session: {course or 'Coaching Session'}"
  - `DESCRIPTION` includes meeting link + coach name
  - `ORGANIZER` = info@vivekdoba.com, `ATTENDEE` = seeker email (+ coach if present)
- Sends via **direct Resend API** (matches the recently-fixed signature email pattern), with the `.ics` as an attachment (base64) AND a plain "Add to Calendar" HTML body.
- Returns `{ email_sent, email_error }`.

**1.2 Auto-trigger on create/reschedule**
- Update `useCreateSession` (in `src/hooks/useDbSessions.ts`) to call `send-session-invite` with `action: 'created'` after successful insert (fire-and-forget, surface toast on failure but do NOT block save).
- Update `useUpdateSession` to detect `date`/`start_time`/`end_time`/`status` changes and trigger `'rescheduled'` or `'cancelled'`.

**1.3 Manual "Resend Invite" button**
- Add a small icon button on session rows in `SessionsPage.tsx` and `CoachSchedule.tsx` to re-trigger the invite on demand.

**1.4 Audit log**
- Insert one row into existing `notifications` table per send (type `session_invite`) so admins can see delivery status.

---

### Part 2 — Couple Sessions (#4)

**Goal:** Allow scheduling a single session attended by **two seekers** (e.g., spouses doing relationship coaching together) without breaking the strict seeker-isolation policy.

**Important policy note:** Memory `seeker-identity-constraints` says no partner-linking. Couple sessions are a *session-level* exception only — the two seekers remain separate accounts; only the session record references both. We will document this exception.

**2.1 Schema migration (additive only)**
```sql
-- New table for multi-participant sessions (also reusable for group)
CREATE TABLE public.session_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  seeker_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'participant', -- 'primary' | 'partner' | 'participant'
  attendance text,                          -- mirrors sessions.attendance per person
  added_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, seeker_id)
);

ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS session_type text
    CHECK (session_type IN ('individual','couple','group')) DEFAULT 'individual';
```
- Backfill: existing sessions remain `individual`; their `seeker_id` is also inserted into `session_participants` as `primary` (so a single read path works going forward).
- Existing `sessions.seeker_id` stays as the **primary** seeker — nothing existing breaks.

**2.2 RLS policies (new table)**
- Admin/coach: full access via `is_admin` / `is_coach`.
- Seeker: `SELECT` only rows where `seeker_id = (their profile id)`. They see only their own participation row, never the partner's identity unless they're the primary.
- A seeker viewing `/seeker/upcoming-sessions` will see couple sessions where they're listed (either via `seeker_id` or `session_participants`).

**2.3 UI — Schedule dialog**
In `CoachSchedule.tsx` and `SessionsPage.tsx` "New Session" dialog:
- Add a **Session Type** selector: `Individual` (default) / `Couple`.
- When "Couple" is chosen, show a second seeker dropdown labeled "Partner Seeker".
- On save: insert the session with `session_type='couple'` and `seeker_id = primary`, then insert two rows in `session_participants` (primary + partner).

**2.4 Display**
- Session list rows show a small "Couple" badge and both seeker names.
- `SeekerSessionDetail` shows the partner's first name only (e.g., "Joint session with Priya") to respect privacy.
- The auto-email invite (Part 1) sends to **both** seekers' emails as ATTENDEEs.

**2.5 Hook updates**
- Extend `useCreateSession` to accept optional `partner_seeker_id` and `session_type`; when present, perform both inserts in a transaction-style sequence (and roll back the session insert if the participants insert fails).
- New helper `useSessionParticipants(sessionId)` for reads.

---

### Files to be created/modified

**New**
- `supabase/functions/send-session-invite/index.ts`
- `supabase/migrations/<timestamp>_session_participants_and_type.sql`
- `src/hooks/useSessionParticipants.ts`

**Modified**
- `src/hooks/useDbSessions.ts` (auto-invoke invite, accept partner)
- `src/pages/coaching/CoachSchedule.tsx` (Couple option + Resend invite button)
- `src/pages/admin/SessionsPage.tsx` (same)
- `src/pages/seeker/SeekerUpcomingSessions.tsx` & `SeekerSessionDetail.tsx` (show couple badge / partner first-name)
- `src/components/SendReminderModal.tsx` — leave intact (still used for manual nudges)

### Out of scope (explicitly NOT touched)
- WhatsApp auto-notifications (#2)
- Group/LGT multi-seeker sessions UI (schema supports it via the same `session_participants` table, but no UI in this pass) (#3)
- Google Calendar OAuth sync (#5) — `.ics` covers add-to-calendar without per-user OAuth
- Self-booking by seekers (#6)

### Risks / mitigations
- **Email deliverability:** uses verified `info@vivekdoba.com` sender already in use for signatures.
- **Duplicate invites on rapid edits:** stable `UID` + incremented `SEQUENCE` means calendar clients update in place rather than create duplicates.
- **Couple privacy:** partner identity never exposed to the other seeker beyond first name; full RLS prevents cross-account data reads.
- **Backward compatibility:** all new columns nullable / defaulted; existing single-seeker code paths unchanged.
