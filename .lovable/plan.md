
## Goal
Seed minimal test data for `crwanare@gmail.com`, run a data-bound smoke test of seeker/coach/admin flows, then **remove all seeded rows** so the database returns to its current state.

## Test fixture (the only data created)
Coach: `vivekcdoba@gmail.com` (dual-role admin/coach)
Seeker: `crwanare@gmail.com`

| # | Table | Row |
|---|-------|-----|
| 1 | `enrollments` | 1 row — Crwanare → an existing course, status `active`, assigned to Vivek |
| 2 | `sessions` | Session #1 — past, status `completed`, attendance `present`, with `meeting_link`, `session_notes`, `key_insights` |
| 3 | `sessions` | Session #2 — future (tomorrow 10:00–11:00), status `scheduled`, with `meeting_link` |
| 4 | `wheel_of_life_assessments` | 1 row — mid-range scores |
| 5 | `lgt_assessments` | 1 row — mid-range scores |
| 6 | `happiness_assessments` | 1 row — mid-range scores |

All rows tagged with a unique marker `session_notes`/`notes` value `SMOKE_TEST_8F42B1C3` so cleanup is surgical.

## Phases

### Phase 1 — Seed (insert tool)
One SQL block, all inserts wrapped so any failure rolls back. Capture the inserted IDs into a temp note for cleanup.

### Phase 2 — Validate (read-only + visual)
With data present, walk through:
- **Seeker** `/seeker/home`, `/seeker/live-session` (Join Meeting button on future session), `/seeker/session-history` (past session), `/seeker/assessments/wheel-of-life|lgt|happiness` (history tab populated).
- **Coach** `/coaching/today-sessions`, `/coaching/schedule`, `/coaching/seeker-detail/<crwanare-id>` (assessments + sessions visible), `/coach/seeker-assessments`.
- **Admin** `/admin/sessions` (both rows listed, coach = Vivek), `/admin/calendar` (future session on tomorrow's date), `/admin/seekers/<crwanare-id>` (360° tabs hydrated), `/admin/coaches` (Vivek's assigned-seeker count = 1, confirming/refuting the bug flagged last pass).

Use `supabase--read_query` to confirm row counts and `browser--screenshot` for visual proof on 2-3 key pages. No clicks that mutate.

### Phase 3 — Cleanup (insert tool, DELETE)
```sql
DELETE FROM wheel_of_life_assessments WHERE notes::text LIKE '%SMOKE_TEST_8F42B1C3%';
DELETE FROM lgt_assessments            WHERE notes::text LIKE '%SMOKE_TEST_8F42B1C3%';
DELETE FROM happiness_assessments      WHERE notes::text LIKE '%SMOKE_TEST_8F42B1C3%';
DELETE FROM sessions                   WHERE session_notes LIKE '%SMOKE_TEST_8F42B1C3%';
DELETE FROM enrollments                WHERE notes LIKE '%SMOKE_TEST_8F42B1C3%';
```
Then re-query each table to confirm `0` rows match the marker, and confirm Crwanare's totals match pre-seed counts (which are currently zero).

## Deliverable
A single report:
1. **Seed confirmation** — IDs created.
2. **Validation results** — per-surface pass/fail with evidence (query counts + screenshots).
3. **Confirmed bugs** (re-tested with real data) — especially the `getAssignedSeekersCount` defect from the last pass.
4. **Cleanup confirmation** — post-delete row counts = 0 for the marker.

## Guarantees
- No schema changes, no migrations.
- No edge function invocations (no emails sent).
- Every seeded row carries the `SMOKE_TEST_8F42B1C3` marker.
- Cleanup runs in the same session, before the report closes.
- If cleanup fails for any reason, the exact `DELETE` statements are surfaced so you can run them yourself.
