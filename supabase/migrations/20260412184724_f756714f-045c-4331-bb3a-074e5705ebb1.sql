
CREATE TABLE public.daily_lgt_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seeker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  dharma_score INTEGER NOT NULL DEFAULT 5,
  artha_score INTEGER NOT NULL DEFAULT 5,
  kama_score INTEGER NOT NULL DEFAULT 5,
  moksha_score INTEGER NOT NULL DEFAULT 5,
  overall_balance NUMERIC(3,1),
  focus_recommendation TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(seeker_id, checkin_date)
);

ALTER TABLE public.daily_lgt_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Seekers manage own checkins"
ON public.daily_lgt_checkins FOR ALL
TO authenticated
USING (seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
WITH CHECK (seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins manage all checkins"
ON public.daily_lgt_checkins FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));
