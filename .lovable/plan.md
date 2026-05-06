# Per-Seeker Module Access Control

Give admin granular control over which seeker pages each individual seeker can see and access. By default, **everything is disabled** for new seekers — admin must explicitly enable modules.

## What gets built

### 1. Database — `seeker_module_access` table

```sql
create table public.seeker_module_access (
  id uuid primary key default gen_random_uuid(),
  seeker_id uuid not null references profiles(id) on delete cascade,
  module_key text not null,         -- canonical key matching MODULE_REGISTRY
  is_enabled boolean not null default false,
  updated_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (seeker_id, module_key)
);
```

**RLS**
- Admin: full read/write (`is_admin(auth.uid())`).
- Coach: read-only on assigned seekers (`is_assigned_coach(...)`).
- Seeker: read-only on own row (`profiles.user_id = auth.uid()`).
- Default model: **absence of a row = disabled**. So no seeker access until admin saves at least one enabled row.

Seed-on-demand: nothing pre-inserted. UI treats missing rows as `false`.

### 2. Module Registry (single source of truth)

New file `src/config/seekerModules.ts` mirroring the groups/items already in `src/components/SeekerLayout.tsx`. Each item gets a stable `key` (e.g. `daily.worksheet`, `assess.wol`, `artha.cashflow`, `moksha.meditation_timer`) plus its `label`, `path`, `group`, and `section` (MY JOURNEY / PURUSHAARTH / RESOURCES / etc.).

Covers every item in the spec doc (Daily Practice, Assessments, Dharma, Artha, Kama, Moksha) and the existing extra groups already in the sidebar (Sessions, Assignments, Learning, Ambient Sounds, Messages, Achievements, Settings) so admin can also gate those. Settings/Profile, Help & Support, Notifications, and Dashboard/Home are marked `alwaysOn: true` (not gated, never hidden) so a seeker always has at least the home + profile.

### 3. New "Access" tab on Admin Seeker Detail page

`src/pages/admin/SeekerDetailPage.tsx` — extend `ALL_TABS` to insert `'Access 🔐'` right after `'Personal Info'`.

Tab UI (`src/components/admin/SeekerAccessTab.tsx`, new):
- Section headers (MY JOURNEY, PURUSHAARTH, RESOURCES, SETTINGS).
- Each group (Daily Practice, Assessments, Dharma, Artha, Kama, Moksha, Sessions, Assignments, Learning, Ambient Sounds, Messages, Achievements) collapsible.
- Per-item checkbox + per-group "toggle all" + global "Enable all / Disable all / Expand all / Collapse all".
- "Save" button: bulk upsert into `seeker_module_access` (one row per non-always-on module). Shows toast on success.
- Item count badge per group: `enabled / total`.
- Always-on items shown as locked rows with a small "Always available" badge.

### 4. Hook + helper

`src/hooks/useSeekerModuleAccess.ts`
- `useSeekerModuleAccess(seekerId)` → `{ accessMap: Record<string, boolean>, isLoading }`.
- `useUpdateSeekerModuleAccess()` mutation → bulk upsert.
- `useMyModuleAccess()` → for the logged-in seeker, joins to their `profiles.id`. Cached via TanStack Query, key includes seeker id, invalidated on update.

`src/lib/canAccessModule.ts`
- `canAccessModule(moduleKey, accessMap)` → `true` if `alwaysOn` OR `accessMap[key] === true`.

### 5. Sidebar gating — `src/components/SeekerLayout.tsx`

- Import `useMyModuleAccess` and the registry.
- Each nav item is annotated with its `moduleKey` (extend `NavItem`).
- Filter: if `!canAccessModule(item.moduleKey, accessMap)`, skip it.
- If a group ends up with zero visible items, skip the group header too.
- While loading: render only always-on items (Dashboard, Profile, Help) so the seeker isn't briefly shown the full menu.

### 6. Route-level guard

New `src/components/ModuleGuard.tsx`:
- Reads `useMyModuleAccess`, looks up the `moduleKey` for the current path.
- If disabled: render a `<ModuleDisabled />` placeholder ("This feature isn't enabled for your account yet. Please contact your coach.") instead of the page. No redirect (avoids loops).
- Always-on routes bypass.

In `src/App.tsx`, wrap each gated seeker route element with `<ModuleGuard moduleKey="...">`. Routes are listed in the registry so we can map path→key. Always-on routes (`/seeker/home`, `/seeker/profile`, `/seeker/help`, `/seeker/notifications`, `/seeker/privacy-settings`) are not wrapped.

### 7. Backend enforcement

RLS already isolates seeker data by `seeker_id = profiles.id where user_id = auth.uid()`. Module access controls **UI visibility**, not table-level data — there are no per-module tables to lock down beyond what RLS already does. The `ModuleGuard` blocks direct URL navigation, and the sidebar hides hidden items. This matches the spec's "frontend hides + backend RLS already protects data" model.

(If a future module exposes shared/global data that needs per-seeker gating at the row level, add a policy that joins to `seeker_module_access`. Out of scope for this pass.)

## Out of scope (future-ready, not built now)

- Permission templates / copy-from-another-seeker
- Bulk assignment across multiple seekers
- Expiry-based / scheduled rollouts
- Audit log table
- Coach-level editing (read-only for now)

## Files touched

- **New**: `supabase/migrations/<ts>_seeker_module_access.sql`, `src/config/seekerModules.ts`, `src/hooks/useSeekerModuleAccess.ts`, `src/lib/canAccessModule.ts`, `src/components/admin/SeekerAccessTab.tsx`, `src/components/ModuleGuard.tsx`
- **Edited**: `src/pages/admin/SeekerDetailPage.tsx` (insert Access tab + render), `src/components/SeekerLayout.tsx` (filter nav by access), `src/App.tsx` (wrap gated seeker routes in `ModuleGuard`)

## Default behavior summary

- New seeker → no rows in `seeker_module_access` → only always-on items visible (Home, Profile, Help, Notifications, Privacy).
- Admin opens Access tab → sees full hierarchy with everything unchecked → ticks the modules to enable → Save → seeker's sidebar + routes update on next load (and live via query invalidation if seeker is logged in).
