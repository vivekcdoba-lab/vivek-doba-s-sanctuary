

# Build Coach Session Management Pages

## Overview
Create 4 new pages under `/coaching/` that replace the current placeholder routes. All pages query the existing `sessions` table and `profiles` table, using the coaching layout's English/Hindi localization pattern.

## Pages

### 1. CoachSchedule.tsx (`/coaching/schedule`)
**Week/Day/Month calendar view with session creation**

- Toggle between Day, Week, Month views (default: Week)
- Week view: 7-column grid with hourly time slots (6 AM - 10 PM)
- Sessions rendered as colored blocks based on status
- "Block Time" button to create `blocked` calendar events via `calendar_events` table
- Available slots shown as light green backgrounds
- Quick session creation dialog (reuse pattern from `SessionsPage` — seeker picker, date, time, course, template)
- Drag-drop rescheduling: HTML5 drag on session cards, drop on time slots triggers `useUpdateSession` to update date/start_time/end_time
- Navigation arrows for prev/next week/month
- Queries: `sessions` table + `calendar_events` for blocked slots

### 2. CoachTodaySessions.tsx (`/coaching/today-sessions`)
**Today's sessions with live controls**

- Filter sessions where `date = today`, sorted by `start_time`
- Current/next session highlighted with a pulsing border (compare current time to start_time)
- Each session card shows:
  - Seeker name + avatar (from profiles join)
  - Time, duration, pillar badge, status badge
  - Quick info: sessions completed count, streak, last worksheet date
- Session prep checklist (hardcoded items: "Review last session notes", "Check pending assignments", "Review worksheet trends")
- "Start Session" button → updates status to `in_progress`
- "Mark Complete" button → updates status to `completed`
- Quick notes textarea → updates `session_notes` via `useUpdateSession`
- Empty state if no sessions today

### 3. CoachPastSessions.tsx (`/coaching/past-sessions`)
**Session history with search/filter/export**

- Query sessions where `date < today`, ordered desc
- Filters: seeker dropdown, date range picker, pillar, status
- Search: text search across `session_notes`, `key_insights`, `breakthroughs`, seeker name
- Timeline view: sessions grouped by month with vertical timeline line
- Each card shows: seeker name, date, duration, pillar, status badge, topics covered
- Expandable sections for notes, insights, breakthroughs, feedback
- Export button: generates CSV of filtered sessions
- Pagination or "load more" for performance

### 4. CoachSessionAnalytics.tsx (`/coaching/session-analytics`)
**Dashboard with recharts visualizations**

- Stat cards row: Sessions this month, Avg duration, Total seekers coached, No-show rate
- Charts (using recharts):
  - **Sessions per month**: BarChart (last 6 months)
  - **Topics frequency**: Horizontal BarChart from `topics_covered` JSON aggregation
  - **Engagement trend**: LineChart of avg `engagement_score` per week
  - **Status distribution**: PieChart (completed/missed/rescheduled/cancelled)
  - **Best time slots**: BarChart grouping sessions by `start_time` hour
  - **No-show/reschedule rates**: AreaChart over months
- All data computed client-side from full sessions query

## Technical Details

**Files to create:**
- `src/pages/coaching/CoachSchedule.tsx`
- `src/pages/coaching/CoachTodaySessions.tsx`
- `src/pages/coaching/CoachPastSessions.tsx`
- `src/pages/coaching/CoachSessionAnalytics.tsx`

**Files to edit:**
- `src/App.tsx` — Import 4 new components, replace `<P />` on lines 314-317

**Data sources:** Existing `sessions` table + `calendar_events` table + `profiles` via `useSeekerProfiles()`. No new tables or migrations needed.

**Patterns reused:**
- `useCoachingLang()` for EN/HI labels
- `useDbSessions()` / `useUpdateSession()` / `useCreateSession()` hooks
- `SESSION_STATUS_CONFIG` color map from `SessionsPage`
- `recharts` for analytics (already installed)
- `date-fns` for date formatting (already installed)

**Styling:** Tailwind with existing brand colors (`sky-blue`, `saffron`, `dharma-green`, `chakra-indigo`). Session cards use status-based color coding consistent with `SessionsPage`.

