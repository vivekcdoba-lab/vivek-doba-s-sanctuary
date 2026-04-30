## Problem

Coach-initiated session deletes appear to "succeed" in the UI but the session keeps showing in the calendar. Root cause: the `public.sessions` table has **no DELETE RLS policy for coaches** — only `Admins can manage sessions` covers DELETE. When a coach calls `supabase.from('sessions').delete()`, RLS silently filters out the row (0 affected rows, no error), so the client thinks it worked while the row stays in the DB.

The current `useDeleteSession` hook also doesn't check the affected-rows count, so the silent block never surfaces as an error.

## Fix (two parts)

### 1. Database — add DELETE policies (migration)

Add a coach DELETE policy on `public.sessions` and `public.session_participants` so the coach who owns the session (or is the assigned coach for the seeker) can delete it. Admins keep full access via the existing "Admins can manage sessions" policy. Seekers remain unable to delete.

```sql
DROP POLICY IF EXISTS "Coaches delete their sessions" ON public.sessions;
CREATE POLICY "Coaches delete their sessions"
  ON public.sessions
  FOR DELETE
  TO authenticated
  USING (
    is_admin(auth.uid())
    OR is_assigned_coach(auth.uid(), seeker_id)
    OR coach_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Coaches delete session participants" ON public.session_participants;
CREATE POLICY "Coaches delete session participants"
  ON public.session_participants
  FOR DELETE
  TO authenticated
  USING (
    is_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.sessions s
      WHERE s.id = session_participants.session_id
        AND (
          is_assigned_coach(auth.uid(), s.seeker_id)
          OR s.coach_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        )
    )
  );
```

### 2. Client — surface silent RLS blocks (`src/hooks/useDbSessions.ts`)

In `useDeleteSession`, change the delete to return the deleted rows and treat 0 rows as an error so the toast actually shows when something is blocked, instead of pretending success.

```ts
const { error, data } = await supabase
  .from('sessions')
  .delete()
  .eq('id', id)
  .select('id');
if (error) throw error;
if (!data || data.length === 0) {
  throw new Error(
    "Session could not be deleted. You may not have permission to delete this session — please contact an admin."
  );
}
```

No other files need to change. After the migration runs, coach delete from `/coaching/schedule` will remove the session from the calendar immediately (the existing `queryClient.invalidateQueries(['db-sessions'])` already refreshes the view), and any future RLS regression will surface as a visible error instead of a silent no-op.
