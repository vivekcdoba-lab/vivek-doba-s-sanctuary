
## Goal
Run a **read-only end-to-end smoke test** of the platform across Seeker, Admin, and Coach surfaces — verifying calendar, meetings, coach email, and assessments — **without creating any records**. Then list gaps and bugs.

## Test accounts
- **Admin + Coach (dual-role):** `vivekcdoba@gmail.com` (admin with `is_also_coach=true`)
- **Seeker:** `crwanare@gmail.com`

## Approach — pure inspection, zero writes
Switch to default mode so I can use:
- `supabase--read_query` to verify data state (profiles, sessions, calendar_events, assessments, RLS) — SELECT only.
- `supabase--edge_function_logs` to inspect coach email function (`send-notification`, `daily-session-report`, `send-otp`) for failures.
- `code--search_files` and `code--view` to trace each flow in code.
- `browser--navigate_to_sandbox` + `observe`/`screenshot` for **visual-only** walkthroughs (no clicks that mutate data — no Save, no Send, no Create).

No `INSERT`, no `UPDATE`, no `DELETE`, no edge function `curl`. No data created.

## Scope — dry run checklist

### A. Account & role integrity
1. Confirm `vivekcdoba@gmail.com`: `role='admin'`, `is_also_coach=true`, `admin_level` set.
2. Confirm `crwanare@gmail.com`: `role='seeker'`, `access_end_date`, enrollment present.
3. AuthGuard logic: dual-role admin reaches `/coaching/*`; seeker blocked from admin/coach.

### B. Admin surfaces (logged-in as admin in code paths)
- `/admin/dashboard` — widgets load, KPIs query the right tables.
- `/admin/coaches` — Vivek listed (via `is_also_coach`), Role column gone, edit dialog has the toggle.
- `/admin/seekers` & `/admin/seekers/:id` — Crwanare loads with 360° tabs.
- `/admin/sessions` — coach picker includes dual-role admin.
- `/admin/calendar` — month renders, events query scoped correctly, coach picker complete.
- `/admin/search-users` — both badges (Admin + Coach) on Vivek.
- `/admin/active-sessions` — heartbeat data visible.

### C. Coach surfaces (same user, coach hat)
- `/coaching` dashboard — CoachingLayout renders, sidebar correct.
- `/coaching/today-sessions`, `/coaching/schedule` — sessions for this coach.
- `/coaching/seeker-detail/:id` for Crwanare — assessments, worksheets, sessions visible.
- Coach → Send email/notification flow: trace `send-notification` edge function code path, check recent logs for errors. **Do not invoke.**
- Coach assessment oversight (`/coach/seeker-assessments`).

### D. Seeker surfaces (Crwanare)
- `/seeker/home` — dashboard widgets, daily affirmation, sankalp, LGT wheel.
- `/seeker/live-session` — upcoming sessions render, meeting link present.
- `/seeker/assessments/*` — all 9 assessment pages: 4-tab architecture intact, history loads.
- `/seeker/daily-worksheet`, `/seeker/journey`, `/seeker/points`, `/seeker/streaks`.

### E. Calendar & Meeting (deep dive)
- `calendar_events` table schema + RLS verified.
- Admin `/admin/calendar` add-event modal: form fields, validation, seeker dropdown source.
- Session `meeting_link` field surfaced on:
  - Admin sessions table
  - Coach today/schedule
  - Seeker live-session "Join Meeting" button
- Cross-check: a session with a `meeting_link` reaches the seeker UI correctly.

### F. Coach email
- Read `supabase/functions/send-notification/index.ts` — verify CORS, payload contract, error handling.
- Read `supabase/functions/daily-session-report/index.ts`.
- Pull last 50 log lines for these functions — surface any `exception`, `replace of undefined`, 4xx/5xx.
- Trace the UI button → invoke chain (no firing).

### G. Assessments
- For each: WheelOfLife, LGT, FIRO-B, Happiness, Mooch, Purusharthas, SWOT — verify:
  - Hook reads correctly (`useXxxAssessment.ts`).
  - Validation triggers in DB exist and ranges match UI sliders.
  - Rate limit trigger (`check_single_assessment_rate_limit`) attached.
  - History tab queries scoped by `seeker_id`.
- Coach/admin oversight pages query the same tables.

### H. Cross-cutting checks
- RLS sanity: `profiles`, `sessions`, `calendar_events`, all assessment tables — confirm seeker isolation, admin override via `is_admin()`.
- Console error already known: `ResetPasswordDialog` ref warning — confirm scope and propose fix.
- Auth flicker, single-device enforcement, session heartbeat token handling — read-only verification.

## Deliverable
A single report with three sections:
1. **✅ Working** — what passed end-to-end (with the evidence — query result / file ref / log snippet).
2. **⚠️ Gaps** — flows that work but have UX/data holes (e.g., missing seeker assignment to coach, missing meeting links, empty assessment history).
3. **🐛 Bugs** — concrete defects with file + line + suggested fix (no fix applied in this run).

No changes to the codebase or database during this smoke test.
