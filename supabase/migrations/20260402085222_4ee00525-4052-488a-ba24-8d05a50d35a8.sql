CREATE TABLE public.japa_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seeker_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  mantra_text text NOT NULL DEFAULT 'ॐ नमः शिवाय',
  mala_count integer NOT NULL DEFAULT 0,
  total_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(seeker_id, log_date)
);

ALTER TABLE public.japa_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Seekers manage own japa logs" ON public.japa_log
  FOR ALL TO authenticated
  USING (seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  WITH CHECK (seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins manage all japa logs" ON public.japa_log
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));