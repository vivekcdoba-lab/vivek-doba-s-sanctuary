## Goal

Yes — that works well and is simpler. Skip the global registry shortcuts and instead make the **Linked Profile** card on Seeker Overview a self-contained mini-profile of the linked partner. The admin sees everything they need about the linked seeker without leaving the current seeker's 360 page.

## What changes

### `src/pages/admin/SeekerDetailPage.tsx` — Linked Profile card (around line 556)

Replace the current minimal row (avatar emoji + name + email + relationship badge + Unlink) with an enriched inline panel when a partner exists:

- **Header row** (kept): relationship emoji, partner name (link to their 360), email, relationship badge, Unlink button.
- **Add: partner stats row** — fetched lightly for the linked partner:
  - Program / enrollment status
  - Sessions completed (count)
  - Total paid (formatted INR) + last payment date
  - Worksheet streak / last activity date
  - Risk / health indicator (Green/Yellow/Red) if available
- **Add: joint context strip** — small badges showing what is shared by virtue of the link:
  - "Joint payments enabled"
  - "Couple-session pairing active"
  - "Shared group_id: <short>"
- **Remove** the "View all links →" link added in the previous pass — the card is now self-sufficient.

When no partner is linked, keep the existing empty-state copy + "Link Seeker" button (unchanged).

### `src/pages/admin/SeekersPage.tsx`
- Remove the "Manage all linked profiles" toolbar button and its `Link2` import (added in the previous pass). The registry is no longer surfaced from here.

### `src/pages/admin/AdminLinkedProfiles.tsx`
- Remove the "Back to Seekers" header link added in the previous pass. The page remains reachable by direct URL only (audit/troubleshooting).

### Data fetching

For partner stats, reuse existing hooks/queries scoped to `linkedPartner.seeker_id`:
- `useSeekerSessionCount(partnerId)` for sessions
- A small `usePayments` filter or direct supabase query for total paid + last payment
- `useStreakCount(partnerId)` for worksheet streak
- Enrollment lookup via existing pattern used in this page

All reads go through hooks that already respect RLS — no new policies, no new tables.

## What stays the same

- `seeker_links` table, RLS, joint-payment behaviour.
- `useLinkSeekers` / `useUnlinkSeekers` hooks.
- `/admin/linked-profiles` route + `AdminLinkedProfiles.tsx` (preservation policy).
- Sidebar (already cleaned in the previous pass).

## Files to edit

- `src/pages/admin/SeekerDetailPage.tsx` — enrich the Linked Profile card.
- `src/pages/admin/SeekersPage.tsx` — remove the toolbar shortcut.
- `src/pages/admin/AdminLinkedProfiles.tsx` — remove the back-to-Seekers link.

## Out of scope

- No DB migrations.
- No changes to linking logic, joint payments, RLS, or the registry page itself.
