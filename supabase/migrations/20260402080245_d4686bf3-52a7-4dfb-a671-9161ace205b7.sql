
-- Table: daily_worksheets
CREATE TABLE public.daily_worksheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seeker_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  worksheet_date date NOT NULL,
  morning_intention text,
  morning_mood text,
  morning_clarity_score integer,
  morning_energy_score integer,
  morning_peace_score integer,
  morning_readiness_score numeric(3,1),
  evening_mood text,
  evening_mental_peace integer,
  evening_emotional_satisfaction integer,
  evening_fulfillment integer,
  evening_fulfillment_score numeric(3,1),
  what_went_well text,
  what_i_learned text,
  do_differently text,
  gratitude_1 text, gratitude_2 text, gratitude_3 text, gratitude_4 text, gratitude_5 text,
  todays_win_1 text, todays_win_2 text, todays_win_3 text,
  aha_moment text,
  dharma_score integer, artha_score integer, kama_score integer, moksha_score integer,
  lgt_balance_score numeric(4,1),
  sampoorna_din_score numeric(4,1),
  tomorrow_sankalp text,
  tomorrow_prep_score integer,
  share_with_buddy boolean DEFAULT false,
  water_intake_glasses integer,
  steps_taken integer,
  sleep_hours numeric(3,1),
  sleep_quality text,
  body_weight_kg numeric(5,1),
  supplements_taken boolean,
  screen_time_hours numeric(3,1),
  end_energy_level integer,
  workout_done boolean,
  workout_type text,
  workout_duration_minutes integer,
  non_negotiables_completed integer,
  non_negotiables_total integer,
  coach_weekly_challenge_done boolean DEFAULT false,
  completion_rate_percent numeric(5,1),
  is_submitted boolean DEFAULT false,
  is_draft boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(seeker_id, worksheet_date)
);

ALTER TABLE public.daily_worksheets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Seekers can manage own worksheets" ON public.daily_worksheets
  FOR ALL TO authenticated
  USING (seeker_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
  WITH CHECK (seeker_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all worksheets" ON public.daily_worksheets
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Table: daily_time_slots
CREATE TABLE public.daily_time_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worksheet_id uuid NOT NULL REFERENCES public.daily_worksheets(id) ON DELETE CASCADE,
  slot_start_time time NOT NULL,
  slot_end_time time NOT NULL,
  activity_name text,
  activity_category text,
  lgt_pillar text,
  energy_level text,
  notes text,
  is_planned boolean DEFAULT true,
  is_completed boolean DEFAULT false,
  actual_status text,
  skip_reason text,
  modified_activity_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.daily_time_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own time slots" ON public.daily_time_slots
  FOR ALL TO authenticated
  USING (worksheet_id IN (SELECT id FROM public.daily_worksheets WHERE seeker_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())))
  WITH CHECK (worksheet_id IN (SELECT id FROM public.daily_worksheets WHERE seeker_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())));

CREATE POLICY "Admins manage all time slots" ON public.daily_time_slots
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Table: daily_priorities
CREATE TABLE public.daily_priorities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worksheet_id uuid NOT NULL REFERENCES public.daily_worksheets(id) ON DELETE CASCADE,
  priority_number integer NOT NULL,
  task_description text,
  lgt_pillar text,
  time_estimate_minutes integer,
  is_completed boolean DEFAULT false
);

ALTER TABLE public.daily_priorities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own priorities" ON public.daily_priorities
  FOR ALL TO authenticated
  USING (worksheet_id IN (SELECT id FROM public.daily_worksheets WHERE seeker_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())))
  WITH CHECK (worksheet_id IN (SELECT id FROM public.daily_worksheets WHERE seeker_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())));

CREATE POLICY "Admins manage all priorities" ON public.daily_priorities
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Table: daily_financial_log
CREATE TABLE public.daily_financial_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worksheet_id uuid NOT NULL REFERENCES public.daily_worksheets(id) ON DELETE CASCADE,
  entry_type text NOT NULL,
  source_description text,
  amount_inr numeric(12,2),
  category text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.daily_financial_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own financial log" ON public.daily_financial_log
  FOR ALL TO authenticated
  USING (worksheet_id IN (SELECT id FROM public.daily_worksheets WHERE seeker_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())))
  WITH CHECK (worksheet_id IN (SELECT id FROM public.daily_worksheets WHERE seeker_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())));

CREATE POLICY "Admins manage all financial logs" ON public.daily_financial_log
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Table: seeker_non_negotiables
CREATE TABLE public.seeker_non_negotiables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seeker_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  habit_name text NOT NULL,
  lgt_pillar text,
  is_active boolean DEFAULT true,
  added_by text NOT NULL DEFAULT 'coach',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.seeker_non_negotiables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Seekers can view own non-negotiables" ON public.seeker_non_negotiables
  FOR SELECT TO authenticated
  USING (seeker_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins manage all non-negotiables" ON public.seeker_non_negotiables
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Table: daily_non_negotiable_log
CREATE TABLE public.daily_non_negotiable_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worksheet_id uuid NOT NULL REFERENCES public.daily_worksheets(id) ON DELETE CASCADE,
  non_negotiable_id uuid NOT NULL REFERENCES public.seeker_non_negotiables(id) ON DELETE CASCADE,
  is_completed boolean DEFAULT false,
  logged_at timestamptz DEFAULT now()
);

ALTER TABLE public.daily_non_negotiable_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own nn log" ON public.daily_non_negotiable_log
  FOR ALL TO authenticated
  USING (worksheet_id IN (SELECT id FROM public.daily_worksheets WHERE seeker_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())))
  WITH CHECK (worksheet_id IN (SELECT id FROM public.daily_worksheets WHERE seeker_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())));

CREATE POLICY "Admins manage all nn logs" ON public.daily_non_negotiable_log
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Table: coach_weekly_challenges
CREATE TABLE public.coach_weekly_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL,
  seeker_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  challenge_text text NOT NULL,
  challenge_description text,
  lgt_pillar text,
  week_start_date date NOT NULL,
  week_end_date date NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.coach_weekly_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Seekers view own challenges" ON public.coach_weekly_challenges
  FOR SELECT TO authenticated
  USING (seeker_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR seeker_id IS NULL);

CREATE POLICY "Admins manage challenges" ON public.coach_weekly_challenges
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Table: worksheet_notifications
CREATE TABLE public.worksheet_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seeker_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  notification_type text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  triggered_by text DEFAULT 'system',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.worksheet_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Seekers view own notifications" ON public.worksheet_notifications
  FOR SELECT TO authenticated
  USING (seeker_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Seekers mark own notifications read" ON public.worksheet_notifications
  FOR UPDATE TO authenticated
  USING (seeker_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins manage all notifications" ON public.worksheet_notifications
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Updated_at triggers
CREATE TRIGGER update_daily_worksheets_updated_at BEFORE UPDATE ON public.daily_worksheets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
