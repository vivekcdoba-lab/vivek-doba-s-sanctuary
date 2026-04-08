
# VDTS Platform — Production-Ready Enhancements

## Phase A (This Session) — High-Impact, Core Functionality

### 1. Sessions Page — Migrate from Mock to Supabase
- Replace `SESSIONS`/`SEEKERS`/`COURSES` mock imports with Supabase hooks
- All CRUD (create, start, complete, mark missed) saves to database
- Seeker names resolved from `profiles` table

### 2. Daily Worksheet Enhancements
- Add rotating motivational quotes from Ramayana/Gita (daily rotation based on date)
- Add weekly summary view (7-day completion chart)
- Add PDF export of worksheet data

### 3. Sound System Enhancements
- Add sleep timer (15min, 30min, 1hr, continuous)
- Remember last played sound preference via Zustand persist
- Sound already persists across navigation via global store ✅

### 4. Assessment Engine Enhancements
- Save Wheel of Life scores to `seeker_assessments` table
- Show assessment history over time (line chart of past scores)
- Add progress indicator during assessment

### 5. CRM Enhancements
- Add search/filter bar (by name, status, source, priority)
- Add notes editing inline on each lead card

### 6. Dashboard Polish
- Admin: Add recent activity feed (last 5 worksheet submissions, session completions)
- Seeker: Add "next assessment due" indicator

## Phase B (Next Session) — Advanced Features
- PDF report generation for assessments
- CSV bulk import for leads
- Coach view of seeker worksheet history
- Admin assessment question editor
- Session calendar view (already exists in CalendarPage)
- Session reminders UI
