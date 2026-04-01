
-- Create submission status enum
CREATE TYPE public.submission_status AS ENUM ('pending', 'approved', 'rejected', 'info_requested');

-- Create submissions table for all 3 intake forms
CREATE TABLE public.submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_type TEXT NOT NULL, -- 'discovery_call', 'workshop', 'lgt_application'
  status submission_status NOT NULL DEFAULT 'pending',
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  mobile TEXT,
  country_code TEXT DEFAULT '+91',
  form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Public can insert (for form submissions)
CREATE POLICY "Anyone can submit forms"
  ON public.submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only authenticated users can view (admin)
CREATE POLICY "Authenticated users can view submissions"
  ON public.submissions FOR SELECT
  TO authenticated
  USING (true);

-- Only authenticated users can update (admin approve/reject)
CREATE POLICY "Authenticated users can update submissions"
  ON public.submissions FOR UPDATE
  TO authenticated
  USING (true);

-- Add updated_at trigger
CREATE TRIGGER update_submissions_updated_at
  BEFORE UPDATE ON public.submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for live updates in admin panel
ALTER PUBLICATION supabase_realtime ADD TABLE public.submissions;
