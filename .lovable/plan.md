

## Plan: LGT Dimension Score Full Assessment Experience

Build a complete LGT (Life's Golden Triangle / Purushaarth) assessment with the same 4-tab pattern as Wheel of Life: Take → Results → Action Plan → History. The 4 dimensions are Dharma (Purpose), Artha (Wealth), Kama (Desires), Moksha (Liberation).

### Database Migration

Create `lgt_assessments` table:
- `id` UUID PK
- `seeker_id` UUID NOT NULL (references profiles, ON DELETE CASCADE)
- `dharma_score` INT NOT NULL (1-10)
- `artha_score` INT NOT NULL (1-10)
- `kama_score` INT NOT NULL (1-10)
- `moksha_score` INT NOT NULL (1-10)
- `average_score` NUMERIC
- `notes` JSONB DEFAULT '{}'
- `created_at` TIMESTAMPTZ DEFAULT now()
- Validation trigger ensuring scores are 1-10
- RLS: seekers manage own rows, admins manage all via `is_admin()`

### Files Created

**1. `src/components/lgt-assessment/lgtData.ts`**
- 4 dimension definitions (id, name, emoji, color, hindi, description, guiding questions)
- Score zone helpers (`getScoreZone`, `getBalanceMessage`) adapted for LGT context
- Per-dimension action recommendations for low/medium/high scores
- Danger messages per dimension

**2. `src/hooks/useLgtAssessment.ts`**
- React Query hook mirroring `useWheelOfLife` pattern
- `history` query from `lgt_assessments`
- `saveAssessment` mutation (calculates average, inserts row)
- `actions` query from `assessment_actions` where `assessment_type = 'lgt'`
- `saveAction` / `toggleAction` mutations

**3. `src/components/lgt-assessment/LgtTakeAssessment.tsx`**
- 4 dimension input cards with sliders (1-10), notes toggle
- Live average score display
- Progress indicator for all 4 dimensions
- "Calculate My LGT Balance" submit button

**4. `src/components/lgt-assessment/LgtResults.tsx`**
- Overall balance score card
- Danger zones section for scores ≤ 4
- Radar chart (4-axis) and bar chart via Recharts
- Pie chart for score distribution (danger/warning/thriving)
- Balance analysis (highest, lowest, gap, variance)
- Top strengths & growth areas

**5. `src/components/lgt-assessment/LgtActionPlan.tsx`**
- Priority matrix: Fix First (1-4), Improve (5-6), Maintain (7-10)
- Per-dimension action recommendations
- 30-Day Challenge focused on lowest dimension
- Saved action items with checkboxes from `assessment_actions`

**6. `src/components/lgt-assessment/LgtHistory.tsx`**
- Summary cards (total, latest score, overall change)
- Line chart showing score trends over time
- History table with date, average, highest, lowest, view button

**7. `src/components/lgt-assessment/LgtFullExperience.tsx`**
- Main orchestrator with 4 tabs (Take/Results/Action Plan/History)
- Same state management pattern as `WheelOfLifeFullExperience.tsx`

### Files Modified

**`src/pages/seeker/assessments/LgtAssessmentPage.tsx`**
- Replace placeholder with full experience component (same pattern as SwotAssessmentPage)

### No Deletions
All existing code remains untouched. Only the LgtAssessmentPage content changes from placeholder to full experience.

