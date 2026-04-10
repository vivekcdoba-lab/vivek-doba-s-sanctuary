

## Plan: Build Assessment History Page

### Overview
Create `src/pages/seeker/SeekerAssessmentHistory.tsx` — a page listing all past assessments with comparison, trend charts, detail modals, and PDF export. Wire it into App.tsx.

### Data

Uses `seeker_assessments` table (columns: id, type, scores_json, analysis_text, notes, period, created_at, seeker_id). No migration needed — existing hook `useAssessmentHistory` fetches by type; we'll query all types at once with a new inline query.

### File 1: `src/pages/seeker/SeekerAssessmentHistory.tsx` (new)

**Data fetching:**
- `useAuthStore` for profile
- Single `useQuery` fetching all `seeker_assessments` where `seeker_id = profile.id`, ordered by `created_at desc`
- Group results by `type` using `useMemo`

**Sections:**

1. **Header** — BackToHome, title "Assessment History", subtitle with total count

2. **Assessment Type Tabs** — All | Wheel of Life | LGT | FIRO-B | Other. Filter the list by type.

3. **Score Trend Mini Charts** — For each assessment type with 2+ entries, a small `LineChart` (recharts) showing score over time. Displayed in a horizontal scrollable row of cards.

4. **Assessment Cards Grid** — Each card shows:
   - Type badge (color-coded)
   - Date taken (formatted)
   - Overall score with color badge (green >70, yellow 50-70, red <50)
   - Quick pillar/category breakdown from `scores_json`
   - "View Details" button → opens detail modal
   - "Retake" button → links to `/seeker/assessments`
   - Checkbox for comparison selection

5. **Comparison Mode** — When 2 cards are checked, a "Compare" button appears. Opens a side-by-side modal with:
   - Two-column layout showing scores
   - Green arrows for improvements, red for declines
   - Delta values for each metric

6. **Detail Modal** (Dialog) — Full breakdown: all scores from `scores_json`, `analysis_text`, `notes` (coach notes), date, period.

7. **PDF Export** — Button using jsPDF to generate a report with assessment scores, date, analysis text.

**Styling:**
- Card grid (`grid-cols-1 md:grid-cols-2`), `rounded-2xl`, saffron accents
- Score badges: green/yellow/red based on thresholds
- Lucide icons: ScrollText, TrendingUp, Download, GitCompare
- Matches SeekerBadges.tsx patterns (useAuthStore, BackToHome, card layout)

### File 2: `src/App.tsx` (edit)

- Add import for `SeekerAssessmentHistory`
- Replace `<P />` at `/seeker/assessment-history` with `<SeekerAssessmentHistory />`

### Technical Notes
- No migration needed — reads existing `seeker_assessments` table
- Score extraction logic adapts to different `scores_json` shapes per type (WoL: array of 9, LGT: object with sectionScores, FIRO-B: object with dimensions)
- Comparison normalizes scores to percentages for cross-type display

