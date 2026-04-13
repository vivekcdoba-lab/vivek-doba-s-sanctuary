

## Plan: Move "My Progress Over Time" to Assessment History Page

### What Changes

1. **Remove** the "My Progress Over Time" table (lines 559-586) from `src/pages/seeker/SeekerAssessments.tsx` and the `PROGRESS_TABLE` data (lines 109-114).

2. **Add** the same progress table to `src/pages/seeker/assessments/AssessmentHistoryPage.tsx`, placed after the timeline section (before the closing `</div>`).

### Files Modified

- `src/pages/seeker/SeekerAssessments.tsx` — Remove `PROGRESS_TABLE` constant and the progress table JSX block
- `src/pages/seeker/assessments/AssessmentHistoryPage.tsx` — Add `PROGRESS_TABLE` constant and render the progress table card after the timeline

### No Deletions of Pages/Routes/Components
Only moving a UI section from one page to another.

