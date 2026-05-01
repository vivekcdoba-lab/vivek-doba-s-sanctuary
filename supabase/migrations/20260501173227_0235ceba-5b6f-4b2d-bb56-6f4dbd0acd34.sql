-- 1) Course session pricing rules
CREATE TABLE IF NOT EXISTS public.course_session_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  trigger_enrollment_course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL,
  free_sessions int NOT NULL DEFAULT 0,
  discounted_sessions int NOT NULL DEFAULT 0,
  discounted_rate_inr int NOT NULL DEFAULT 0,
  paid_after int NOT NULL DEFAULT 0,
  notes text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_course_session_rules_course ON public.course_session_rules(course_id);
CREATE INDEX IF NOT EXISTS idx_course_session_rules_trigger ON public.course_session_rules(trigger_enrollment_course_id);

ALTER TABLE public.course_session_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "All can read course session rules" ON public.course_session_rules;
CREATE POLICY "All can read course session rules"
  ON public.course_session_rules FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins manage course session rules" ON public.course_session_rules;
CREATE POLICY "Admins manage course session rules"
  ON public.course_session_rules FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP TRIGGER IF EXISTS trg_course_session_rules_updated_at ON public.course_session_rules;
CREATE TRIGGER trg_course_session_rules_updated_at
  BEFORE UPDATE ON public.course_session_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Storage RLS for avatars (public read; users manage own folder; admins manage all)
DROP POLICY IF EXISTS "Avatars are publicly readable" ON storage.objects;
CREATE POLICY "Avatars are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users upload own avatar" ON storage.objects;
CREATE POLICY "Users upload own avatar"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users update own avatar" ON storage.objects;
CREATE POLICY "Users update own avatar"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users delete own avatar" ON storage.objects;
CREATE POLICY "Users delete own avatar"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Admins manage all avatars" ON storage.objects;
CREATE POLICY "Admins manage all avatars"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'avatars' AND public.is_admin(auth.uid()))
  WITH CHECK (bucket_id = 'avatars' AND public.is_admin(auth.uid()));