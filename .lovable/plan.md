## Revised Seed Plan — End-to-End Dry Run with Notifications

**Window:** Jan 1, 2026 → May 31, 2026 (151 days, 21 weeks)
**Accounts (existing, no new users):**
- Admin: `vivekcdoba@gmail.com`
- Coach: `coachviveklgt@gmail.com`
- Seeker: `crwanare@gmail.com` (joined Jan 1, 2026)

---

### Part A — Database Seed (single idempotent SQL migration)

All scores follow the requested growth pattern: **Up → Steady → Up → Down → Steady → Up → Up** across the 21 weeks.

| Table | Rows | Notes |
|---|---|---|
| `enrollments` | 1 | LGT PLATINUM™, effective Jan 1, 2026 |
| `program_trainers` | 1 | Coach as `lead` (auto-fires `coach_seekers` link via existing trigger) |
| `sessions` | 21 | Weekly Saturday 10:00–11:00; statuses progress scheduled→completed; pillars rotate Dharma/Artha/Kama/Moksha; coach notes, engagement_score, key_insights, major_win, client_growth_json |
| `session_notifications` | 42 | Uses allowed types only: `session_assigned` (24 h before) + `session_approved` (post-completion) |
| `daily_worksheets` | ~140 | `is_submitted=true`, completion_rate_percent on growth curve, ~10 strategic misses in "down" weeks |
| `daily_lgt_checkins` | 151 | Dharma/Artha/Kama/Moksha 1–10 on growth curve |
| `assignments` | 172 | 151 daily "Sadhana" (recurring) + 21 weekly homework (one_time, scored 1–10) |
| `payments` | 5 | 10th of Jan, Feb, Mar, Apr, May × ₹11,800 (₹10k + 18% GST), status `received` |
| `points_ledger` | ~250 | 10 pts per worksheet, 25 per session attended, 15 per assignment ≥7 |
| `seeker_badges` | 6 | First Worksheet, 7-Day Streak, 30-Day Streak, First Session, 10 Sessions, Wheel Master |
| `streaks` | 1 | current_streak + longest_streak |
| `wheel_of_life_assessments` | 3 | Jan 5 (baseline 5.0) → Mar 1 (mid 6.5) → May 25 (final 9.0) |
| `lgt_assessments` | 3 | Jan 7, Mar 5, May 28 |
| `happiness_assessments` | 2 | Jan + May (before/after delta) |
| `mooch_assessments` | 2 | Jan + May |
| `messages` | ~25 | Coach ↔ seeker spaced across 5 months |
| `client_feedback` | 3 | After sessions 5, 12, 21 with star ratings |
| `notifications` | ~80 | Bell-icon entries (mix read/unread) — see Part B |

**Skipped:** `agreements` table (requires `client_id` from a separate `clients` table not linked to this seeker). User can test agreement generation manually.

---

### Part B — In-App Notifications + Email Delivery with "Testing" Subject

**1. In-app notifications (`notifications` table):**
~80 entries seeded for: enrollment welcome, every session reminder (24 h before), every session summary, payment receipts, badge awards, weekly summary, missed-worksheet alerts to coach. Mix of `is_read=true/false` so the bell shows realistic unread count for both seeker and coach.

**2. Email notifications via existing `send-notification` edge function:**

To physically deliver test emails (so you can verify the full notification pipeline end-to-end), I'll add a small one-off edge function `seed-test-notifications` that:

- Looks up the seeker, coach, and admin email addresses
- Loops through key milestone events (enrollment, monthly payment receipt × 5, badge award × 6, weekly progress summary × 21, session reminder × 21)
- Sends each as a Resend email **with subject prefixed `Testing — `** (e.g. `Testing — Session Reminder: Saturday 10:00 AM`, `Testing — Payment Received ₹11,800 (Feb 2026)`, `Testing — Badge Earned: 30-Day Streak`)
- Throttles to ~1 email/sec to stay within Resend rate limits
- Sends to all three addresses (seeker, coach, admin) so every inbox shows the full notification stream

This function is idempotent and safe to re-invoke. It will be invoked once after the seed migration completes.

**Email templates** reuse the existing branded HTML from `send-notification/index.ts` so styling matches production.

---

### Execution Order
1. Run SQL migration (creates all DB rows, fires existing triggers).
2. Deploy `seed-test-notifications` edge function.
3. Invoke the function once → ~75 emails delivered with "Testing — …" subject.
4. Smoke-test as seeker / coach / admin (dashboards, bell, payments, reports).

### Smoke Test Checklist (post-seed)
- Seeker home → streak, points, 6 badges, ₹50k paid, next session, WoL chart
- Coach dashboard → seeker grid green/yellow/red across 21 weeks; weekly report
- Admin dashboard → revenue chart 5 monthly bars; seeker 360 populated
- Notifications bell → mixed read/unread count for all 3 roles
- Email inboxes (vivekcdoba@, coachviveklgt@, crwanare@) → ~75 "Testing — …" emails covering full lifecycle
- WoL history → 3 assessments showing the up/steady/up/down/steady/up/up curve
- Payments page → 5 invoices

**Approve to execute the migration + deploy the test-notification function + send all emails.**