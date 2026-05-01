CREATE TABLE public.weekly_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seeker_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id uuid REFERENCES public.sessions(id) ON DELETE SET NULL,
  week_start date NOT NULL,
  week_end date NOT NULL,
  rating int CHECK (rating BETWEEN 1 AND 5),
  wins jsonb NOT NULL DEFAULT '[]'::jsonb,
  challenge text,
  learning text,
  wheel_scores jsonb NOT NULL DEFAULT '[]'::jsonb,
  next_goals text,
  need_from_coach text,
  gratitude text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (seeker_id, week_start)
);

ALTER TABLE public.weekly_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Seekers view own weekly reviews"
  ON public.weekly_reviews FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles p
            WHERE p.id = weekly_reviews.seeker_id AND p.user_id = auth.uid())
  );

CREATE POLICY "Seekers insert own weekly reviews"
  ON public.weekly_reviews FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p
            WHERE p.id = weekly_reviews.seeker_id AND p.user_id = auth.uid())
  );

CREATE POLICY "Seekers update own weekly reviews"
  ON public.weekly_reviews FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles p
            WHERE p.id = weekly_reviews.seeker_id AND p.user_id = auth.uid())
  );

CREATE POLICY "Admins manage all weekly reviews"
  ON public.weekly_reviews FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Assigned coaches view seeker weekly reviews"
  ON public.weekly_reviews FOR SELECT TO authenticated
  USING (public.is_assigned_coach(auth.uid(), weekly_reviews.seeker_id));

CREATE TRIGGER trg_weekly_reviews_updated_at
  BEFORE UPDATE ON public.weekly_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_weekly_reviews_seeker_week ON public.weekly_reviews(seeker_id, week_start DESC);