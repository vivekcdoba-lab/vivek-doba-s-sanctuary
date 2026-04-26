## Goal
Allow an **admin** to link two registered seeker profiles into a "joint group" (e.g. husband–wife, mother–daughter, siblings, custom) without requiring approval from either user. Once linked, both profiles show their connection, and payments can be tagged as **Joint** (visible to both) or **Individual** (visible only to one).

> ⚠️ **Memory override note**: The existing rule `mem://features/seeker-identity-constraints` explicitly forbids partner-linking. Per your instruction, I will update that memory to permit **admin-managed linking** while keeping unique email/mobile per seeker. Auth, login, and onboarding remain fully isolated per individual.

---

## 1. Database schema (new migration)

**Table `seeker_links`** — one row per linked group member
| column | type | notes |
|---|---|---|
| `id` | uuid PK | |
| `group_id` | uuid | shared by all members of the same link group |
| `seeker_id` | uuid → profiles.id | |
| `relationship` | text | e.g. `spouse`, `parent`, `child`, `sibling`, `custom` |
| `relationship_label` | text | free-text (used when relationship = `custom`, e.g. "Business Partner") |
| `linked_by` | uuid → profiles.id | admin who created the link |
| `created_at` | timestamptz | |

- Unique constraint `(seeker_id)` — a seeker can belong to only one group at a time (keeps logic simple; admin can unlink + re-link).
- RLS: admins full access; seekers `SELECT` only rows where `seeker_id` belongs to them OR shares their `group_id` (so they can see who they're linked to).

**Alter `payments` table** — add:
- `is_joint` boolean default false
- `joint_group_id` uuid null (FK-style ref to `seeker_links.group_id`)

RLS update on `payments`: a seeker can `SELECT` a payment if `seeker_id = self` **OR** (`is_joint = true AND joint_group_id IN (their group)`).

---

## 2. Admin UI

**a) Seeker 360 Profile** (`src/pages/admin/SeekerDetailPage.tsx`) — add a new **"Linked Profile"** card:
- If unlinked: "Link this seeker" button → opens dialog with searchable seeker dropdown (reuse `useSeekerProfiles`) + relationship select (Spouse / Parent / Child / Sibling / Custom) + custom label input.
- If linked: shows the partner's name, relationship, "View partner" link, and "Unlink" button.

**b) New admin page `/admin/linked-profiles`** (optional but useful) — table of all link groups with unlink action. Add nav entry under Seekers section.

**c) Record Payment** (`src/pages/admin/AdminRecordPayment.tsx`) — add a **"Joint payment"** toggle (only enabled if the selected seeker is linked). When on, payment is tagged with `is_joint=true` and the seeker's `joint_group_id`.

---

## 3. Seeker UI

**a) Seeker Profile** (`src/pages/seeker/SeekerProfile.tsx`) — add a small read-only **"Linked With"** section showing partner name + relationship badge (e.g. "🤝 Spouse — Priya Sharma"). No edit controls (admin-managed).

**b) Seeker Payments** (`src/pages/seeker/SeekerPayments.tsx`) — query now returns own payments + joint payments. Each row shows a clear badge:
- `Individual` (default) — neutral badge
- `Joint` — accent badge with partner's name (e.g. "Joint with Priya")

Filter chips: All / Individual / Joint.

---

## 4. Hook updates

- **New** `src/hooks/useSeekerLink.ts` — fetch current seeker's link group + partner profile.
- **New** `src/hooks/useAdminSeekerLinks.ts` — admin list/create/delete link groups.
- **Update** `src/hooks/usePayments.ts` — include joint payments via the updated RLS-driven query; expose `is_joint` and partner name in the returned shape.

---

## 5. Memory updates
- Update `mem://features/seeker-identity-constraints` to reflect: unique email/mobile still required; admin-managed linking now permitted; no auth/data merge.
- Add new memory `mem://features/seeker-linking` documenting the joint-group model and joint-payment visibility rule.

---

## Out of scope (per your instruction)
- ❌ No peer approval / notification flow.
- ❌ No shared assessments, worksheets, sessions, journals, or messages — only payments cross the boundary.
- ❌ No joint login or merged dashboard.

---

## Files to be created / edited
**New:** migration file, `src/hooks/useSeekerLink.ts`, `src/hooks/useAdminSeekerLinks.ts`, `src/pages/admin/AdminLinkedProfiles.tsx`, memory file.
**Edited:** `src/pages/admin/SeekerDetailPage.tsx`, `src/pages/admin/AdminRecordPayment.tsx`, `src/pages/seeker/SeekerProfile.tsx`, `src/pages/seeker/SeekerPayments.tsx`, `src/hooks/usePayments.ts`, `src/components/AdminLayout.tsx` (nav entry), `mem://features/seeker-identity-constraints`, `mem://index.md`.