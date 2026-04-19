-- 1. OTP codes: explicit deny for authenticated/anon SELECT
DROP POLICY IF EXISTS "Block authenticated reads on otp_codes" ON public.otp_codes;
CREATE POLICY "Block authenticated reads on otp_codes" ON public.otp_codes
  FOR SELECT TO authenticated, anon USING (false);

DROP POLICY IF EXISTS "Block authenticated writes on otp_codes" ON public.otp_codes;
CREATE POLICY "Block authenticated writes on otp_codes" ON public.otp_codes
  FOR ALL TO authenticated, anon USING (false) WITH CHECK (false);

-- 2. Profiles role escalation: ensure trigger is attached
DROP TRIGGER IF EXISTS prevent_role_escalation_trigger ON public.profiles;
CREATE TRIGGER prevent_role_escalation_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_escalation();

-- Simplify the UPDATE policy — trigger now enforces role immutability for non-admins
DO $$
DECLARE
  pol_name text;
BEGIN
  FOR pol_name IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles' AND cmd = 'UPDATE'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol_name);
  END LOOP;
END $$;

CREATE POLICY "Users can update own profile (role locked by trigger)"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()))
  WITH CHECK (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- 3. Realtime channel authorization — scope to user's own topics
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users subscribe own topics" ON realtime.messages;
CREATE POLICY "Users subscribe own topics" ON realtime.messages
  FOR SELECT TO authenticated
  USING (
    realtime.topic() LIKE '%' || auth.uid()::text || '%'
  );

-- 4. Resources bucket: make private (signed URLs required)
UPDATE storage.buckets SET public = false WHERE id = 'resources';

-- Drop overly broad SELECT policies on storage.objects for resources/avatars to prevent listing
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname ILIKE '%public%list%'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

-- Tighten signatures bucket UPDATE/DELETE to user's folder only
DROP POLICY IF EXISTS "Signers can update own signatures" ON storage.objects;
CREATE POLICY "Signers can update own signatures" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'signatures' AND (auth.uid())::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'signatures' AND (auth.uid())::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Signers can delete own signatures" ON storage.objects;
CREATE POLICY "Signers can delete own signatures" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'signatures' AND (auth.uid())::text = (storage.foldername(name))[1]);