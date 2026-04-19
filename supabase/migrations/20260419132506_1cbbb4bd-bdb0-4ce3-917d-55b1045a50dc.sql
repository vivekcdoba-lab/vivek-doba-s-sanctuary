CREATE POLICY "Admins can delete submissions"
ON public.submissions FOR DELETE TO authenticated
USING (public.is_admin(auth.uid()));