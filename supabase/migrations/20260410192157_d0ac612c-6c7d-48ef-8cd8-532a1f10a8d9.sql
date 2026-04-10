
-- Create learning_content table
CREATE TABLE public.learning_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'video' CHECK (type IN ('video', 'audio', 'pdf', 'framework')),
  category TEXT,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_minutes INTEGER,
  course_id UUID REFERENCES public.courses(id),
  tier TEXT NOT NULL DEFAULT 'standard',
  language TEXT NOT NULL DEFAULT 'HI',
  tags TEXT[],
  view_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.learning_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active learning content"
ON public.learning_content FOR SELECT TO authenticated
USING (is_active = true);

CREATE POLICY "Admins manage all learning content"
ON public.learning_content FOR ALL TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Create user_content_progress table
CREATE TABLE public.user_content_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES public.learning_content(id) ON DELETE CASCADE,
  seeker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  progress_percent INTEGER NOT NULL DEFAULT 0,
  last_position_seconds INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  is_bookmarked BOOLEAN NOT NULL DEFAULT false,
  last_watched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(content_id, seeker_id)
);

ALTER TABLE public.user_content_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Seekers manage own progress"
ON public.user_content_progress FOR ALL TO authenticated
USING (seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
WITH CHECK (seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins view all progress"
ON public.user_content_progress FOR SELECT TO authenticated
USING (is_admin(auth.uid()));

-- Indexes
CREATE INDEX idx_learning_content_category ON public.learning_content(category);
CREATE INDEX idx_learning_content_type ON public.learning_content(type);
CREATE INDEX idx_user_content_progress_seeker ON public.user_content_progress(seeker_id);

-- Updated_at triggers
CREATE TRIGGER update_learning_content_updated_at
BEFORE UPDATE ON public.learning_content
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_content_progress_updated_at
BEFORE UPDATE ON public.user_content_progress
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
