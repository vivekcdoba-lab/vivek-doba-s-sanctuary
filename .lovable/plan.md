# 🌅 5-Month CEO Transformation Seed (Jan 1 – May 31, 2026)

**Seeker**: Chandrakant Wanare (`crwanare@gmail.com` · `0c0ada4d…270efa`)
**Coach (verifier)**: Coach Vivek Doba (`coachviveklgt@gmail.com` · `d1bbd4c2…3bdc b1`)
**Persona**: CEO of a startup, 6-month BHAG → enter **Fortune Global 500**

Coach link ✅, 21 coach-tagged sessions ✅, 148 worksheets ✅ already exist. This plan **adds** the missing pillar content + coach review trail and fills gaps — nothing is deleted.

---

## 1️⃣ MY JOURNEY → Daily Practice (top-up only)

Existing: 148 worksheets, 169 assignments. Will **add**:

| Table | What | Volume |
|---|---|---|
| `daily_worksheets` | Backfill 3 missing days (target 151 days = full 5 months) with CEO-themed sankalp + gratitude + reflections | +3 |
| `daily_lgt_checkins` | Daily Dharma/Artha/Kama/Moksha 1-10 self-rating, with realistic "Down weeks 10-12" dip | 151 |
| `time_sheets` | Weekly CEO time-block log (deep work / team / family / sadhana) | 22 weeks |
| `daily_logs` | Daily CEO reflection — "biggest decision", "energy level", "win of the day" | 151 |
| `japa_log` | Morning mantra count (108 → 1008 progressing) | 151 |
| `streaks` | Reset/refresh current streak counters | 1 row |

---

## 2️⃣ MY JOURNEY → Assessments (+ coach verification)

Will **add** monthly cadence (5 instances each) and coach feedback for every one:

| Assessment | Existing | Add | Coach feedback |
|---|---|---|---|
| `wheel_of_life_assessments` | 3 | +2 (monthly) | ✅ via `coach_assessment_feedback` |
| `lgt_assessments` | 3 | +2 (monthly) | ✅ |
| `purusharthas_assessments` | 0 | +5 (monthly) | ✅ |
| `firo_b_assessments` | check & add 1 baseline + 1 mid + 1 final | +3 | ✅ |
| `mooch_assessments` | +3 (Jan / Mar / May) | +3 | ✅ |
| `happiness_assessments` | +3 | +3 | ✅ |
| `personal_swot_assessments` | +2 (Jan baseline, May final) | +2 | ✅ |
| `seeker_assessments` (generic Dharma/Kama/Moksha narratives) | +5 monthly | +5 | ✅ |
| `assessment_actions` | 30-Day Balance Challenge per assessment | ~25 | — |

Each `coach_assessment_feedback` row will include a CEO-tailored note (e.g. *"Artha rising → reinforce delegation; Kama dropped → schedule family Sankalp"*).

---

## 3️⃣ MY JOURNEY → Sessions (verification + extra detail)

21 sessions exist. Will **enrich** them (no new sessions) so the verification loop is complete:

- `session_notes`: insert coach-authored summary, breakthroughs, next-week assignments for all 21
- `session_topics`: tag each with pillar (Dharma/Artha/Kama/Moksha rotation, plus 4 Vishnu Protocol sessions on Fortune-500 roadmap)
- `session_signatures`: insert coach + seeker e-sign for all 21 (status = approved/completed)
- `session_audit_log`: trail of submitted → reviewed → approved
- `client_feedback`: post-session 1–5 ratings from seeker
- `sessions.status` → `completed`, `attendance='present'`, `engagement_score` 7–9 (dip to 5–6 in weeks 10–12 to match worksheet "Down" trend)

---

## 4️⃣ MY JOURNEY → Assignments (+ coach scoring)

169 assignments exist. Will:

- Ensure 100% have `status='completed'` for weeks 1-9 & 13-22, and `status='missed'` for weeks 10-12 (matching narrative)
- Add `score` (1–10) and `feedback` text from coach on every completed one (~155 rows)
- Insert ~12 new strategic CEO assignments: *"Draft Fortune-500 5-year financial model"*, *"Identify 3 strategic acquisitions"*, *"Define cultural OS"*, *"30-day investor pitch sprint"*, etc.
- `submissions` table: link submission artifacts + reviewer marks where applicable

---

## 5️⃣ PURUSHAARTH → DHARMA (Purpose)

Insert into `seeker_assessments` (type='dharma_*') + `assessment_actions`:

- **Mission statement**: *"Build a conscious-capitalism enterprise that uplifts 1M lives by 2031"*
- **Ikigai map**: Passion (technology), Mission (mass uplift), Vocation (CEO craft), Profession (deep-tech)
- **Core values** (5): Satya, Seva, Sankalp, Shraddha, Saatvik growth
- **Daily practices**: 5am sadhana, scripture reading 20 min, weekly satsang
- **Dharma journal entries**: 22 weekly reflections on alignment between values & decisions

---

## 6️⃣ PURUSHAARTH → ARTHA (Business)

Create the full Artha module dataset:

| Table | Content |
|---|---|
| `business_profiles` | Startup name, industry=Deep-tech SaaS, team_size growing 25→180, revenue_range step-up |
| `business_mission_vision` | Vision: "Fortune Global 500 by 2032"; Mission + Purpose |
| `business_values` | 6 prioritized values with emojis |
| `business_swot_items` | 5 S + 5 W + 5 O + 5 T (Fortune-500 lens) |
| `business_competitors` | 4 global competitors with threat-level + strategic notes |
| `accounting_records` | Monthly P&L stubs Jan→May |
| `cashflow_records` | Weekly inflow/outflow with runway extension story |
| `daily_financial_log` | 151 daily revenue/burn entries |
| `marketing_strategy` | Campaigns: brand authority, thought leadership, AR strategy |
| `sales_strategy` | Pipeline goals, ACV, enterprise motion |
| `branding_strategy` | Brand pillars aligned to Fortune-500 narrative |
| `department_health` | 8 departments scored monthly (engg, sales, marketing, ops, finance, HR, R&D, CX) |
| `team_members` | 12 key leaders with roles & reporting |
| `rnd_projects` | 4 R&D bets (AI moat, IP filing, infra, edge) |
| `clients` | 8 enterprise client logos in funnel |

---

## 7️⃣ PURUSHAARTH → KAMA (Relationships)

- `seeker_assessments` (type='kama_*'): family scorecard, social network audit, romance/partner reflection
- `assignments` (Kama-tagged): *"Weekly date night"*, *"Sunday family ritual"*, *"Mentor 1 founder/month"*
- `daily_logs` extended: relationship quality 1-10, "act of service done today"
- Goals: 4 quarterly relationship goals tracked across 5 months
- Dharma↔Kama balance reflection in 22 weekly worksheets

---

## 8️⃣ PURUSHAARTH → MOKSHA (Liberation)

- `seeker_assessments` (type='moksha_*'): consciousness self-rating, attachment audit, ego-watch entries
- `japa_log` already covered in §1
- Meditation goals: 21-min → 60-min progression across 5 months (in `assignments` + `daily_worksheets.meditation_minutes`)
- 22 weekly **Moksha Journal** entries via `seeker_assessments` (type='moksha_journal')
- `assessment_actions` for "Detachment Sprint" 30-day challenge

---

## 9️⃣ Coach Verification Layer (cross-cutting)

Every artifact above will have a verification trail:

| Artifact | Verifier mechanism |
|---|---|
| Assessments | `coach_assessment_feedback` row (note + status='reviewed') |
| Assignments | `assignments.score` + `assignments.feedback` set, `status='completed'` |
| Sessions | `session_signatures` (coach + seeker) + `session_notes.reviewed_by` + `session_audit_log` |
| Worksheets | `worksheet_notifications` "reviewed" + coach comment via `session_comments` (linked via daily worksheet ref) |
| Business module | `coach_seekers` already linked; coach notes inserted into `business_swot_items.action_plan` |
| Dharma/Kama/Moksha | `coach_assessment_feedback` per monthly entry |

---

## 🔟 Notifications & Points

- `notifications`: ~40 events to seeker (assessment ready, assignment graded, session approved, badge earned, monthly report)
- Mirror to coach + admin (~80 rows) — bell continuity per prior fix
- `points_ledger`: log Sampoorna points for every completed worksheet/assessment/session (≈ 4,500 points across 5 months)
- `seeker_badges`: award lifecycle badges (First Worksheet, 30-Day Streak, LGT Mastery, Artha Champion, Kama Anchor, Moksha Initiate, Fortune-500 Visionary)

---

## 📐 Data integrity guardrails (built into the seed)

1. All inserts use `ON CONFLICT … DO NOTHING` where unique keys exist
2. Down-trend weeks 10–12 (Mar 9 – Mar 29) consistently reflected across worksheets, sessions, assignments, check-ins
3. Coach `coach_id` populated on every coach-related row
4. All `seeker_id` rows belong only to Chandrakant — no cross-contamination
5. Existing 148 worksheets / 21 sessions / 169 assignments are **enriched**, not replaced

---

## 🚦 Execution order (after approval)

1. Top-up daily practice tables (worksheets, check-ins, time-sheets, japa, daily_logs)
2. Insert assessments (5 types × monthly cadence) + `assessment_actions`
3. Enrich sessions with notes/signatures/audit/feedback
4. Score & feedback all assignments + insert 12 strategic ones
5. Build full Artha business module (15 tables)
6. Insert Dharma / Kama / Moksha narrative content
7. Insert `coach_assessment_feedback` for every assessment
8. Award points + badges + notifications (3-way mirror)
9. Verify counts with a final SELECT report

Estimated insert volume: **~1,800 rows** across **~30 tables**, all idempotent.

---

**Approve to switch to default mode and execute steps 1 → 9 in order.** I'll post a final count-report once done.