ALTER TABLE public.signature_requests
  ADD COLUMN IF NOT EXISTS sign_method text
  CHECK (sign_method IN ('email','in_person')) DEFAULT 'email';

UPDATE public.signature_requests
SET sign_method = 'in_person'
WHERE token_hash LIKE 'inline-%' AND sign_method IS DISTINCT FROM 'in_person';

UPDATE public.signature_requests
SET sign_method = 'email'
WHERE sign_method IS NULL;