## Send daily reports only to active seekers

Currently the cron run targets every `seeker` profile that has `daily_progress_email_enabled = true` — including seekers who never enrolled, dropped out, or completed their program. We'll restrict it to **active seekers**.

### Definition of "active seeker"

A seeker is considered active when **all** of these are true:
- `profiles.role = 'seeker'`
- `profiles.daily_progress_email_enabled = true` (opt-in)
- Has at least one row in `enrollments` where:
  - `status` is **not** in `('completed','cancelled','canceled','dropped','refunded','expired')`, AND
  - `end_date IS NULL` OR `end_date >= today`

This matches how the rest of the app reasons about active enrollment (no separate `is_active` flag exists on profiles).

### Changes

**File: `supabase/functions/send-daily-seeker-reports/index.ts`** (the recipient-selection block, lines 248–255 in the non-test branch)

1. Fetch candidate seeker IDs as today (role + opt-in).
2. In a second query, fetch their enrollments (`seeker_id, status, end_date`).
3. Build an `activeSet` of seeker IDs that have at least one non-terminated, non-expired enrollment.
4. Filter `seekerIds` to that set.
5. Test mode (`Send test to me` and `seeker_id` overrides) is left unchanged so admins can always preview.

Result counts (`total / sent / skipped / failed`) returned to the admin panel will now reflect only active seekers, and inactive seekers will simply be excluded from the run rather than logged as skipped (keeping the log clean).

No DB migration, no new secrets, no UI change required.
