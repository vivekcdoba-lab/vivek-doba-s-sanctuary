

## Final Pre-Launch Audit — Results

### ✅ Everything critical is working

I reverified by querying `pg_trigger` directly (the `<db-triggers>` panel shown in context was stale/empty — the actual database has all triggers attached). Here's what's confirmed live:

**Database state**
| Check | Status |
|---|---|
| Identity model | ✅ 1 super admin, 4 admins, 2 pure coaches, 1 seeker, 0 dual-role, 1 historical empty-phone row |
| Triggers attached | ✅ 50+ triggers on pg_trigger including all critical ones |
| `on_auth_user_created` (auth.users) | ✅ Active |
| `prevent_role_escalation` + `prevent_admin_level_escalation` (profiles) | ✅ Active |
| 6 score validators + 6 rate limiters (assessments) | ✅ Active |
| `validate_seeker_session_update` (sessions) | ✅ Active |
| `updated_at` triggers on profiles/sessions/enrollments + 30+ tables | ✅ Active |
| `handle_new_user` uses `NULLIF(..., '')` for optional fields | ✅ Confirmed |
| `check_profile_duplicate` skips empty-string phone | ✅ Confirmed |
| `is_coach()` helper + RLS for coaches on sessions + 7 assessment tables | ✅ Confirmed |
| `sessions.coach_id` column + index | ✅ Confirmed |
| `admin-create-user` normalizes empty phone → null | ✅ Confirmed |

### 🟡 Gaps found (none are launch blockers)

**Gap 1 — One legacy `phone=''` row exists**
`Vdtssolutions@gmail.com` (super admin) still has `phone=''` from before the NULLIF fix. The unique-index issue is moot (only 1 row), but it's inconsistent. One-line UPDATE will normalize it to NULL.

**Gap 2 — All sessions have `coach_id = NULL`**
0 of 0 sessions have a coach assigned. There's no coach picker in the session create/edit UI yet, so coach dashboards / per-coach analytics will stay empty until that's built. Recommend a follow-up feature, **not** a launch blocker (no real session data exists yet anyway).

**Gap 3 — Linter: 1 storage warning**
The public `avatars` bucket allows listing. This is the standard Lovable default and matches how avatars are loaded across the app. Not a blocker; tightening would require re-fetching every avatar via signed URLs (large refactor, no real risk for public profile photos).

**Non-issue — Linter: "RLS Policy Always True"**
All flagged policies are `SELECT`-only on truly public tables (announcements, courses, batches, badges, topics, app_settings, resources) plus the public submissions form. These are intentional and safe.

### Fix in this pass

One-row data normalization (no schema change, no code change):
```sql
UPDATE public.profiles SET phone = NULL WHERE phone = '';
```

That's it. Everything else is launch-ready.

### Final report after fix
- Confirm 0 rows with `phone=''` remain
- Green-light for launch with two known follow-ups documented:
  1. Add coach picker to session create/edit (when first real sessions are scheduled)
  2. Optionally tighten `avatars` bucket listing policy (low priority)

### Out of scope
- Coach picker UI — separate feature
- Avatars bucket hardening — defer
- New tests / pages / charts

