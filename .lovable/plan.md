# Test Data Cleanup — Expanded Window

You confirmed the cleanup window is **1 January 2026 → 31 May 2026** for these three test accounts:

| Role | Email | Profile ID | Profile created |
|---|---|---|---|
| Seeker | crwanare@gmail.com | `0c0ada4d…` | 2026-04-19 |
| Coach | coachviveklgt@gmail.com | `d1bbd4c2…` | 2026-04-20 |
| Admin | vivekcdoba@gmail.com | `5bce8fee…` | 2026-04-19 |

All three profiles themselves are **preserved** (auth + profile stays intact). Only data they generated within the window is removed.

## Audit results — rows that will be deleted

| Table | Rows | Notes |
|---|---:|---|
| `points_ledger` | 499 | Sampoorna point entries for the seeker |
| `assignments` | 181 | Assignments created for the seeker |
| `daily_worksheets` | 151 | Daily Dharmic Worksheets |
| `coach_assessment_feedback` | 25 | Coach feedback rows linked to seeker/coach/admin |
| `sessions` | 21 | Sessions where seeker is participant or coach is owner |
| `seeker_badges` | 17 | Achievements earned by seeker |
| `user_sessions` | 10 | Login session history for all 3 accounts |
| `submissions` | 6 | Intake/registration submissions in the window |
| `payments` | 5 | Test payment rows for seeker |
| `lgt_assessments` | 5 | LGT assessment attempts |
| `wheel_of_life_assessments` | 5 | WoL attempts |
| `purusharthas_assessments` | 5 | Purushartha attempts |
| `firo_b_assessments` | 3 | FIRO-B attempts |
| `mooch_assessments` | 3 | MOOCH attempts |
| `happiness_assessments` | 3 | Happiness attempts |
| `enrollments` | 1 | Seeker enrollment in test program |
| `coach_seekers` | 1 | Coach↔seeker auto-link from enrollment |
| `business_profiles` | 1 | Artha module business profile |
| `notifications` | 0 | None in window |
| `leads` | 0 | None in window |

**Total: ~942 rows**

## Cascading cleanup (also removed)

Deleting parent rows triggers automatic removal of children:
- `sessions` → `session_attendees`, `session_signatures`, `session_notifications`
- Each assessment row → its `assessment_actions` (action plan / 30-day challenges)
- `business_profiles` → linked Artha rows (`accounting_records`, `daily_financial_log`, `cashflow_records`, `team_members`, `department_health`) — explicitly cleaned
- `enrollments` → triggers re-evaluation of the coach↔seeker auto-link

## Items to flag before deletion

1. **`enrollments` (1 row)** — removing this also drops the `coach_seekers` link. Coach loses visibility into this seeker until re-enrolled. ✅ Expected since this is test data.
2. **`payments` (5 rows)** — these are test transactions; financial reports will lose these entries. ✅ Expected.
3. **`points_ledger` (499 rows)** — leaderboard rank for this seeker drops to zero. ✅ Expected.
4. **`seeker_badges` (17 rows)** — badge celebration animations may re-fire if conditions are re-met later. ✅ Acceptable for test cleanup.
5. **`submissions` (6 rows)** — these are test intake form submissions across the window, not just the original 1 from Apr 26–27. Confirm OK.
6. Profile rows for all 3 accounts (`profiles`, `auth.users`) are **NOT touched**. Logins continue to work.
7. `agreements` table has no `seeker_id` column — checked separately and not in scope.

## Execution order (dependency-safe)

```text
1. session_signatures, session_attendees, session_notifications  (where session in scope)
2. assessment_actions (where parent assessment in scope)
3. Artha child tables (where business_profile in scope)
4. seeker_badges, points_ledger, notifications
5. assignments, daily_worksheets
6. lgt/wheel/firo/mooch/happiness/purusharthas assessments
7. coach_assessment_feedback
8. sessions
9. payments, submissions
10. business_profiles
11. coach_seekers, enrollments
12. user_sessions
```

All deletes scoped to `created_at::date BETWEEN '2026-01-01' AND '2026-05-31'` (or equivalent timestamp column for tables without `created_at`, e.g. `seeker_badges.earned_at`, `coach_seekers.assigned_at`, `user_sessions.login_at`).

## Post-cleanup verification

After execution I will re-run the audit query and report final counts to confirm zero remaining rows for these three accounts in the window.

## Identified gaps already fixed in prior turns

From earlier testing rounds, no new gaps were detected during this audit. The previously fixed items remain in place:
- OTP plaintext column dropped (`otp_codes.otp_code`)
- Encryption-only OTP flow in `send-otp` / `verify-otp`
- `session_signatures` SELECT policy for seekers

If you'd like, I can also reset the seeker's onboarding flag so the account starts fresh from the welcome wizard after cleanup. Tell me yes/no when approving.

**Approve to proceed with deletion in the order above.**
