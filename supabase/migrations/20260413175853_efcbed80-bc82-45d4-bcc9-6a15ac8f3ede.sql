
-- =========================================================
-- 1. PURUSHARTHAS ASSESSMENTS
-- =========================================================
CREATE TABLE public.purusharthas_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seeker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  dharma_score INTEGER NOT NULL DEFAULT 5,
  artha_score INTEGER NOT NULL DEFAULT 5,
  kama_score INTEGER NOT NULL DEFAULT 5,
  moksha_score INTEGER NOT NULL DEFAULT 5,
  sub_dimensions JSONB DEFAULT '{}'::jsonb,
  average_score NUMERIC,
  notes JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.purusharthas_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Seekers manage own purusharthas" ON public.purusharthas_assessments
  FOR ALL TO authenticated
  USING (seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  WITH CHECK (seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins manage all purusharthas" ON public.purusharthas_assessments
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.validate_purusharthas_scores()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.dharma_score < 1 OR NEW.dharma_score > 10 OR
     NEW.artha_score < 1 OR NEW.artha_score > 10 OR
     NEW.kama_score < 1 OR NEW.kama_score > 10 OR
     NEW.moksha_score < 1 OR NEW.moksha_score > 10 THEN
    RAISE EXCEPTION 'Purusharthas scores must be between 1 and 10';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_purusharthas_scores
  BEFORE INSERT OR UPDATE ON public.purusharthas_assessments
  FOR EACH ROW EXECUTE FUNCTION public.validate_purusharthas_scores();

-- =========================================================
-- 2. HAPPINESS ASSESSMENTS
-- =========================================================
CREATE TABLE public.happiness_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seeker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  life_satisfaction_score INTEGER NOT NULL DEFAULT 5,
  positive_emotions_score INTEGER NOT NULL DEFAULT 5,
  engagement_score INTEGER NOT NULL DEFAULT 5,
  relationships_score INTEGER NOT NULL DEFAULT 5,
  meaning_score INTEGER NOT NULL DEFAULT 5,
  accomplishment_score INTEGER NOT NULL DEFAULT 5,
  health_score INTEGER NOT NULL DEFAULT 5,
  gratitude_score INTEGER NOT NULL DEFAULT 5,
  average_score NUMERIC,
  notes JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.happiness_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Seekers manage own happiness" ON public.happiness_assessments
  FOR ALL TO authenticated
  USING (seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  WITH CHECK (seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins manage all happiness" ON public.happiness_assessments
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.validate_happiness_scores()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.life_satisfaction_score < 1 OR NEW.life_satisfaction_score > 10 OR
     NEW.positive_emotions_score < 1 OR NEW.positive_emotions_score > 10 OR
     NEW.engagement_score < 1 OR NEW.engagement_score > 10 OR
     NEW.relationships_score < 1 OR NEW.relationships_score > 10 OR
     NEW.meaning_score < 1 OR NEW.meaning_score > 10 OR
     NEW.accomplishment_score < 1 OR NEW.accomplishment_score > 10 OR
     NEW.health_score < 1 OR NEW.health_score > 10 OR
     NEW.gratitude_score < 1 OR NEW.gratitude_score > 10 THEN
    RAISE EXCEPTION 'Happiness scores must be between 1 and 10';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_happiness_scores
  BEFORE INSERT OR UPDATE ON public.happiness_assessments
  FOR EACH ROW EXECUTE FUNCTION public.validate_happiness_scores();

-- =========================================================
-- 3. MOOCH ASSESSMENTS
-- =========================================================
CREATE TABLE public.mooch_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seeker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  overthinking_score INTEGER NOT NULL DEFAULT 5,
  negativity_score INTEGER NOT NULL DEFAULT 5,
  comparison_score INTEGER NOT NULL DEFAULT 5,
  fear_score INTEGER NOT NULL DEFAULT 5,
  attachment_score INTEGER NOT NULL DEFAULT 5,
  resistance_score INTEGER NOT NULL DEFAULT 5,
  average_score NUMERIC,
  notes JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.mooch_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Seekers manage own mooch" ON public.mooch_assessments
  FOR ALL TO authenticated
  USING (seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  WITH CHECK (seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins manage all mooch" ON public.mooch_assessments
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.validate_mooch_scores()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.overthinking_score < 1 OR NEW.overthinking_score > 10 OR
     NEW.negativity_score < 1 OR NEW.negativity_score > 10 OR
     NEW.comparison_score < 1 OR NEW.comparison_score > 10 OR
     NEW.fear_score < 1 OR NEW.fear_score > 10 OR
     NEW.attachment_score < 1 OR NEW.attachment_score > 10 OR
     NEW.resistance_score < 1 OR NEW.resistance_score > 10 THEN
    RAISE EXCEPTION 'MOOCH scores must be between 1 and 10';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_mooch_scores
  BEFORE INSERT OR UPDATE ON public.mooch_assessments
  FOR EACH ROW EXECUTE FUNCTION public.validate_mooch_scores();

-- =========================================================
-- 4. FIRO-B ASSESSMENTS
-- =========================================================
CREATE TABLE public.firo_b_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seeker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  expressed_inclusion INTEGER NOT NULL DEFAULT 0,
  wanted_inclusion INTEGER NOT NULL DEFAULT 0,
  expressed_control INTEGER NOT NULL DEFAULT 0,
  wanted_control INTEGER NOT NULL DEFAULT 0,
  expressed_affection INTEGER NOT NULL DEFAULT 0,
  wanted_affection INTEGER NOT NULL DEFAULT 0,
  total_expressed INTEGER,
  total_wanted INTEGER,
  notes JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.firo_b_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Seekers manage own firo_b" ON public.firo_b_assessments
  FOR ALL TO authenticated
  USING (seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  WITH CHECK (seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins manage all firo_b" ON public.firo_b_assessments
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.validate_firo_b_scores()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.expressed_inclusion < 0 OR NEW.expressed_inclusion > 9 OR
     NEW.wanted_inclusion < 0 OR NEW.wanted_inclusion > 9 OR
     NEW.expressed_control < 0 OR NEW.expressed_control > 9 OR
     NEW.wanted_control < 0 OR NEW.wanted_control > 9 OR
     NEW.expressed_affection < 0 OR NEW.expressed_affection > 9 OR
     NEW.wanted_affection < 0 OR NEW.wanted_affection > 9 THEN
    RAISE EXCEPTION 'FIRO-B scores must be between 0 and 9';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_firo_b_scores
  BEFORE INSERT OR UPDATE ON public.firo_b_assessments
  FOR EACH ROW EXECUTE FUNCTION public.validate_firo_b_scores();
