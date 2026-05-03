Update the "Linked Profile" card on the Seeker Detail page:

1. Keep the partner detail block as-is (avatar/emoji, name, email, relationship badge, partner stats, joint-payment chips).
2. Remove the warning message about "existing link / partner could not be loaded" — no more stale-link banner.
3. In the card header, alongside the Link/Edit button, add a `View all links →` link that navigates to `/admin/linked-profiles`, where the admin can see, add, update, or remove any link.
4. When no partner is linked, keep the simple "Not linked" placeholder and still show the `View all links →` shortcut.

File to edit:
- `src/pages/admin/SeekerDetailPage.tsx` (Linked Profile section only)

No backend or schema changes.