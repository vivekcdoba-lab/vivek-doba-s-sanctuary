

## Goal
Run a **seed → validate → cleanup** smoke test across all four roles, fix the confirmed bugs from prior passes, and harden the platform to a "final version without errors."

## Current state (verified)
| Role | User | Status |
|---|---|---|
| Super admin | `chandrakant.wanare@gmail.com` | ✅ admin, no coach hat |
| Admin | `vivekcdoba@gmail.com` | ✅ admin, no coach hat |
| Admin | `dobaarchana@gmail.com` | ✅ admin, no coach hat |
| Coach | `coachviveklgt@gmail.com` | ✅ pure coach (newly created) |
| Coach | `coacharchanalgt@gmail.com` | ✅ pure coach (newly created) |
| Seeker | `crwanare@gmail.com` | ✅ seeker, 0 sessions/enrollments |

Identity model is now clean — independent emails/phones for each role, no overlap.

## Phase 1 — Fix confirmed bugs (code + schema)

### Bug A — `sessions` has no `coach_id` (HIGH)
Sessions can't be attributed to a specific coach. Blocks per-coach dashboards, RLS for pure coaches, and accurate analytics.

**Migration:**
```sql
ALTER TABLE public.sessions
  ADD COLUMN coach_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;
CREATE INDEX idx_sessions_coach_id ON public.sessions(coach_id);
```

### Bug B — Pure coaches have no RLS to read their seekers' data (HIGH)
Add a SECURITY DEFINER helper + policies so coaches can read their assigned sessions/seekers/assessments.

```sql
CREATE OR REPLACE FUNCTION public.is_coach(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS(SELECT 1 FROM profiles WHERE user_id=_user_id AND (role='coach' OR is_also_coach=true))
$$;

-- sessions: coaches can SELECT/UPDATE their own
CREATE POLICY "Coaches view their sessions" ON sessions FOR SELECT TO authenticated
  USING (coach_id IN (SELECT id FROM profiles WHERE user_id=auth.uid()));
CREATE POLICY "Coaches update their sessions" ON sessions FOR UPDATE TO authenticated
  USING (coach_id IN (SELECT id FROM profiles WHERE user_id=auth.uid()));

-- assessments: coaches read assessments of seekers they coach
-- (apply same pattern to wheel_of_life, lgt, happiness, firo_b, mooch, purusharthas, swot)
```

### Bug C — `AdminCoaches.getAssignedSeekersCount` returns global count (HIGH)
Filter by `coach_id` from the new column; join through sessions to count distinct seekers per coach.

### Bug D — `SeekerLiveSession` filters non-existent status `'confirmed'` (MEDIUM)
`src/pages/seeker/SeekerLiveSession.tsx:45` — drop `'confirmed'`, keep `['scheduled','in_progress']`.

### Bug E — `send-notification` doesn't recognize dual-role admins (LOW)
`supabase/functions/send-notification/index.ts` — accept `role==='coach' OR is_also_coach===true`.

### Bug F — `is_also_coach` not protected by escalation trigger (MEDIUM)
Extend `prevent_admin_level_escalation` to revert unauthorized `is_also_coach` changes when caller isn't super admin.

### Gap G — `enrollments` lacks `notes` field (LOW)
```sql
ALTER TABLE public.enrollments ADD COLUMN notes text;
```

## Phase 2 — Seed → Validate → Cleanup smoke test

**Marker:** `SMOKE_TEST_FINAL_8F42B1C3` on every seeded row.

**Seed (insert tool, one block):**
1. Assign `coachviveklgt@gmail.com` as coach for crwanare
2. 1 enrollment (LGT PLATINUM, status=active, marker in `notes`)
3. Session #1 — past, completed, `coach_id`=coachvivek, `meeting_link`, marker in `session_notes`
4. Session #2 — tomorrow 10:00, scheduled, `coach_id`=coachvivek, `meeting_link`, marker
5. 1 wheel_of_life, 1 lgt, 1 happiness assessment (mid-range scores, marker in `notes`)

**Validate (read-only SQL + targeted browser checks):**
- Seeker `/seeker/live-session` → "Join Meeting" button surfaces session #2
- Seeker `/seeker/session-history` → session #1 visible
- Seeker `/seeker/assessments/*` → history populated for 3 assessments
- Coach `/coaching/today-sessions`, `/coaching/seeker-detail/<id>` → both sessions + assessments visible (proves RLS fix)
- Admin `/admin/coaches` → Coach Vivek shows **assigned seekers = 1** (proves bug C fix)
- Admin `/admin/calendar`, `/admin/seekers/<id>` → both sessions + 360° tabs hydrated
- Super admin `/admin/admins` → Vivek/Archana/Chandrakant listed correctly

**Cleanup (insert tool, DELETE by marker):**
```sql
DELETE FROM wheel_of_life_assessments WHERE notes LIKE '%SMOKE_TEST_FINAL_8F42B1C3%';
DELETE FROM lgt_assessments            WHERE notes LIKE '%SMOKE_TEST_FINAL_8F42B1C3%';
DELETE FROM happiness_assessments      WHERE notes LIKE '%SMOKE_TEST_FINAL_8F42B1C3%';
DELETE FROM sessions                   WHERE session_notes LIKE '%SMOKE_TEST_FINAL_8F42B1C3%';
DELETE FROM enrollments                WHERE notes LIKE '%SMOKE_TEST_FINAL_8F42B1C3%';
```
Re-query to confirm 0 marker rows; crwanare's totals return to 0.

## Phase 3 — Final report
1. **Bugs fixed** — what changed (file + line / migration name)
2. **Smoke test results** — per-role pass/fail with SQL evidence
3. **Cleanup confirmation** — 0 marker rows
4. **Remaining known limitations** — anything punted (with rationale)

## Out of scope
- No new features, no UI redesign
- No changes to other coaches/admins/seekers
- No emails sent (no edge-function invokes during test)
- Existing data untouched
