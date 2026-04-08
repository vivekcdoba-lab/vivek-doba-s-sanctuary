
-- 1. Drop the overly permissive public INSERT on profiles
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;

-- The "Users can insert own profile" policy (auth.uid() = user_id) is sufficient for authenticated users.
-- The handle_new_user trigger runs as SECURITY DEFINER and bypasses RLS, so no public policy needed.

-- 2. Fix session_notifications INSERT policy - restrict to admins only (seekers get notified, not create notifications)
DROP POLICY IF EXISTS "Authenticated insert notifications" ON public.session_notifications;

CREATE POLICY "Admins and session participants insert notifications"
ON public.session_notifications
FOR INSERT
TO authenticated
WITH CHECK (
  is_admin(auth.uid())
  OR recipient_id IN (
    SELECT p.id FROM profiles p WHERE p.user_id = auth.uid()
  )
);
