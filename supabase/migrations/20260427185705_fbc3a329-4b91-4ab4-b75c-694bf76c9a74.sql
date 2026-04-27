-- LGT Applications table (one per seeker)
CREATE TABLE public.lgt_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seeker_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','submitted')),
  form_data jsonb,
  invite_token text UNIQUE,
  invite_token_expires_at timestamptz,
  invited_by uuid,
  invited_at timestamptz,
  invite_email_sent_at timestamptz,
  filled_by_role text CHECK (filled_by_role IN ('admin','seeker')),
  submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT lgt_applications_seeker_unique UNIQUE (seeker_id)
);

CREATE INDEX lgt_applications_seeker_id_idx ON public.lgt_applications(seeker_id);
CREATE INDEX lgt_applications_invite_token_idx ON public.lgt_applications(invite_token);
CREATE INDEX lgt_applications_status_idx ON public.lgt_applications(status);

ALTER TABLE public.lgt_applications ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admins manage all lgt applications"
ON public.lgt_applications FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Seekers can view their own application
CREATE POLICY "Seekers view own lgt application"
ON public.lgt_applications FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = lgt_applications.seeker_id AND p.user_id = auth.uid()
  )
);

-- Seekers can update their own pending application
CREATE POLICY "Seekers update own pending lgt application"
ON public.lgt_applications FOR UPDATE
TO authenticated
USING (
  status = 'pending' AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = lgt_applications.seeker_id AND p.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = lgt_applications.seeker_id AND p.user_id = auth.uid()
  )
);

-- Updated_at trigger
CREATE TRIGGER update_lgt_applications_updated_at
BEFORE UPDATE ON public.lgt_applications
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Public token RPC: fetch application + seeker prefill by token
CREATE OR REPLACE FUNCTION public.get_lgt_application_by_token(_token text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_app record;
  v_profile record;
BEGIN
  IF _token IS NULL OR _token = '' THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'invalid_token');
  END IF;

  SELECT * INTO v_app FROM public.lgt_applications WHERE invite_token = _token LIMIT 1;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'not_found');
  END IF;

  IF v_app.status = 'submitted' THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'already_submitted');
  END IF;

  IF v_app.invite_token_expires_at IS NOT NULL AND v_app.invite_token_expires_at < now() THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'expired');
  END IF;

  SELECT id, full_name, email, phone, city, state, country, dob, company, occupation
    INTO v_profile FROM public.profiles WHERE id = v_app.seeker_id;

  RETURN jsonb_build_object(
    'valid', true,
    'application_id', v_app.id,
    'seeker_id', v_app.seeker_id,
    'form_data', COALESCE(v_app.form_data, '{}'::jsonb),
    'profile', jsonb_build_object(
      'full_name', v_profile.full_name,
      'email', v_profile.email,
      'phone', v_profile.phone,
      'city', v_profile.city,
      'state', v_profile.state,
      'country', v_profile.country,
      'dob', v_profile.dob,
      'company', v_profile.company,
      'occupation', v_profile.occupation
    )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_lgt_application_by_token(text) TO anon, authenticated;

-- Public token RPC: submit application by token
CREATE OR REPLACE FUNCTION public.submit_lgt_application_by_token(_token text, _form_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_app record;
BEGIN
  IF _token IS NULL OR _token = '' THEN
    RETURN jsonb_build_object('success', false, 'reason', 'invalid_token');
  END IF;
  IF _form_data IS NULL THEN
    RETURN jsonb_build_object('success', false, 'reason', 'missing_data');
  END IF;

  SELECT * INTO v_app FROM public.lgt_applications WHERE invite_token = _token LIMIT 1;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'reason', 'not_found');
  END IF;
  IF v_app.status = 'submitted' THEN
    RETURN jsonb_build_object('success', false, 'reason', 'already_submitted');
  END IF;
  IF v_app.invite_token_expires_at IS NOT NULL AND v_app.invite_token_expires_at < now() THEN
    RETURN jsonb_build_object('success', false, 'reason', 'expired');
  END IF;

  UPDATE public.lgt_applications
    SET form_data = _form_data,
        status = 'submitted',
        filled_by_role = 'seeker',
        submitted_at = now(),
        invite_token = NULL,
        invite_token_expires_at = NULL
    WHERE id = v_app.id;

  RETURN jsonb_build_object('success', true, 'application_id', v_app.id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_lgt_application_by_token(text, jsonb) TO anon, authenticated;