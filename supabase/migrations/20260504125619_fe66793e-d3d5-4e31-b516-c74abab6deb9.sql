-- 1) seeker_assessments: replace inline role check with is_admin() helper
DROP POLICY IF EXISTS "Admins can manage seeker assessments" ON public.seeker_assessments;
CREATE POLICY "Admins can manage seeker assessments"
  ON public.seeker_assessments
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 2) Allow seekers to read their own signed PDFs in the documents bucket
DROP POLICY IF EXISTS "documents_seeker_read_signed_pdf" ON storage.objects;
CREATE POLICY "documents_seeker_read_signed_pdf"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND EXISTS (
      SELECT 1
      FROM public.document_signatures ds
      JOIN public.profiles p ON p.id = ds.seeker_id
      WHERE ds.signed_pdf_path = storage.objects.name
        AND p.user_id = auth.uid()
    )
  );

-- 3) Reduce Realtime exposure for sessions: keep in publication but use default
--    REPLICA IDENTITY (primary key only) instead of FULL so unchanged sensitive
--    columns are not broadcast on UPDATE. App only needs change notifications
--    and re-fetches via RLS-protected SELECT.
ALTER TABLE public.sessions REPLICA IDENTITY DEFAULT;