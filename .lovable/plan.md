I found why the Linked Profile dialog still fails: the detail page only enables the replace flow when it successfully detects an existing partner. In your screenshot the card says “Not linked”, so the submit is sent as a normal new link, and the database correctly rejects it because one of the selected seekers is already linked.

Plan to fix it:

1. Make linking always safe from the Seeker Detail dialog
   - When linking from a seeker profile, always use the replace/update path.
   - This means if the current seeker or chosen partner already has an old link, that old link is removed first and the new link is created.
   - This matches the screen text: “If the chosen partner is already linked elsewhere, that link will be replaced.”

2. Improve the data fetch so existing links display reliably
   - Keep using the existing secure backend helper for link details.
   - Add a fallback check in the hook so admins can still detect the current seeker’s existing `group_id` even when partner rows are not returned as expected.
   - This prevents the false “Not linked” state when a `seeker_links` record already exists.

3. Update the dialog behavior and messaging
   - Change the button text/logic so it no longer submits a non-replace link from this profile page.
   - If the page cannot display the existing partner but detects that the seeker is already linked, show a clear “Existing link will be replaced” notice instead of behaving like a fresh link.
   - Update the error message so it tells the admin exactly what happened if replacement still fails.

4. Refresh linked-profile UI after save
   - Invalidate/refetch the relevant link queries after linking or unlinking.
   - Ensure the Linked Profile card immediately shows the newly linked partner instead of staying on “Not linked”.

Files to update:
- `src/hooks/useSeekerLinks.ts`
- `src/pages/admin/SeekerDetailPage.tsx`

No database schema change should be needed for this specific error.