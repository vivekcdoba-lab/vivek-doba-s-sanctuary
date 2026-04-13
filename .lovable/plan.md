
# Plan: Build All Empty Coach Placeholder Pages

## Problem
16 coaching routes currently render a generic `PlaceholderModule` ("This module will be built in the next phase"). These need real, functional content using existing DB tables and hooks.

## Pages to Build (16 new files)

### Group 1: Seekers (5 pages)
All use `useSeekerProfiles()` + `useDbAssignments()` + worksheet data to show seeker cards with status.

1. **`CoachAllSeekers.tsx`** → `/coaching/seekers`
   - Grid of all seeker cards (avatar initials, name, email, city, streak, program)
   - Search bar, link to each seeker detail
   - Quick actions: WhatsApp, Message, Schedule Session

2. **`CoachSeekersActive.tsx`** → `/coaching/seekers-active`
   - Filtered view: seekers with worksheet activity in last 2 days
   - Shows last activity, current streak, LGT balance scores

3. **`CoachSeekersAttention.tsx`** → `/coaching/seekers-attention`
   - Filtered: seekers with no worksheet for 3+ days or broken streak
   - Red/yellow status indicators, quick "Send Reminder" actions

4. **`CoachSeekersOntrack.tsx`** → `/coaching/seekers-ontrack`
   - Filtered: seekers with active streak ≥3 days
   - Green status, celebration badges, top performers

5. **`CoachSeekersSearch.tsx`** → `/coaching/seekers-search`
   - Full search across name, email, phone, city
   - Advanced filters (program, status, join date)

### Group 2: Assessments (1 page)
6. **`CoachGenerateReports.tsx`** → `/coaching/generate-reports`
   - Select seeker → view their assessment history (Wheel of Life, LGT, FIRO-B)
   - Summary cards with scores, date taken
   - "Download PDF" button per assessment

### Group 3: Business Reviews (4 pages)
All query `business_profiles`, `business_swot_items`, `department_health` tables joined via seeker profiles.

7. **`CoachBusinesses.tsx`** → `/coaching/businesses`
   - List of all seekers' businesses with industry, team size, revenue range
   - Click to expand: VMV, departments overview

8. **`CoachSwotReviews.tsx`** → `/coaching/swot-reviews`
   - Select seeker → view their SWOT in 4-quadrant layout
   - Coach can add notes/action plans per item

9. **`CoachDeptHealth.tsx`** → `/coaching/dept-health`
   - Radar chart of 8 departments per seeker business
   - Color-coded health scores, month-over-month trends

10. **`CoachBusinessNotes.tsx`** → `/coaching/business-notes`
    - Timestamped notes per seeker's business
    - Add/edit notes with dimension tags

### Group 4: Messages (3 pages)
11. **`CoachMessages.tsx`** → `/coaching/messages`
    - Conversation list (sidebar) + message thread (main area)
    - Uses `useDbMessages` + `useSendMessage` hooks
    - Real-time via existing Supabase channel

12. **`CoachTemplates.tsx`** → `/coaching/templates`
    - Pre-written message templates (session reminder, worksheet nudge, motivation, etc.)
    - Click to copy, edit, or send to selected seekers

13. **`CoachAnnouncements.tsx`** → `/coaching/announcements`
    - Create announcement with audience targeting (all/program-specific)
    - View past announcements with read counts

### Group 5: Reports (4 pages)
14. **`CoachEngagement.tsx`** → `/coaching/engagement`
    - Worksheet completion rates, session attendance, assignment stats
    - Bar/line charts using Recharts

15. **`CoachProgressReport.tsx`** → `/coaching/progress-report`
    - Per-seeker LGT dimension trends over time
    - Comparison table across all seekers

16. **`CoachArthaProgress.tsx`** → `/coaching/artha-progress`
    - Business health dashboard across all seekers
    - Department scores aggregated, SWOT completion status

17. **`CoachExport.tsx`** → `/coaching/export`
    - Export options: Seekers CSV, Worksheets CSV, Sessions CSV
    - Date range picker, download buttons

### Group 6: Settings (1 page)
18. **`CoachSettings.tsx`** → `/coaching/settings`
    - Profile info (read-only from auth store)
    - Notification preferences toggles
    - Language preference, theme toggle
    - WhatsApp number, bio text

## Technical Approach
- Each page: standalone `.tsx` in `src/pages/coaching/`
- Import in `App.tsx`, replace `<P />` with actual component
- Use existing hooks (`useSeekerProfiles`, `useDbSessions`, `useDbAssignments`, `useDbMessages`)
- Direct Supabase queries for business tables (`business_profiles`, `business_swot_items`, `department_health`)
- Follow existing styling: `bg-card rounded-xl border border-border`, saffron accent, Lucide icons
- No database changes, no deleted code, no style changes

## Files Changed
- **18 new files** in `src/pages/coaching/`
- **1 edited**: `src/App.tsx` (replace `<P />` imports with real components)
