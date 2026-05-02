
-- ============================================================
-- 1. SUBMISSIONS: encrypt password inside form_data on write
-- ============================================================
CREATE OR REPLACE FUNCTION public.encrypt_submission_password()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_pw text;
  v_enc bytea;
BEGIN
  IF NEW.form_data IS NULL THEN
    RETURN NEW;
  END IF;

  v_pw := NEW.form_data->>'password';
  IF v_pw IS NOT NULL AND v_pw <> '' THEN
    v_enc := public.encrypt_field(v_pw);
    -- Store encrypted hex (decryptable server-side); remove plaintext
    NEW.form_data := (NEW.form_data - 'password')
                     || jsonb_build_object('password_enc', encode(v_enc, 'hex'));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_encrypt_submission_password ON public.submissions;
CREATE TRIGGER trg_encrypt_submission_password
  BEFORE INSERT OR UPDATE OF form_data ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.encrypt_submission_password();

-- Backfill: encrypt any existing plaintext passwords sitting in pending submissions
UPDATE public.submissions
SET form_data = (form_data - 'password')
                || jsonb_build_object('password_enc', encode(public.encrypt_field(form_data->>'password'), 'hex'))
WHERE form_data ? 'password'
  AND (form_data->>'password') IS NOT NULL
  AND (form_data->>'password') <> '';

-- Helper RPC: edge function can decrypt password by submission id (admin only)
CREATE OR REPLACE FUNCTION public.get_submission_password(_submission_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_hex text;
BEGIN
  -- Allow only admins or service role
  IF auth.uid() IS NOT NULL AND NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  SELECT form_data->>'password_enc' INTO v_hex
  FROM public.submissions WHERE id = _submission_id;

  IF v_hex IS NULL OR v_hex = '' THEN
    RETURN NULL;
  END IF;

  RETURN public.decrypt_field(decode(v_hex, 'hex'));
END;
$$;

REVOKE ALL ON FUNCTION public.get_submission_password(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_submission_password(uuid) TO service_role;

-- ============================================================
-- 2. LEADS: add encrypted/hashed mirror columns + maintain via trigger
-- ============================================================
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS email_enc bytea,
  ADD COLUMN IF NOT EXISTS phone_enc bytea,
  ADD COLUMN IF NOT EXISTS email_hash text,
  ADD COLUMN IF NOT EXISTS phone_hash text;

CREATE OR REPLACE FUNCTION public.maintain_lead_pii()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR NEW.email IS DISTINCT FROM OLD.email THEN
    NEW.email_enc  := public.encrypt_field(NEW.email);
    NEW.email_hash := public.hash_for_lookup(NEW.email);
  END IF;
  IF TG_OP = 'INSERT' OR NEW.phone IS DISTINCT FROM OLD.phone THEN
    NEW.phone_enc  := public.encrypt_field(NEW.phone);
    NEW.phone_hash := public.hash_for_lookup(NEW.phone);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_maintain_lead_pii ON public.leads;
CREATE TRIGGER trg_maintain_lead_pii
  BEFORE INSERT OR UPDATE OF email, phone ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.maintain_lead_pii();

-- Backfill existing rows
UPDATE public.leads
SET email_enc = public.encrypt_field(email),
    email_hash = public.hash_for_lookup(email),
    phone_enc = public.encrypt_field(phone),
    phone_hash = public.hash_for_lookup(phone)
WHERE (email IS NOT NULL AND email_enc IS NULL)
   OR (phone IS NOT NULL AND phone_enc IS NULL);

CREATE INDEX IF NOT EXISTS leads_email_hash_idx ON public.leads(email_hash);
CREATE INDEX IF NOT EXISTS leads_phone_hash_idx ON public.leads(phone_hash);

-- ============================================================
-- 3. BUSINESS PROFILES: encrypt revenue_range bracket
-- ============================================================
ALTER TABLE public.business_profiles
  ADD COLUMN IF NOT EXISTS revenue_range_enc bytea;

CREATE OR REPLACE FUNCTION public.maintain_business_revenue_range_enc()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR NEW.revenue_range IS DISTINCT FROM OLD.revenue_range THEN
    NEW.revenue_range_enc := public.encrypt_field(NEW.revenue_range);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_maintain_business_revenue_range_enc ON public.business_profiles;
CREATE TRIGGER trg_maintain_business_revenue_range_enc
  BEFORE INSERT OR UPDATE OF revenue_range ON public.business_profiles
  FOR EACH ROW EXECUTE FUNCTION public.maintain_business_revenue_range_enc();

UPDATE public.business_profiles
SET revenue_range_enc = public.encrypt_field(revenue_range)
WHERE revenue_range IS NOT NULL AND revenue_range_enc IS NULL;

-- ============================================================
-- 4. UNSUBSCRIBE TOKENS: add token_hash, lookup helper
-- ============================================================
ALTER TABLE public.email_unsubscribe_tokens
  ADD COLUMN IF NOT EXISTS token_hash text;

-- Backfill from existing token column (if still present)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='email_unsubscribe_tokens' AND column_name='token'
  ) THEN
    EXECUTE 'UPDATE public.email_unsubscribe_tokens
             SET token_hash = public.hash_token(token)
             WHERE token IS NOT NULL AND token_hash IS NULL';
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS email_unsubscribe_tokens_token_hash_key
  ON public.email_unsubscribe_tokens(token_hash);

-- Helper: resolve a raw token -> row id without exposing all tokens
CREATE OR REPLACE FUNCTION public.find_unsubscribe_token(_token text)
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_id uuid;
BEGIN
  SELECT id INTO v_id
  FROM public.email_unsubscribe_tokens
  WHERE token_hash = public.hash_token(_token)
  LIMIT 1;
  RETURN v_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.find_unsubscribe_token(text) TO anon, authenticated, service_role;

-- ============================================================
-- 5. LGT INVITE TOKENS: add invite_token_hash + hashed-lookup RPCs
-- ============================================================
ALTER TABLE public.lgt_applications
  ADD COLUMN IF NOT EXISTS invite_token_hash text;

UPDATE public.lgt_applications
SET invite_token_hash = public.hash_token(invite_token)
WHERE invite_token IS NOT NULL AND invite_token_hash IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS lgt_applications_invite_token_hash_key
  ON public.lgt_applications(invite_token_hash)
  WHERE invite_token_hash IS NOT NULL;

-- Update token-lookup RPCs to prefer hashed lookup, fall back to legacy plaintext
CREATE OR REPLACE FUNCTION public.get_lgt_application_by_token(_token text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_app record;
  v_profile record;
  v_hash text;
BEGIN
  IF _token IS NULL OR _token = '' THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'invalid_token');
  END IF;

  v_hash := public.hash_token(_token);

  SELECT * INTO v_app FROM public.lgt_applications
   WHERE invite_token_hash = v_hash
      OR invite_token = _token
   LIMIT 1;
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

CREATE OR REPLACE FUNCTION public.submit_lgt_application_by_token(_token text, _form_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_app record;
  v_hash text;
BEGIN
  IF _token IS NULL OR _token = '' THEN
    RETURN jsonb_build_object('success', false, 'reason', 'invalid_token');
  END IF;
  IF _form_data IS NULL THEN
    RETURN jsonb_build_object('success', false, 'reason', 'missing_data');
  END IF;

  v_hash := public.hash_token(_token);

  SELECT * INTO v_app FROM public.lgt_applications
   WHERE invite_token_hash = v_hash
      OR invite_token = _token
   LIMIT 1;
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
        invite_token_hash = NULL,
        invite_token_expires_at = NULL
    WHERE id = v_app.id;

  RETURN jsonb_build_object('success', true, 'application_id', v_app.id);
END;
$$;
