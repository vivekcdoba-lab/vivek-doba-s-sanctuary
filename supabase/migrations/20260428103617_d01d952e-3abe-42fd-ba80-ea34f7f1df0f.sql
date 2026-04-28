ALTER TABLE public.signature_requests
  DROP CONSTRAINT IF EXISTS signature_requests_document_id_fkey;
ALTER TABLE public.signature_requests
  ADD CONSTRAINT signature_requests_document_id_fkey
  FOREIGN KEY (document_id) REFERENCES public.documents(id) ON DELETE CASCADE;

ALTER TABLE public.document_signatures
  DROP CONSTRAINT IF EXISTS document_signatures_document_id_fkey;
ALTER TABLE public.document_signatures
  ADD CONSTRAINT document_signatures_document_id_fkey
  FOREIGN KEY (document_id) REFERENCES public.documents(id) ON DELETE CASCADE;

DELETE FROM public.documents WHERE id = '2b837929-8def-4c2c-9e94-8b70f42ca8c4';