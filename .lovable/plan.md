

## Plan: Hide "My Assessments" from Navigation

Comment out (preserve for future) the "My Assessments" nav item and route, keeping all other assessment sub-pages intact.

### Files Modified

**`src/components/SeekerLayout.tsx`** (line 43)
- Comment out the `{ icon: BarChart3, label: 'My Assessments', path: '/seeker/assessments' }` nav item

**`src/App.tsx`** (line 325)
- Comment out the `<Route path="/seeker/assessments" element={<SeekerAssessments />} />` route
- Keep the import (commented) so it can be restored easily

### No Deletions
The `SeekerAssessments` page file and all its code remain untouched. Only the nav link and route are commented out.

