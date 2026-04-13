
CREATE TABLE public.personal_swot_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seeker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  strengths JSONB DEFAULT '[]'::jsonb,
  weaknesses JSONB DEFAULT '[]'::jsonb,
  opportunities JSONB DEFAULT '[]'::jsonb,
  threats JSONB DEFAULT '[]'::jsonb,
  overall_notes TEXT,
  strength_count INT DEFAULT 0,
  weakness_count INT DEFAULT 0,
  opportunity_count INT DEFAULT 0,
  threat_count INT DEFAULT 0,
  balance_score NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.personal_swot_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Seekers can view own SWOT assessments"
ON public.personal_swot_assessments FOR SELECT
TO authenticated
USING (seeker_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Seekers can create own SWOT assessments"
ON public.personal_swot_assessments FOR INSERT
TO authenticated
WITH CHECK (seeker_id = auth.uid());

CREATE POLICY "Seekers can delete own SWOT assessments"
ON public.personal_swot_assessments FOR DELETE
TO authenticated
USING (seeker_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE INDEX idx_personal_swot_seeker ON public.personal_swot_assessments(seeker_id);
CREATE INDEX idx_personal_swot_created ON public.personal_swot_assessments(created_at DESC);
