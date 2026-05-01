# Feature Catalog

A flat index of every major feature, where it lives, and which tables it touches. Use this to find "where do I go to change X?".

## Daily Practice

| Feature | Page | Tables |
|---|---|---|
| Dharmic Daily Worksheet | `/seeker/daily-worksheet` (`DailyWorksheet.tsx`) | `daily_worksheets` |
| Time Sheet | `/seeker/time-sheet` | `time_sheets`, `daily_time_slots` |
| LGT Quick Check-in | dashboard widget | `daily_lgt_checkins` |
| Daily Affirmation | dashboard widget | `daily_affirmations`, `favorite_affirmations` |
| Daily Sankalp | dashboard widget | `daily_worksheets.tomorrow_sankalp` |
| Japa / Mantra Log | `/seeker/daily-mindfulness` | `japa_log` |
| Non-negotiables | dashboard widget | `seeker_non_negotiables`, `daily_non_negotiable_log` |

## Weekly / Monthly

| Feature | Page | Tables |
|---|---|---|
| Weekly Review (gated) | `/seeker/weekly-review` | `weekly_reviews` |
| Weekly Challenges | `/seeker/challenges` | `weekly_challenges`, `weekly_challenge_progress`, `coach_weekly_challenges` |
| Worksheet History | `/seeker/worksheet-history` | `daily_worksheets` |
| Streaks | `/seeker/streaks` | `streaks`, `daily_worksheets` |

## Sessions

| Feature | Page | Tables |
|---|---|---|
| Upcoming Sessions | `/seeker/upcoming-sessions` | `sessions` |
| Session Detail / Live | `/seeker/sessions/:id`, `/seeker/live-session` | `sessions`, `session_notes`, `session_topics` |
| Session History | `/seeker/session-history` | `sessions` |
| Coach Today | `/coach/today-sessions` | `sessions` |
| Coach Past Sessions | `/coach/past-sessions` | `sessions` |
| E-signatures | inline | `session_signatures` |

## Assessments (9 frameworks)

| Page | Table |
|---|---|
| `/seeker/assessments` (hub) | — |
| LGT, WoL, FIRO-B, Happiness, MOOCH, Purushaarthas, SWOT, Intake, Goal Commitment | one table each (see Database Schema → Assessments) |
| Coach review | `coach_assessment_feedback`, `assessment_actions` |
| Admin config | `assessment_config` |

## Programs / Enrollment

| Feature | Page | Tables |
|---|---|---|
| Programs (6 core) | `/admin/edit-programs` | `courses` |
| Assign coach to program | `/admin/program-coaches` | `program_trainers` |
| Enrollments | `/admin/enrollments` | `enrollments` |
| Batches | `/admin/batches` | `batches` |
| Coach ↔ Seeker linking | auto via triggers | `coach_seekers` |

## Financial

| Feature | Page | Tables |
|---|---|---|
| Record Payment | `/admin/record-payment` | `payments` |
| Invoices | `/admin/invoices` | `payments` |
| Overdue Payments | `/admin/overdue-payments` | `payments` |
| Revenue / Export | `/admin/revenue`, `/admin/export-financials` | `payments`, `accounting_records` |
| Cashflow (Artha) | `/seeker/artha/cashflow` | `cashflow_records` |

## Artha (Business Module)

| Feature | Page | Tables |
|---|---|---|
| Business Profile | `/seeker/artha/profile` | `business_profiles` |
| Vision / Mission | `/seeker/artha/vision-mission` | `business_mission_vision` |
| Departments (8) | `/seeker/artha/departments` | `department_health` |
| SWOT | `/seeker/artha/swot` | `business_swot_items`, `swot_competitors` |
| Branding / Marketing / Sales | respective Artha pages | `branding_strategy`, `marketing_strategy`, `sales_strategy` |
| R&D Projects | `/seeker/artha/rnd` | `rnd_projects` |
| Team | `/seeker/artha/team` | `team_members` |
| Coach review | `/coach/artha-progress`, `/coach/dept-health` | same tables |

## CRM (Lead Management)

| Feature | Page | Tables |
|---|---|---|
| 8-stage Kanban | `/admin/all-leads` | `leads` |
| Hot Leads | `/admin/hot-leads` | `leads` |
| Add Lead | `/admin/add-lead` | `leads` |
| Lead Sources | `/admin/lead-sources` | `leads` |
| Conversion Funnel | `/admin/conversion-funnel` | `leads`, `enrollments` |

## Communication

| Feature | Page | Tables |
|---|---|---|
| Internal Messaging | `/seeker/messages`, `/coach/messages` | `messages` |
| Announcements | `/admin/announcements`, `/seeker/announcements` | `announcements`, `announcement_reads` |
| Notifications Center | `/seeker/notifications` | `notifications` |
| Support Inbox | `/admin/support` | `support_tickets` |
| Email Logs | `/admin/notifications` | `email_log`, `email_send_log`, `email_send_state` |
| WhatsApp send | edge: `send-whatsapp` | — |

## Gamification

| Feature | Page | Tables |
|---|---|---|
| Points | `/seeker/points` | `points_ledger` |
| Badges | `/seeker/badges` | `badge_definitions`, `seeker_badges`, `seeker_badge_progress` |
| Leaderboard | `/seeker/leaderboard` | RPC `get_leaderboard_data` |

## Learning Center

| Feature | Page | Tables |
|---|---|---|
| Audio | `/seeker/learning/audio` | `learning_content`, `resources` |
| PDFs | `/seeker/learning/pdfs` | same |
| Videos | `/seeker/learning/videos` | same |
| Frameworks | `/seeker/learning/frameworks` | static |
| Bookmarks | `/seeker/bookmarks` | `user_bookmarks` |
| Progress | `user_content_progress` | per-asset checkpoint |

## Admin Operations

| Feature | Page | Tables / Functions |
|---|---|---|
| All Users / Search | `/admin/search-users` | `profiles` |
| Coaches Management | `/admin/coaches` | `profiles`, `coach_seekers` |
| Coach ↔ Seeker | `/admin/coach-seekers` | `coach_seekers` |
| Linked Profiles | `/admin/linked-profiles` | `seeker_links` |
| Active Sessions Monitor | `/active-sessions` | `user_sessions` |
| Audit Logs | `/admin/audit-logs` | `session_audit_log` |
| Backup | `/admin/backup` | — |
| Encryption Status | `/admin/encryption-status` | `encryption_keys` |
| Branding | `/admin/branding` | `branding_strategy` |
| Daily Reports | `/admin/daily-reports` | `daily_report_settings` |

## Coach Operations

| Feature | Page | Tables |
|---|---|---|
| Today View | `/coach/today-sessions` | `sessions` |
| Day View | `/coach/day-view` | aggregated |
| Pending Submissions | `/coach/pending-submissions` | `submissions` |
| Worksheet Stats | `/coach/worksheet-stats` | `daily_worksheets` |
| Engagement | `/coach/engagement` | computed |
| Reports | `/coach/generate-reports` | export |
| Templates | `/coach/templates` | `session_templates` |
