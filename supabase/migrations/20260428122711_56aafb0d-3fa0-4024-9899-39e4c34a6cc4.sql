
-- 1. Add SET search_path to pgmq wrapper functions (was mutable)
CREATE OR REPLACE FUNCTION public.delete_email(queue_name text, message_id bigint)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pgmq
AS $$
BEGIN
  RETURN pgmq.delete(queue_name, message_id);
EXCEPTION WHEN undefined_table THEN
  RETURN FALSE;
END;
$$;

CREATE OR REPLACE FUNCTION public.enqueue_email(queue_name text, payload jsonb)
RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pgmq
AS $$
BEGIN
  RETURN pgmq.send(queue_name, payload);
EXCEPTION WHEN undefined_table THEN
  PERFORM pgmq.create(queue_name);
  RETURN pgmq.send(queue_name, payload);
END;
$$;

CREATE OR REPLACE FUNCTION public.move_to_dlq(source_queue text, dlq_name text, message_id bigint, payload jsonb)
RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pgmq
AS $$
DECLARE new_id BIGINT;
BEGIN
  SELECT pgmq.send(dlq_name, payload) INTO new_id;
  PERFORM pgmq.delete(source_queue, message_id);
  RETURN new_id;
EXCEPTION WHEN undefined_table THEN
  BEGIN
    PERFORM pgmq.create(dlq_name);
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  SELECT pgmq.send(dlq_name, payload) INTO new_id;
  BEGIN
    PERFORM pgmq.delete(source_queue, message_id);
  EXCEPTION WHEN undefined_table THEN
    NULL;
  END;
  RETURN new_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.read_email_batch(queue_name text, batch_size integer, vt integer)
RETURNS TABLE(msg_id bigint, read_ct integer, message jsonb)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pgmq
AS $$
BEGIN
  RETURN QUERY SELECT r.msg_id, r.read_ct, r.message FROM pgmq.read(queue_name, vt, batch_size) r;
EXCEPTION WHEN undefined_table THEN
  PERFORM pgmq.create(queue_name);
  RETURN;
END;
$$;

CREATE OR REPLACE FUNCTION public.purge_email_queue(queue_name text)
RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pgmq
AS $$
DECLARE n bigint;
BEGIN
  SELECT pgmq.purge_queue(queue_name) INTO n;
  RETURN n;
EXCEPTION WHEN undefined_table THEN
  RETURN 0;
END;
$$;

-- 2. Revoke EXECUTE from anon/authenticated on internal SECURITY DEFINER functions
-- These are intended only for service_role / triggers / other SECURITY DEFINER callers.

-- Encryption internals — must never be callable by clients
REVOKE EXECUTE ON FUNCTION public._current_dek() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public._dek_for_version(text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.decrypt_field(bytea) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.decrypt_many(bytea[]) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.encrypt_field(text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.hash_for_lookup(text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.hash_token(text) FROM anon, authenticated, public;

-- Email queue internals — service-role / cron only
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM anon, authenticated, public;

-- Trigger / maintenance functions — never called directly by clients
REVOKE EXECUTE ON FUNCTION public.auto_link_coaches_on_enrollment() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.auto_link_seekers_on_program_trainer_insert() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.check_single_assessment_rate_limit() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_sessions() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.close_inactive_sessions() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.maintain_profile_hashes() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.prevent_admin_level_escalation() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.prevent_role_escalation() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.validate_seeker_session_update() FROM anon, authenticated, public;

-- Admin-only / report functions — keep callable only by service_role / cron
REVOKE EXECUTE ON FUNCTION public.get_daily_session_report() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.get_encryption_status() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.rotate_encryption_keys(text) FROM anon, authenticated, public;
-- get_encryption_status and rotate_encryption_keys still self-check is_admin / is_super_admin internally,
-- but admins call them via edge functions using service-role; clients should not invoke directly.

-- 3. Strengthen profiles UPDATE policy: explicitly forbid non-admins from
-- toggling is_also_coach in WITH CHECK (defense in depth alongside the
-- prevent_admin_level_escalation trigger which reverts it).
DROP POLICY IF EXISTS "Users update own non-role fields" ON public.profiles;
CREATE POLICY "Users update own non-role fields"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND NOT (role IS DISTINCT FROM (SELECT p.role FROM public.profiles p WHERE p.user_id = auth.uid()))
  AND NOT (admin_level IS DISTINCT FROM (SELECT p.admin_level FROM public.profiles p WHERE p.user_id = auth.uid()))
  AND NOT (admin_permissions IS DISTINCT FROM (SELECT p.admin_permissions FROM public.profiles p WHERE p.user_id = auth.uid()))
  AND NOT (is_also_coach IS DISTINCT FROM (SELECT p.is_also_coach FROM public.profiles p WHERE p.user_id = auth.uid()))
  AND is_also_coach IS NOT TRUE
       OR (SELECT p.is_also_coach FROM public.profiles p WHERE p.user_id = auth.uid()) IS TRUE
);

-- Actually rewrite cleaner: deny any update that ends with is_also_coach=true unless it was already true.
DROP POLICY IF EXISTS "Users update own non-role fields" ON public.profiles;
CREATE POLICY "Users update own non-role fields"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND NOT (role IS DISTINCT FROM (SELECT p.role FROM public.profiles p WHERE p.user_id = auth.uid()))
  AND NOT (admin_level IS DISTINCT FROM (SELECT p.admin_level FROM public.profiles p WHERE p.user_id = auth.uid()))
  AND NOT (admin_permissions IS DISTINCT FROM (SELECT p.admin_permissions FROM public.profiles p WHERE p.user_id = auth.uid()))
  AND NOT (is_also_coach IS DISTINCT FROM (SELECT p.is_also_coach FROM public.profiles p WHERE p.user_id = auth.uid()))
);

-- 4. Add an explicit admin-read policy on email_send_log so admins can audit
-- email delivery via the application (currently service-role only). Service
-- role bypasses RLS regardless, so the strict scoping remains intact.
DROP POLICY IF EXISTS "Admins can view email send log" ON public.email_send_log;
CREATE POLICY "Admins can view email send log"
ON public.email_send_log FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));
