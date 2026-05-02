-- Voice note columns for seeker post-session reflection
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS seeker_what_learned_audio text,
  ADD COLUMN IF NOT EXISTS seeker_where_to_apply_audio text,
  ADD COLUMN IF NOT EXISTS seeker_how_to_apply_audio text;

-- Storage policies on the private 'documents' bucket scoped to session-reflections/<sessionId>/...
-- Seekers can upload/update/delete their own session reflection audio
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Seekers upload own reflection audio'
  ) THEN
    CREATE POLICY "Seekers upload own reflection audio"
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (
        bucket_id = 'documents'
        AND (storage.foldername(name))[1] = 'session-reflections'
        AND EXISTS (
          SELECT 1 FROM public.sessions s
          JOIN public.profiles p ON p.id = s.seeker_id
          WHERE s.id::text = (storage.foldername(name))[2]
            AND p.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Seekers update own reflection audio'
  ) THEN
    CREATE POLICY "Seekers update own reflection audio"
      ON storage.objects FOR UPDATE TO authenticated
      USING (
        bucket_id = 'documents'
        AND (storage.foldername(name))[1] = 'session-reflections'
        AND EXISTS (
          SELECT 1 FROM public.sessions s
          JOIN public.profiles p ON p.id = s.seeker_id
          WHERE s.id::text = (storage.foldername(name))[2]
            AND p.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Seekers delete own reflection audio'
  ) THEN
    CREATE POLICY "Seekers delete own reflection audio"
      ON storage.objects FOR DELETE TO authenticated
      USING (
        bucket_id = 'documents'
        AND (storage.foldername(name))[1] = 'session-reflections'
        AND EXISTS (
          SELECT 1 FROM public.sessions s
          JOIN public.profiles p ON p.id = s.seeker_id
          WHERE s.id::text = (storage.foldername(name))[2]
            AND p.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Reflection audio readable by seeker coach admin'
  ) THEN
    CREATE POLICY "Reflection audio readable by seeker coach admin"
      ON storage.objects FOR SELECT TO authenticated
      USING (
        bucket_id = 'documents'
        AND (storage.foldername(name))[1] = 'session-reflections'
        AND (
          public.is_admin(auth.uid())
          OR EXISTS (
            SELECT 1 FROM public.sessions s
            JOIN public.profiles p ON p.id = s.seeker_id
            WHERE s.id::text = (storage.foldername(name))[2]
              AND p.user_id = auth.uid()
          )
          OR EXISTS (
            SELECT 1 FROM public.sessions s
            WHERE s.id::text = (storage.foldername(name))[2]
              AND public.is_assigned_coach(auth.uid(), s.seeker_id)
          )
        )
      );
  END IF;
END $$;