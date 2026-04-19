
Add delete capability to the Applications page. Each submission card needs a Delete button (with confirmation) that removes the row from the `submissions` table.

Looking at `ApplicationsPage.tsx`: cards already have Approve / Reject / Request Info actions. I'll add a Delete button alongside them, available for ALL statuses (not just pending) since admins should be able to clean up old approved/rejected entries too.

## Plan

### 1. Update `src/pages/admin/ApplicationsPage.tsx`
- Add `Trash2` icon import from lucide-react
- Add a `handleDelete(id, name)` function that:
  - Shows a `window.confirm("Delete application from {name}? This cannot be undone.")` dialog
  - On confirm, calls `supabase.from('submissions').delete().eq('id', id)`
  - Shows success/error toast
  - Realtime subscription already auto-refreshes the list
- Render a Delete button:
  - Always visible in the expanded card (regardless of status), placed at the right side of the action row
  - Style: ghost/outline with destructive color (`text-destructive border-destructive/30 hover:bg-destructive/10`)
  - Icon + "Delete" label
- Also add a small Delete icon-button on the collapsed card header (top-right next to chevron) for quick removal without expanding — uses `e.stopPropagation()` so it doesn't toggle expand

### 2. RLS check
The `submissions` table already allows admin DELETE (admins have full access via `is_admin()` policies used elsewhere). No DB migration needed — if the policy is missing, the delete will fail with a clear toast and we'll add a migration in the implementation step.

### Files changed
- `src/pages/admin/ApplicationsPage.tsx` — add delete handler + 2 delete buttons

Nothing else touched. Existing approve/reject/info-request flows untouched.
