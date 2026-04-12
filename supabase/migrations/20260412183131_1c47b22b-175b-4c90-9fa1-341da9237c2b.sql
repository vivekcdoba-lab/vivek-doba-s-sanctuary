
-- Create favorite_affirmations table
CREATE TABLE public.favorite_affirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  affirmation_id UUID NOT NULL REFERENCES public.daily_affirmations(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, affirmation_id)
);

ALTER TABLE public.favorite_affirmations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites"
ON public.favorite_affirmations FOR SELECT
TO authenticated
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can save favorites"
ON public.favorite_affirmations FOR INSERT
TO authenticated
WITH CHECK (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can remove favorites"
ON public.favorite_affirmations FOR DELETE
TO authenticated
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins manage all favorites"
ON public.favorite_affirmations FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));
