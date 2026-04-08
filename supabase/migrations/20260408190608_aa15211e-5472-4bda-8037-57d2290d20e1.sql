
CREATE TABLE public.swot_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('strength', 'weakness', 'opportunity', 'threat')),
  text TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.swot_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage swot_entries"
  ON public.swot_entries FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE TABLE public.swot_competitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  strengths JSONB NOT NULL DEFAULT '[]'::jsonb,
  weaknesses JSONB NOT NULL DEFAULT '[]'::jsonb,
  opportunity_for_vdts JSONB NOT NULL DEFAULT '[]'::jsonb,
  threat_level TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (threat_level IN ('LOW', 'MEDIUM', 'HIGH')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.swot_competitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage swot_competitors"
  ON public.swot_competitors FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE TRIGGER update_swot_entries_updated_at
  BEFORE UPDATE ON public.swot_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_swot_competitors_updated_at
  BEFORE UPDATE ON public.swot_competitors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
