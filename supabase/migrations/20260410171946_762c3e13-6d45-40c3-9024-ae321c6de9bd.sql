
CREATE OR REPLACE FUNCTION public.check_profile_duplicate(_email text, _phone text)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.profiles WHERE email = _email) THEN
    RETURN 'email';
  END IF;
  IF _phone != '' AND EXISTS (SELECT 1 FROM public.profiles WHERE phone = _phone) THEN
    RETURN 'phone';
  END IF;
  RETURN 'none';
END;
$$;
