

## Plan: Build 5 Remaining Assessment Experiences

Build full Take/Results/Action Plan/History experiences for Purusharthas, Happiness Index, MOOCH, FIRO-B, and Assessment History page. Each follows the same 4-tab pattern as Wheel of Life / LGT / SWOT.

### Database Migration (1 migration file, 4 new tables)

**1. `purusharthas_assessments`** — 4 pillar scores (dharma, artha, kama, moksha) rated 1-10 with sub-dimensions as JSONB. Validation trigger. RLS: seeker owns rows, admin via `is_admin()`.

**2. `happiness_assessments`** — 8 dimension scores (life_satisfaction, positive_emotions, engagement, relationships, meaning, accomplishment, health, gratitude) rated 1-10. Validation trigger. RLS same pattern.

**3. `mooch_assessments`** — 6 mind pattern scores (overthinking, negativity, comparison, fear, attachment, resistance) rated 1-10. Validation trigger. RLS same pattern.

**4. `firo_b_assessments`** — 6 dimension scores (expressed_inclusion, wanted_inclusion, expressed_control, wanted_control, expressed_affection, wanted_affection) each 0-9. Stores total_expressed, total_wanted. Validation trigger. RLS same pattern.

### Files Created (28 new files)

**Purusharthas (6 files)**
- `src/components/purusharthas-assessment/purusharthasData.ts` — 4 pillar definitions with sub-dimensions, questions, scoring helpers
- `src/hooks/usePurusharthasAssessment.ts` — React Query hook (same pattern as useLgtAssessment)
- `src/components/purusharthas-assessment/PurusharthasTakeAssessment.tsx` — 4 pillars with sub-dimension sliders
- `src/components/purusharthas-assessment/PurusharthasResults.tsx` — Radar + bar + pie charts, balance analysis
- `src/components/purusharthas-assessment/PurusharthasActionPlan.tsx` — Priority matrix with per-pillar recommendations
- `src/components/purusharthas-assessment/PurusharthasHistory.tsx` — Trend line chart + history table
- `src/components/purusharthas-assessment/PurusharthasFullExperience.tsx` — 4-tab orchestrator

**Happiness Index (6 files)**
- `src/components/happiness-assessment/happinessData.ts` — 8 PERMA+ dimensions, questions, scoring helpers
- `src/hooks/useHappinessAssessment.ts`
- `src/components/happiness-assessment/HappinessTakeAssessment.tsx` — 8 dimension sliders
- `src/components/happiness-assessment/HappinessResults.tsx` — Radar, bar, pie charts
- `src/components/happiness-assessment/HappinessActionPlan.tsx`
- `src/components/happiness-assessment/HappinessHistory.tsx`
- `src/components/happiness-assessment/HappinessFullExperience.tsx`

**MOOCH Mind Patterns (6 files)**
- `src/components/mooch-assessment/moochData.ts` — 6 mind patterns (scored inversely: lower is better for patterns like overthinking)
- `src/hooks/useMoochAssessment.ts`
- `src/components/mooch-assessment/MoochTakeAssessment.tsx` — 6 pattern sliders with awareness prompts
- `src/components/mooch-assessment/MoochResults.tsx` — Charts showing pattern intensity
- `src/components/mooch-assessment/MoochActionPlan.tsx` — Transformation strategies per pattern
- `src/components/mooch-assessment/MoochHistory.tsx`
- `src/components/mooch-assessment/MoochFullExperience.tsx`

**FIRO-B Interpersonal (6 files)**
- `src/components/firo-b-assessment/firoBData.ts` — 6 dimensions (eI/wI/eC/wC/eA/wA), 54 questions, analysis helpers
- `src/hooks/useFiroBAssessment.ts`
- `src/components/firo-b-assessment/FiroBTakeAssessment.tsx` — Section-by-section 54-question flow (reuses existing FIRO-B questions from `FIROBAssessment.tsx`)
- `src/components/firo-b-assessment/FiroBResults.tsx` — Bar chart, expressed vs wanted comparison, personalized analysis
- `src/components/firo-b-assessment/FiroBActionPlan.tsx` — Interpersonal growth recommendations
- `src/components/firo-b-assessment/FiroBHistory.tsx`
- `src/components/firo-b-assessment/FiroBFullExperience.tsx`

**Assessment History (1 file - rewrite)**
- `src/pages/seeker/assessments/AssessmentHistoryPage.tsx` — Aggregates data from all assessment tables, shows:
  - Summary cards (total assessments, types taken, latest date)
  - Timeline view of all assessments across types
  - Comparison chart of average scores over time per type
  - Filter by assessment type

### Files Modified (4 files)

- `src/pages/seeker/assessments/PurusharthasPage.tsx` — Replace placeholder with PurusharthasFullExperience
- `src/pages/seeker/assessments/HappinessPage.tsx` — Replace placeholder with HappinessFullExperience
- `src/pages/seeker/assessments/MoochPage.tsx` — Replace placeholder with MoochFullExperience
- `src/pages/seeker/assessments/FiroBPage.tsx` — Replace placeholder with FiroBFullExperience

### No Deletions
All existing code, routes, and components remain untouched. Only placeholder page contents are replaced with full experiences.

### Technical Notes
- Note: Purusharthas differs from LGT in that it includes sub-dimensions within each pillar (e.g., Dharma has Values, Ethics, Service sub-scores), making it a deeper assessment vs LGT's quick check
- FIRO-B reuses the existing 54-question bank from `FIROBAssessment.tsx` but stores results in the new seeker-owned table (the existing component was coach-facing)
- MOOCH uses inverse scoring display — high scores = strong pattern = needs attention (red), unlike other assessments where high = good
- Assessment History page queries all 5+ assessment tables to build a unified timeline

