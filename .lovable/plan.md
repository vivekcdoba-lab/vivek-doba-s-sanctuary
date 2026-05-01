# Auto-decrement Sessions + Reminder Emails

## 1. Auto-decrement attendance after each session

The counter already subtracts attended sessions from total — the only gap is that **no UI action currently writes `attendance`** on the happy path (admin clicks "Approve" / "Sign", but never sets `attendance='present'`). Today the seeker only sees the count drop if admin/coach manually picks "Present" from the dropdown.

**Fix** — make it automatic via a database trigger:

```sql
CREATE OR REPLACE FUNCTION public.auto_set_attendance_on_status()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  -- When session is moved to a "session actually happened" state, default attendance=present
  IF NEW.status IN ('in_progress','submitted','reviewing','approved','completed')
     AND (NEW.attendance IS NULL OR NEW.attendance = '')
  THEN
    NEW.attendance := 'present';
  END IF;
  -- When status flips to missed/no_show and no attendance set, default to no_show (counts as attended)
  IF NEW.status IN ('missed','no_show')
     AND (NEW.attendance IS NULL OR NEW.attendance = '')
  THEN
    NEW.attendance := 'no_show';
  END IF;
  RETURN NEW;
END;
$$;
```
Plus a one-time backfill UPDATE for already-completed sessions with NULL attendance.

This means the moment a coach starts/submits/approves/certifies a session, `attendance` becomes `'present'` → the counter auto-decrements. Admin can still override to `excused` later if the seeker had a strong reason.

## 2. Daily evening reminder — Gratitude Wall

A new edge function **`send-evening-gratitude-nudge`** runs at **7 PM IST every day** and emails every active seeker:

- Subject: *"🙏 End your day with gratitude"*
- Body (EN/HI/MR): "Please complete today's tasks and write 3 things you are grateful for."
- Big CTA → `https://www.vivekdoba.com/seeker/gratitude-wall`
- Skipped for seekers who have already submitted their gratitude entry for today
- Skipped for seekers who set `daily_progress_email_enabled = false`

Cron: `0 13 * * *` (UTC = 6:30 PM IST → use `30 13 * * *`).

## 3. 24-hour pre-session reminder — Challenges + Weekly Review

A new edge function **`send-pre-session-prep-reminder`** runs **hourly** and finds every seeker whose next scheduled session falls in the **next 23–25 hour window**:

- Subject: *"📅 Session tomorrow — please complete your prep"*
- Body lists what to finish before the session:
  1. **Weekly Review** → CTA → `/seeker/weekly-review`
  2. **Active Challenge** → CTA → `/seeker/challenges`
  3. (gentle reminder) Today's Gratitude → `/seeker/gratitude-wall`
- One email per seeker per session (dedup via `notifications` table marker `kind = 'pre_session_prep'` + `related_session_id`)
- Skips if `daily_progress_email_enabled = false`

Cron: every hour at minute 0 → `0 * * * *`.

## 4. Sessions card update on `/seeker/payments`

The existing card already shows Total / Attended / Excused / Remaining. After the trigger lands, it will update automatically — no code change needed.

## Technical Details

**New files:**
- `supabase/functions/send-evening-gratitude-nudge/index.ts`
- `supabase/functions/send-pre-session-prep-reminder/index.ts`

**New migration:**
- Trigger `auto_set_attendance_on_status` on `public.sessions` (BEFORE INSERT/UPDATE)
- Backfill UPDATE for existing completed/approved/missed sessions with NULL attendance

**New cron jobs** (added via insert tool, not migration, because they contain anon key):
- `evening-gratitude-nudge` → `30 13 * * *`
- `pre-session-prep-reminder` → `0 * * * *`

**Both functions use the existing `_shared/send-email.ts` queue** — no new secrets needed.

**Tri-lingual** (EN/HI/MR) — same pattern as `send-daily-seeker-reports`.

**Idempotency:** each function checks the `notifications` table before sending, and writes a row after sending so it won't double-send.

## Out of Scope

- Building the Gratitude Wall / Challenges / Weekly Review pages (they exist)
- WhatsApp reminders (email only — can add later)
- Custom per-seeker timing (everyone gets 7 PM IST)
