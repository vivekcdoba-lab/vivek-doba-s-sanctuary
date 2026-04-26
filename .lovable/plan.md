## Goal
Complete the remaining UI polish for the admin-managed seeker linking + joint payments feature. Database, hooks, admin record-payment toggle, and `/admin/linked-profiles` page are already done in the previous step.

## Changes

### 1. Seeker Profile — "Linked With" card (`src/pages/seeker/SeekerProfile.tsx`)
- Use the already-imported `useSeekerLinkGroup(seekerProfileId)` hook.
- Add a read-only card after **Personal Info** showing each linked partner as a row:
  - `{emoji} {Partner Name} — {Relationship Label}` (e.g. `💑 Priya Sharma — Spouse`).
  - Uses `RELATIONSHIP_EMOJIS` and `RELATIONSHIP_LABELS` maps already exported from the hook.
- If no link, render nothing (don't clutter the page).
- Small note: "Managed by admin" so seeker knows they cannot edit it here.

### 2. Seeker Payments — Joint badges + filter (`src/pages/seeker/SeekerPayments.tsx`)
- Pull the seeker's link group via `useSeekerLinkGroup(profile?.id)` to map `joint_group_id` → partner name.
- Add a column / inline badge on each row:
  - **Individual** (neutral muted badge) — default.
  - **Joint** (accent badge, e.g. `🤝 Joint with Priya`) when `is_joint = true`.
- Add filter chips above the table: **All / Individual / Joint**.
- Update the totals stats so "Total Paid" / "Pending" reflect the active filter.
- Pass `is_joint` flag into the InvoiceModal payload so the invoice shows a "Joint Payment" tag.

### 3. Admin Seeker 360 — "Linked Profile" card (`src/pages/admin/SeekerDetailPage.tsx`)
- Add a new card inside the **Overview** tab (or top of Personal Info tab) titled **Linked Profile**.
- If unlinked: a **"Link this seeker"** button that opens a dialog containing:
  - Searchable seeker dropdown (reuse `useSeekerProfiles`, exclude current seeker and any already-linked seekers).
  - Relationship `<Select>`: Spouse / Parent / Child / Sibling / Custom.
  - Custom label `<Input>` shown only when `relationship = custom`.
  - Submit calls `useLinkSeekers().mutate(...)` with `linked_by` = current admin profile id.
- If already linked: show partner name + relationship badge + **View partner** link (`/admin/seekers/{partnerId}`) + **Unlink** button calling `useUnlinkSeekers().mutate(group_id)` with confirm dialog.
- Reuses the existing `useSeekerLinkGroup`, `useLinkSeekers`, `useUnlinkSeekers` hooks — no new hooks.

### 4. Memory updates
- **Update** `mem://features/seeker-identity-constraints` — soften prior "no partner-linking" rule to: *unique email/mobile still required; admin-managed linking now permitted; auth & data remain isolated; only payments cross via the joint flag*.
- **Create** `mem://features/seeker-linking` — document the joint-group model: `seeker_links` table, `is_joint`/`joint_group_id` on `payments`, RLS sharing rule, admin-only management (no peer approval), and that no other data (assessments, sessions, journals, messages) is shared.
- **Update** `mem://index.md` — add the new memory entry; tweak the existing `seeker-identity-constraints` description to reflect the new permission.

## Files
- **Edited:** `src/pages/seeker/SeekerProfile.tsx`, `src/pages/seeker/SeekerPayments.tsx`, `src/pages/admin/SeekerDetailPage.tsx`, `mem://features/seeker-identity-constraints`, `mem://index.md`.
- **New:** `mem://features/seeker-linking`.

## Out of scope (already shipped or deliberately excluded)
- Migration, RLS, hooks, `/admin/linked-profiles` page, joint-payment toggle on `AdminRecordPayment` — done previously.
- No peer approval flow, no shared assessments/sessions/journals/messages — only payments cross the boundary.
