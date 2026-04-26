-- Allow seekers to read documents that have been sent to them for signature
CREATE POLICY "Seekers can read documents sent to them for signature"
ON public.documents
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.signature_requests sr
    JOIN public.profiles p ON p.id = sr.seeker_id
    WHERE sr.document_id = documents.id
      AND p.user_id = auth.uid()
  )
);