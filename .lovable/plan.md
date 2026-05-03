## Goal

Stop showing **Linked Profiles** as its own top-level entry under the `USERS` group. Instead, surface it from inside the **Seekers** section so it sits next to the per-seeker "Linked Profile" card that already exists on Seeker Overview.

Per the project preservation rule, no page or route gets deleted — only the sidebar placement changes.

## What changes

### 1. Admin sidebar (`src/components/AdminLayout.tsx`)
- Remove the `Linked Profiles → /admin/linked-profiles` entry from the `USERS` group.
- It will instead be reachable from the Seekers section (see step 2). Route stays live for direct links / bookmarks.

### 2. Seekers section entry point
The Seekers area today is rooted at `/seekers` (All Seekers list) and `/seekers/:id` (Seeker 360 with the "Linked Profile" card). To embed the registry inside this section:

- Add a small toolbar button **"Manage all linked profiles"** at the top of the **All Seekers** page (`src/pages/admin/SeekersPage.tsx`) that navigates to `/admin/linked-profiles`.
- Add the same shortcut on the Seeker Overview "Linked Profile" card (`SeekerDetailPage.tsx`, around line 556) — a secondary link "View all links →" beside the existing Link/Unlink controls.
- On `/admin/linked-profiles` itself, add a "Back to Seekers" breadcrumb/back link so it visually belongs to the Seekers section.

### 3. Generated docs
- `src/docs/operation/_generated/navigation.md` will be regenerated automatically by the docs script — no manual edit.

## What stays the same

- `/admin/linked-profiles` route, `AdminLinkedProfiles.tsx` page, and all link/unlink hooks (`useSeekerLinks.ts`).
- The per-seeker **Linked Profile** card on Seeker Overview (link/unlink one partner at a time).
- RLS policies, `seeker_links` table, joint-payment behaviour — untouched.

## Files to edit

- `src/components/AdminLayout.tsx` — remove the USERS-group entry.
- `src/pages/admin/SeekersPage.tsx` — add "Manage all linked profiles" button.
- `src/pages/admin/SeekerDetailPage.tsx` — add "View all links →" link inside the Linked Profile card.
- `src/pages/admin/AdminLinkedProfiles.tsx` — add a back-to-Seekers link/breadcrumb at the top.

## Out of scope

- No DB migrations.
- No changes to linking logic, joint payments, or RLS.
- No deletion of the registry page (preservation policy).
