-- Premium Coaching Agreement signatures table
CREATE TABLE IF NOT EXISTS public.agreement_signatures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agreement_id UUID NOT NULL REFERENCES public.agreements(id) ON DELETE CASCADE,
  signer_id UUID NOT NULL,
  signer_role TEXT NOT NULL CHECK (signer_role IN ('seeker', 'coach', 'admin')),
  storage_path TEXT,
  typed_name TEXT,
  content_hash TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  signed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agreement_signatures_agreement_id ON public.agreement_signatures(agreement_id);
CREATE INDEX IF NOT EXISTS idx_agreement_signatures_signer_id ON public.agreement_signatures(signer_id);

ALTER TABLE public.agreement_signatures ENABLE ROW LEVEL SECURITY;

-- Admins: full access
CREATE POLICY "Admins manage all agreement signatures"
ON public.agreement_signatures
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Seekers: view their own signatures (where the parent agreement belongs to them)
CREATE POLICY "Seekers view own agreement signatures"
ON public.agreement_signatures
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.agreements a
    JOIN public.profiles p ON p.id = a.client_id
    WHERE a.id = agreement_signatures.agreement_id
      AND p.user_id = auth.uid()
  )
);

-- Seekers: insert only their own signature on their own agreement
CREATE POLICY "Seekers insert own agreement signatures"
ON public.agreement_signatures
FOR INSERT
TO authenticated
WITH CHECK (
  signer_role = 'seeker'
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = agreement_signatures.signer_id
      AND p.user_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM public.agreements a
    JOIN public.profiles p2 ON p2.id = a.client_id
    WHERE a.id = agreement_signatures.agreement_id
      AND p2.user_id = auth.uid()
  )
);

-- Coaches: view signatures for their assigned seekers
CREATE POLICY "Coaches view assigned seekers agreement signatures"
ON public.agreement_signatures
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.agreements a
    WHERE a.id = agreement_signatures.agreement_id
      AND public.is_assigned_coach(auth.uid(), a.client_id)
  )
);

-- Coaches: insert their own coach signature for assigned seekers
CREATE POLICY "Coaches insert agreement signatures for assigned seekers"
ON public.agreement_signatures
FOR INSERT
TO authenticated
WITH CHECK (
  signer_role IN ('coach', 'admin')
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = agreement_signatures.signer_id
      AND p.user_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM public.agreements a
    WHERE a.id = agreement_signatures.agreement_id
      AND public.is_assigned_coach(auth.uid(), a.client_id)
  )
);
