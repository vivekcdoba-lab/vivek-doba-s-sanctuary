
-- Badge definitions table
CREATE TABLE public.badge_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_key text UNIQUE NOT NULL,
  emoji text NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL DEFAULT 'streak',
  condition_type text NOT NULL,
  condition_field text,
  condition_threshold integer NOT NULL DEFAULT 7,
  condition_streak_days integer NOT NULL DEFAULT 7,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Seeker earned badges
CREATE TABLE public.seeker_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seeker_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES public.badge_definitions(id) ON DELETE CASCADE,
  earned_at timestamptz NOT NULL DEFAULT now(),
  awarded_by text NOT NULL DEFAULT 'system',
  notes text,
  UNIQUE(seeker_id, badge_id)
);

-- Badge progress tracking
CREATE TABLE public.seeker_badge_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seeker_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES public.badge_definitions(id) ON DELETE CASCADE,
  current_streak integer NOT NULL DEFAULT 0,
  best_streak integer NOT NULL DEFAULT 0,
  last_qualifying_date date,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(seeker_id, badge_id)
);

-- RLS
ALTER TABLE public.badge_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seeker_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seeker_badge_progress ENABLE ROW LEVEL SECURITY;

-- Badge definitions: everyone can read
CREATE POLICY "Anyone can view badge definitions" ON public.badge_definitions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins manage badge definitions" ON public.badge_definitions
  FOR ALL TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- Seeker badges: seekers see own, admins see all
CREATE POLICY "Seekers view own badges" ON public.seeker_badges
  FOR SELECT TO authenticated
  USING (seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins manage all badges" ON public.seeker_badges
  FOR ALL TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- Badge progress: seekers see/manage own, admins see all
CREATE POLICY "Seekers manage own progress" ON public.seeker_badges
  FOR INSERT TO authenticated
  WITH CHECK (seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Seekers view own progress" ON public.seeker_badge_progress
  FOR SELECT TO authenticated
  USING (seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Seekers update own progress" ON public.seeker_badge_progress
  FOR ALL TO authenticated
  USING (seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  WITH CHECK (seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins manage all progress" ON public.seeker_badge_progress
  FOR ALL TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- Insert default badge definitions
INSERT INTO public.badge_definitions (badge_key, emoji, name, description, category, condition_type, condition_field, condition_threshold, condition_streak_days, sort_order) VALUES
  ('tapasvi', '🔥', 'Tapasvi', 'Worksheet submitted for 21 days straight', 'streak', 'worksheet_submitted', NULL, 1, 21, 1),
  ('jal_sadhak', '💧', 'Jal Sadhak', '8 glasses water logged for 14 days straight', 'streak', 'water_intake', 'water_intake_glasses', 8, 14, 2),
  ('gyan_yogi', '📚', 'Gyan Yogi', 'Book reading logged for 30 days', 'streak', 'worksheet_submitted', NULL, 1, 30, 3),
  ('artha_vijay', '💰', 'Artha Vijay', 'Positive income logged for 30 days', 'streak', 'positive_income', NULL, 1, 30, 4),
  ('sampoorna', '🎯', 'Sampoorna', 'Sampoorna Din Score above 90 for 7 days straight', 'streak', 'sampoorna_score', 'sampoorna_din_score', 90, 7, 5),
  ('dhyana_siddh', '🧘', 'Dhyana Siddh', 'Meditation done for 21 days straight', 'streak', 'worksheet_submitted', NULL, 1, 21, 6),
  ('pratah_veer', '🌅', 'Pratah Veer', 'All non-negotiables completed for 14 days', 'streak', 'all_non_negotiables', NULL, 1, 14, 7),
  ('saptah_yoddha', '⚔️', 'Saptah Yoddha', '7-day worksheet submission streak', 'streak', 'worksheet_submitted', NULL, 1, 7, 8),
  ('ekadashi', '🕉️', 'Ekadashi', '11-day continuous worksheet streak', 'streak', 'worksheet_submitted', NULL, 1, 11, 9),
  ('chaturmas', '👑', 'Chaturmas', '120-day worksheet submission streak', 'streak', 'worksheet_submitted', NULL, 1, 120, 10);
