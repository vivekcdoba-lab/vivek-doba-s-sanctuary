
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'general' CHECK (type IN ('general','workshop','course_update','celebration','maintenance')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  audience TEXT[] NOT NULL DEFAULT ARRAY['all'],
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_pinned BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_announcements_priority ON public.announcements(is_pinned DESC, priority, created_at DESC);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view announcements"
  ON public.announcements FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins manage announcements"
  ON public.announcements FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Track reads
CREATE TABLE public.announcement_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(announcement_id, user_id)
);

CREATE INDEX idx_announcement_reads_user ON public.announcement_reads(user_id);

ALTER TABLE public.announcement_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own reads"
  ON public.announcement_reads FOR SELECT TO authenticated
  USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users mark as read"
  ON public.announcement_reads FOR INSERT TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins view all reads"
  ON public.announcement_reads FOR SELECT TO authenticated
  USING (is_admin(auth.uid()));
