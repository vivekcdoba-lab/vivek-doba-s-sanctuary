-- Create timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ═══ CLIENTS TABLE ═══
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL,
  name TEXT NOT NULL,
  mobile TEXT,
  email TEXT,
  dob DATE,
  gender TEXT,
  income TEXT,
  education TEXT,
  course TEXT,
  sessions_committed INTEGER DEFAULT 0,
  personal_history_json JSONB DEFAULT '{}'::jsonb,
  signature_data TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can view their own clients"
  ON public.clients FOR SELECT
  USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can insert their own clients"
  ON public.clients FOR INSERT
  WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Coaches can update their own clients"
  ON public.clients FOR UPDATE
  USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can delete their own clients"
  ON public.clients FOR DELETE
  USING (auth.uid() = coach_id);

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═══ AGREEMENTS TABLE ═══
CREATE TABLE public.agreements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('coaching', 'goal')),
  fields_json JSONB DEFAULT '{}'::jsonb,
  signed_at TIMESTAMP WITH TIME ZONE,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.agreements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can view their own agreements"
  ON public.agreements FOR SELECT
  USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can insert their own agreements"
  ON public.agreements FOR INSERT
  WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Coaches can update their own agreements"
  ON public.agreements FOR UPDATE
  USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can delete their own agreements"
  ON public.agreements FOR DELETE
  USING (auth.uid() = coach_id);

CREATE TRIGGER update_agreements_updated_at
  BEFORE UPDATE ON public.agreements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═══ ASSESSMENTS TABLE ═══
CREATE TABLE public.assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL,
  scores_json JSONB DEFAULT '{}'::jsonb,
  analysis_text TEXT,
  language TEXT DEFAULT 'en',
  taken_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can view their own assessments"
  ON public.assessments FOR SELECT
  USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can insert their own assessments"
  ON public.assessments FOR INSERT
  WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Coaches can update their own assessments"
  ON public.assessments FOR UPDATE
  USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can delete their own assessments"
  ON public.assessments FOR DELETE
  USING (auth.uid() = coach_id);