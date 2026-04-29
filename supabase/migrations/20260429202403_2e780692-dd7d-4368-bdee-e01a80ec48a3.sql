-- Profile preferences
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS daily_progress_email_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS preferred_language text NOT NULL DEFAULT 'en';

-- Settings singleton
CREATE TABLE IF NOT EXISTS public.daily_report_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enabled boolean NOT NULL DEFAULT true,
  send_hour integer NOT NULL DEFAULT 15,   -- UTC hour (15:00 UTC = 20:30 IST when minute=0; we approximate)
  send_minute integer NOT NULL DEFAULT 0,
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  singleton boolean NOT NULL DEFAULT true UNIQUE
);

INSERT INTO public.daily_report_settings (enabled, send_hour, send_minute)
SELECT true, 15, 0
WHERE NOT EXISTS (SELECT 1 FROM public.daily_report_settings);

ALTER TABLE public.daily_report_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authed can read daily report settings"
  ON public.daily_report_settings FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can update daily report settings"
  ON public.daily_report_settings FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert daily report settings"
  ON public.daily_report_settings FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

-- Email log
CREATE TABLE IF NOT EXISTS public.daily_progress_email_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seeker_id uuid NOT NULL,
  sent_date date NOT NULL,
  status text NOT NULL CHECK (status IN ('sent','skipped','failed')),
  summary jsonb,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dpel_seeker_date ON public.daily_progress_email_log(seeker_id, sent_date DESC);
CREATE INDEX IF NOT EXISTS idx_dpel_date ON public.daily_progress_email_log(sent_date DESC);

ALTER TABLE public.daily_progress_email_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read email log"
  ON public.daily_progress_email_log FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

-- Daily summary RPC
CREATE OR REPLACE FUNCTION public.get_seeker_daily_summary(_seeker_id uuid, _date date)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_profile record;
  v_ws record;
  v_lgt record;
  v_streak integer := 0;
  v_lgt_avg jsonb;
  v_next_session record;
  v_pending integer := 0;
BEGIN
  SELECT id, full_name, email, preferred_language, daily_progress_email_enabled
    INTO v_profile FROM public.profiles WHERE id = _seeker_id;
  IF NOT FOUND THEN RETURN NULL; END IF;

  SELECT is_submitted, completion_rate_percent, morning_mood, morning_energy_score,
         dharma_score, artha_score, kama_score, moksha_score, sampoorna_din_score,
         tomorrow_sankalp
    INTO v_ws
    FROM public.daily_worksheets
    WHERE seeker_id = _seeker_id AND worksheet_date = _date
    LIMIT 1;

  SELECT dharma_score, artha_score, kama_score, moksha_score, overall_balance
    INTO v_lgt
    FROM public.daily_lgt_checkins
    WHERE seeker_id = _seeker_id AND checkin_date = _date
    LIMIT 1;

  -- Simple streak: count back consecutive submitted days ending today/yesterday
  WITH days AS (
    SELECT generate_series(0, 90) AS n
  ),
  flags AS (
    SELECT d.n, EXISTS(
      SELECT 1 FROM public.daily_worksheets w
      WHERE w.seeker_id = _seeker_id
        AND w.is_submitted = true
        AND w.worksheet_date = _date - d.n
    ) AS done
    FROM days d
  )
  SELECT COUNT(*) INTO v_streak FROM (
    SELECT n, done,
           SUM(CASE WHEN done THEN 0 ELSE 1 END) OVER (ORDER BY n) AS grp
    FROM flags
  ) g WHERE grp = 0 AND done;

  -- 7-day LGT average
  SELECT jsonb_build_object(
    'dharma', COALESCE(AVG(dharma_score),0),
    'artha',  COALESCE(AVG(artha_score),0),
    'kama',   COALESCE(AVG(kama_score),0),
    'moksha', COALESCE(AVG(moksha_score),0)
  ) INTO v_lgt_avg
  FROM public.daily_lgt_checkins
  WHERE seeker_id = _seeker_id
    AND checkin_date BETWEEN _date - 7 AND _date - 1;

  SELECT id, date, start_time, session_name
    INTO v_next_session
    FROM public.sessions
    WHERE seeker_id = _seeker_id AND date >= _date
    ORDER BY date ASC, start_time ASC NULLS LAST
    LIMIT 1;

  SELECT COUNT(*) INTO v_pending FROM public.assignments
    WHERE seeker_id = _seeker_id
      AND COALESCE(status,'pending') IN ('pending','assigned','in_progress');

  RETURN jsonb_build_object(
    'seeker_id', v_profile.id,
    'full_name', v_profile.full_name,
    'email', v_profile.email,
    'language', COALESCE(v_profile.preferred_language,'en'),
    'enabled', COALESCE(v_profile.daily_progress_email_enabled, true),
    'date', _date,
    'worksheet', CASE WHEN v_ws IS NULL THEN NULL ELSE jsonb_build_object(
      'submitted', v_ws.is_submitted,
      'completion', v_ws.completion_rate_percent,
      'mood', v_ws.morning_mood,
      'energy', v_ws.morning_energy_score,
      'dharma', v_ws.dharma_score,
      'artha', v_ws.artha_score,
      'kama', v_ws.kama_score,
      'moksha', v_ws.moksha_score,
      'sampoorna_din', v_ws.sampoorna_din_score,
      'tomorrow_sankalp', v_ws.tomorrow_sankalp
    ) END,
    'lgt_today', CASE WHEN v_lgt IS NULL THEN NULL ELSE jsonb_build_object(
      'dharma', v_lgt.dharma_score,
      'artha',  v_lgt.artha_score,
      'kama',   v_lgt.kama_score,
      'moksha', v_lgt.moksha_score,
      'balance', v_lgt.overall_balance
    ) END,
    'lgt_7d_avg', v_lgt_avg,
    'streak_days', v_streak,
    'pending_assignments', v_pending,
    'next_session', CASE WHEN v_next_session IS NULL THEN NULL ELSE jsonb_build_object(
      'id', v_next_session.id,
      'date', v_next_session.date,
      'start_time', v_next_session.start_time,
      'name', v_next_session.session_name
    ) END
  );
END;
$$;