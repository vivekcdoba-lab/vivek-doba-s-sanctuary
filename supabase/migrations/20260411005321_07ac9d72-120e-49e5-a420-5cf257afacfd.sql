
DROP POLICY "System can insert notifications" ON public.notifications;

CREATE POLICY "Users or admins insert notifications"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (
    is_admin(auth.uid())
    OR user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );
