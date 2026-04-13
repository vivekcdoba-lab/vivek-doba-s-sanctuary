

## Plan: Coach Assessment Dashboard for Seeker Management

### Overview
Add two new pages and enhance the coach sidebar to let coaches view/manage seeker assessments, provide feedback, and track progress. All new — nothing deleted.

### Key Design Decision
The user's request uses `/coach/` paths, but all existing coaching routes use `/coaching/` prefix. I will use `/coaching/` for consistency (e.g., `/coaching/seeker-assessments` instead of `/coach/seeker-assessments`).

### Changes

**1. Database Migration — `coach_assessment_feedback` table**
- Create table with columns: id, coach_id, seeker_id, assessment_id, assessment_type, spoke_feedback (JSONB), general_notes, action_items (JSONB), shared_with_seeker, created_at, updated_at
- Use validation triggers instead of CHECK constraints
- RLS: coaches manage their own feedback; seekers view shared feedback
- Admin access via `is_admin()` function

**2. Update Coach Sidebar Navigation** (`src/components/CoachingLayout.tsx`)
- Enhance the existing ASSESSMENTS group (lines 66-71) by adding two new items:
  - `{ icon: Brain, label: 'Assessment Dashboard', path: '/coaching/seeker-assessments' }`
  - `{ icon: PieChart, label: 'Assessment Analytics', path: '/coaching/assessment-analytics' }`

**3. Create `src/pages/coaching/CoachSeekerAssessments.tsx`**
- Dashboard page showing stats cards (total seekers, assessments this month, avg wheel score, danger zone count)
- Searchable seeker list with Wheel of Life scores, LGT scores, danger zone badges, and status indicators
- Fetches real data from `profiles` + `wheel_of_life_assessments` via Supabase joins
- Each seeker card has View/Message/Schedule actions
- "View" navigates to `/coaching/seeker-assessments/:seekerId`

**4. Create `src/pages/coaching/CoachSeekerDetail.tsx`**
- Seeker header with contact info, program, day count, streak
- Tabs: Wheel of Life (Radar + Bar charts via recharts), SWOT, LGT, Overview (placeholders for last three)
- Danger zones section with seeker notes displayed
- Coach feedback textarea with save to `coach_assessment_feedback` table
- "Share Summary with Seeker" button toggles `shared_with_seeker`
- Back button to seeker list

**5. Create `src/pages/coaching/CoachAssessmentAnalytics.tsx`**
- Placeholder page with coming soon message and summary of planned analytics features

**6. Update Routes** (`src/App.tsx`)
- Add imports for the 3 new pages
- Add 3 routes inside the coaching `<Route>` block:
  - `/coaching/seeker-assessments` → `CoachSeekerAssessments`
  - `/coaching/seeker-assessments/:seekerId` → `CoachSeekerDetail`
  - `/coaching/assessment-analytics` → `CoachAssessmentAnalytics`

### Files Modified
- `src/components/CoachingLayout.tsx` — add 2 nav items to ASSESSMENTS group
- `src/App.tsx` — add 3 imports + 3 routes

### Files Created
- `src/pages/coaching/CoachSeekerAssessments.tsx`
- `src/pages/coaching/CoachSeekerDetail.tsx`
- `src/pages/coaching/CoachAssessmentAnalytics.tsx`

### Database Migration
- 1 new table: `coach_assessment_feedback` with RLS policies

