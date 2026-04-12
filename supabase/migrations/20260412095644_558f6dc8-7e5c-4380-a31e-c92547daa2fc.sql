
-- 1. Batches table
CREATE TABLE public.batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  capacity INTEGER NOT NULL DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage batches" ON public.batches FOR ALL TO authenticated
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Anyone can view active batches" ON public.batches FOR SELECT TO authenticated
  USING (true);

-- 2. Session attendees table
CREATE TABLE public.session_attendees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  seeker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  attendance_status TEXT NOT NULL DEFAULT 'pending',
  feedback_rating INTEGER,
  feedback_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(session_id, seeker_id)
);
ALTER TABLE public.session_attendees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage all attendees" ON public.session_attendees FOR ALL TO authenticated
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Seekers view own attendance" ON public.session_attendees FOR SELECT TO authenticated
  USING (seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Seekers update own feedback" ON public.session_attendees FOR UPDATE TO authenticated
  USING (seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- 3. Points ledger
CREATE TABLE public.points_ledger (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seeker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0,
  activity_type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.points_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage all points" ON public.points_ledger FOR ALL TO authenticated
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Seekers view own points" ON public.points_ledger FOR SELECT TO authenticated
  USING (seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Seekers earn points" ON public.points_ledger FOR INSERT TO authenticated
  WITH CHECK (seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- 4. Streaks table
CREATE TABLE public.streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seeker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_completed_date DATE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage all streaks" ON public.streaks FOR ALL TO authenticated
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Seekers view own streak" ON public.streaks FOR SELECT TO authenticated
  USING (seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Seekers manage own streak" ON public.streaks FOR UPDATE TO authenticated
  USING (seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Seekers insert own streak" ON public.streaks FOR INSERT TO authenticated
  WITH CHECK (seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Add updated_at triggers
CREATE TRIGGER update_batches_updated_at BEFORE UPDATE ON public.batches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_streaks_updated_at BEFORE UPDATE ON public.streaks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
