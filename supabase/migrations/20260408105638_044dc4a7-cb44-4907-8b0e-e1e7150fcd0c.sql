
-- Session comments table for per-section threaded comments
CREATE TABLE public.session_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  section_name text NOT NULL CHECK (section_name IN ('notes','insights','breakthroughs','topics','assignments','general')),
  author_id uuid NOT NULL REFERENCES public.profiles(id),
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Audit log table (append-only)
CREATE TABLE public.session_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.sessions(id) ON DELETE SET NULL,
  actor_id uuid REFERENCES public.profiles(id),
  action text NOT NULL CHECK (action IN ('created','edited','deleted','approved','revision_requested','signed','commented','submitted')),
  diff jsonb,
  created_at timestamptz DEFAULT now()
);

-- Add revision_note column to sessions
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS revision_note text;

-- Enable RLS
ALTER TABLE public.session_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS for session_comments
CREATE POLICY "Admins manage all comments" ON public.session_comments
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Seekers view own session comments" ON public.session_comments
  FOR SELECT TO authenticated
  USING (session_id IN (
    SELECT s.id FROM public.sessions s
    WHERE s.seeker_id IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid())
  ));

CREATE POLICY "Seekers insert own session comments" ON public.session_comments
  FOR INSERT TO authenticated
  WITH CHECK (
    author_id IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid())
    AND session_id IN (
      SELECT s.id FROM public.sessions s
      WHERE s.seeker_id IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid())
    )
  );

CREATE POLICY "Seekers update own comment read status" ON public.session_comments
  FOR UPDATE TO authenticated
  USING (session_id IN (
    SELECT s.id FROM public.sessions s
    WHERE s.seeker_id IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid())
  ));

-- RLS for audit_log (append-only for authenticated, select for admins)
CREATE POLICY "Admins view all audit logs" ON public.session_audit_log
  FOR SELECT TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Authenticated users insert audit logs" ON public.session_audit_log
  FOR INSERT TO authenticated
  WITH CHECK (actor_id IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid()));

-- Enable realtime for comments
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_comments;
