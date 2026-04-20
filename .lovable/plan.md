

## Goal
Fix the "Schedule New Session" dialog on `/sessions` — at the current viewport (994×734), the dialog is taller than the screen and the Save/Cancel buttons are cut off with no way to scroll.

## Root cause
The `<DialogContent>` has no height cap or internal scroll. On shorter viewports the bottom of the form (including the action buttons) falls below the fold and the dialog itself doesn't scroll.

## Fix
Single-file change: `src/pages/admin/SessionsPage.tsx`

1. Cap the dialog height: add `max-h-[90vh]` and make the outer container a flex column so the header stays pinned.
2. Wrap the form body (everything between `<DialogHeader>` and the action buttons) in a scrollable div: `flex-1 overflow-y-auto pr-1 -mr-1` so the side scrollbar appears inside the dialog when content overflows.
3. Keep the action button row (Cancel / Schedule Session) **outside** the scroll area so it's always visible at the bottom — wrap it in a `shrink-0 border-t pt-3` footer.

No schema, no hook, no logic changes. Purely layout.

## Smoke test
- At 994×734 viewport, open `/sessions` → Schedule Session → the dialog should cap at 90% of viewport height, the form should scroll internally, and the Save button should remain visible pinned at the bottom.
- Repeat on 375×812 (mobile) — same behaviour.

## Out of scope
- The Coach dialog in `CoachSchedule.tsx` — currently shorter and not reported as broken; leave untouched to stay minimal.
- Any style changes beyond the scroll fix.

