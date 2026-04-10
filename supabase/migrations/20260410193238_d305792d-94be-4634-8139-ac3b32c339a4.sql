
CREATE TABLE public.user_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seeker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'audio', 'pdf', 'framework', 'session_note')),
  content_id UUID,
  content_title TEXT NOT NULL,
  content_url TEXT,
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Seekers manage own bookmarks"
  ON public.user_bookmarks FOR ALL
  TO authenticated
  USING (seeker_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
  WITH CHECK (seeker_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins manage all bookmarks"
  ON public.user_bookmarks FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE INDEX idx_user_bookmarks_seeker ON public.user_bookmarks(seeker_id);
CREATE INDEX idx_user_bookmarks_type ON public.user_bookmarks(content_type);
