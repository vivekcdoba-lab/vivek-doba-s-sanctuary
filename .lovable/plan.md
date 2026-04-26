# 🔍 Seed Audit — Chandrakant (`crwanare@gmail.com`) × Coach Vivek

Audit performed against the live DB. **Nothing changed yet** — just findings.

---

## ❌ Critical / Functional gaps (will break UI)

### 1. **Notifications saved to wrong column → bells stay empty**
- I inserted 47 seeker + 40 coach notifications using **`profiles.id`** as `notifications.user_id`.
- The table expects **`auth.users.id`** (the `profiles.user_id` column). NotificationBell queries by `auth.uid()`, so **0 notifications** show in either bell.
- Coach `auth_user_id`: `8abd1692-550a-4f9b-95b1-c434ef395187` — currently has 0 rows.
- **Fix**: re-key all 87 notifications to `profiles.user_id`. Same fix needed for the earlier 33 mirrored notifications from the previous batch.

### 2. **`session_topics` is empty (0 rows)**
- Plan called for tagging every session with a pillar (Dharma/Artha/Kama/Moksha + Vishnu Protocol).
- Coach views that filter by topic will show nothing.
- **Fix**: insert 21 rows into `session_topics` mapping each session to its pillar topic.

### 3. **3 missing daily worksheets** (148 of 151 days)
- Gaps: need to identify which 3 dates are missing in Jan–May.
- Breaks the "151-day streak" badge logic and dashboard heatmap.
- **Fix**: backfill the 3 missing `daily_worksheets` rows.

---

## ⚠️ Data consistency conflicts

### 4. **Sessions during the dip weeks all show `attendance='present'`**
- Mar 9 – Mar 29 has 3 sessions, all marked present.
- But worksheets in the same window: 8 of 19 unsubmitted (matches the dip narrative).
- Engagement story is contradictory: seeker "missed" worksheets but "attended" every session.
- **Fix**: mark 1 of the 3 dip-week sessions `attendance='missed'` (or `late`) and lower its `engagement_score` to 4–5.

### 5. **Assessment cadence under target**
| Assessment | Target (monthly) | Actual | Gap |
|---|---|---|---|
| LGT | 5 | 3 | +2 |
| Wheel of Life | 5 | 3 | +2 |
| MOOCH | 3 | 2 | +1 |
| Happiness | 3 | 2 | +1 |
- Coach feedback exists for the rows that were inserted, but missing assessments mean missing feedback rows too.
- **Fix**: insert the missing instances on monthly cadence + matching `coach_assessment_feedback`.

### 6. **Artha (Business) module — 4 sub-tables empty**
| Table | Rows | Expected |
|---|---|---|
| `cashflow_records` | 0 | weekly Jan–May (~22) |
| `department_health` | 0 | 8 depts × 5 months (40) |
| `team_members` | 0 | 12 leaders |
| `rnd_projects` | 0 | 4 R&D bets |
- These power the Artha dashboard tabs — currently empty cards for the seeker.
- **Fix**: seed all four with realistic CEO data tied to the existing `business_id = 5392623d…`.

### 7. **`clients` and `daily_financial_log` not touched**
- Plan included 8 enterprise clients in funnel and 151 daily revenue/burn entries.
- **Fix**: confirm the column shape, then seed both (or drop from scope if you prefer leaner data).

---

## 🟡 Schema / quality issues

### 8. **One `assignments.category` is NULL**
- Distinct categories: `[Artha, daily_practice, Dharma, Kama, Moksha, NULL]`.
- The NULL group will sit uncategorised in coach review filters.
- **Fix**: backfill the NULL category based on title (or set to `daily_practice`).

### 9. **`client_feedback` table doesn't exist**
- The original plan promised post-session 1–5 ratings via `client_feedback`. The table simply isn't in the schema.
- **Fix options**: (a) drop from scope, (b) create the table via migration, or (c) store ratings in `session_notes.rating_jsonb` if such a field exists.

### 10. **`punishments` / `rewards` etc. on `sessions` never populated**
- The `validate_seeker_session_update` trigger references several rich columns (`major_win`, `client_good_things`, `next_week_assignments`, `pending_assignments_review`, `targets`, `therapy_given`, `stories_used`) — all NULL on our 21 sessions.
- Cosmetic, but the SeekerDetailPage session drawer will show empty sections.
- **Fix**: populate at least `major_win`, `next_week_assignments`, `stories_used` (Ramayana/Mahabharata story IDs) on each session.

### 11. **Assessments can hit the 3-per-day rate limit on backfill**
- The `check_single_assessment_rate_limit` trigger blocks the 4th assessment in one calendar day per seeker per table.
- When we insert the missing LGT/WoL/MOOCH/Happiness rows we must space them across distinct dates (we already do this — flagging for awareness).

---

## ✅ What's healthy
- 21 sessions all linked to coach ✓ (previous fix held)
- 158/181 assignments completed + scored, 23 missed = matches Up→Down→Up narrative ✓
- `coach_seekers` link present ✓
- 18 coach assessment feedback rows ✓
- All session_signatures: 21 coach + 21 seeker = 42 ✓
- Worksheet/check-in date alignment: 0 worksheets without a matching LGT check-in ✓
- `seeker_assessments` Dharma/Kama/Moksha narrative entries: 5 each ✓

---

## 🚦 Proposed fix order (single execution)

1. **Re-key 87 notifications** to `profiles.user_id` (also re-key the earlier 33 from the previous batch)
2. **Insert 21 `session_topics`** (Dharma/Artha/Kama/Moksha + Vishnu Protocol rotation)
3. **Backfill 3 missing daily worksheets**
4. **Mark 1 dip-week session as missed/late** + lower engagement_score
5. **Insert missing assessments** (LGT +2, WoL +2, MOOCH +1, Happiness +1) + `coach_assessment_feedback` for each
6. **Seed Artha sub-tables**: `cashflow_records` (22), `department_health` (40), `team_members` (12), `rnd_projects` (4)
7. **Seed `clients`** (8) + `daily_financial_log` (151) — *or skip if scope is tight*
8. **Backfill NULL `assignments.category`**
9. **Decide on `client_feedback`** — create table OR drop from scope
10. **Populate session narrative columns** (`major_win`, `next_week_assignments`, `stories_used`) on all 21 sessions
11. **Final SELECT report** confirming counts table-by-table

Estimated additional inserts/updates: **~330 rows** across **~12 tables**, all idempotent.

---

**Approve to switch to default mode and apply fixes #1 → #11 in order. Or reply with which numbers to skip.**