# Hide Training Program Prices from Non-Admins

## Audit results

Prices currently appear in these places:

**Admin-only (KEEP — already protected by `AuthGuard requiredRole="admin"`)**
- `src/pages/admin/CoursesPage.tsx` — program cards + edit form
- `src/pages/admin/AdminEditPrograms.tsx` — program cards + edit form
- `src/pages/admin/AdminCreateProgram.tsx` — create wizard preview/review
- `src/pages/admin/Dashboard.tsx` — revenue, recent program list
- `src/pages/admin/AdminProgramAnalytics.tsx`, `AdminNewEnrollment.tsx`, `AdminAddLead.tsx`, `AdminRecordPayment.tsx`, `PaymentsPage.tsx`, `SeekerDetailPage.tsx`, `CoachDayView.tsx` — all under admin guard

**Coach pages** — no program-price exposure found. (Personal/financial figures don't appear on coach routes.) ✅ Nothing to change.

**Seeker pages** — `SeekerPayments.tsx` shows the seeker's *own* invoice/payment amounts. This is the seeker's personal financial record, not a program price list, so it stays.

**Public / mixed-audience pages (FIX — these leak program prices to seekers, coaches, and unauthenticated visitors)**

1. `src/pages/Index.tsx` (line 114) — homepage badge "Starting ₹5,000".
2. `src/pages/ApplyLGT.tsx` — public LGT intake form
   - Line 367: header subtitle "Investment: ₹2,50,000 - ₹10,00,000…"
   - Line 402: program tile shows `₹{p.price}`
   - Line 430: course mini-card shows `₹{c.price}`
   - Lines 770, 773, 774: payment-pref step shows full price + EMI breakdown
3. `src/pages/BookAppointment.tsx` (line 255) — course mini-card "duration · format · ₹price"
4. `src/pages/RegisterWorkshop.tsx` — public workshop registration
   - Line 123: "Investment: ₹{price}"
   - Line 161: workshop tile price
   - Line 209: course mini-card price
   - Line 369: consent checkbox text "I understand the investment of ₹…"

## Approach

Since these pages are reached by anyone (no role guard), the simplest, safest fix is to **remove price rendering from the JSX on these public pages entirely**. The price data still flows in form state for admins/internal use, but it's not displayed.

Rationale (vs. role-conditional rendering):
- These four pages are public/unauthenticated entry points — there's usually no `profile` available to gate on.
- A plain `{isAdmin && …}` would just hide the chunk for everyone in practice, so removing the markup is cleaner.
- Admins who need to see prices use the admin Programs/Courses pages, which already show them.

For admin-internal pages where coaches might land: none currently expose program prices, so no extra guards needed.

## Changes

1. **`src/pages/Index.tsx`** — remove the "Starting ₹5,000" badge (line ~114). Replace with a neutral label like "Open for Registration" or drop the badge entirely.

2. **`src/pages/ApplyLGT.tsx`**
   - Line 367: replace investment range subtitle with "⚡ Limited seats. By application only."
   - Line 402: remove `₹{p.price.toLocaleString…}` line from program tile.
   - Line 430: drop `· ₹{c.price…}` from the course mini-card meta (keep duration · format).
   - Lines 770–774: in the payment-preference step, replace amount-bearing labels with: "Selected: **{name}**", "Full Payment — Best Value", "EMI (6 instalments)". Final amount will be confirmed by admin during enrolment.

3. **`src/pages/BookAppointment.tsx`** (line 255) — drop `· ₹{c.price…}` from the meta line.

4. **`src/pages/RegisterWorkshop.tsx`**
   - Line 123: remove the "Investment: ₹…" subtitle.
   - Line 161: remove price from workshop tile.
   - Line 209: drop `· ₹{c.price…}` from course mini-card.
   - Line 369: rephrase consent to "I confirm my registration and commit to attending the full workshop. 🙏 *" (drop the price clause).

## Out of scope (no changes)

- Admin Dashboard, Programs, Edit Programs, Create Program, Payments, Analytics — admin guard already restricts access; these legitimately show pricing.
- Seeker Payments page — shows the seeker's own invoices, not a program catalogue.
- Coach pages — already have no program-price exposure.

## Technical notes

- No DB / RLS changes needed — `courses.price` stays readable; we're only changing client-side rendering.
- `formatINR`, `COURSES`, and price fields remain in form state where used for downstream admin handling.
- Preservation policy respected: no features, pages, components, or tables removed — only price *display* hidden on public pages.
