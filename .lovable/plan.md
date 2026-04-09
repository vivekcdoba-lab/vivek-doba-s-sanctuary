

## Plan: Session History Cleanup + Daily Report Email

### Overview
1. Auto-delete session history older than 30 days using a scheduled cron job
2. Create an edge function that generates a daily active users report and emails it to vivekcdoba@gmail.com via Resend

---

### Step 1: Database — Add cleanup function

Create a SQL function `cleanup_old_sessions()` that deletes rows from `user_sessions` where `login_at < now() - interval '30 days'` and `status = 'closed'`.

Also create a function `get_daily_session_report()` that returns summary stats (total sessions today, unique users, avg duration, top users by session count) for the cron email.

---

### Step 2: Edge Function — `daily-session-report`

New edge function that:
1. Calls `cleanup_old_sessions()` to purge old data
2. Queries yesterday's session data (user count, session count, avg duration, top users, login/logout breakdown)
3. Builds an HTML email report with the summary
4. Sends it to vivekcdoba@gmail.com via Resend API (RESEND_API_KEY is already configured)

---

### Step 3: Schedule the cron job

Use `pg_cron` + `pg_net` to call the `daily-session-report` edge function once daily at 7:00 AM IST (1:30 AM UTC).

---

### Step 4: Enable extensions

Migration to enable `pg_cron` and `pg_net` extensions if not already enabled.

---

### Technical Details

| File | Action |
|------|--------|
| `supabase/migrations/..._session_cleanup.sql` | Add `cleanup_old_sessions()` function, enable extensions |
| `supabase/functions/daily-session-report/index.ts` | New edge function: cleanup + report + email |
| Cron job (via insert tool) | Schedule daily invocation at 1:30 AM UTC |

The email will be sent from `onboarding@resend.dev` (Resend test sender) unless a custom domain is configured. Report includes: sessions count, unique users, avg duration, device breakdown, and top active users.

