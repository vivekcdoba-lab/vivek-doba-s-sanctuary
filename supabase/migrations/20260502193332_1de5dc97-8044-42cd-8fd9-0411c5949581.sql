
-- 1) Encrypted mirrors for submissions email/mobile
ALTER TABLE public.submissions
  ADD COLUMN IF NOT EXISTS email_enc bytea,
  ADD COLUMN IF NOT EXISTS mobile_enc bytea,
  ADD COLUMN IF NOT EXISTS email_hash text,
  ADD COLUMN IF NOT EXISTS mobile_hash text;

CREATE OR REPLACE FUNCTION public.maintain_submission_pii()
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
  IF TG_OP = 'INSERT' OR NEW.mobile IS DISTINCT FROM OLD.mobile THEN
    NEW.mobile_enc  := public.encrypt_field(NEW.mobile);
    NEW.mobile_hash := public.hash_for_lookup(NEW.mobile);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_maintain_submission_pii ON public.submissions;
CREATE TRIGGER trg_maintain_submission_pii
BEFORE INSERT OR UPDATE ON public.submissions
FOR EACH ROW EXECUTE FUNCTION public.maintain_submission_pii();

UPDATE public.submissions
SET email_enc  = public.encrypt_field(email),
    email_hash = public.hash_for_lookup(email),
    mobile_enc = public.encrypt_field(mobile),
    mobile_hash = public.hash_for_lookup(mobile)
WHERE email_enc IS NULL OR mobile_enc IS NULL;

-- 2) OTP cooldown trigger
CREATE OR REPLACE FUNCTION public.enforce_otp_cooldown()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_age_seconds numeric;
BEGIN
  SELECT EXTRACT(EPOCH FROM (now() - created_at))
    INTO v_age_seconds
    FROM public.otp_codes
    WHERE identifier = NEW.identifier
    LIMIT 1;

  IF v_age_seconds IS NOT NULL AND v_age_seconds < 60 THEN
    RAISE EXCEPTION 'OTP_COOLDOWN: please wait % seconds before requesting another OTP',
      ceil(60 - v_age_seconds);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_otp_cooldown ON public.otp_codes;
CREATE TRIGGER trg_enforce_otp_cooldown
BEFORE INSERT ON public.otp_codes
FOR EACH ROW EXECUTE FUNCTION public.enforce_otp_cooldown();
