## Goal
On both Admin schedule (`/admin/sessions`, used as the admin scheduler) and Coach schedule (`/coaching/schedule`):
1. The "New Session" form must open pre-filled with the **current local date and time** (rounded up to the next 15 minutes), not a hardcoded `10:00`/empty date.
2. Users must NOT be able to schedule a session in the past — neither past dates nor past times on today's date.
3. Edit/Reschedule dialogs follow the same rule (cannot move a session into the past).

Block-Time and Calendar event creation get the same treatment.

## Scope
Files to modify:
- `src/pages/coaching/CoachSchedule.tsx` — newForm, editForm, blockForm defaults + min-date/time guards.
- `src/pages/admin/SessionsPage.tsx` — newSession defaults + min-date/time guards.
- `src/pages/admin/CalendarPage.tsx` — newEvent defaults + min-date/time guards (since it shares the same scheduling concern).
- `src/components/common/DateTimeTzInput.tsx` — add an optional `minDate`/`minTime` prop (or `disablePast` flag) so the composite control can enforce "no past" natively via the native `min` attribute on date/time inputs.

## Behavior

### Defaults when opening the New Session dialog
- `date` = today's local date in `YYYY-MM-DD` (in the selected timezone, defaulting to browser tz).
- `start_time` = current local time rounded **up** to the next 15 min (e.g. 14:07 → 14:15).
- `end_time` = `start_time + 1h`.
- These are recomputed every time the dialog opens (not just on mount), so the time stays "fresh" if the user leaves the page open.

### Past-date / past-time guards
- The native `<input type="date">` gets `min={todayLocalISO}`.
- The native `<input type="time">` gets `min={nowHHMM}` **only when the chosen date equals today**; otherwise no min.
- On submit (`handleCreate`, recurring create, edit save, block-time save), validate: if computed start moment < `Date.now()`, show a toast ("Cannot schedule in the past — please pick a future time.") and abort.
- For recurring series, only the first occurrence is checked (subsequent dates are by definition in the future).

### Edit / Reschedule
- Same min-date/min-time rule applies in the edit dialog and in drag-to-reschedule (`dragSession` handler) — if the drop target lands on a past slot, revert and toast.

### Scheduler "current time" indicator
- The day/week grid already uses `new Date()` for today highlighting — no change needed there.
- In the New Session dialog header subtitle, show a small muted line: `Now: <DD-Mon-YYYY HH:mm> (<tz>)` so the scheduler can see the live current system time. Updated via a 60s interval while dialog is open.

## Technical Details

### Helper (new, in `src/lib/timezones.ts` or a new `src/lib/scheduleTime.ts`)
```ts
// Returns local YYYY-MM-DD in the given IANA tz.
export function todayInTz(tz: string): string;

// Returns HH:MM in the given IANA tz, rounded UP to the next `stepMin` minutes.
export function nowRoundedHHMM(tz: string, stepMin = 15): string;

// Returns true if a (date, HH:MM, tz) combo is strictly in the future.
export function isFutureLocal(date: string, time: string, tz: string): boolean;
```
Implemented with `date-fns-tz` (already a dep — used by `DateTimeTzInput`).

### `DateTimeTzInput` change
Add prop `disablePast?: boolean` (default false). When true:
- `<input type="date">` gets `min={todayInTz(timezone)}`.
- `<input type="time">` gets `min={nowRoundedHHMM(timezone)}` only if `date === todayInTz(timezone)`.
- When the user changes the timezone, recompute the mins.

### Open-dialog hook pattern
Replace one-shot `useState({date:'', start_time:'10:00', ...})` with:
```ts
const openNewSession = () => {
  const tz = defaultTz;
  setNewForm(f => ({
    ...f,
    date: todayInTz(tz),
    start_time: nowRoundedHHMM(tz, 15),
    end_time: addOneHour(nowRoundedHHMM(tz, 15)),
    timezone: tz,
  }));
  setShowNewSession(true);
};
```
Wire this to every "New Session" / "+" / day-cell click that currently sets `showNewSession=true`.

### Submit-time guard
Inside `useCreateSession` / `useCreateRecurringSessions` callers and the local `handleCreateSession` in `SessionsPage.tsx`:
```ts
if (!isFutureLocal(form.date, form.start_time, form.timezone ?? defaultTz)) {
  toast.error('Cannot schedule a session in the past.');
  return;
}
```
Same check inside the edit-save handler and block-time create.

### Admin pages without `DateTimeTzInput`
`SessionsPage.tsx` and `CalendarPage.tsx` use raw `<input type="date">` / `<input type="time">`. Add `min={...}` directly to those inputs using the helpers above.

## Out of scope
- No DB migrations.
- Existing past-dated sessions are NOT modified or hidden — the rule is creation/edit-only.
- Seeker-side scheduling (if any) is unchanged unless surfaced later.
