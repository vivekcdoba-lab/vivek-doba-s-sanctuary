-- Batched decrypt helper for list views (one round trip vs N)
CREATE OR REPLACE FUNCTION public.decrypt_many(_payloads bytea[])
RETURNS text[]
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_result text[];
  v_item bytea;
BEGIN
  IF _payloads IS NULL THEN RETURN NULL; END IF;
  v_result := ARRAY[]::text[];
  FOREACH v_item IN ARRAY _payloads LOOP
    IF v_item IS NULL THEN
      v_result := array_append(v_result, NULL);
    ELSE
      v_result := array_append(v_result, public.decrypt_field(v_item));
    END IF;
  END LOOP;
  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.decrypt_many(bytea[]) TO authenticated, service_role;

-- Convenience wrapper to hash password-reset / one-time tokens (alias of hash_for_lookup)
CREATE OR REPLACE FUNCTION public.hash_token(_token text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT public.hash_for_lookup(_token);
$$;

GRANT EXECUTE ON FUNCTION public.hash_token(text) TO authenticated, service_role, anon;