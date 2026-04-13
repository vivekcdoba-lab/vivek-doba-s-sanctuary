

## Plan: Fix Seeker Home Gaps and Bugs

After end-to-end testing of `/seeker/home`, here are the bugs and gaps found, with fixes:

### Bug 1: Duplicate Affirmation Sections
**Problem**: Two affirmation blocks render — `DailyAffirmationWidget` (DB-powered, lines 82-83) AND a hardcoded "Today's Affirmation" fallback (lines 85-95). Both always show, causing visual redundancy.
**Fix**: Remove the hardcoded fallback block (lines 85-95) from `SeekerHome.tsx`. The `DailyAffirmationWidget` already handles empty state internally.

### Bug 2: Quick Action "Assessment" Links to Hidden Route
**Problem**: `QuickActionsBar.tsx` links to `/seeker/assessments` (line 6), but that route was commented out. Clicking leads to 404.
**Fix**: Change the Assessment quick action path from `/seeker/assessments` to `/seeker/assessments/history` (the assessment history page that is still active).

### Bug 3: Hardcoded Points & Level
**Problem**: `PointsCard` receives `points={1250} level={2}` — hardcoded values, not from DB.
**Fix**: For now, this is acceptable as a placeholder (no points table exists yet). Add a comment marking it as TODO. No code change needed unless user wants a points system built.

### Bug 4: Hardcoded LGT Scores
**Problem**: `lgtScores` on line 39 are mock values `{ dharma: 72, artha: 45, kama: 68, moksha: 55 }`, not from DB.
**Fix**: Query the latest `lgt_assessments` record for the seeker and use those scores. Fall back to the mock values if no assessment exists.

### Bug 5: WorksheetStatusCard Always Shows "Pending"
**Problem**: `hasFilledToday={false}` is hardcoded. Even if the seeker filled their worksheet today, it shows "Pending".
**Fix**: Query the `daily_worksheets` table to check if a record exists for today's date for this seeker, and pass the real value.

### Bug 6: Journey Progress Shows "Day 0/1"
**Problem**: `totalSessions` uses `sessions.length || 1`, so when there's 1 session and 0 completed, it shows "0/1" which looks odd. With no sessions it shows "0/1".
**Fix**: Use a minimum of 24 for the total (matching the journey page logic) so progress shows "Day 0/24" which is more meaningful: `const totalSessions = Math.max(sessions.length, 24)`.

---

### Files Modified

**`src/pages/seeker/SeekerHome.tsx`**
- Remove duplicate hardcoded affirmation block (lines 85-95)
- Query `lgt_assessments` for real LGT scores (replace line 39)
- Query `daily_worksheets` for today's worksheet status (replace `hasFilledToday={false}`)
- Fix `totalSessions` to use `Math.max(sessions.length, 24)`

**`src/components/dashboard/QuickActionsBar.tsx`**
- Change Assessment path from `/seeker/assessments` to `/seeker/assessments/history`

### No Deletions
No files or routes are removed. Only fixing data sources and removing a duplicate UI block.

