-- Fix: pgcrypto lives in `extensions` schema on Supabase
CREATE OR REPLACE FUNCTION public.hash_for_lookup(_value text)
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public, extensions
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
  RETURN encode(extensions.digest(v_salt || lower(trim(_value)), 'sha256'), 'hex');
END;
$$;

CREATE OR REPLACE FUNCTION public.encrypt_field(_plaintext text)
RETURNS bytea
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
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
  v_cipher := extensions.pgp_sym_encrypt(_plaintext, encode(v_dek, 'hex'), 'cipher-algo=aes256');
  v_ver_bytes := convert_to(v_version, 'UTF8');
  RETURN set_byte(decode(lpad(to_hex(length(v_ver_bytes)), 2, '0'), 'hex'), 0, length(v_ver_bytes))
         || v_ver_bytes
         || v_cipher;
END;
$$;

CREATE OR REPLACE FUNCTION public.decrypt_field(_payload bytea)
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_len int;
  v_version text;
  v_dek bytea;
  v_cipher bytea;
BEGIN
  IF _payload IS NULL THEN RETURN NULL; END IF;
  v_len := get_byte(_payload, 0);
  v_version := convert_from(substring(_payload FROM 2 FOR v_len), 'UTF8');
  v_cipher := substring(_payload FROM v_len + 2);
  v_dek := public._dek_for_version(v_version);
  IF v_dek IS NULL THEN
    RAISE EXCEPTION 'Encryption key version % not found', v_version;
  END IF;
  RETURN extensions.pgp_sym_decrypt(v_cipher, encode(v_dek, 'hex'));
END;
$$;

-- ===== Now run Phase 2 =====

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS dob_enc bytea,
  ADD COLUMN IF NOT EXISTS gender_enc bytea,
  ADD COLUMN IF NOT EXISTS pincode_enc bytea,
  ADD COLUMN IF NOT EXISTS whatsapp_enc bytea,
  ADD COLUMN IF NOT EXISTS hometown_enc bytea,
  ADD COLUMN IF NOT EXISTS linkedin_url_enc bytea,
  ADD COLUMN IF NOT EXISTS blood_group_enc bytea,
  ADD COLUMN IF NOT EXISTS address_enc bytea,
  ADD COLUMN IF NOT EXISTS emergency_contact_enc bytea,
  ADD COLUMN IF NOT EXISTS marriage_anniversary_enc bytea,
  ADD COLUMN IF NOT EXISTS pan_enc bytea,
  ADD COLUMN IF NOT EXISTS aadhaar_enc bytea,
  ADD COLUMN IF NOT EXISTS email_hash text,
  ADD COLUMN IF NOT EXISTS phone_hash text,
  ADD COLUMN IF NOT EXISTS whatsapp_hash text,
  ADD COLUMN IF NOT EXISTS pan_hash text,
  ADD COLUMN IF NOT EXISTS aadhaar_hash text;

CREATE INDEX IF NOT EXISTS profiles_email_hash_idx ON public.profiles(email_hash);
CREATE INDEX IF NOT EXISTS profiles_phone_hash_idx ON public.profiles(phone_hash);
CREATE INDEX IF NOT EXISTS profiles_whatsapp_hash_idx ON public.profiles(whatsapp_hash);
CREATE INDEX IF NOT EXISTS profiles_pan_hash_idx ON public.profiles(pan_hash);

UPDATE public.profiles SET email_hash = public.hash_for_lookup(email)
  WHERE email IS NOT NULL AND email_hash IS NULL;
UPDATE public.profiles SET phone_hash = public.hash_for_lookup(phone)
  WHERE phone IS NOT NULL AND phone_hash IS NULL;

ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS personal_history_enc bytea,
  ADD COLUMN IF NOT EXISTS medical_history_enc bytea,
  ADD COLUMN IF NOT EXISTS family_details_enc bytea,
  ADD COLUMN IF NOT EXISTS relationship_status_enc bytea,
  ADD COLUMN IF NOT EXISTS children_details_enc bytea,
  ADD COLUMN IF NOT EXISTS parents_details_enc bytea;

UPDATE public.clients
SET personal_history_enc = public.encrypt_field(personal_history_json::text)
WHERE personal_history_json IS NOT NULL AND personal_history_enc IS NULL;

CREATE OR REPLACE FUNCTION public.check_profile_duplicate(_email text, _phone text)
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email_hash text;
  v_phone_hash text;
BEGIN
  IF _email IS NOT NULL AND _email <> '' THEN
    v_email_hash := public.hash_for_lookup(_email);
    IF EXISTS (SELECT 1 FROM public.profiles WHERE email_hash = v_email_hash OR email = _email) THEN
      RETURN 'email';
    END IF;
  END IF;
  IF _phone IS NOT NULL AND _phone <> '' THEN
    v_phone_hash := public.hash_for_lookup(_phone);
    IF EXISTS (SELECT 1 FROM public.profiles WHERE phone_hash = v_phone_hash OR phone = _phone) THEN
      RETURN 'phone';
    END IF;
  END IF;
  RETURN 'none';
END;
$$;

CREATE OR REPLACE FUNCTION public.maintain_profile_hashes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR NEW.email IS DISTINCT FROM OLD.email THEN
    NEW.email_hash := public.hash_for_lookup(NEW.email);
  END IF;
  IF TG_OP = 'INSERT' OR NEW.phone IS DISTINCT FROM OLD.phone THEN
    NEW.phone_hash := public.hash_for_lookup(NEW.phone);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_maintain_hashes ON public.profiles;
CREATE TRIGGER profiles_maintain_hashes
  BEFORE INSERT OR UPDATE OF email, phone ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.maintain_profile_hashes();