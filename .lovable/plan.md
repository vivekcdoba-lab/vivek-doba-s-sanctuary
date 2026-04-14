

## Plan: Fix 8 Seeker Bugs

### Issue 1: Tour Popup Shows Repeatedly
**Problem**: Tour shows on first 2 visits (localStorage counter < 2), but some tour steps target elements that don't exist (`worksheet`, `session-progress`, `bottom-nav`), causing broken positioning.
**Fix**:
- Change tour to show only once (`count < 1` instead of `count < 2`)
- Remove tour steps referencing non-existent `data-tour` targets (`worksheet`, `session-progress`, `bottom-nav`)
- Add a "Replay Tour" button in SeekerHome settings or profile (stores `forceShow` state)
- File: `src/components/OnboardingTour.tsx`

### Issue 2: Delete Slots in 24-Hour Sacred Timesheet
**Problem**: No way to clear/delete individual time slots once filled.
**Fix**:
- Add a small `X` (clear) button on each filled time slot row
- Clicking clears that slot's activity, pillar, energy, notes back to empty
- No confirmation needed (it's just clearing a field, not deleting DB data — auto-save handles persistence)
- File: `src/pages/seeker/DailyWorksheet.tsx`

### Issue 3: Templates Not Reflecting
**Problem**: `applyTemplate()` at line 143 only shows a toast — it doesn't actually populate time slots. It's a stub.
**Fix**:
- Define template data for each of the 8 templates (mapping time ranges to activities and pillars)
- Call `bulkFillSlots` from `useWorksheet` for each template's time blocks when a template is selected
- Show "Template Applied" toast with the count of slots filled
- Files: `src/pages/seeker/DailyWorksheet.tsx`, `src/data/worksheetData.ts` (add template definitions)

### Issue 4: Copy Yesterday Not Working
**Problem**: The `copyYesterday` function in `useWorksheet.ts` looks correct — it queries yesterday's slots and copies them. Likely issue: it only copies time slots but doesn't save them, so if the user navigates away before auto-save (2 min), data is lost. Also, if no worksheet exists for today yet, the copied slots are in-memory only.
**Fix**:
- After copying yesterday's slots into state, trigger an immediate save (draft) so data persists
- Handle the case where yesterday has no worksheet with a clearer message
- Show success toast with slot count: "Copied 28 slots from yesterday!"
- File: `src/hooks/useWorksheet.ts`

### Issue 5: My Tasks — Assignment Visibility
**Problem**: `SeekerTasksEnhanced` queries assignments correctly from DB. If admin-created assignments aren't showing, it's likely because `useDbAssignments` on the home page and `SeekerTasksEnhanced` use different query keys, causing stale cache. Also, no real-time notification when new assignments arrive.
**Fix**:
- Add `refetchOnWindowFocus: true` to the assignments query in `SeekerTasksEnhanced`
- Invalidate `seeker-assignments` query key when navigating to the tasks page (or use `staleTime: 0`)
- File: `src/pages/seeker/SeekerTasksEnhanced.tsx`

### Issue 6: Growth — Self-Assessment Not Working
**Problem**: The "Take Self-Assessment" button at line 216 of `SeekerGrowth.tsx` links to `/seeker/assessments` — the route we commented out.
**Fix**:
- Change the link from `/seeker/assessments` to `/seeker/assessments/history` (the active assessment hub)
- File: `src/pages/seeker/SeekerGrowth.tsx`

### Issue 7: Home — LGT Balance Wheel Shows Zero
**Problem**: The query for `lgt_assessments` returns assessment scores (1-10), multiplied by 10 for percentage. If no assessment exists, scores default to `{ dharma: 0, artha: 0, kama: 0, moksha: 0 }`. The LGT Balance Wheel shows all zeros. Additionally, the daily worksheet also stores `dharma_score`, `artha_score`, etc. — these should be used as fallback.
**Fix**:
- If no LGT assessment exists, fall back to the latest submitted daily worksheet's LGT scores (multiplied by 10)
- If neither exists, show a prompt "Take your first assessment" instead of zeros
- File: `src/pages/seeker/SeekerHome.tsx`, `src/components/dashboard/LGTBalanceWheel.tsx`

### Issue 8: Home — "Today Pending" After Submit
**Problem**: After submitting the worksheet on `/seeker/worksheet`, the user navigates back to `/seeker/home`. The `worksheet-today` query is cached and still shows `null` (pending). React Query's default `staleTime` means the old result persists.
**Fix**:
- Add `staleTime: 0` and `refetchOnWindowFocus: true` to the `worksheet-today` query in `SeekerHome.tsx`
- In `useWorksheet.ts`, after successful submit, invalidate the `worksheet-today` query globally using `queryClient`
- File: `src/pages/seeker/SeekerHome.tsx`, `src/hooks/useWorksheet.ts`

---

### Files Modified
1. `src/components/OnboardingTour.tsx` — Fix tour steps, show once
2. `src/pages/seeker/DailyWorksheet.tsx` — Add slot delete button, implement real template application
3. `src/data/worksheetData.ts` — Add template slot definitions
4. `src/hooks/useWorksheet.ts` — Fix copyYesterday to auto-save, invalidate worksheet-today on submit
5. `src/pages/seeker/SeekerTasksEnhanced.tsx` — Add refetchOnWindowFocus
6. `src/pages/seeker/SeekerGrowth.tsx` — Fix assessment link
7. `src/pages/seeker/SeekerHome.tsx` — Add staleTime/refetch for worksheet status, fallback LGT from worksheets
8. `src/components/dashboard/LGTBalanceWheel.tsx` — Show empty state when all scores are 0

