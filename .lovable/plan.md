
## Goal
Decide how `dobaarchana@gmail.com` and `vivekcdoba@gmail.com` appear as **both admin and coach**.

## Your proposal vs. the current flag approach

You're suggesting: **drop the email/phone uniqueness constraints and create a second `profiles` row** with `role='coach'` for the same person.

I'd recommend **against** this. Here's why, and what I recommend instead.

### Why duplicate rows is risky

1. **Breaks seeker isolation rule.** Memory `seeker-identity-constraints` and `duplicate-validation-pattern` mandate unique email + mobile. Removing those constraints opens the door to duplicate seeker records too — the exact problem the platform was built to prevent.
2. **Auth has only ONE user per email.** Supabase `auth.users.email` is globally unique and cannot be relaxed. So both profile rows would point to the **same `user_id`**, which means:
   - `profiles.user_id` would no longer uniquely identify a profile.
   - Every existing query (`from('profiles').select().eq('user_id', uid).maybeSingle()`) would randomly return either the admin row or the coach row → unpredictable role, broken RBAC, broken dashboards.
   - Login can't decide "which profile is this session" — there's no signal in the JWT to pick one.
3. **Data fragmentation.** Sessions, assignments, badges, points, enrollments, signatures all FK to `profiles.id`. Two profile rows = data scattered across two IDs for the same human → reports double-count or under-count.
4. **The flag we already shipped works.** `is_also_coach=true` makes them appear in coach lists *and* keeps them as admins — exactly the outcome you want, with zero schema risk.

### What I recommend — keep the flag, polish the UX

Build on what's already in place so they show up correctly **everywhere a coach is expected**, while remaining admins.

## Plan

### 1. Audit every "coach" query and extend it
Search the codebase for all coach filters and update each to include `is_also_coach`:
- `role === 'coach'` → `role === 'coach' || is_also_coach === true`
- `.eq('role', 'coach')` → `.or('role.eq.coach,is_also_coach.eq.true')`
- `.in('role', ['coach'])` → same `or` form

Files likely affected (to be verified during implementation):
- `src/pages/admin/AdminCoaches.tsx` ✅ already done
- `src/pages/admin/Dashboard.tsx` ✅ already done
- `src/pages/admin/AdminUserAnalytics.tsx` ✅ already done
- Coach pickers / session assignment dropdowns in:
  - `src/pages/admin/SessionsPage.tsx`
  - `src/pages/admin/CalendarPage.tsx`
  - `src/pages/admin/CoachDayView.tsx`
  - `src/pages/admin/SeekersPage.tsx` & `SeekerDetailPage.tsx` (assigned coach)
  - `src/components/SendReminderModal.tsx` (if it picks a coach)
  - Any `useDbSessions` / `useSeekerProfiles` queries that filter by role

### 2. Make role display context-aware
- On `/admin/*` pages → show **Admin** badge (their primary identity).
- On `/coaching/*` pages and coach lists → show **Coach** badge.
- On `/admin/search-users` → show **both** badges (already done).

This way the same user appears with the correct hat depending on which surface you're on, without needing duplicate rows.

### 3. Coach sidebar access
Confirm that when these users navigate to `/coaching`, the `CoachingLayout` recognizes them. Today the layout likely checks `role === 'coach' || role === 'admin'`, which already lets admins in — verify and tighten so the **coach sidebar** treats them as a coach, not as an admin viewing coach pages.

### 4. Add a one-line note in the edit dialog
Next to the existing **"Also act as coach"** checkbox, add helper text:
> "This user will appear in coach lists and pickers without losing admin access."

### 5. Keep email/phone unique constraints intact
**Do not remove** them. They protect the seeker isolation rule.

## Out of scope
- No new `profiles` rows for the same user.
- No removal of email/phone unique constraints.
- No `user_roles` table refactor (too invasive per preservation policy).
- No RLS changes.

## Verification
1. `/admin/coaches` lists Archana and Vivek alongside other coaches.
2. Session/assignment coach pickers across admin pages include them.
3. They can navigate to `/coaching/*` and see the coach sidebar/layout.
4. `/admin/search-users` shows both badges.
5. Existing pure admins are unaffected; existing pure coaches are unaffected.
6. No duplicate profile rows; email/phone uniqueness still enforced.
