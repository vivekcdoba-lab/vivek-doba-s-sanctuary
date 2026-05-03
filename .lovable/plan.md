## Root Cause
The "Linked Profile" section on Admin → Seeker Detail relies on the `get_linked_seekers_basic` RPC. That RPC excludes the seeker's own row (`WHERE sl.seeker_id <> _seeker_id`) and joins via `public.profiles` — and in this project's RLS posture, the join visibility for the partner profile row is failing for the calling admin in some cases, returning 0 rows even though both link rows exist (verified in DB: group `a229b970…` contains both Sunita K and Chandrakant Wanare).

Because `linkGroup` is empty, `linkedPartner` is `undefined`, and the UI shows "Not linked to any other seeker." The unlink button also can't function (no `linkGroupId`).

## Fix (one-shot)
Rewrite `useSeekerLinkGroup` in `src/hooks/useSeekerLinks.ts` to read `seeker_links` directly (admins have full SELECT via the existing `Admins manage seeker links` policy; seekers can also read their own group via the existing `Seekers see own group links` policy):

1. Query `seeker_links` filtered by `seeker_id = _seekerId` to get the `group_id`.
2. Then query all rows where `group_id = <found>` joining `profiles` for partner name/email.
3. Keep the existing RPC call as a fallback if step 1 returns nothing (preserves seeker-side behavior).

The page code already filters `linkGroup.find(r => r.seeker_id !== id)` to derive `linkedPartner`, so returning all rows (including own) is fine.

## File
- `src/hooks/useSeekerLinks.ts` — replace the `useSeekerLinkGroup` query function only.

No DB changes, no UI changes, no policy changes.
