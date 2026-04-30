## Default Zoom meeting link for Online sessions

Make the New Session dialog auto-fill the meeting link with your standard Zoom URL when Online is chosen, while still letting the coach override it with a different link.

### Changes — `src/pages/coaching/CoachSchedule.tsx`

1. **Add constant** near the top of the file (after imports):
   ```ts
   const DEFAULT_ZOOM_LINK = 'https://us06web.zoom.us/j/86310221885?pwd=LdIaVqMxx7tbavIqggTVegh01kL8HB.1';
   ```

2. **Form state (line 71)** — initialize `meeting_link: DEFAULT_ZOOM_LINK` (instead of `''`). Same for the reset on line 191 and when switching back to `online` mode.

3. **Online/In-Person toggle (lines 416–422)**:
   - When user clicks **Online** → set `meeting_link: DEFAULT_ZOOM_LINK` (only if currently empty, so we don't clobber a custom one they typed earlier).
   - When user clicks **In-Person** → keep existing behavior (clear `meeting_link`).

4. **Meeting Link section (lines 427–435)** — replace the single input with a two-mode UI:
   - Radio/segmented toggle: **Use default Zoom link** | **Use custom link**
   - When "default" is selected: show the default URL as read-only text (with a small "Copy" link) and store `DEFAULT_ZOOM_LINK` in state.
   - When "custom" is selected: show the existing URL input, pre-filled empty, for the coach to paste their own (Google Meet, alternate Zoom, etc.).
   - Track the choice with a small local `linkMode: 'default' | 'custom'` state (does not need to persist to DB — only `meeting_link` is saved).

5. **Bilingual labels** to add to `L`: `useDefaultLink` (Use default Zoom link / डिफ़ॉल्ट ज़ूम लिंक का उपयोग करें), `useCustomLink` (Use custom link / कस्टम लिंक का उपयोग करें), `defaultZoom` (Default Zoom Room / डिफ़ॉल्ट ज़ूम रूम).

### Out of scope
- No DB schema change — `sessions.meeting_link` already stores whatever URL is chosen.
- Edge function `send-session-invite` already uses `meeting_link` for the calendar `LOCATION` and email body, so the default link will flow through automatically.
- "Block Time" dialog unchanged.
- Existing/past sessions unchanged.
