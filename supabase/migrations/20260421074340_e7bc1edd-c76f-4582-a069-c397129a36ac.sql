-- =====================================================
-- PHASE 1: Encryption Infrastructure
-- =====================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------
-- Encryption keys table (versioned DEKs)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.encryption_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version text NOT NULL UNIQUE,
  dek bytea NOT NULL,                 -- 32-byte AES-256 key
  algorithm text NOT NULL DEFAULT 'aes-256-gcm-pgcrypto',
  is_current boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  rotated_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS encryption_keys_one_current
  ON public.encryption_keys ((is_current))
  WHERE is_current = true;

ALTER TABLE public.encryption_keys ENABLE ROW LEVEL SECURITY;

-- Only super-admins can read raw keys; functions use SECURITY DEFINER
CREATE POLICY "encryption_keys_super_admin_read"
  ON public.encryption_keys FOR SELECT
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "encryption_keys_super_admin_write"
  ON public.encryption_keys FOR ALL
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

-- ---------------------------------------------------------------
-- Settings table for the lookup-hash salt
-- ---------------------------------------------------------------
INSERT INTO public.app_settings (key, value)
VALUES ('encryption_lookup_salt', to_jsonb(encode(gen_random_bytes(32), 'hex')))
ON CONFLICT (key) DO NOTHING;

-- ---------------------------------------------------------------
-- Helper: get current DEK
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public._current_dek()
RETURNS TABLE(version text, dek bytea)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT version, dek FROM public.encryption_keys WHERE is_current = true LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public._dek_for_version(_version text)
RETURNS bytea
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT dek FROM public.encryption_keys WHERE version = _version LIMIT 1;
$$;

-- ---------------------------------------------------------------
-- encrypt_field(text) -> bytea
-- Output layout: 1 byte version-length || version-bytes || pgp_sym_encrypt output
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.encrypt_field(_plaintext text)
RETURNS bytea
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_version text;
  v_dek bytea;
  v_cipher bytea;
  v_ver_bytes bytea;
BEGIN
  IF _plaintext IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT version, dek INTO v_version, v_dek FROM public._current_dek();
  IF v_version IS NULL THEN
    RAISE EXCEPTION 'No active encryption key found';
  END IF;

  v_cipher := pgp_sym_encrypt(_plaintext, encode(v_dek, 'hex'), 'cipher-algo=aes256');
  v_ver_bytes := convert_to(v_version, 'UTF8');

  RETURN set_byte(decode(lpad(to_hex(length(v_ver_bytes)), 2, '0'), 'hex'), 0, length(v_ver_bytes))
         || v_ver_bytes
         || v_cipher;
END;
$$;

-- ---------------------------------------------------------------
-- decrypt_field(bytea) -> text
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.decrypt_field(_payload bytea)
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_len int;
  v_version text;
  v_dek bytea;
  v_cipher bytea;
BEGIN
  IF _payload IS NULL THEN
    RETURN NULL;
  END IF;

  v_len := get_byte(_payload, 0);
  v_version := convert_from(substring(_payload FROM 2 FOR v_len), 'UTF8');
  v_cipher := substring(_payload FROM v_len + 2);

  v_dek := public._dek_for_version(v_version);
  IF v_dek IS NULL THEN
    RAISE EXCEPTION 'Encryption key version % not found', v_version;
  END IF;

  RETURN pgp_sym_decrypt(v_cipher, encode(v_dek, 'hex'));
END;
$$;

-- ---------------------------------------------------------------
-- hash_for_lookup(text) -> text  (salted SHA-256 hex)
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.hash_for_lookup(_value text)
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_salt text;
BEGIN
  IF _value IS NULL OR _value = '' THEN
    RETURN NULL;
  END IF;
  SELECT value #>> '{}' INTO v_salt FROM public.app_settings WHERE key = 'encryption_lookup_salt';
  IF v_salt IS NULL THEN
    RAISE EXCEPTION 'Lookup salt not configured';
  END IF;
  RETURN encode(digest(v_salt || lower(trim(_value)), 'sha256'), 'hex');
END;
$$;

-- ---------------------------------------------------------------
-- Seed the first DEK (v1)
-- ---------------------------------------------------------------
INSERT INTO public.encryption_keys (version, dek, is_current)
VALUES ('v1', gen_random_bytes(32), true)
ON CONFLICT (version) DO NOTHING;

-- ---------------------------------------------------------------
-- Permissions
-- ---------------------------------------------------------------
REVOKE ALL ON public.encryption_keys FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.encrypt_field(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.decrypt_field(bytea) TO authenticated;
GRANT EXECUTE ON FUNCTION public.hash_for_lookup(text) TO authenticated;