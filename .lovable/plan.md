
## Change
Remove the **Role** column from the coaches table at `/admin/coaches`.

## File
`src/pages/admin/AdminCoaches.tsx`

## Edits
1. Delete the `<TableHead>Role</TableHead>` header cell.
2. Delete the matching `<TableCell>` that renders the role `<Badge>`.
3. Update the empty-state row `colSpan={7}` → `colSpan={6}`.

No other logic, styling, or data fetching changes.

## Verification
- `/admin/coaches` table shows: Coach, Email, City, Status, Joined, Actions (6 columns).
- Empty state spans full width.
- All coaches still listed (including dual-role admins via `is_also_coach`).
