## Problem

In the admin Session Review page, the **Approve** button stays as **"Approve (locked — waiting on seeker reflection)"** even after the seeker types their notes and clicks **Save Reflection**.

Reason found in `src/pages/admin/SessionReviewPage.tsx` (lines 334-341):

```ts
const seekerHasReflection =
  s.seeker_what_learned?.trim() || !!s.seeker_what_learned_audio;

const approveLocked =
  !s.session_notes?.trim() ||   // coach notes must exist
  !seekerHasReflection ||        // seeker reflection text/audio must exist
  !s.seeker_accepted_at;         // ← seeker must ALSO click "Accept & Proceed to Sign"
```

So the lock requires **three** things, but the seeker UI (`SeekerSessionDetail.tsx`) splits the flow into two clicks: **Save Reflection** (writes `seeker_what_learned`) and a separate **Accept & Proceed to Sign** (writes `seeker_accepted_at`). The user expects the admin lock to release as soon as the seeker clicks **Save**.

A second, independent issue: the admin page only loads session data once on mount, so even after the seeker saves, the admin must hard-refresh to see the new state.

## Fix

### 1. Loosen the admin approve-lock condition
File: `src/pages/admin/SessionReviewPage.tsx` (lines 334-341)

Drop the `!s.seeker_accepted_at` requirement. Approval should unlock as soon as **both** of these are true:
- Coach has written `session_notes`
- Seeker has saved a reflection (`seeker_what_learned` text or audio)

The separate `seeker_accepted_at` + signature flow continues to exist for the audit trail, but it no longer blocks the admin from clicking Approve. (If you prefer to keep it gated, we can instead auto-set `seeker_accepted_at` inside `handleSubmitReflection` — see "Alternative" below.)

Also update the locked button's tooltip and label to reflect the new condition:
- Label: `Approve (locked — waiting on seeker notes)`
- Tooltip: `Waiting for the seeker to save their Post-Session Reflection.`
- Plus a small inline hint listing exactly which of the two pieces is missing (coach notes vs seeker reflection) so admins know what to chase.

### 2. Live refresh on the admin page
File: `src/pages/admin/SessionReviewPage.tsx`

Add a Supabase Realtime subscription on the `sessions` table filtered to the current `session.id`. When an UPDATE event fires (seeker saves reflection, accepts, signs), refetch the session and re-render. This removes the need for an admin hard-refresh.

Pattern:

```ts
useEffect(() => {
  if (!session?.id) return;
  const ch = supabase
    .channel(`session-${session.id}`)
    .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'sessions', filter: `id=eq.${session.id}` },
        () => loadSession())
    .subscribe();
  return () => { supabase.removeChannel(ch); };
}, [session?.id]);
```

(`sessions` is already in the realtime publication for other features in the app; if not, we will add `ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;` via a migration.)

### 3. Optional — clearer seeker-side messaging
File: `src/pages/seeker/SeekerSessionDetail.tsx`

Update the **Save Reflection** success toast to:
> "Reflection saved ✨ Your coach can now approve this session."

So seekers understand that saving (not the later Accept) is what unlocks admin approval.

## Alternative (if you'd rather keep `seeker_accepted_at` as a hard gate)

Instead of removing it from `approveLocked`, change `handleSubmitReflection` in `SeekerSessionDetail.tsx` to also set `seeker_accepted_at: new Date().toISOString()` in the same UPDATE — making "Save Reflection" implicitly accept the session. The downstream Sign flow already runs off `seeker_accepted_at`, so this would also collapse the two-step UX into one. Tell me which you prefer; default plan is option (1) above.

## Files touched

- `src/pages/admin/SessionReviewPage.tsx` — relax `approveLocked`, update label/tooltip, add realtime subscription
- `src/pages/seeker/SeekerSessionDetail.tsx` — refine Save Reflection toast copy
- (If needed) a migration to add `sessions` to `supabase_realtime` publication

## Out of scope

- Coach signature / certification flow — unchanged
- RLS policies — already permit admin updates and seeker self-updates on `sessions`
