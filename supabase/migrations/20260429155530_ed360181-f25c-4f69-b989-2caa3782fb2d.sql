-- Tighten signatures bucket INSERT policy: require admin OR a real participation
-- in a session/agreement (in addition to path-based ownership) so that
-- arbitrary authenticated users cannot upload files into the bucket.

DROP POLICY IF EXISTS "Signers can upload own signatures" ON storage.objects;

CREATE POLICY "Signers can upload own signatures"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'signatures'
  AND (
    public.is_admin(auth.uid())
    OR (
      -- Path must be under the uploader's own auth UID folder
      (auth.uid())::text = (storage.foldername(name))[1]
      AND (
        -- Seeker is signing one of their own sessions
        EXISTS (
          SELECT 1
          FROM public.sessions s
          JOIN public.profiles p ON p.id = s.seeker_id
          WHERE p.user_id = auth.uid()
        )
        -- Coach assigned to at least one seeker (can sign agreements/sessions)
        OR public.is_coach(auth.uid())
        -- Or the uploader has a pending signature_request as the seeker
        OR EXISTS (
          SELECT 1
          FROM public.signature_requests sr
          JOIN public.profiles p ON p.id = sr.seeker_id
          WHERE p.user_id = auth.uid()
            AND sr.status = 'pending'
        )
      )
    )
  )
);