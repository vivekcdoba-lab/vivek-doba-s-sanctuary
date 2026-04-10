

## Plan: Build Streaks Dashboard Page

### Overview
Create `src/pages/seeker/SeekerStreaks.tsx` with a full streaks dashboard and wire it into `App.tsx` replacing the placeholder route.

### File 1: `src/pages/seeker/SeekerStreaks.tsx` (new)

**Data fetching:**
- `useStreakCount(profile.id)` for current streak
- `useQuery` on `daily_worksheets` table (same pattern as `SeekerWorksheetHistory`) to get all submissions
- Derive: best streak, total days logged, monthly consistency %, last 90 days heatmap data, milestone progress

**Sections:**

1. **Hero** — Large streak number with 🔥, status message based on streak count, next milestone countdown (7/21/40/108 thresholds)

2. **Streak Heatmap Calendar** — Last 90 days grid (like `StreakHeatmap.tsx` but enhanced with completion % color intensity). Hover tooltip with date + stats.

3. **Milestones** — 4 cards: 7-day 🌱, 21-day 🌳, 40-day Mandala 🕉️, 108-day 👑. Earned/locked styling matching `SeekerBadges.tsx`. Progress ring showing % toward next milestone.

4. **Statistics Cards** — 4-card grid: Longest streak, Total days logged, This month's consistency %, Average completion (computed from worksheet data).

5. **Streak Recovery** — Shown only when streak is 0. Encouraging message, Bhagavad Gita quote, "Restart your journey" link to daily worksheet page.

6. **Celebration** — Trigger `Celebration` component when a new milestone is detected (compare current streak against milestones, use `sessionStorage` to avoid repeat triggers).

**Styling:** Saffron/gold gradients, `gradient-sacred` header, `rounded-2xl` cards, Lucide icons (Flame, Trophy, Target, TrendingUp), animated pulse on flame icon for active streaks.

### File 2: `src/App.tsx` (edit)

- Add import: `import SeekerStreaks from "./pages/seeker/SeekerStreaks";`
- Replace `<Route path="/seeker/streaks" element={<P />} />` with `<Route path="/seeker/streaks" element={<SeekerStreaks />} />`

### Technical Notes
- All data from existing `daily_worksheets` table — no migration needed
- Reuses `useStreakCount` hook, `Celebration` component, `BackToHome`, `useAuthStore`
- Mobile responsive: hero stacks vertically, stats grid goes 2-col on mobile, heatmap scrolls horizontally

