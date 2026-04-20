
The user wants strict role-based route access enforced:
- **Seeker** → only seeker pages (`/seeker/*`)
- **Coach** → only coach pages (`/coaching/*`)
- **Admin** (regular) → only admin pages (and NOT coach/seeker pages)
- **Super Admin** → universal access to all pages and all accounts

Currently `AuthGuard.tsx` lets ANY admin access everything (including coach + seeker pages). That needs to change so regular admins are restricted to admin routes only — only `super_admin` gets the universal pass.

## Changes

### 1. Update `src/components/AuthGuard.tsx`
Replace the role-matching logic with strict per-role enforcement plus super_admin override:

- Read `profile.admin_level` (already on profile per `adminPermissions.ts`).
- **Super admin** (`role === 'admin' && admin_level === 'super_admin'`) → access to everything (admin, coach, seeker routes).
- **Regular admin** (`role === 'admin' && admin_level !== 'super_admin'`) → access ONLY to `requiredRole === 'admin'` routes. If they hit a coach/seeker route, redirect to `/dashboard` (admin home).
- **Coach** → only `requiredRole === 'coach'`. Else redirect to `/coaching`.
- **Seeker** → only `requiredRole === 'seeker'`. Else redirect to `/seeker/home`.

### 2. Update `src/store/authStore.ts` Profile type
Add `admin_level?: string | null` to the `Profile` interface and include it in the `fetchProfile` select query, so AuthGuard can read it.

The fallback profile (3s timeout case) keeps `admin_level` undefined → treated as regular user (safe default).

### 3. Update reset-password Edge Function plan (carry-over from prior approved plan)
No change to the previously approved `admin-reset-password` plan — its rule "regular admin can reset seeker/coach only; super_admin can reset anyone including admins" already aligns perfectly with this new access model.

## Files to edit
- `src/components/AuthGuard.tsx` — strict role enforcement + super_admin override
- `src/store/authStore.ts` — add `admin_level` to Profile type + select query

## Out of scope
- No DB changes (uses existing `profiles.admin_level` column + `is_super_admin` function)
- No sidebar/menu changes — guards at the route level are sufficient; menus already render per role
- No changes to login routing logic in `LoginPage.tsx` — it already routes by `role`; super_admins still land on `/dashboard` and can navigate elsewhere freely
- Previously approved `admin-reset-password` function + UI work remains as planned
