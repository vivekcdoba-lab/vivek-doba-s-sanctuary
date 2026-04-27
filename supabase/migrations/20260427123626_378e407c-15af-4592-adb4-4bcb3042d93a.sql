CREATE OR REPLACE FUNCTION public.purge_email_queue(queue_name text)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE n bigint;
BEGIN
  SELECT pgmq.purge_queue(queue_name) INTO n;
  RETURN n;
EXCEPTION WHEN undefined_table THEN
  RETURN 0;
END;
$$;
REVOKE ALL ON FUNCTION public.purge_email_queue(text) FROM PUBLIC, anon, authenticated;