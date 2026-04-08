
-- Session signatures table
CREATE TABLE public.session_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  signer_id uuid NOT NULL REFERENCES public.profiles(id),
  signer_role text NOT NULL CHECK (signer_role IN ('seeker', 'coach')),
  storage_path text NOT NULL,
  typed_name text,
  ip_address text,
  user_agent text,
  content_hash text,
  signed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(session_id, signer_role)
);

-- Enable RLS
ALTER TABLE public.session_signatures ENABLE ROW LEVEL SECURITY;

-- Admins can manage all signatures
CREATE POLICY "Admins manage all signatures"
  ON public.session_signatures FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Seekers can insert their own signatures
CREATE POLICY "Seekers can sign own sessions"
  ON public.session_signatures FOR INSERT
  TO authenticated
  WITH CHECK (
    signer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- Both participants can view signatures for their sessions
CREATE POLICY "Participants can view session signatures"
  ON public.session_signatures FOR SELECT
  TO authenticated
  USING (
    session_id IN (
      SELECT id FROM sessions WHERE seeker_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
    )
    OR is_admin(auth.uid())
  );

-- Create signatures storage bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('signatures', 'signatures', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for signatures bucket
CREATE POLICY "Authenticated users can upload signatures"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'signatures');

CREATE POLICY "Authenticated users can view signatures"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'signatures');
