DROP POLICY IF EXISTS "Anyone can view announcements" ON public.announcements;

CREATE POLICY "Users view targeted announcements"
  ON public.announcements
  FOR SELECT
  TO authenticated
  USING (
    public.is_admin(auth.uid())
    OR (
      (starts_at IS NULL OR starts_at <= now())
      AND (expires_at IS NULL OR expires_at >= now())
      AND (
        audience IS NULL
        OR 'all' = ANY(audience)
        OR EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.user_id = auth.uid()
            AND (
              p.role = ANY(audience)
              OR (p.is_also_coach = true AND 'coach' = ANY(audience))
            )
        )
        OR (
          course_id IS NOT NULL
          AND EXISTS (
            SELECT 1
            FROM public.enrollments e
            JOIN public.profiles p ON p.id = e.seeker_id
            WHERE p.user_id = auth.uid()
              AND e.course_id = announcements.course_id
          )
        )
      )
    )
  );