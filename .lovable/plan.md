## Goal
Replace the single-line truncated Zoom link display with a 3-line wrapped read-only text box, so the full URL is visible without overlapping the Copy button and the dialog naturally aligns.

## Change
In `src/pages/coaching/CoachSchedule.tsx`, inside the "default" `linkMode` branch (around lines 446–456):

- Switch the layout from a horizontal `flex` row (link + Copy button on the same line) to a vertical stack:
  - A read-only `<textarea>` showing `DEFAULT_ZOOM_LINK`, with `rows={3}`, `readOnly`, `wrap="soft"`, full-width, small font, muted background, `break-all` so the URL wraps cleanly across 3 lines.
  - A `Copy` button placed below the textarea, right-aligned, keeping the existing copy-to-clipboard handler and bilingual label (`कॉपी` / `Copy`).
- Remove the `truncate` / `min-w-0` flex hacks that caused the overlap.
- Custom-link branch (URL `<input>`) stays unchanged.

No other logic, state, or translations change. This naturally fixes the alignment in the New Session dialog.

## Files
- `src/pages/coaching/CoachSchedule.tsx` (only the default-link display block)
