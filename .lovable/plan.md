## Add "Session Mode" dropdown to New Session

Add an Online / In-Person selector to the **New Session** dialog in `src/pages/coaching/CoachSchedule.tsx`, plus a conditional Meeting Link field when Online is chosen. The value flows through to the existing `location_type` and `meeting_link` columns on `sessions` (already supported by `useCreateSession`), so no DB or hook changes are needed.

### Changes — `src/pages/coaching/CoachSchedule.tsx`

1. **Form state (line 71)** — extend `newForm` with:
   - `location_type: 'online' | 'in_person'` (default `'online'`)
   - `meeting_link: string` (default `''`)

2. **UI (between Course select and `DateTimeTzInput`, ~line 409)** — add a two-button toggle styled to match the existing "Session Type" toggle:
   ```
   🎥 Online    |    📍 In-Person
   ```
   When `online`, show a Meeting Link input (optional, placeholder "https://meet… or Zoom link"). When `in_person`, hide the link field.

3. **Submit (`handleCreateSession`, line 173)** — pass `location_type` and `meeting_link` (only if non-empty) into `createSession.mutate(...)`.

4. **Reset (line 189)** — include `location_type: 'online'`, `meeting_link: ''` in the post-save reset.

### Bilingual labels
Add to the `L` map: `mode` (Mode / मोड), `online` (Online / ऑनलाइन), `inPerson` (In-Person / व्यक्तिगत), `meetingLink` (Meeting Link / मीटिंग लिंक).

### Out of scope (kept as-is)
- "Block Time" dialog — not a session, no mode needed.
- DB schema and `useCreateSession` already accept `location_type` + `meeting_link`; calendar invite (`send-session-invite`) already renders the right "Location" line based on these fields.
- No changes to existing rendering of past/scheduled sessions.
