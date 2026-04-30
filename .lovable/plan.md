## Timezone-Aware Scheduling

### Database (additive, non-breaking)
- Add to `sessions` and `calendar_events`:
  - `start_at TIMESTAMPTZ`, `end_at TIMESTAMPTZ`, `timezone TEXT`
- Backfill existing rows treating `date + start_time` as `Asia/Kolkata`.
- `BEFORE INSERT/UPDATE` trigger keeps legacy `date/start_time/end_time` columns coherent with `start_at` (rendered in the row's `timezone`). Old code paths keep working untouched (Preservation Policy).
- Add `timezone TEXT` to `profiles` for per-user reminder preference.

### Reusable components
- `src/lib/timezones.ts` — grouped IANA zones + browser-tz detection + live offset formatter.
- `src/components/common/TimezonePicker.tsx` — grouped `<select>` with live UTC offset, defaults to viewer browser tz.
- `src/components/common/DateTimeTzInput.tsx` — date + start + end + timezone + live preview line ("10:00 in Asia/Kolkata = 05:30 your local time"). Exports `toUtcIso` / `fromUtcIso` helpers using `date-fns-tz`.
- Add dependency: `date-fns-tz` (already installed).

### Wire `CoachSchedule.tsx` first
- Replace plain date/time inputs in **New Session** and **Block Time** dialogs with `<DateTimeTzInput />`.
- Default timezone = scheduler's browser tz (so a coach in Berlin defaults to Europe/Berlin).
- On save, persist `start_at`, `end_at`, `timezone` (the trigger fills legacy fields automatically).

### Update display surfaces to render in viewer's tz
- `UpcomingSessionsWidget`, `SeekerLiveSession`, `CoachActionCenter`, `CoachTodaySessions`, `CalendarPage` (admin + coach grids).
- When `start_at` is present, render via `formatInTimeZone(start_at, viewerTz, ...)`.
- If `session.timezone !== viewerTz`, show small dual-zone hint: `10:00 IST → 05:30 your time`.
- Fallback to legacy `date/start_time` rendering when `start_at` is null (old rows after backfill should all have it).

### Calendar invites
- Update `supabase/functions/send-session-invite` to emit `DTSTART;TZID=<session.timezone>` plus the `VTIMEZONE` block, so Google/Outlook auto-convert per recipient.

### Rollout order in build mode
1. Submit migration (schema + backfill + trigger + profiles.timezone).
2. Create `lib/timezones.ts`, `TimezonePicker`, `DateTimeTzInput`.
3. Wire `CoachSchedule` (new + block dialogs).
4. Update display widgets to viewer tz with dual-zone hint.
5. Update `send-session-invite` to TZID-aware ICS.
6. Roll the same control to remaining schedulers (`BookAppointment`, admin calendar, reschedule flows) in subsequent passes.

### Preservation
- All existing pages, columns, rows preserved.
- Default timezone everywhere = `Asia/Kolkata` so existing Indian users see no behavioural change.
- New flexibility activates only when a scheduler explicitly chooses a different zone.
