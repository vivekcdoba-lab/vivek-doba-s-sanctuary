
-- Topics table for controlled vocabulary
CREATE TABLE public.topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  category text,
  icon_emoji text,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view topics" ON public.topics
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins manage all topics" ON public.topics
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Authenticated users can create topics" ON public.topics
  FOR INSERT TO authenticated
  WITH CHECK (created_by IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid()));

-- Session templates table
CREATE TABLE public.session_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES public.profiles(id),
  name text NOT NULL,
  default_topic_ids uuid[] DEFAULT '{}',
  default_assignments jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.session_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage all templates" ON public.session_templates
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Coaches manage own templates" ON public.session_templates
  FOR ALL TO authenticated
  USING (coach_id IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid()))
  WITH CHECK (coach_id IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid()));

-- Session topics junction table
CREATE TABLE public.session_topics (
  session_id uuid REFERENCES public.sessions(id) ON DELETE CASCADE,
  topic_id uuid REFERENCES public.topics(id) ON DELETE CASCADE,
  PRIMARY KEY (session_id, topic_id)
);

ALTER TABLE public.session_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage session topics" ON public.session_topics
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Seekers view own session topics" ON public.session_topics
  FOR SELECT TO authenticated
  USING (session_id IN (
    SELECT s.id FROM public.sessions s
    WHERE s.seeker_id IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid())
  ));
