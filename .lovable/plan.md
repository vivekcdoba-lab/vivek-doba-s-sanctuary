

## Goal
Three cleanups across the admin surface:
1. Replace the hardcoded "Recent Automation History" mock list with real data.
2. Add visible entry points to the Document Library + Send for Signature flow.
3. Sweep the codebase for remaining hardcoded/test data and replace with live database queries.

---

## Part 1 — Real Automation History
File: `src/pages/admin/AdminAutomations.tsx`
- Remove the four hardcoded entries (Amit Joshi, Priya Nair, Sneha Kulkarni, Anil Bhosle).
- Fetch the latest 20 real events via TanStack Query, unioning:
  - `notifications` (reminders, celebrations, payment nudges, applications)
  - `audit_logs` (system actions like "session marked missed", "reminder sent")
  - `signature_requests` (document sent / signed / expired events)
- Merge by `created_at DESC`, cap at 20. Map type → emoji, render relative time via `formatDistanceToNow`.
- Loading skeleton + empty state ("No automation activity yet").

---

## Part 2 — Surface Document Signature Flow
The flow exists end-to-end but is hard to find from the top level.

**a. Quick-action card on `/admin` Dashboard** (`src/pages/admin/Dashboard.tsx`)
- Add "📄 Documents & Signatures" card → `/admin/documents` with subtitle "Upload templates, send for signature, track status".

**b. Helper banner on `/admin/automations`**
- Above the history list: short note + two buttons — "Document Library" → `/admin/documents`, "Find a Seeker" → `/admin/seekers`.

(The actual "Send for Signature" button stays on the seeker-scoped Documents tab where it already works correctly.)

---

## Part 3 — Remove Hardcoded / Test Data Across the App

Audit-driven sweep. Each file below currently uses mock arrays or sample seeded data; replace with live queries to existing tables.

| File | Current hardcoded data | Replace with |
|---|---|---|
| `src/pages/admin/Dashboard.tsx` | `activityItems` mocked from first 3 seekers with fake "1h/2h/3h ago" + emoji-cycled labels ("New enrollment", "Payment received", "Lead converted") | Real recent events from `notifications` + `payments` + `enrollments` ordered by `created_at` |
| `src/pages/admin/Dashboard.tsx` | `coachData.rating: 0` placeholder | Compute from `session_feedback.rating` averages per coach (or hide column if no feedback yet) |
| `src/components/dashboard/ActivityFeed.tsx` | Items prop sourced from mock above | Same as above (driven by parent fix) |
| `src/pages/seeker/SeekerRelationshipTracker.tsx` | `SAMPLE` array of 4 hardcoded relationships (Archana, Ananya, Papa, Raj) | Wire to existing `seeker_relationships` table if present; otherwise start empty + show empty-state CTA "Add your first relationship". Keep the "Add Relationship" form functional and persist via Supabase. |
| `src/data/storyLibrary.ts` | Already addressed in prior step (emptied) | No action |
| `src/data/mockData.ts` `MOTIVATIONAL_QUOTES` | Used by Dashboard hero | Keep — these are static curated content, not test data. **No change.** |
| `src/components/dashboard/CoachPerformanceChart.tsx` | Receives data from Dashboard | Already live after Dashboard fix |
| `src/pages/admin/AdminAutomations.tsx` (rules section) | If any rules list is hardcoded, leave existing rules toggles intact (preservation) — only history is replaced | History only |
| Any remaining `// mock` / `// sample` / `// TODO: replace` markers in `src/pages/admin/**` and `src/pages/coaching/**` | Audit and either: (a) wire to real DB if a matching table exists, (b) replace with empty state if no source exists yet | Per-file decision |

**Audit method**: grep for `mock`, `SAMPLE`, `placeholder`, `dummy`, `TODO`, `hardcoded`, `1h ago`, `2h ago`, `Amit Joshi`, `Priya Nair`, `Sneha Kulkarni` across `src/pages/**` and `src/components/**`. Each hit gets fixed in this pass or explicitly preserved (curated static content like quotes/affirmations/story templates).

**Preservation guardrails**:
- Curated static content (motivational quotes, affirmations, framework definitions, assessment question banks, dharma stories templates) is **not** test data — left untouched.
- Mock data files used as fallbacks during loading are kept but only rendered when DB returns empty AND we add a clear "Sample data" badge so it's not mistaken for real entries.
- No DB schema changes; if a target table doesn't exist for a given mock (e.g., relationships), switch to a clean empty state instead of inventing tables.

---

## Verification

1. `/admin/automations` shows real notifications/audit/signature events (or clean empty state); banner with "Document Library" + "Find a Seeker" buttons present and working.
2. `/admin` Dashboard:
   - "Recent Activity" widget reflects actual recent enrollments/payments/notifications, not "1h ago / 2h ago" cycled seekers.
   - Coach performance ratings reflect real `session_feedback` averages (or hide rating).
   - New "Documents & Signatures" quick-action card visible and links to `/admin/documents`.
3. `/seeker/relationship-tracker` no longer pre-loads Archana/Ananya/Papa/Raj — empty state until seeker adds their own; added relationships persist.
4. Grep across `src/pages/**` for known test names returns no matches.
5. All existing tabs, widgets, and charts continue to render without errors when their underlying tables are empty.

## Files affected
- Edited: `src/pages/admin/AdminAutomations.tsx`, `src/pages/admin/Dashboard.tsx`, `src/components/dashboard/ActivityFeed.tsx`, `src/pages/seeker/SeekerRelationshipTracker.tsx`
- Edited (per audit findings): any additional admin/coach pages discovered to contain test data during the sweep
- No DB or edge-function changes
- No deletions — all preserved per "Only Add and Enhance" policy

## Out of scope
- Curated static content (quotes, affirmations, framework data) — preserved
- New tables for features without backing storage — handled with empty states
- Visual redesign of any widget — content swap only

