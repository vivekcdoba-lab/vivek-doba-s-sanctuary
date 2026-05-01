# Business Rules

The non-negotiable logic that drives the app. Change these and you change the product.

## Life's Golden Triangle (LGT)

- 4 pillars: **Dharma** (purpose), **Artha** (wealth), **Kama** (relationships/desire), **Moksha** (liberation).
- Each scored 1–10 in daily worksheets, LGT check-ins, and the LGT assessment.
- "Overall balance" = average of the four.
- Validation triggers (`validate_lgt_scores`, `validate_purusharthas_scores`) reject anything outside 1–10.

## Sampoorna Points (Gamification)

- **Levels**: 5 tiers tied to total points.
- **Badges**: ~20+ definitions in `badge_definitions` (e.g., 7-day streak, first session, full LGT week).
- **Earning rules** (per `get_leaderboard_data`):
  - Daily worksheet submitted: +10
  - Worksheet at 100% completion: +5 bonus
  - Streak day: +2 per day current streak
  - Badge earned: +15
  - Session attended (`attendance='present'`): +25
- **Leaderboard**: privacy-first — first name + last initial only; opt-in via `leaderboard_visible`.

## Session Attendance Counter

- `attendance` ∈ `present` | `no_show` | `excused` | (auto-set by `auto_set_attendance_on_status`).
- **Excused sessions are FREE** — they do NOT increment the seeker's session count.
- LGT IGS (Initial Goal Setting) counts as **Session #1** (+1).
- Otherwise: present and no_show both consume a slot.

## Transformation Journey Progress

- 6 stages, 180-day journey.
- Progress denominator anchored to **minimum 24 sessions** — `Math.max(sessions.length, 24)`.
- Prevents the bar from racing to 100% with a small course; aligns with the standard Vishnu Protocol cycle.

## Financial Rules

- **Manual payment recording** by admins (no online payment gateway in v1).
- **GST**: 18% calculated automatically on payments where applicable.
- **Joint payments**: a `seeker_links` group can share one `is_joint=true` payment.
- **Currencies**: INR primary; foreign-country seekers can be billed in their local currency on the invoice.

## Seeker Identity Constraints

- **Unique** email AND phone (enforced via `email_hash`, `phone_hash` lookups + `check_profile_duplicate` RPC).
- Strict isolation: assessments, sessions, journals are NEVER shared between seekers — even joint partners.
- Admin-only linking via `seeker_links` exists solely to allow joint payments / family billing visibility.

## Risk Intelligence Score (0–100)

A composite "health" score that drives the Coach Seeker Status grid (Green / Yellow / Red):

- 7-day worksheet submission rate (weight 25)
- 30-day session attendance rate (weight 25)
- Latest LGT balance vs target (weight 20)
- Pending assignments aging (weight 15)
- Days since last coach contact (weight 15)

Coaches see the traffic light; admins see the underlying score breakdown.

## Coaching Day View (Coach)

- Today's sessions, prep checklist, signature pending list, danger-zone seekers.
- Auto-generated 10 minutes before each session via `send-pre-session-prep-reminder`.

## Vishnu Protocol

- 6-month personalized transformation roadmap auto-generated after the LGT IGS.
- Defines weekly themes, expected practices, and mid-program check-points.

## Assessment Frameworks (9)

| Framework | Range | Special rule |
|---|---|---|
| LGT | 1–10 ×4 | Validates via trigger |
| Wheel of Life | 1–10 ×8 | Validates via trigger |
| FIRO-B | 0–9 ×6 | Validates via trigger |
| Happiness (PERMA-H+) | 1–10 ×8 | Validates via trigger |
| MOOCH | 1–10 ×6 | Validates via trigger |
| Purushaarthas | 1–10 ×4 | Validates via trigger |
| Personal SWOT | qualitative | — |
| Coaching Intake | qualitative | Long form |
| Goal Commitment | qualitative | Generates Action Challenges |

- **Rate limit**: max 3 attempts per day per assessment type (`check_single_assessment_rate_limit`).
- **30-Day Balance Challenge** is auto-generated from the lowest pillar after the LGT assessment.

## Communication Defaults

- Daily seeker progress email: opt-in via `daily_progress_email_enabled` on profile.
- Evening gratitude nudge: 8pm local — push + optional email.
- Pre-session prep reminder: 10 min before scheduled start.
- Admin support inbox: every new ticket fans out a notification to all admins via `notify_admins_of_ticket`.
