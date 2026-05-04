## Goal

After a seeker clicks **Save Reflection**, both the **Session Notes** panel and the **Your Post-Session Reflection** section must become permanently read-only for the seeker. Also enforce that all three reflection fields are filled before save (mandatory).

## What changes

### 1. `src/pages/seeker/SeekerSessionDetail.tsx`

**Reflection — make all 3 fields mandatory + lock-on-save**

- Update `handleSubmitReflection`:
  - Require all three fields (each can be text **or** voice note): `What I Learned`, `Where to Apply`, `How to Apply`. If any is empty, show an error toast and abort.
  - Show a confirmation dialog: *"Once saved, you cannot edit Session Notes or your Post-Session Reflection. Continue?"*
  - On success: toast `Reflection saved & locked 🔒 Your coach can now approve this session.`

**Lock the reflection UI as soon as it's been saved (not just after Accept)**

- Compute `reflectionLocked = !!session.seeker_what_learned || !!session.seeker_what_learned_audio || !!session.seeker_accepted_at`.
- Replace `disabled={!!session.seeker_accepted_at}` on every reflection `<textarea>` and `<VoiceNoteRecorder>` (6 spots) with `disabled={reflectionLocked}`.
- Add red asterisks `*` and `(required)` hints to all three field labels.
- Hide the **Save Reflection** button once `reflectionLocked` is true; show a small badge: `🔒 Reflection saved — locked`.
- Keep the **Accept & Proceed to Sign** button visible when `reflectionLocked && !seeker_accepted_at` (so the signing flow still works).

**Lock the Session Notes panel for the seeker after reflection save**

- Pass a new prop to `SessionNotesPanel`: `lockSeekerNotes={reflectionLocked}`.

### 2. `src/components/SessionNotesPanel.tsx`

- Add optional prop `lockSeekerNotes?: boolean` (default `false`).
- When `viewMode === 'seeker' && lockSeekerNotes`:
  - Hide the `+ Add Note` / `Cancel` button in the header.
  - Force `showNewForm = false` (don't render the new-note form).
  - Hide the seeker's **Edit** pencil button on their own notes (line ~297-308). Coach edit/privacy controls stay unaffected.
  - Show a small inline notice at the top: `🔒 Notes locked — your reflection has been submitted.`
- Coach view (`viewMode === 'coach'`) is completely unaffected — coach can still add/edit notes as before.

### 3. Admin approve gate stays as-is

The admin's `approveLocked` (already updated last turn) only requires coach `session_notes` + seeker reflection. Since the new mandatory rule guarantees the seeker reflection exists once saved, the Approve button will unlock immediately on save — no further admin-side change needed.

## Files touched

- `src/pages/seeker/SeekerSessionDetail.tsx` — reflection mandatory, lock-on-save, pass new prop
- `src/components/SessionNotesPanel.tsx` — accept and honor `lockSeekerNotes` prop

## Out of scope

- Coach-side notes panel behaviour
- DB schema / RLS (already prevent seeker from editing once accepted; UI lock is the additional UX guard)
- Existing `Accept & Proceed to Sign` + signature flow — unchanged
