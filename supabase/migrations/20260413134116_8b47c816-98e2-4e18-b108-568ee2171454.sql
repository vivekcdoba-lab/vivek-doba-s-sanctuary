
-- Wheel of Life assessments table
CREATE TABLE public.wheel_of_life_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seeker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  career_score INTEGER NOT NULL DEFAULT 5,
  finance_score INTEGER NOT NULL DEFAULT 5,
  health_score INTEGER NOT NULL DEFAULT 5,
  family_score INTEGER NOT NULL DEFAULT 5,
  romance_score INTEGER NOT NULL DEFAULT 5,
  growth_score INTEGER NOT NULL DEFAULT 5,
  fun_score INTEGER NOT NULL DEFAULT 5,
  environment_score INTEGER NOT NULL DEFAULT 5,
  average_score DECIMAL(3,1),
  notes JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Validation trigger instead of CHECK constraints
CREATE OR REPLACE FUNCTION public.validate_wol_scores()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.career_score < 1 OR NEW.career_score > 10
    OR NEW.finance_score < 1 OR NEW.finance_score > 10
    OR NEW.health_score < 1 OR NEW.health_score > 10
    OR NEW.family_score < 1 OR NEW.family_score > 10
    OR NEW.romance_score < 1 OR NEW.romance_score > 10
    OR NEW.growth_score < 1 OR NEW.growth_score > 10
    OR NEW.fun_score < 1 OR NEW.fun_score > 10
    OR NEW.environment_score < 1 OR NEW.environment_score > 10
  THEN
    RAISE EXCEPTION 'All scores must be between 1 and 10';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_wol_scores
BEFORE INSERT OR UPDATE ON public.wheel_of_life_assessments
FOR EACH ROW EXECUTE FUNCTION public.validate_wol_scores();

-- Assessment action items table
CREATE TABLE public.assessment_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seeker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assessment_type TEXT NOT NULL DEFAULT 'wheel_of_life',
  assessment_id UUID,
  action_text TEXT NOT NULL,
  category TEXT,
  priority INTEGER DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending',
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.wheel_of_life_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_actions ENABLE ROW LEVEL SECURITY;

-- Seekers manage own WoL assessments
CREATE POLICY "Seekers manage own wol assessments"
ON public.wheel_of_life_assessments FOR ALL
TO authenticated
USING (seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
WITH CHECK (seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Admins manage all WoL assessments
CREATE POLICY "Admins manage all wol assessments"
ON public.wheel_of_life_assessments FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Seekers manage own assessment actions
CREATE POLICY "Seekers manage own assessment actions"
ON public.assessment_actions FOR ALL
TO authenticated
USING (seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
WITH CHECK (seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Admins manage all assessment actions
CREATE POLICY "Admins manage all assessment actions"
ON public.assessment_actions FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));
