
-- ============================================================
-- PART A: SECURITY HARDENING
-- ============================================================

-- A1. Harden role escalation prevention on profiles
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Service role / no auth context (edge functions): allow
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.role IS DISTINCT FROM OLD.role AND NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can change a user role';
  END IF;
  RETURN NEW;
END;
$$;

-- Drop any duplicate trigger and recreate single one
DROP TRIGGER IF EXISTS prevent_role_escalation_trigger ON public.profiles;
DROP TRIGGER IF EXISTS profiles_prevent_role_escalation ON public.profiles;
CREATE TRIGGER profiles_prevent_role_escalation
BEFORE UPDATE OF role ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_role_escalation();

-- Add policy-level guard so non-admins can't even attempt persisting a different role
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT polname FROM pg_policy
    WHERE polrelid = 'public.profiles'::regclass AND polcmd = 'w'
  LOOP
    -- We won't auto-drop existing policies; instead add a new restrictive policy.
    NULL;
  END LOOP;
END $$;

DROP POLICY IF EXISTS "Restrict role changes to admins" ON public.profiles;
CREATE POLICY "Restrict role changes to admins"
ON public.profiles
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (
  public.is_admin(auth.uid())
  OR role = (SELECT p.role FROM public.profiles p WHERE p.id = profiles.id)
);

-- A2. Tighten submissions INSERT
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'submissions') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can submit applications" ON public.submissions';
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can insert submissions" ON public.submissions';
    EXECUTE 'DROP POLICY IF EXISTS "Public can submit" ON public.submissions';
    EXECUTE $POL$
      CREATE POLICY "Validated public submissions"
      ON public.submissions
      FOR INSERT
      TO anon, authenticated
      WITH CHECK (
        status = 'pending'
        AND email IS NOT NULL
        AND length(email) BETWEEN 5 AND 320
        AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
        AND (mobile IS NULL OR length(mobile) BETWEEN 6 AND 20)
        AND (full_name IS NULL OR length(full_name) <= 200)
        AND (form_data IS NULL OR length(form_data::text) <= 65536)
      )
    $POL$;
  END IF;
END $$;

-- A3. Signatures storage row-ownership policies
DROP POLICY IF EXISTS "Users can update own signatures" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own signatures" ON storage.objects;
DROP POLICY IF EXISTS "signatures_update_own_folder" ON storage.objects;
DROP POLICY IF EXISTS "signatures_delete_own_folder" ON storage.objects;

CREATE POLICY "signatures_update_own_row"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'signatures'
  AND (
    public.is_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.session_signatures ss
      WHERE ss.storage_path = storage.objects.name
        AND ss.signer_id = auth.uid()
    )
  )
);

CREATE POLICY "signatures_delete_own_row"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'signatures'
  AND (
    public.is_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.session_signatures ss
      WHERE ss.storage_path = storage.objects.name
        AND ss.signer_id = auth.uid()
    )
  )
);

-- ============================================================
-- PART B: DOCUMENT LIBRARY + SIGNATURE WORKFLOW
-- ============================================================

-- B1. documents table
CREATE TABLE IF NOT EXISTS public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'other' CHECK (category IN ('agreement','nda','commitment','other')),
  storage_path text NOT NULL,
  version int NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage documents"
ON public.documents
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Coaches read active documents"
ON public.documents
FOR SELECT
TO authenticated
USING (is_active = true AND (public.is_coach(auth.uid()) OR public.is_admin(auth.uid())));

CREATE TRIGGER documents_set_updated_at
BEFORE UPDATE ON public.documents
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- B2. signature_requests table
CREATE TABLE IF NOT EXISTS public.signature_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seeker_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE RESTRICT,
  session_id uuid,
  signer_email_encrypted bytea,
  signer_name text,
  token_hash text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','signed','expired','cancelled')),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  sent_at timestamptz NOT NULL DEFAULT now(),
  signed_at timestamptz,
  cancelled_at timestamptz,
  custom_message text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sigreq_seeker ON public.signature_requests(seeker_id);
CREATE INDEX IF NOT EXISTS idx_sigreq_status ON public.signature_requests(status);
CREATE INDEX IF NOT EXISTS idx_sigreq_token ON public.signature_requests(token_hash);

ALTER TABLE public.signature_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage signature requests"
ON public.signature_requests
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Coaches view their seekers' requests"
ON public.signature_requests
FOR SELECT
TO authenticated
USING (public.is_coach(auth.uid()));

CREATE POLICY "Seekers view their own requests"
ON public.signature_requests
FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = signature_requests.seeker_id AND p.user_id = auth.uid()));

CREATE TRIGGER signature_requests_set_updated_at
BEFORE UPDATE ON public.signature_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- B3. document_signatures table
CREATE TABLE IF NOT EXISTS public.document_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.signature_requests(id) ON DELETE CASCADE,
  seeker_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE RESTRICT,
  signed_pdf_path text NOT NULL,
  typed_full_name text NOT NULL,
  place text NOT NULL,
  signature_date date NOT NULL DEFAULT CURRENT_DATE,
  ip_address inet,
  user_agent text,
  verification_id text NOT NULL UNIQUE,
  file_size_bytes int,
  signed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_docsig_seeker ON public.document_signatures(seeker_id);
CREATE INDEX IF NOT EXISTS idx_docsig_request ON public.document_signatures(request_id);
CREATE INDEX IF NOT EXISTS idx_docsig_verification ON public.document_signatures(verification_id);

ALTER TABLE public.document_signatures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read document signatures"
ON public.document_signatures
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Coaches read document signatures"
ON public.document_signatures
FOR SELECT
TO authenticated
USING (public.is_coach(auth.uid()));

CREATE POLICY "Seekers read own document signatures"
ON public.document_signatures
FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = document_signatures.seeker_id AND p.user_id = auth.uid()));

-- B4. documents storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "documents_admin_all"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'documents' AND public.is_admin(auth.uid()))
WITH CHECK (bucket_id = 'documents' AND public.is_admin(auth.uid()));

CREATE POLICY "documents_coach_read"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'documents' AND public.is_coach(auth.uid()));

CREATE POLICY "documents_seeker_read_via_request"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents'
  AND EXISTS (
    SELECT 1
    FROM public.signature_requests sr
    JOIN public.documents d ON d.id = sr.document_id
    JOIN public.profiles p ON p.id = sr.seeker_id
    WHERE d.storage_path = storage.objects.name
      AND p.user_id = auth.uid()
  )
);
