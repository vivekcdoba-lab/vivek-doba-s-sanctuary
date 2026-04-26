## End-to-End Dry Run: 5-Month Seeker Lifecycle Seed

I'll generate **150 days of realistic activity data** for the existing accounts so you can walk every dashboard, report, and notification end-to-end. No new users will be created — all three accounts already exist:

| Role | Email | Profile ID |
|---|---|---|
| Admin | vivekcdoba@gmail.com | `5bce8fee…b56c10` |
| Coach | coachviveklgt@gmail.com | `d1bbd4c2…0c723bdcb1` |
| Seeker | crwanare@gmail.com | `0c0ada4d…77fdb270efa` |

**Window:** Jan 1, 2026 → May 31, 2026 (151 days, ~21 weeks, 5 months)

### 1. Foundation Setup (one-time inserts)
- **Program enrollment**: Enroll seeker into **LGT PLATINUM™** (`0239906e…12788`) effective Jan 1, 2026.
- **Coach assignment**: Insert `program_trainers` (coach as `lead`) → triggers will auto-link `coach_seekers` for Chandrakant.
- **Coaching Agreement** (`agreements` type=`coaching_agreement`): signed Jan 1.
- **Fee Structure** (`agreements` type=`fee_structure`): 5 sessions × ₹10,000 + GST template, stored in `fields_json`.

### 2. Weekly Sessions (21 sessions, every Saturday 10:00–11:00)
- Created in `sessions` table, status progressing: scheduled → completed for past dates.
- `session_number` 1…21, `pillar` rotating across Dharma/Artha/Kama/Moksha.
- For each completed session: `attendance='present'`, coach notes, `engagement_score`, `key_insights`, `major_win`, `client_growth_json` filled with the **growth pattern**.
- Each session emits a `session_notifications` row (reminder + summary) and a generic `notifications` row for both seeker & coach.

### 3. Daily Worksheets (151 rows, one per day)
- `daily_worksheets` table — `worksheet_date` Jan 1…May 31.
- `is_submitted=true`, `completion_rate_percent` follows the **growth curve** below.
- Misses ~10 strategic days in the "down" weeks to make Streak/Risk widgets meaningful.

### 4. Daily Assignments (151 daily + 21 weekly)
- **Daily** (`type='recurring'`): "Daily Sadhana" — 1 row per day, status `completed` for past dates with score 1–10 following growth curve.
- **Weekly** (`type='one_time'`): post-session homework, due 6 days later, scored by coach.

### 5. Daily LGT Check-ins + Streaks
- `daily_lgt_checkins` row per day with Dharma/Artha/Kama/Moksha scores following the **growth pattern**.
- `streaks` table seeded with current_streak, longest_streak based on gaps.

### 6. Monthly Payments (5 invoices × ₹10,000 + 18% GST = ₹11,800 each)
- `payments` table: 10th of Jan, Feb, Mar, Apr, May. Status `received`. Auto invoice numbers.

### 7. Assessments (4 baseline + 4 progress + 1 final)
- `wheel_of_life_assessments`: Jan 5 (baseline), Mar 1 (mid), May 25 (final) — scores follow growth curve.
- `lgt_assessments`: Jan 7, Mar 5, May 28.
- `happiness_assessments`, `mooch_assessments`: Jan + May for before/after delta.

### 8. Gamification
- `points_ledger`: rows for every worksheet (10 pts), session attended (25 pts), assignment scored ≥7 (15 pts).
- `seeker_badges`: award **First Worksheet** (Jan 1), **7-Day Streak** (Jan 8), **30-Day Streak** (Jan 30), **First Session** (Jan 3), **10 Sessions** (Mar 14), **Wheel Master** (May 25).

### 9. Notifications (≈80 entries)
- `notifications` table seeded for: enrollment welcome, every session reminder (24h before), payment receipts, badge awards, weekly summary, missed-worksheet alerts to coach.
- Mix of `is_read=true/false` so the bell shows realistic unread count.

### 10. Communication
- `messages`: ~25 messages between coach ↔ seeker spaced across the 5 months (intros, weekly check-ins, encouragement during "down" weeks).
- `client_feedback`: 3 entries (after sessions 5, 12, 21) with star ratings.

### Growth Pattern Applied (your sequence: up → steady → up → down → steady → up → up)
Mapped across 21 weeks:
| Phase | Weeks | Pattern | Avg WoL Score |
|---|---|---|---|
| 1. Up | W1–W3 | Strong start | 5.0 → 6.5 |
| 2. Steady | W4–W6 | Plateau | 6.5 |
| 3. Up | W7–W9 | Breakthrough | 6.5 → 7.8 |
| 4. Down | W10–W12 | Setback (life event) | 7.8 → 6.2 |
| 5. Steady | W13–W15 | Recovery plateau | 6.2 |
| 6. Up | W16–W18 | Re-engagement | 6.2 → 7.5 |
| 7. Up | W19–W21 | Mastery | 7.5 → 9.0 |

This pattern drives: WoL/LGT scores, worksheet completion %, assignment scores, engagement scores, and the visible growth chart on every report.

### Execution Method
A single SQL script with deterministic `generate_series` loops will insert ~600 rows across ~18 tables. All inserts use the existing profile IDs above so RLS / triggers (auto-link, point awards, etc.) fire naturally. Idempotent — safe to re-run (uses `ON CONFLICT DO NOTHING` where unique constraints exist).

### What You'll Be Able to Test After Approval
1. **Seeker dashboard** → streak card, points, badges, WoL chart, upcoming session, recent worksheets.
2. **Coach dashboard** → seeker status grid (green/yellow/red across the 5 months), today's session list, action center.
3. **Admin dashboard** → revenue (₹50k + GST), enrollment funnel, active seekers, audit logs.
4. **Reports** → Coach Weekly Report (pick any week), seeker progress charts, payment history.
5. **Notifications** → unread bell counts, history.
6. **Documents tab** → generated Coaching Agreement + Fee Structure for Chandrakant.
7. **Growth visualization** → WoL radar deltas (Jan vs May), LGT trend line showing your exact up/steady/up/down/steady/up/up pattern.

### Smoke Test Checklist (post-seed)
- [ ] Login as seeker → home shows correct streak + 5 badges + ₹50k paid + next session
- [ ] Login as coach → Chandrakant appears in My Seekers; weekly report renders for any of 21 weeks
- [ ] Login as admin → revenue chart shows 5 monthly bars; seeker 360 profile populated across all tabs
- [ ] WoL history page → 3 assessments plotted; growth curve matches pattern
- [ ] Payments page → 5 invoices listed
- [ ] Notifications bell → mixed read/unread

**Approve to execute the seed script.**