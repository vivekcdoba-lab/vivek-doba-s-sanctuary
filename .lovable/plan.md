

# VDTS Platform — Complete Audit Report

---

## EXECUTIVE SUMMARY

The application has a solid foundation with well-designed UI, proper Supabase database schema with 37 tables, and functional authentication. However, a **critical architectural issue** pervades the platform: the majority of pages use **hardcoded mock data** instead of querying the live database. This makes most features non-functional in production.

---

## 1. WHAT'S WORKING PERFECTLY ✅

| Area | Details |
|------|---------|
| **Authentication Flow** | Login, Register, Reset Password all work with Supabase Auth. Profile auto-creation via `handle_new_user` trigger is correct. |
| **AuthGuard** | Route protection works — unauthenticated users redirect to `/login`, seekers cannot access admin routes. Admin can access all routes. |
| **Daily Dharmic Worksheet** | Full Supabase integration via `useWorksheet` hook — reads/writes to `daily_worksheets`, `daily_time_slots`, `daily_financial_log`, `daily_non_negotiable_log`, `daily_priorities`. This is the best-implemented module. |
| **Worksheet Analytics (Admin)** | Reads real data from `daily_worksheets` table — fully functional. |
| **Session Certification** | Supabase-backed digital signatures, audit logging, and content hashing. |
| **Session Review/Comments** | Real-time session review workflow with Supabase. |
| **Session Templates** | CRUD operations against Supabase `session_templates` table. |
| **Coaching Module (Client Intake, Agreements, FIRO-B)** | All save to Supabase (`clients`, `agreements`, `assessments` tables). |
| **Badge System** | `useBadges` hook reads/writes to `badge_definitions`, `seeker_badges`, `seeker_badge_progress`. |
| **Sacred Space / Audio Engine** | Procedural Web Audio API ambient sounds — fully client-side, works well. |
| **RLS Policies** | All 37 tables have RLS enabled with appropriate policies using the `is_admin()` security definer function. |
| **PWA Install** | Manifest and icons configured for "Add to Home Screen". |
| **Dark Mode** | Toggle works across all layouts. |
| **Edge Functions** | `send-notification`, `send-otp`, `verify-otp`, `send-whatsapp` deployed. |

---

## 2. WHAT'S BROKEN OR BUGGY 🔴

### 🔴 CRITICAL: 20+ Pages Use Mock Data Instead of Database

**This is the #1 issue.** The following pages import from `@/data/mockData.ts` and display hardcoded sample data (e.g., "Rahul Patil") instead of real database records:

| Page | Mock Data Used |
|------|---------------|
| **Admin Dashboard** | `SEEKERS`, `SESSIONS`, `ASSIGNMENTS`, `PAYMENTS` — all fake |
| **Seekers Page** | `SEEKERS` — hardcoded list, not from `profiles` table |
| **Seeker Detail Page** | `SEEKERS` — partially mock + some Supabase calls |
| **Sessions Page** | `SESSIONS` — initialized with mock, Supabase used only for new sessions |
| **Assignments Page** | `ASSIGNMENTS`, `SEEKERS` — entirely mock |
| **Payments Page (Admin)** | `SEEKERS` — mock for seeker list, Supabase for payment CRUD |
| **Follow-ups Page** | `FOLLOW_UPS`, `SEEKERS` — entirely mock |
| **Reports Page** | `SEEKERS`, `PAYMENTS`, `SESSIONS` — entirely mock |
| **Daily Tracking Page** | `SEEKERS` — mock seeker list |
| **Growth Matrix Page** | `SEEKERS` — mock |
| **Calendar Page** | Unknown — needs check |
| **Seeker Home** | `SEEKERS[0]`, `SESSIONS`, `AFFIRMATIONS` — hardcoded to first mock seeker |
| **Seeker Growth** | `SEEKERS[0]` — hardcoded scores, not from database |
| **Seeker Tasks** | `ASSIGNMENTS`, `SEEKERS[0]` — mock data |
| **Seeker Payments** | `PAYMENTS`, `SEEKERS[0]` — mock data |
| **Seeker Journey** | `SEEKERS[0]` — hardcoded milestones |
| **Seeker Messages** | `MESSAGES` — entirely mock, not connected to `messages` table |
| **Leads Page** | Likely mock — needs verification |

**Impact**: Real users (test01-05@gmail.com) will see "Rahul Patil's" data, not their own. Admin dashboard shows fake revenue and fake seeker counts.

### 🔴 Seeker Home Hardcoded to Mock User
`SeekerHome.tsx` line 9: `const seeker = SEEKERS[0]` — every seeker sees "Rahul Patil's" streak, sessions, and progress instead of their own.

### 🔴 Streak Counter Hardcoded
`SeekerLayout.tsx` line 151: Flame streak is hardcoded to `15` — not calculated from actual worksheet data.

### 🔴 Console Error: Function Component Ref Warning
`Warning: Function components cannot be given refs` on `Index` component — React Router layout route issue. The `AuthGuard` wraps children directly in `<>{children}</>` but the Route `element` prop passes it as a layout, which triggers this warning.

### 🔴 React Router v6 Deprecation Warnings
Two `v7_startTransition` and `v7_relativeSplatPath` future flag warnings in console.

### 🔴 No "Coach" Role in Auth System
`AuthGuard` only supports `'admin' | 'seeker'` roles. The `profiles` table `role` column defaults to `'seeker'`. There's no `'coach'` role — Admin and Coach are the same user (vivek@gmail.com). This is by design but means the system has only 2 roles, not 3.

### 🔴 Payments Table Uses String `seeker_id`
The `payments.seeker_id` column is `text` type, not `uuid` — it stores mock IDs like `'s1'` and doesn't have a foreign key to `profiles`. This will cause issues when matching real profile UUIDs.

---

## 3. WHAT'S INCOMPLETE OR PLACEHOLDER 🟡

### 🟡 Coaching Module — 4 Placeholder Pages
These routes show "This module will be built in the next phase":
- `/coaching/sessions` — Session Notes
- `/coaching/planner` — Daily Planner
- `/coaching/homework` — Homework Tracker
- `/coaching/progress` — Progress Matrix

### 🟡 Reports Page — 5 of 6 Sections Are Placeholder
Only "Seeker Progress" table renders (with mock data). The other 5 sections show: *"Detailed charts and data will be rendered here with Recharts integration."*

### 🟡 Admin Search Bar Non-Functional
The search input in `AdminLayout.tsx` header is decorative — no search logic implemented.

### 🟡 Seeker Weekly Review — Likely Mock
Needs verification but pattern suggests mock data.

### 🟡 Seeker Assessments — Likely Mock
The seeker-facing assessment results page likely reads from mock, while actual assessment data goes to the `seeker_assessments` table.

### 🟡 Messages Module — Not Connected to Database
`SeekerMessages.tsx` uses `MESSAGES` mock array. Messages sent are only stored in React state and lost on page refresh. The `messages` table in Supabase exists with proper RLS but is unused.

### 🟡 Admin Messages Page — Needs Verification
Likely also uses mock data.

### 🟡 Seeker Topics Page — Needs Verification

### 🟡 No File Upload Integration Active
Google Drive storage was discussed but not implemented. The Supabase storage buckets (`resources`, `avatars`, `signatures`) exist but file upload UI integration status is unclear for most pages.

---

## 4. DATABASE AUDIT

### Schema Health: GOOD ✅
- 37 tables with logical structure
- All tables have RLS enabled
- `is_admin()` security definer function prevents recursive RLS
- `handle_new_user` trigger auto-creates profiles
- 12 profiles exist in the database

### Issues Found:
| Issue | Severity |
|-------|----------|
| `payments.seeker_id` is `text` not `uuid` — no FK to profiles | 🔴 High |
| No foreign keys on `agreements`, `assessments`, `clients` to `auth.users` | 🟡 Medium (they use `coach_id = auth.uid()` which is fine for RLS) |
| No triggers listed in database despite `handle_new_user` being defined as trigger function | 🟡 Investigate |
| `profiles.user_id` is nullable — could cause RLS bypass | 🔴 High |
| `otp_codes` only accessible by `service_role` — correct ✅ | — |

---

## 5. SECURITY AUDIT

| Check | Status |
|-------|--------|
| RLS on all tables | ✅ Enabled |
| Admin check via security definer | ✅ `is_admin()` function |
| No client-side role storage | ✅ Roles from database |
| Auth state listener pattern | ✅ Correct with `onAuthStateChange` |
| Profile fetch timeout fallback | ⚠️ Falls back to `user_metadata` which could have stale role |
| Generic login error messages | ✅ Prevents email enumeration |
| `profiles.user_id` nullable | 🔴 Could allow null user_id to bypass RLS |

---

## 6. UI/UX CONSISTENCY

| Area | Status |
|------|--------|
| Fonts & typography | ✅ Consistent via Tailwind |
| Color palette (saffron/maroon/sacred theme) | ✅ Well-defined CSS variables |
| Card styling | ✅ Consistent rounded-xl with border |
| Button styles | ✅ Consistent via shadcn/ui |
| Mobile bottom nav (Seeker) | ✅ Works |
| Mobile sidebar (Admin) | ✅ Overlay drawer works |
| Responsive layouts | ✅ Grid adjusts for mobile/desktop |
| Dark mode | ✅ Toggles correctly |
| Loading states | ✅ Loader2 spinner used consistently |

---

## 7. RECOMMENDED PRIORITY FIXES

### P0 — Critical (Do First)
1. **Migrate all mock-data pages to Supabase** — This is the single biggest issue. At minimum: Admin Dashboard, Seekers list, Seeker Home, Sessions, Assignments, Payments, Messages, Follow-ups
2. **Fix `payments.seeker_id` to be `uuid`** with FK to profiles
3. **Make `profiles.user_id` NOT NULL** to prevent RLS bypass

### P1 — High Priority
4. **Connect Seeker Messages to `messages` table** with real-time subscription
5. **Connect Seeker Home to real profile data** — streaks from worksheets, sessions from DB
6. **Calculate streak dynamically** from `daily_worksheets` instead of hardcoding `15`
7. **Fix React Router ref warning** — wrap Index in forwardRef or restructure routes

### P2 — Medium Priority
8. **Build remaining Coaching placeholders** (4 modules)
9. **Build Reports charts** with Recharts using real data
10. **Implement admin search** functionality
11. **Connect Seeker Growth page** to real assessment data

### P3 — Nice to Have
12. **Add React Router v7 future flags** to suppress deprecation warnings
13. **Implement Google Drive file storage** integration
14. **Add offline support** to PWA (service worker caching)

---

## SUMMARY SCORECARD

| Module | Score | Status |
|--------|-------|--------|
| Authentication | 9/10 | ✅ Working |
| Daily Worksheet | 9/10 | ✅ Full Supabase |
| Session Management | 7/10 | ⚠️ Mix of mock + Supabase |
| CRM / Seekers | 3/10 | 🔴 Mostly mock |
| Payments | 4/10 | 🔴 Mock seeker data + text ID |
| Messages | 2/10 | 🔴 Entirely mock |
| Reports | 2/10 | 🔴 Mock + placeholder |
| Coaching Tools | 5/10 | 🟡 4 placeholders |
| Sacred Space / Audio | 10/10 | ✅ Perfect |
| Database & Security | 8/10 | ✅ Good RLS, minor fixes needed |
| UI/UX | 9/10 | ✅ Polished |

**Overall Platform Readiness: ~55%** — The UI shell is excellent but the data layer needs to be connected to make it production-ready.

