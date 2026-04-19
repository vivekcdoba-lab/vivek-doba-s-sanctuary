
User wants:
1. Edit button functional on `/admin/search-users` (from previous plan)
2. Delete capability — but ONLY for seekers (not admin/coach)
3. Admin and coach can have an "end date" field added (presumably to mark when their access ends)

Need to check: profiles table has end_date? Likely no. Need migration to add `access_end_date` column.

Delete a seeker = delete their profile + auth user (cascade). Use edge function with service role since client can't delete auth.users.

Let me design:

**Edit dialog**: Name, Phone, City, State, Company, Occupation, Role + Access End Date (only shown for admin/coach)
**Delete button**: Shown only for `role === 'seeker'`. Confirmation dialog. Calls edge function `delete-seeker` that uses service role to delete auth user (profile cascades).
**End date**: New column `access_end_date date` on profiles. AuthGuard could check this later — for now just store it. Editable in edit dialog when role is admin/coach.

Keep concise.
