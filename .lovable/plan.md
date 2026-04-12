

# Build All Remaining Admin Placeholder Pages (25 pages)

## Overview
Replace all 25 `<P />` placeholder routes in `App.tsx` with functional pages. These are grouped into 7 modules.

## Pages to Build

### Module 1: Payments (5 pages)
1. **AdminRecordPayment.tsx** — Dedicated payment recording form (reuses `usePayments().createPayment`, seeker selector, GST calc)
2. **AdminInvoices.tsx** — Invoice listing with search, print/download, InvoiceModal integration
3. **AdminOverduePayments.tsx** — Filtered view of overdue payments with reminder actions (SendReminderModal)
4. **AdminRevenue.tsx** — Revenue dashboard with monthly/quarterly charts (recharts BarChart, AreaChart), breakdown by course
5. **AdminExportFinancials.tsx** — Export payments/revenue data as CSV, date range filter

### Module 2: Resources (4 pages)
6. **AdminVideos.tsx** — List/manage video learning content from `learning_content` table (type='video')
7. **AdminAudios.tsx** — List/manage audio content (type='audio')
8. **AdminUploadResource.tsx** — Upload form for resources to `resources` storage bucket + `learning_content` table
9. **AdminCategories.tsx** — Manage content categories with CRUD

### Module 3: Assessments (2 pages)
10. **AdminQuestionBank.tsx** — CRUD for assessment questions, category/type filters
11. **AdminCreateAssessment.tsx** — Wizard to create new assessment, select questions, assign to seekers

### Module 4: Messages (1 page)
12. **AdminAnnouncements.tsx** — CRUD for announcements table, audience targeting, pin/unpin

### Module 5: Our Company (3 pages)
13. **AdminCompetitors.tsx** — VDTS competitor tracking (manual entries, threat levels)
14. **AdminBusinessMetrics.tsx** — Key business KPIs dashboard (revenue, users, sessions, assignments aggregated)
15. **AdminStrategicGoals.tsx** — OKR/goal tracking with progress bars, quarterly targets

### Module 6: Reports (5 pages)
16. **AdminUserGrowth.tsx** — User registration trends (AreaChart by month), role breakdown
17. **AdminEngagement.tsx** — Worksheet completion rates, session attendance, assignment completion
18. **AdminCoachPerformance.tsx** — Per-coach session counts, seeker engagement scores, completion rates
19. **AdminRetention.tsx** — Monthly active users, churn indicators, retention cohort analysis
20. **AdminExportReports.tsx** — Export selection UI for various report types as CSV

### Module 7: System (5 pages)
21. **AdminBranding.tsx** — Brand color config, logo upload, platform name settings (localStorage-based)
22. **AdminNotifications.tsx** — Notification templates, send broadcast, history log
23. **AdminIntegrations.tsx** — Display connected integrations (WhatsApp, Email), status indicators
24. **AdminAuditLogs.tsx** — Query `user_sessions` table for login activity, display as timeline
25. **AdminBackup.tsx** — Database stats overview, export triggers, informational page

## Technical Approach

- **Data sources**: `usePayments`, `useSeekerProfiles`, `useDbSessions`, `useDbAssignments`, `useDbCourses`, plus direct Supabase queries for `learning_content`, `announcements`, `user_sessions`
- **Charts**: recharts (BarChart, PieChart, AreaChart, LineChart) — already installed
- **Patterns**: Follow existing admin page patterns (loading spinner, card grids, data tables, Dialog modals)
- **No migrations needed**: All tables already exist
- **Styling**: Consistent with existing admin pages — card-based layouts, status badges, gradient headers

## File Changes

- **Create**: 25 new files in `src/pages/admin/`
- **Edit**: `src/App.tsx` — replace all `<P />` references with new component imports

## Implementation Order
Will build all 25 pages in a single pass, grouped by module for coherence.

