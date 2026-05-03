CREATE OR REPLACE FUNCTION public.submit_lgt_application_by_token(_token text, _form_data jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
        invite_token_hash = v_hash,
        invite_token_expires_at = NULL
    WHERE id = v_app.id;

  RETURN jsonb_build_object('success', true, 'application_id', v_app.id);
END;
$function$;