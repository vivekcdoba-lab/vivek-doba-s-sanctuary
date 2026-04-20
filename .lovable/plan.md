

## Goal
Allow `dobaarchana@gmail.com` and `vivekcdoba@gmail.com` to function as **both admin and coach** simultaneously.

## Current state
- `profiles.role` is a single text field (`'seeker' | 'coach' | 'admin'`).
- Both target users currently have `role='admin'`.
- Coach pages (`/admin/coaches`, coach assignment lists, session ownership lookups) filter by `role='coach'` — so admins are invisible to those flows.
- A `user_roles` pattern (per security guidelines) doesn't exist yet in this project.

A user cannot hold two roles with the current schema. We need a small additive change.

## Approach — minimal, additive (preserves all existing logic)

### 1. DB migration — add `is_also_coach` flag on profiles
Add a boolean column to mark admins who should also appear/act as coaches:
```sql
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_also_coach boolean NOT NULL DEFAULT false;
```
Then set it for the two users:
```sql
UPDATE public.profiles
SET is_also_coach = true
WHERE email IN ('dobaarchana@gmail.com','vivekcdoba@gmail.com');
```

Why a flag (not a `user_roles` table): the entire codebase reads `profile.role` directly in dozens of places. Migrating to `user_roles` is a large refactor and violates the "Only Add and Enhance" preservation policy. A flag is additive, safe, and zero-breaking.

### 2. Coach listings — include admins-also-coach
Update queries that surface coaches to include either `role='coach'` OR `is_also_coach=true`.

Files to update:
- `src/pages/admin/AdminCoaches.tsx` — change `allProfiles.filter(p => p.role === 'coach')` to include `p.is_also_coach === true`.
- Any coach picker/dropdown (search for `.role === 'coach'` and `role.eq.coach` across `src/`) — extend the same way.

### 3. Coach UI access for these admins
Admins already have full access to all routes (RBAC allows admin everywhere), so `/coaching/*` pages are already reachable. No route guard changes needed — they just weren't being *listed* as coaches.

### 4. Search Users page — show the dual badge
In `src/pages/admin/AdminSearchUsers.tsx`, when `is_also_coach` is true on an admin row, render an additional `Coach` badge next to the existing `admin` badge so the dual role is visible.

### 5. Edit dialog toggle
In the same edit dialog, add a checkbox **"Also act as coach"** (visible only when `role='admin'`) bound to `is_also_coach`. Save it alongside the existing update payload.

### 6. Type regeneration
`src/integrations/supabase/types.ts` regenerates automatically after the migration — no manual edit.

## Out of scope
- No move to a `user_roles` table (too invasive; revisit later if multi-role becomes common).
- No changes to RLS policies (admins already have full access; the flag is read-only metadata).
- No changes to email/auth flows.
- No changes to seeker-facing logic.

## Verification
1. Migration runs; `select role, is_also_coach from profiles where email in (...)` returns `admin / true` for both.
2. `/admin/coaches` lists Archana and Vivek alongside other coaches.
3. `/admin/search-users` shows both with **Admin + Coach** badges.
4. Edit dialog toggle flips the flag and persists.
5. Coach pickers (e.g. session assignment) include them in selection lists.
6. Existing pure admins (without the flag) still appear only as admins — no regression.

