## Two bugs on `/admin/sessions`

### Bug 1 — "Schedule Now" does nothing during a live session

**Root cause.** `SessionsPage.tsx` has two return branches:

- Line 300–541: live-session view (rendered when `liveSession` is set)
- Line 544+: list view, which contains the `<Dialog open={showSchedule}>` (line 732)

Clicking the new "📅 Schedule Now" button in the live session sets `showSchedule = true`, but the dialog is only rendered inside the **list-view** branch — so nothing visible happens.

**Fix.** Lift the schedule dialog (and the related "Reminder" dialog if it has the same problem) so it renders in BOTH branches. Cleanest approach: extract the JSX block at lines 732–~870 into a local `<ScheduleDialog />` sub-component (defined OUTSIDE the parent render to comply with our focus-loss rule) and render it in both the live-session return and the list-view return. Same for the `reminder` dialog block (lines 715–730).

After the dialog confirms (existing `createSession` mutation), also reflect the new date/time string back into `postData.nextSessionTime` so it persists into `sessions.next_session_time` when the coach submits.

### Bug 2 — No email after "End & Submit to Seeker"

**Root cause(s).**

1. `notify-session-submitted` edge function exists in the repo but has zero invocations in logs (`supabase--edge_function_logs` returned none). It was created last turn and may not have been deployed — once deployed, calls will start landing.
2. Even if it deploys, the call is wrapped in a silent `try/catch` with no toast and no console error. If the email path fails (suppression, sender domain, RLS), the coach sees "submitted" success but no email lands and there is no diagnostic.
3. The toast text already promises "they have been emailed" — currently misleading.

**Fix.**

1. Deploy `notify-session-submitted` (happens automatically on next save / can be triggered explicitly).
2. In `submitToSeeker`'s `onSuccess`, capture the function response:
   - On `data?.error` or invoke `error`, show `toast.warning('Session submitted — but seeker email could not be sent: <reason>')` and `console.warn`.
   - On success, keep the existing success toast.
3. In the edge function:
   - Add a couple of `console.log` markers (`session_id`, seeker email present?, `sendEmail` result) so future debugging is trivial via `edge_function_logs`.
   - If `seeker.email` is missing, return `{ ok: true, email: { skipped: 'no_email' } }` (already partially handled — make it explicit so the client can warn the coach).
   - Verify the `session_submitted` notification type is allowed by the `notifications` table check constraint; if not, fall back to a permitted type (`system`) so the in-app insert never fails silently.
4. Quick sanity check via `supabase--read_query` after the first real submission to confirm a row in `email_send_log` / queue row in `transactional_emails`.

### Out of scope / preserved
- LGT IGS = Session #1 attendance rule untouched.
- All existing fields / statuses / approval gating untouched.
- The unrelated React `forwardRef` warning surfaced in console for `SessionReviewPage`'s `DialogFooter` is a separate cosmetic warning — not part of this fix.

---

## Technical section

### Files to edit
- `src/pages/admin/SessionsPage.tsx`
  - Extract `<ScheduleDialog />` (and optionally `<ReminderDialog />`) outside the component.
  - Render both in the live-session branch AND the list-view branch.
  - In the "Schedule Now" handler (line 477) and in `createSession.onSuccess`, write a friendly `nextSessionTime` string into `postData` (e.g. `"Thu, 09 May 2026 10:00 IST"`).
  - In `submitToSeeker.onSuccess`, await the invoke and surface failures via toast + console.
- `supabase/functions/notify-session-submitted/index.ts`
  - Add `console.log` checkpoints (gated so prod-strip leaves them — these are server-side logs, not client).
  - Make the in-app `notifications.type` resilient: try `'session_submitted'`, on insert error fall back to `'system'`.
  - Return `{ ok, email, in_app }` so the client can warn precisely.

### No DB migration required
All needed columns (`next_session_time`, audio columns, `seeker_accepted_at`, etc.) already exist.

### Verification
1. Open a session → live view → click "Schedule Now" → dialog should now appear pre-filled (+7 days).
2. End & Submit → check `supabase--edge_function_logs` for `notify-session-submitted` boot + log lines.
3. `select * from email_send_log order by created_at desc limit 5;` → row with `label = 'session_submitted'`.
4. Seeker inbox shows the branded email with the `/seeker/sessions/<id>` CTA.
