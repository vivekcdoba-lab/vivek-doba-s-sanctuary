## Daily Seeker Progress Email

A personalized evening email sent to every active seeker summarizing their day, with an admin toggle and per-seeker opt-out.

### What each seeker receives (8:30 PM IST, daily)

Subject: `🪔 Your Day in Review — {Date} | Streak: {N} days`

Sections:
1. **Greeting** — Namaste {First Name}, in their preferred language (EN/HI/MR).
2. **Today's Snapshot**
   - Worksheet completion % (with ✅ submitted / ⏳ partial / ❌ missed)
   - Morning mood + energy score
   - Current streak (🔥 N days) + best streak
3. **LGT Dimensions Today** — Dharma / Artha / Kama / Moksha scores from `daily_lgt_checkins`, with trend arrow vs 7-day average.
4. **Coach's Note** — latest unread comment from coach (if any) from session/worksheet comments.
5. **Pending for Tomorrow** — open assignments, next session, any missed items.
6. **Daily Affirmation / Shloka** — one rotating bilingual line.
7. **CTA buttons** — "Open Today's Worksheet", "View Full Journey", "Manage Notifications".
8. Footer — unsubscribe link → toggles `daily_progress_email_enabled` on profile.

If the seeker did **not** submit a worksheet, the email becomes a gentle nudge ("We missed you today 🙏") instead of a recap, but still includes streak + tomorrow's focus.

### Admin controls (new page: `/admin/daily-reports`)

- Master toggle: enable/disable platform-wide
- Send time (default 20:30 IST)
- "Send test to me now" button
- Last run log: sent / skipped / failed counts
- Per-seeker override visible in Seeker 360 → Notifications tab

### Technical Implementation

**1. DB migration**
- Add `profiles.daily_progress_email_enabled boolean default true`
- Add `profiles.preferred_language text default 'en'` (if not present)
- New table `daily_progress_email_log (id, seeker_id, sent_date, status, summary jsonb, error text, created_at)` with admin-only RLS
- New table `daily_report_settings (id, enabled bool, send_hour int, send_minute int, updated_by, updated_at)` (singleton row)
- RPC `get_seeker_daily_summary(_seeker_id uuid, _date date) returns jsonb` — aggregates worksheet, LGT, mood, streak, coach comment, pending assignments, next session.

**2. Edge function `send-daily-seeker-reports`** (`verify_jwt = false`, accepts `x-cron-secret` or admin JWT)
- Loads settings; exits if disabled.
- Selects all seekers where `daily_progress_email_enabled = true` AND has at least one enrollment.
- For each seeker → calls RPC, builds bilingual HTML (reuses pattern from `daily-session-report`), enqueues via shared `sendEmail()` (Resend through existing queue).
- Writes one row per seeker into `daily_progress_email_log`.
- Returns aggregate counts.

**3. Cron job** via `pg_cron` + `pg_net` → invokes the function daily at 20:30 IST (15:00 UTC). SQL inserted via Supabase insert tool (not migration) since it embeds the function URL + anon key.

**4. Admin UI**
- New page `src/pages/admin/AdminDailyReports.tsx` with toggle, time picker, test-send, and last-7-days log table.
- Add route in `src/App.tsx` and sidebar link in `AdminLayout.tsx`.
- Add notification preference toggle in seeker settings (`SeekerSettings` if exists, else `SeekerHelp` adjacent).

**5. Bilingual templates**
- Inline EN/HI/MR strings in the edge function (small dict). Devanagari fonts inline-styled (`Noto Sans Devanagari`).

### Files to create / edit

- Create `supabase/migrations/<ts>_daily_seeker_reports.sql`
- Create `supabase/functions/send-daily-seeker-reports/index.ts`
- Insert `pg_cron` schedule via Supabase insert tool
- Create `src/pages/admin/AdminDailyReports.tsx`
- Edit `src/App.tsx` (add route)
- Edit `src/components/AdminLayout.tsx` (sidebar entry under Reports/Settings)
- Edit seeker settings page (notification preference toggle)

### Out of scope (can add later)
- WhatsApp delivery (Twilio is connected — easy follow-up)
- Weekly digest for seekers
- Coach-facing daily digest of their seekers
