

## Plan: Build Seeker Leaderboard Page

### 1. Database Migration

**Add `leaderboard_visible` column to profiles:**
```sql
ALTER TABLE public.profiles ADD COLUMN leaderboard_visible boolean NOT NULL DEFAULT true;
```

**Create a SECURITY DEFINER function `get_leaderboard_data`** that computes rankings server-side and returns only aggregated, privacy-safe data (first name + last initial). This avoids exposing individual worksheet/badge data across seekers.

The function will:
- Accept parameters: `_period` (text: 'week', 'month', 'all_time', 'batch'), `_course_id` (uuid, nullable), `_city` (text, nullable)
- Query `profiles` WHERE `role='seeker'` AND `leaderboard_visible=true`
- For each seeker, calculate:
  - Worksheet points: count of submitted worksheets × 10 + full completion (100%) × 5
  - Streak points: current streak × 2
  - Badge points: count of seeker_badges × 15
  - Session points: count of sessions with attendance='present' × 25
- Filter by period (week/month/all_time/batch based on `created_at`)
- Filter by course (via enrollments join) and city
- Return: rank, display_name (privacy-masked), avatar_url, total_points, streak_days, badge_count, profile_id

### 2. New Page: `src/pages/seeker/SeekerLeaderboard.tsx`

**Tabs:** Weekly | Monthly | All-Time | My Batch

**Sections:**
- **Point System Card** — explains Sampoorna Points breakdown
- **Podium** — Top 3 with trophy emojis (🥇🥈🥉), crown for #1
- **Rankings Table** — remaining ranks with user's own row highlighted
- **"Rising Star"** — biggest point gainer this week (derived from data)
- **Motivational bar** — "X points to reach next rank"
- **Filters** — Course dropdown, City dropdown
- **Privacy toggle** — updates `profiles.leaderboard_visible`

**Patterns:** useAuthStore, useQuery with RPC call, BackToHome, saffron/gold styling, Card components, Tabs component.

### 3. Route Update: `src/App.tsx`

Replace `<P />` at `/seeker/leaderboard` with `<SeekerLeaderboard />`.

### Files Changed

| File | Change |
|------|--------|
| Migration SQL | Add `leaderboard_visible` column, create `get_leaderboard_data` RPC function |
| `src/pages/seeker/SeekerLeaderboard.tsx` | New page with full leaderboard UI |
| `src/App.tsx` | Import + route swap |

