
User wants Level (Super Admin / Admin) and Permissions (granular flags) to be:
1. Settable when creating an admin via `/admin/add-user`
2. Editable on the existing `/admin/admins` page (currently read-only, with hardcoded "Super Admin" for first row and "Full Access" badge)

Currently `profiles.role` is just `'admin' | 'coach' | 'seeker'` — no level/permissions storage exists. Need DB columns + UI + edge function update.

## Plan

### 1. DB migration — add admin level + permissions
Add two nullable columns on `profiles` (only used when role='admin'):
- `admin_level text` — values: `'super_admin' | 'admin'` (default `'admin'`)
- `admin_permissions jsonb` — default `{}`, stores boolean flags

Permission keys (8 modules, on/off):
`manage_users, manage_coaches, manage_seekers, manage_courses, manage_payments, manage_content, view_analytics, manage_settings`

Super Admin implicitly has all permissions (UI shows all-on, disabled).

RLS: Only admins can update these columns. Add a trigger `prevent_admin_level_escalation` — non-super-admin admins cannot set `admin_level='super_admin'` or modify another admin's level/permissions. Only super_admins can promote/demote other admins. Self-demotion of last super_admin blocked.

### 2. Edge function — `admin-create-user/index.ts`
Accept new optional body fields: `admin_level`, `admin_permissions`.
- Only allow these when `role === 'admin'`.
- Verify caller is `super_admin` if `admin_level === 'super_admin'` requested; otherwise force `'admin'`.
- Persist to profiles in the existing UPDATE call.

### 3. `AdminAddUser.tsx` — wizard step 2 additions (when role=admin)
Show a conditional block:
- **Admin Level** select: Admin / Super Admin (Super Admin option disabled if caller isn't super_admin — read caller's level via `useAuthStore` profile + a quick fetch)
- **Permissions** — 8 checkboxes in a 2-col grid, with "Select all" / "Clear all" helpers. Hidden/all-checked-disabled when level=super_admin.
Send to edge function. Review step (3) shows chosen level + permission count.

### 4. `AdminAdmins.tsx` — make rows editable
- Remove the hardcoded `idx === 0 ? 'Super Admin'` heuristic; read real `admin_level` from profile.
- Replace static "Full Access" badge with a count: e.g. "5 of 8" or "All" for super admins.
- Add an **Edit** action (pencil icon) per row → opens a Dialog:
  - Level select (Admin / Super Admin) — disabled unless current user is super_admin
  - 8 permission checkboxes — disabled if level=super_admin (auto all)
  - Save → directly `supabase.from('profiles').update({ admin_level, admin_permissions }).eq('id', admin.id)` (RLS + trigger guard the rest)
  - Toast on success/error; refresh via existing `useAllProfiles` invalidation
- Update the 3 stat cards: Super Admins count = real super_admin count; "Active" stays as-is.

### 5. Type extension
`useSeekerProfiles` / Profile type — add `admin_level?: string | null; admin_permissions?: Record<string, boolean> | null` (or rely on auto-generated supabase types after migration).

### 6. Optional: permission gating helpers (future-proof, non-breaking)
Add `src/lib/adminPermissions.ts` exporting:
- `PERMISSION_KEYS` constant + labels
- `hasPermission(profile, key): boolean` — returns true if super_admin OR flag true
Not wired into route guards yet (keeps preservation policy — additive only). Available for future use.

### Files
- `supabase/migrations/<new>.sql` — add 2 columns + RLS trigger
- `supabase/functions/admin-create-user/index.ts` — accept level/permissions
- `src/pages/admin/AdminAddUser.tsx` — conditional admin block in step 2
- `src/pages/admin/AdminAdmins.tsx` — edit dialog + real data display
- `src/lib/adminPermissions.ts` (new) — keys/labels/helper

Nothing existing removed. Coach/seeker creation flow untouched.
