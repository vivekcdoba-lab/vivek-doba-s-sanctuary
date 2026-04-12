
-- 1. DAILY AFFIRMATIONS
CREATE TABLE public.daily_affirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affirmation_text TEXT NOT NULL,
  affirmation_hindi TEXT,
  category TEXT DEFAULT 'general',
  source TEXT,
  author TEXT,
  image_url TEXT,
  display_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.daily_affirmations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active affirmations" ON public.daily_affirmations FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Admins manage affirmations" ON public.daily_affirmations FOR ALL TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- 2. PROGRAM TRAINERS
CREATE TABLE public.program_trainers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  trainer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'trainer',
  display_order INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.program_trainers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view trainers" ON public.program_trainers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage trainers" ON public.program_trainers FOR ALL TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- 3. WEEKLY CHALLENGES (structured, separate from coach_weekly_challenges)
CREATE TABLE public.weekly_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  dimension TEXT,
  challenge_type TEXT DEFAULT 'daily_task',
  start_date DATE,
  end_date DATE,
  tasks_json JSONB DEFAULT '[]'::jsonb,
  points_reward INTEGER DEFAULT 100,
  badge_id UUID,
  program_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.weekly_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active challenges" ON public.weekly_challenges FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Admins manage challenges" ON public.weekly_challenges FOR ALL TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- 4. WEEKLY CHALLENGE PROGRESS
CREATE TABLE public.weekly_challenge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.weekly_challenges(id) ON DELETE CASCADE,
  seeker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  task_completed BOOLEAN DEFAULT false,
  notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.weekly_challenge_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Seekers manage own progress" ON public.weekly_challenge_progress FOR ALL TO authenticated
  USING (seeker_id IN (SELECT p.id FROM profiles p WHERE p.user_id = auth.uid()))
  WITH CHECK (seeker_id IN (SELECT p.id FROM profiles p WHERE p.user_id = auth.uid()));
CREATE POLICY "Admins manage all progress" ON public.weekly_challenge_progress FOR ALL TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- 5. SESSION NOTES
CREATE TABLE public.session_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_role TEXT DEFAULT 'seeker',
  note_type TEXT DEFAULT 'during',
  content TEXT NOT NULL,
  is_private BOOLEAN DEFAULT false,
  attachments_json JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.session_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authors manage own notes" ON public.session_notes FOR ALL TO authenticated
  USING (author_id IN (SELECT p.id FROM profiles p WHERE p.user_id = auth.uid()))
  WITH CHECK (author_id IN (SELECT p.id FROM profiles p WHERE p.user_id = auth.uid()));
CREATE POLICY "Admins manage all notes" ON public.session_notes FOR ALL TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Non-private notes visible to session participants" ON public.session_notes FOR SELECT TO authenticated
  USING (is_private = false AND session_id IN (
    SELECT s.id FROM sessions s WHERE s.seeker_id IN (SELECT p.id FROM profiles p WHERE p.user_id = auth.uid())
  ));
CREATE TRIGGER update_session_notes_updated_at BEFORE UPDATE ON public.session_notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. TIME SHEETS
CREATE TABLE public.time_sheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seeker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  wake_up_time TIME,
  sleep_time TIME,
  meditation_minutes INTEGER DEFAULT 0,
  exercise_minutes INTEGER DEFAULT 0,
  reading_minutes INTEGER DEFAULT 0,
  work_hours NUMERIC(4,2),
  family_hours NUMERIC(4,2),
  learning_hours NUMERIC(4,2),
  spiritual_practice_minutes INTEGER DEFAULT 0,
  screen_time_hours NUMERIC(4,2),
  water_glasses INTEGER,
  meals_count INTEGER,
  productivity_score INTEGER,
  energy_level INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(seeker_id, date)
);
ALTER TABLE public.time_sheets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Seekers manage own time sheets" ON public.time_sheets FOR ALL TO authenticated
  USING (seeker_id IN (SELECT p.id FROM profiles p WHERE p.user_id = auth.uid()))
  WITH CHECK (seeker_id IN (SELECT p.id FROM profiles p WHERE p.user_id = auth.uid()));
CREATE POLICY "Admins manage all time sheets" ON public.time_sheets FOR ALL TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
