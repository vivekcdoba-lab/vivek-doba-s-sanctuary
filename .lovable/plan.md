

## Plan: SWOT Analysis Full Assessment Experience

Build a complete SWOT personal assessment following the same 4-tab pattern as Wheel of Life (Take → Results → Action Plan → History), with dedicated data/hook files and a new database table.

### Database Migration

Create `personal_swot_assessments` table:
- `id` UUID PK
- `seeker_id` UUID NOT NULL (references profiles)
- `strengths` JSONB DEFAULT '[]' — array of {text, importance (1-5), category}
- `weaknesses` JSONB DEFAULT '[]'
- `opportunities` JSONB DEFAULT '[]'  
- `threats` JSONB DEFAULT '[]'
- `overall_notes` TEXT
- `strength_count` INT, `weakness_count` INT, `opportunity_count` INT, `threat_count` INT
- `balance_score` NUMERIC — calculated ratio metric
- `created_at` TIMESTAMPTZ DEFAULT now()

RLS: seekers manage own rows, admins manage all via `is_admin()`.

### Files Created

**1. `src/components/swot-assessment/swotData.ts`**
- SWOT quadrant definitions (name, emoji, color, description, guiding questions)
- Category suggestions per quadrant (e.g., for Strengths: Skills, Knowledge, Resources, Character)
- Action recommendations based on SWOT analysis patterns
- Helper functions: `getSwotBalance()`, `getQuadrantHealth()`

**2. `src/hooks/useSwotAssessment.ts`**
- React Query hook mirroring `useWheelOfLife` pattern
- `history` query from `personal_swot_assessments`
- `saveAssessment` mutation
- `actions` query from `assessment_actions` where type='swot'
- `saveAction` / `toggleAction` mutations

**3. `src/components/swot-assessment/SwotTakeAssessment.tsx`**
- 4 quadrant input cards (Strengths/Weaknesses/Opportunities/Threats)
- Each quadrant: add items with text + importance (1-5) + optional category tag
- Live item count display per quadrant
- Guiding questions to help seekers think
- Submit button to analyze

**4. `src/components/swot-assessment/SwotResults.tsx`**
- Recharts BarChart showing item counts per quadrant
- Recharts PieChart showing importance-weighted distribution
- Balance analysis: internal (S vs W) and external (O vs T) ratios
- Key insights auto-generated from the data
- Comparison with previous assessment if available

**5. `src/components/swot-assessment/SwotActionPlan.tsx`**
- Priority matrix: "Leverage" (S+O), "Defend" (S+T), "Improve" (W+O), "Mitigate" (W+T)
- Auto-generated strategic recommendations
- Saveable action items to `assessment_actions` table
- Toggleable completion checkboxes

**6. `src/components/swot-assessment/SwotHistory.tsx`**
- List of past SWOT assessments with date and counts
- Trend chart showing quadrant counts over time
- View details loads a past assessment into Results tab

**7. `src/components/swot-assessment/SwotFullExperience.tsx`**
- Main orchestrator with 4 tabs (Take/Results/Action Plan/History)
- Same structure as `WheelOfLifeFullExperience.tsx`

### Files Modified

**`src/pages/seeker/assessments/SwotAssessmentPage.tsx`**
- Replace placeholder with the full experience component (same pattern as WheelOfLifePage)

### No Deletions
All existing code, routes, and components remain untouched. Only the SwotAssessmentPage content changes from placeholder to full experience.

