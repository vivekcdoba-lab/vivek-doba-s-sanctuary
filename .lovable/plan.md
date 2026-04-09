

## Plan: Show Welcome Tour Only First 2 Visits

### Change
Modify `OnboardingTour.tsx` to use a **counter** instead of a boolean flag in localStorage. The tour shows on the first 2 visits, then never again.

### File: `src/components/OnboardingTour.tsx`

1. **Change `STORAGE_KEY` value storage from `'true'` to a number count**
   - On mount: read count from localStorage. If count < 2, show the tour. Otherwise, hide it.
   - On `finish()`: increment the count and save it back (e.g., `'1'` → `'2'`).

2. **Logic update in the `useEffect`** (line 64-76):
   - Read `localStorage.getItem(STORAGE_KEY)` → parse as integer (default 0)
   - If count < 2: show tour after 800ms delay
   - If count >= 2: do not show

3. **Logic update in `finish()`** (line 116-119):
   - Read current count, increment by 1, save back to localStorage

This is a single-file change with no other dependencies.

