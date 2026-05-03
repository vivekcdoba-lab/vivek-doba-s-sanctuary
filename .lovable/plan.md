I found the issue: the database already has Chandrakant Wanare linked to Sunita K, but the current seeker card can still show “Not linked” because the seeker-specific fetch relies on the partner-only RPC result. Also, when a link already exists, the dialog only attempts to create a new link and fails instead of letting you update/replace it from the same “Linked Profile” section.

Plan:

1. Make the “Linked Profile” card read the full existing link reliably
   - Add/adjust a backend read helper that returns the current seeker’s link group, including both the current seeker row and partner row, for admins.
   - Keep seeker privacy rules intact: admins can manage all links; seekers can only view their own linked group.
   - Update the hook so `useSeekerLinkGroup(id)` always includes enough data to show the current link under the current seeker profile.

2. Show the existing linked profile clearly under “Linked Profile”
   - If the seeker is already linked, always show the partner mini-profile instead of the “Not linked” message.
   - Show partner name, email, relationship, joint payment/session badges, group ID, session count, paid amount, and last payment.
   - Add a clear “Update Link” action next to “Unlink” in the existing card.

3. Fix the link dialog behavior for existing links
   - Rename the dialog action dynamically:
     - “Link Profiles” when there is no existing link.
     - “Update Link” when the seeker already has a link.
   - In update mode, preselect the existing partner and relationship.
   - If the admin selects a new partner while the current seeker already has a link, perform a safe replace flow:
     - delete the old link group first,
     - then create the new link group,
     - refresh the card.
   - If only the relationship changes with the same partner, still save it cleanly.

4. Improve selectable partner list and messaging
   - Hide seekers already linked to someone else, except the currently linked partner in update mode.
   - Replace the confusing “If a seeker is already linked, the link attempt will fail” note with clear text like: “This seeker already has a link. Updating will replace the existing link.”
   - If a selected partner is linked elsewhere, show a helpful validation message before submit.

5. Refresh related cached data after changes
   - Invalidate both the current seeker’s link query and global link query after link/update/unlink.
   - This should make the card update immediately without needing a page reload.

Files/areas to update after approval:
- `src/hooks/useSeekerLinks.ts`
- `src/pages/admin/SeekerDetailPage.tsx`
- Possibly one small database migration for a more reliable admin-safe link-group read/update helper, if needed after implementation review.