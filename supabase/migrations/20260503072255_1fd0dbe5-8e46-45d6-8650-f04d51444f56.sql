CREATE POLICY "Super admins can delete old email send log entries"
ON public.email_send_log
FOR DELETE
TO authenticated
USING (public.is_super_admin(auth.uid()));