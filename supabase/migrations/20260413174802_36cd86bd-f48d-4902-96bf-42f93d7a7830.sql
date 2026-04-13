
CREATE TABLE public.lgt_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seeker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  dharma_score INTEGER NOT NULL DEFAULT 5,
  artha_score INTEGER NOT NULL DEFAULT 5,
  kama_score INTEGER NOT NULL DEFAULT 5,
  moksha_score INTEGER NOT NULL DEFAULT 5,
  average_score NUMERIC,
  notes JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lgt_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Seekers manage own lgt assessments"
  ON public.lgt_assessments FOR ALL
  TO authenticated
  USING (seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  WITH CHECK (seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins manage all lgt assessments"
  ON public.lgt_assessments FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.validate_lgt_scores()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.dharma_score < 1 OR NEW.dharma_score > 10
    OR NEW.artha_score < 1 OR NEW.artha_score > 10
    OR NEW.kama_score < 1 OR NEW.kama_score > 10
    OR NEW.moksha_score < 1 OR NEW.moksha_score > 10 THEN
    RAISE EXCEPTION 'LGT scores must be between 1 and 10';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_lgt_scores
  BEFORE INSERT OR UPDATE ON public.lgt_assessments
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_lgt_scores();
