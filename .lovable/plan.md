## Session Workflow Improvements

Six tightly-related changes to the Admin → Coach → Seeker session lifecycle.

### 1. Live Session: Stories + Free Text
File: `src/pages/admin/SessionsPage.tsx` (live session view, lines ~280–470)
- The 16 hard-coded "Stories Used" buttons already exist. Add directly under that block:
  - A free-text field "Custom Story / Reference" that appends a typed story name into `postData.stories` when the coach hits Add (chip-style), so it persists into `sessions.stories_used`.
- "Quick Notes" textarea already provides general free-text during the session — no change needed there.

### 2. "Schedule Next Session" Popup
Same live session view, replace the current plain text "Next Session Time" input (line ~427) with:
- A read-only display + "📅 Schedule Next Session" button that opens the existing `showSchedule` dialog (already used elsewhere in the file).
- Pre-filled with: same seeker, same coach, same course, +7 days, same time slot.
- After the dialog confirms (creates a real session row), write a human-readable string back into `postData.nextSessionTime` so it still appears in the submitted payload and on the seeker's session detail page.
- Also expose the same button on `src/pages/admin/SessionReviewPage.tsx` (post-submission view) so the coach can schedule the next one even after submitting.

### 3. Gated "Approve" Button
Files:
- `src/pages/admin/SessionReviewPage.tsx` (`canApprove`, line ~281)
- `src/pages/admin/SessionsPage.tsx` (`approveSession`, table action line ~582)

New rule — Approve is enabled only when ALL three are true:
1. `seeker_what_learned` is non-empty (the "Save Reflection" requirement — set by the seeker on `SeekerSessionDetail`).
2. `session_notes` (coach notes) is non-empty.
3. `seeker_accepted_at` is set (meaning the seeker clicked "Save Reflection" / accepted).

When disabled, show a tooltip: "Waiting for seeker to complete Session Notes + Post-Session Reflection."

No new DB columns needed — all three fields already exist on `sessions`.

### 4. Auto-Email Seeker on Submission
File: `src/pages/admin/SessionsPage.tsx` → `submitToSeeker()` (line ~183)
- After the `updateSession.mutate({ status: 'submitted', ... })` succeeds, invoke a new edge function `notify-session-submitted` (see Technical section) which:
  - Sends a branded email to the seeker via the existing Lovable Emails queue (same path as `send-notification`).
  - Email body summarises session details (date, name, pillar, key insights, next session) and links to `/seeker/sessions/<id>` with a clear CTA: "Complete your Session Notes + Post-Session Reflection".
- Also create an in-app `notifications` row of type `session_submitted` so it appears in the bell.

### 5. Remove "Schedule Session" From Seeker Side
File: `src/pages/seeker/SeekerUpcomingSessions.tsx` (line ~117)
- Replace the EmptyState `actionLabel="Schedule Session"` / `actionPath` with informational copy only: "Your coach will schedule your next session. You'll be notified by email."
- Audit any other seeker entry points (sidebar, dashboard widgets) for "Schedule Session" CTAs and remove or convert to "Request Session" (which messages the coach instead of creating a session).

### 6. Voice-Note in Post-Session Reflection
File: `src/pages/seeker/SeekerSessionDetail.tsx` (reflection block, lines ~374–423)
- Keep the three existing textareas (typing remains).
- Add a single "🎙️ Record Voice Note" button per textarea (or one combined recorder beneath them) using `MediaRecorder` API:
  - Records mono webm/opus.
  - Uploads to the existing private `documents` bucket under path `session-reflections/<sessionId>/<seekerProfileId>-<field>.webm` (overwrite-on-resave).
  - Stores the resulting storage path in three new nullable columns: `seeker_what_learned_audio`, `seeker_where_to_apply_audio`, `seeker_how_to_apply_audio` on `sessions`.
- Coach side (`SessionReviewPage.tsx`) gets a small audio player when those columns are populated.

### Out-of-Scope / Preserved
- LGT IGS = Session #1 attendance counter rule untouched.
- All existing fields, statuses, certification, signature flow preserved (Preservation Policy).

---

## Technical Section

### DB migration
```sql
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS seeker_what_learned_audio text,
  ADD COLUMN IF NOT EXISTS seeker_where_to_apply_audio text,
  ADD COLUMN IF NOT EXISTS seeker_how_to_apply_audio text;
```
Storage policies on the existing private `documents` bucket already allow seekers to write/read their own paths and admins/assigned coaches to read; verify the path prefix `session-reflections/<sessionId>/...` is covered (add a policy if not).

### New edge function `notify-session-submitted`
- Input: `{ session_id }`, JWT-validated; only callable by the assigned coach or admin (re-uses `is_assigned_coach` / `is_admin`).
- Loads session + seeker profile (full_name, email, preferred_language).
- Enqueues an email via `enqueue_email` (same pattern used by `send-notification` → Lovable Emails queue).
- Inserts a `notifications` row for the seeker.
- Strips `console`/`debugger` per project security stack.

### Approve gating helper (client)
```ts
const canApprove =
  ['submitted','reviewing','completed'].includes(session.status) &&
  !!session.session_notes?.trim() &&
  !!session.seeker_what_learned?.trim() &&
  !!session.seeker_accepted_at;
```

### Voice recorder
- Lightweight component `<VoiceNoteRecorder field="what_learned" sessionId=... onUploaded={path => setAudioPath(path)} />` placed beside each textarea.
- Uses `navigator.mediaDevices.getUserMedia({ audio: true })` + `MediaRecorder`.
- On stop → `supabase.storage.from('documents').upload(path, blob, { upsert: true })` → write returned path into the corresponding new column on Save Reflection.

### Files to edit / create
- Edit `src/pages/admin/SessionsPage.tsx`
- Edit `src/pages/admin/SessionReviewPage.tsx`
- Edit `src/pages/seeker/SeekerSessionDetail.tsx`
- Edit `src/pages/seeker/SeekerUpcomingSessions.tsx`
- Create `src/components/VoiceNoteRecorder.tsx`
- Create `supabase/functions/notify-session-submitted/index.ts`
- New migration for the three audio columns + storage policy verification.
