

## Plan: Admin Assessment Management Dashboard

### Overview
Add a comprehensive admin assessment management page with organization-wide analytics, assessment configuration, and report generation. Enhance the existing admin sidebar with new navigation items. Create two new database tables for assessment configuration and system settings.

### Changes

**1. Database Migration — `assessment_config` and `system_settings` tables**
- `assessment_config`: stores per-assessment-type toggle and JSONB config, with RLS for admin write / authenticated read
- `system_settings`: stores category-based settings (frequency, thresholds), admin-only access via `is_admin()` function
- Seed default rows for 7 assessment types and default assessment settings
- Use `is_admin(auth.uid())` in RLS policies to avoid recursion

**2. Update Admin Sidebar** (`src/components/AdminLayout.tsx`)
- Add two new items to the existing ASSESSMENTS group (lines 85-89):
  - `{ icon: Settings, label: 'Configure Assessments', path: '/admin/assessments/configure' }`
  - `{ icon: PieChart, label: 'Assessment Analytics', path: '/admin/assessments/analytics' }`

**3. Create `src/pages/admin/AdminAssessmentConfig.tsx`**
- Global settings panel: assessment frequency, auto-reminders toggle, coach danger zone alerts toggle, danger threshold selector
- Per-assessment-type cards with active/inactive Switch toggles
- Wheel of Life spoke configuration list
- Reads from / writes to `assessment_config` and `system_settings` tables via Supabase

**4. Create `src/pages/admin/AdminAssessmentAnalytics.tsx`**
- Organization-wide stats cards (total assessments, active seekers, completion rate, monthly count)
- Bar chart of average Wheel of Life scores by spoke (from `wheel_of_life_assessments`)
- Pie chart of score distribution (danger/warning/good)
- Coach performance comparison table
- Key insights section
- Report generation buttons (placeholder actions)

**5. Update Routes** (`src/App.tsx`)
- Add 2 new imports and 2 new routes inside the admin `<Route>` block:
  - `/admin/assessments/configure` → `AdminAssessmentConfig`
  - `/admin/assessments/analytics` → `AdminAssessmentAnalytics`
- The existing `/assessments` route (AssessmentsPage) remains untouched

### Files Modified
- `src/components/AdminLayout.tsx` — add 2 nav items
- `src/App.tsx` — add 2 imports + 2 routes

### Files Created
- `src/pages/admin/AdminAssessmentConfig.tsx`
- `src/pages/admin/AdminAssessmentAnalytics.tsx`

### Database Migration
- 2 new tables: `assessment_config`, `system_settings` with RLS and seed data

