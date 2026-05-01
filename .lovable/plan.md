# Reorganize Seekers → Documents (Fee Structure) Form

File: `src/components/FeeStructureForm.tsx`

## Goal

Restructure the Course Selection & Pricing Rules card and the invoice table so the layout flows: course selection → invoice → pricing summary, with GST toggle moved earlier and session duration shown alongside dates.

## Changes

### 1. Split the top "Course Selection & Pricing Rules" card

Keep at the top (above the invoice table), in this exact order:
1. **Primary Course \*** (unchanged)
2. **Include GST?** (Yes/No + Rate %) — moved up so it sits right after Primary Course and before the invoice table's `GST @ 18%` row
3. **Bundled Courses (Free)** — MOVED OUT (see step 3)
4. **Discount (₹)** — MOVED OUT (see step 3)
5. The summary box (Subtotal / Discount / GST / Total Investment / Total sessions / Coaching window) — MOVED OUT (see step 3)

Result: top card only contains the heading, Primary Course, and Include GST? toggle.

### 2. Invoice table stays in the middle (unchanged structure)

The existing `<div className="border-2 border-[#1e3a5f] rounded-lg ...">` table (rows: Fee per session, Number of sessions, Coaching duration, …, GST @ 18%, TOTAL INVESTMENT, …, Invoice) renders as-is.

Because Include GST? was moved above, the toggle now visually precedes the `GST @ 18%` row inside the invoice table — matching the requested order.

### 3. New "Pricing Summary" card BELOW the invoice table

After the invoice table, add a new bordered card that contains, in order:
- **Bundled Courses (Free)** selector (with the saved-value caption)
- **Discount (₹)** + reason input
- The summary box (Subtotal, Discount, GST line, Total Investment, Total sessions incl. bundled, Coaching window)

### 4. Enhance the Coaching window line

Currently shows: `Start → End`.

Update to display three pieces when available:
- **Start date** (`f.startDate`)
- **End date** (`f.endDate`, already auto-computed from start + coachingDuration)
- **Session duration** — derived from `f.coachingDuration` (e.g. "6 months"). Display as: `Start: 01 Jan 2026 · End: 30 Jun 2026 · Duration: 6 months`.

If only start date exists, show start + duration. End date already auto-fills via the existing effect at lines 107–121, so no new computation is needed.

## Technical Details

- Pure JSX reordering inside `FeeStructureForm.tsx`. No schema, no hook, no DB changes.
- The existing `computed` useMemo, `set`, and auto-effects continue to work unchanged because they don't depend on JSX position.
- `Coaching window` row formatting: render three `<span>`s separated by `·`; use `format(parseISO(...), 'dd MMM yyyy')` from `date-fns` (already imported) for nicer date display.
- Session duration text comes from `f.coachingDuration` (free-form string already collected in the invoice table row "Coaching duration").

## Out of Scope

- No new fields added to `FeeStructureFields`.
- No changes to save/load logic, GST math, or bundled-session calculation.
- No changes outside `src/components/FeeStructureForm.tsx`.
