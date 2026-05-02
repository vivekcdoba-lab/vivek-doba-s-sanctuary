-- 1. Restrict coach_weekly_challenges: remove NULL-seeker exposure to all authenticated users
DROP POLICY IF EXISTS "Seekers view own challenges" ON public.coach_weekly_challenges;
CREATE POLICY "Seekers view own challenges"
  ON public.coach_weekly_challenges
  FOR SELECT
  USING (
    seeker_id IN (
      SELECT profiles.id FROM public.profiles WHERE profiles.user_id = auth.uid()
    )
  );

-- 2. Restrict email_send_log reads to super_admins (and service role) since recipient_email is plaintext PII
DROP POLICY IF EXISTS "Admins can view email send log" ON public.email_send_log;
DROP POLICY IF EXISTS "Restrict email_send_log reads to admins and service role" ON public.email_send_log;
CREATE POLICY "Super admins and service role can read email send log"
  ON public.email_send_log
  FOR SELECT
  USING (public.is_super_admin(auth.uid()) OR auth.role() = 'service_role');

-- 3. Hash unsubscribe token email for lookup; keep plaintext only as fallback but add hashed column
ALTER TABLE public.email_unsubscribe_tokens
  ADD COLUMN IF NOT EXISTS email_hash text;

UPDATE public.email_unsubscribe_tokens
   SET email_hash = public.hash_for_lookup(email)
 WHERE email_hash IS NULL AND email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_email_unsubscribe_tokens_email_hash
  ON public.email_unsubscribe_tokens(email_hash);

-- Trigger to maintain email_hash automatically
CREATE OR REPLACE FUNCTION public.maintain_unsubscribe_token_email_hash()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR NEW.email IS DISTINCT FROM OLD.email THEN
    NEW.email_hash := public.hash_for_lookup(NEW.email);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_maintain_unsubscribe_token_email_hash ON public.email_unsubscribe_tokens;
CREATE TRIGGER trg_maintain_unsubscribe_token_email_hash
  BEFORE INSERT OR UPDATE ON public.email_unsubscribe_tokens
  FOR EACH ROW EXECUTE FUNCTION public.maintain_unsubscribe_token_email_hash();