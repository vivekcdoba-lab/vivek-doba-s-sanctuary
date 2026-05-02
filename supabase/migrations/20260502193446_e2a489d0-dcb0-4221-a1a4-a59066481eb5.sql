
CREATE OR REPLACE FUNCTION public.enforce_otp_cooldown()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_age_seconds numeric;
  v_existing record;
BEGIN
  SELECT created_at, code_enc INTO v_existing
    FROM public.otp_codes
    WHERE identifier = NEW.identifier
    LIMIT 1;

  IF v_existing.created_at IS NULL THEN
    RETURN NEW;
  END IF;

  -- Only enforce cooldown when a fresh OTP is being issued (code changed)
  IF NEW.code_enc IS DISTINCT FROM v_existing.code_enc THEN
    v_age_seconds := EXTRACT(EPOCH FROM (now() - v_existing.created_at));
    IF v_age_seconds < 60 THEN
      RAISE EXCEPTION 'OTP_COOLDOWN: please wait % seconds before requesting another OTP',
        ceil(60 - v_age_seconds);
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_otp_cooldown ON public.otp_codes;
CREATE TRIGGER trg_enforce_otp_cooldown
BEFORE INSERT OR UPDATE ON public.otp_codes
FOR EACH ROW EXECUTE FUNCTION public.enforce_otp_cooldown();
