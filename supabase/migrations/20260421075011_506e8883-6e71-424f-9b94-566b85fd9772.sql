-- =====================================================
-- PHASE 4: Secrets, password tracking, key rotation
-- =====================================================

-- ---------- OTP codes: encrypted at rest ----------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='otp_codes') THEN
    ALTER TABLE public.otp_codes ADD COLUMN IF NOT EXISTS code_enc bytea;
  END IF;
END $$;

-- ---------- Password reset tokens: hash-only ----------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='password_reset_tokens') THEN
    ALTER TABLE public.password_reset_tokens ADD COLUMN IF NOT EXISTS token_hash text;
    CREATE INDEX IF NOT EXISTS prt_token_hash_idx ON public.password_reset_tokens(token_hash);
  END IF;
END $$;

-- ---------- Password change tracking ----------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS password_changed_at timestamptz DEFAULT now();

-- Backfill: existing accounts use created_at as a baseline so banner doesn't fire immediately
UPDATE public.profiles
SET password_changed_at = COALESCE(updated_at, created_at)
WHERE password_changed_at IS NULL;

-- ---------- Key rotation log ----------
CREATE TABLE IF NOT EXISTS public.key_rotation_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rotated_at timestamptz NOT NULL DEFAULT now(),
  from_version text,
  to_version text NOT NULL,
  rotated_by uuid,
  trigger_source text NOT NULL DEFAULT 'manual',
  notes text
);

ALTER TABLE public.key_rotation_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "key_rotation_log_admin_read"
  ON public.key_rotation_log FOR SELECT
  USING (public.is_admin(auth.uid()));

-- ---------- rotate_encryption_keys() ----------
CREATE OR REPLACE FUNCTION public.rotate_encryption_keys(_trigger_source text DEFAULT 'manual')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_old_version text;
  v_new_version text;
  v_next_n int;
BEGIN
  -- Only super admins (or service role with no auth.uid) can rotate
  IF auth.uid() IS NOT NULL AND NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only super admins can rotate encryption keys';
  END IF;

  SELECT version INTO v_old_version FROM public.encryption_keys WHERE is_current = true;

  -- Compute next version number
  SELECT COALESCE(MAX(NULLIF(regexp_replace(version, '[^0-9]', '', 'g'), '')::int), 0) + 1
    INTO v_next_n FROM public.encryption_keys;
  v_new_version := 'v' || v_next_n;

  UPDATE public.encryption_keys SET is_current = false, rotated_at = now() WHERE is_current = true;

  INSERT INTO public.encryption_keys (version, dek, is_current)
  VALUES (v_new_version, extensions.gen_random_bytes(32), true);

  INSERT INTO public.key_rotation_log (from_version, to_version, rotated_by, trigger_source)
  VALUES (v_old_version, v_new_version, auth.uid(), _trigger_source);

  RETURN jsonb_build_object(
    'success', true,
    'from_version', v_old_version,
    'to_version', v_new_version,
    'rotated_at', now()
  );
END;
$$;

REVOKE ALL ON FUNCTION public.rotate_encryption_keys(text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rotate_encryption_keys(text) TO service_role;

-- ---------- Get rotation status (admin UI) ----------
CREATE OR REPLACE FUNCTION public.get_encryption_status()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_version text;
  v_current_created timestamptz;
  v_total_keys int;
  v_last_rotation timestamptz;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  SELECT version, created_at INTO v_current_version, v_current_created
    FROM public.encryption_keys WHERE is_current = true;

  SELECT COUNT(*) INTO v_total_keys FROM public.encryption_keys;
  SELECT MAX(rotated_at) INTO v_last_rotation FROM public.key_rotation_log;

  RETURN jsonb_build_object(
    'current_version', v_current_version,
    'current_key_age_days', EXTRACT(DAY FROM now() - v_current_created)::int,
    'total_key_versions', v_total_keys,
    'last_rotation_at', v_last_rotation,
    'next_scheduled_rotation', v_current_created + interval '30 days'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_encryption_status() TO authenticated;