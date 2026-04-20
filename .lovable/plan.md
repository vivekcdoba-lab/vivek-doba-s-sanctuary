
## Goal
On `/apply-lgt`, when the user submits without choosing a program, make the missing "Select Program *" field obvious and scroll it into view.

## Changes — single file: `src/pages/ApplyLGT.tsx`

1. **Track validation error state**
   - Add `const [programError, setProgramError] = useState(false);`
   - Add `const programRef = useRef<HTMLDivElement>(null);`

2. **On submit, validate program first**
   - In the form submit handler, before the existing submission logic:
     - If `formData.program` is empty/unselected:
       - `setProgramError(true)`
       - Show toast: `"Please select a program to continue"`
       - `programRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })`
       - Focus the SelectTrigger
       - `return` early
   - Reset `programError` to `false` when a program is chosen (in the Select's `onValueChange`).

3. **Visual highlight on the program field**
   - Wrap the existing program `<Select>` block in a `<div ref={programRef} className="scroll-mt-24">`.
   - When `programError` is true:
     - SelectTrigger gets: `border-destructive border-2 ring-2 ring-destructive/30 animate-pulse`
     - Label "Select Program *" gets: `text-destructive font-semibold`
     - Add a helper line below: `<p className="text-sm text-destructive flex items-center gap-1"><AlertCircle className="w-4 h-4" /> Please select a program to continue</p>`
   - The pulse animation runs until the user picks a value (then `programError` flips false and styles return to normal).

4. **Apply the same pattern to other required fields** (consistency, minimal additions)
   - Use one shared `errors` state object `{ program, name, email, phone }` and one `firstErrorRef` that points to whichever required field is empty first (top-down order: name → email → phone → program).
   - On submit: collect missing required fields, set `errors`, scroll to the first missing one, show a single toast `"Please complete the highlighted fields"`, return early.
   - Same red border + label color + helper text treatment for each.

## Out of scope
- No DB or schema changes.
- No change to the actual submission logic, success flow, or thank-you screen.
- No change to other pages (`RegisterWorkshop`, `BookAppointment`) — apply later if requested.

## Verification
1. Open `/apply-lgt`, fill name/email/phone, leave Program empty, click submit → page scrolls to Program field, field pulses red, helper text appears, toast shows.
2. Pick a program → red highlight and helper text disappear immediately.
3. Submit with multiple empty required fields → scrolls to the topmost missing field; all missing fields are highlighted.
4. Submit with everything filled → submits normally, no regressions.
