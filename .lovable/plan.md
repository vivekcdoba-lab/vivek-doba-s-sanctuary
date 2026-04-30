## Goal
Make **In-Person** the default location type when opening the "New Session" dialog on the Coach Schedule page.

## Change
In `src/pages/coaching/CoachSchedule.tsx`:

1. **Initial state (line 73)**: change `location_type: 'online'` → `'in_person'`, and `meeting_link: DEFAULT_ZOOM_LINK` → `''` (no Zoom link needed by default).
2. **Reset after save (line 194)**: same two changes so the form resets to In-Person after creating a session.

The Online toggle still works exactly as before — selecting it auto-fills the default Zoom link via the existing `linkMode` logic. No other behavior changes.

## Files
- `src/pages/coaching/CoachSchedule.tsx`
