
# Couple Session — Sync Check, UI Safeguards, Automated Tests

Three targeted additions on top of the just-shipped couple-session feature. No existing behavior is removed.

## 1. Recurring couple sync check

**Goal:** guarantee that for a recurring couple booking, every occurrence pair reuses *the same* `couple_group_id` for its two seeker rows, those two rows belong to **distinct** seekers, and each row produces its own calendar invite.

**Implementation (`src/hooks/useDbSessions.ts`):**
- Extract the per-occurrence pair-building logic out of the inline loop in `SessionsPage.tsx` into a pure helper:
  - `buildCouplePairs({ primary_seeker_id, partner_seeker_id, start_date, frequency, count, primary_start_number, partner_start_number }) → CouplePairRow[]`
  - Throws if the two seekers are identical.
  - Generates a fresh `couple_group_id` per occurrence and emits two rows with `couple_role: 'primary' | 'partner'`.
- Add a verifier `verifyCouplePairs(rows)` that returns the list of integrity problems (wrong group size, duplicate seeker in a group, role missing, date mismatch). Empty array = healthy.
- `SessionsPage.tsx` recurring-couple branch refactored to:
  1. Call `buildCouplePairs(...)`.
  2. Run `verifyCouplePairs(...)` — abort with a toast if it returns errors (defensive).
  3. Insert each row via `createSession.mutateAsync(...)`, which already fires its own `send-session-invite` per row → distinct invites for each seeker.

This keeps the existing single-row create flow untouched.

## 2. UI safeguards on the review page

**Goal:** prevent destructive operations on the couple tabs once a seeker's row has been approved/signed-off, and make sure each tab's edits are written only to that tab's `sessions` row.

**Implementation (`src/pages/admin/SessionReviewPage.tsx`):**
- The tab UI already navigates to the sibling row via `navigate(/sessions/:id/review)`, so `saveEdit`, `handleApprove`, `handleRevisionRequest`, comments, and audit log already write to the active row's `id`. Add explicit guards to make this safe:
  - **Locked-tab indicator:** if a sibling tab's `status ∈ {approved, signed_off}`, render its `TabsTrigger` with a 🔒 badge and `aria-disabled`. Clicking it still navigates (read-only is allowed) but the destination row's edit/approve/revision/delete buttons are disabled when its own status is locked (this already happens via the existing `canApprove` / `canRequestRevision` checks; we add the same lock to inline section edits and Delete).
  - **Cross-tab confirmation:** when admin clicks a sibling tab while the current tab has unsaved edits (`editingSection !== null`), show a `confirm()` dialog ("Discard unsaved edits to {seeker}'s notes?"). On cancel, stay on the current tab.
  - **Misroute guard:** in `saveEdit` / `handleApprove` / `handleRevisionRequest` / `handleDelete`, assert `session.id === id` (the URL param) before issuing the Supabase write. If they diverge (e.g. a stale closure during a fast tab switch), abort and show a toast — this guarantees notes/insights cannot leak to the wrong sibling.
  - **Banner:** add a small read-only banner above the form summarising sibling status ("Partner: Sunita — approved ✅") so the admin sees the other seeker's progress without leaving the tab.

## 3. Automated tests

**Goal:** lock in the contract — couple bookings produce two linked rows with two emails, and per-seeker approval is independent.

**New files:**

- `src/hooks/useDbSessions.couple.test.ts` (vitest, pure logic):
  - `buildCouplePairs` returns `2 × count` rows.
  - Each occurrence's two rows share one `couple_group_id`.
  - Different occurrences use *different* `couple_group_id`s.
  - Roles are exactly `{primary, partner}` per group.
  - Throws when both seekers are the same id.
  - `verifyCouplePairs` returns `[]` for valid output and reports each injected defect (duplicate seeker, missing role, mismatched dates, single-row group).

- `src/pages/admin/__tests__/SessionsPage.couple.test.tsx`:
  - Mocks `useDbSessions` hooks (`useCreateSession`) and the supabase client.
  - Renders the schedule dialog, picks two distinct seekers in couple mode, submits.
  - Asserts `createSession.mutateAsync` is called **exactly twice** with matching `couple_group_id`, opposing `couple_role`, and distinct `seeker_id`.
  - Asserts the underlying calendar-invite invocation (`supabase.functions.invoke('send-session-invite', ...)`) is called twice — once per inserted row.

- `src/pages/admin/__tests__/SessionReviewPage.couple.test.tsx`:
  - Mocks supabase to return a primary session row + a sibling partner row sharing `couple_group_id`.
  - Asserts both tabs render with seeker names and status pills.
  - Approving the active tab updates **only** that row (mock asserts `update().eq('id', primary.id)` was called with no call against partner.id).
  - Sibling tab's status remains untouched after approval.

**Test infra:** project already has vitest configured (`vitest.config.ts`, `src/test/setup.ts`); no setup changes needed.

## Files touched

- `src/hooks/useDbSessions.ts` — add `buildCouplePairs` + `verifyCouplePairs` helpers.
- `src/pages/admin/SessionsPage.tsx` — recurring-couple branch uses helpers + verifier.
- `src/pages/admin/SessionReviewPage.tsx` — locked-tab badges, unsaved-edit confirmation, sibling banner, id-mismatch guards in write handlers.
- `src/hooks/useDbSessions.couple.test.ts` — new.
- `src/pages/admin/__tests__/SessionsPage.couple.test.tsx` — new.
- `src/pages/admin/__tests__/SessionReviewPage.couple.test.tsx` — new.

## Out of scope / preserved

- Individual session flow — unchanged.
- Existing approval pipeline, audit log, RLS — unchanged.
- DB schema — no new migration (uses the columns added in the previous step).
