
-- Add leaderboard visibility toggle to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS leaderboard_visible boolean NOT NULL DEFAULT true;

-- Create the leaderboard RPC function
CREATE OR REPLACE FUNCTION public.get_leaderboard_data(
  _period text DEFAULT 'all_time',
  _course_id uuid DEFAULT NULL,
  _city text DEFAULT NULL,
  _batch_user_id uuid DEFAULT NULL
)
RETURNS TABLE(
  rank bigint,
  profile_id uuid,
  display_name text,
  avatar_url text,
  total_points bigint,
  streak_days bigint,
  badge_count bigint,
  worksheet_count bigint,
  session_count bigint
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  period_start date;
  batch_month date;
BEGIN
  -- Determine period start
  IF _period = 'week' THEN
    period_start := date_trunc('week', CURRENT_DATE)::date;
  ELSIF _period = 'month' THEN
    period_start := date_trunc('month', CURRENT_DATE)::date;
  ELSE
    period_start := '2000-01-01'::date;
  END IF;

  -- For batch mode, find the month the requesting user joined
  IF _period = 'batch' AND _batch_user_id IS NOT NULL THEN
    SELECT date_trunc('month', p.created_at)::date INTO batch_month
    FROM profiles p WHERE p.user_id = _batch_user_id;
  END IF;

  RETURN QUERY
  WITH seekers AS (
    SELECT
      p.id AS pid,
      -- Privacy: first name + last initial
      split_part(p.full_name, ' ', 1) || COALESCE(' ' || left(split_part(p.full_name, ' ', 2), 1) || '.', '') AS dname,
      p.avatar_url AS av,
      p.created_at AS joined_at,
      p.city AS pcity
    FROM profiles p
    WHERE p.role = 'seeker'
      AND p.leaderboard_visible = true
      AND (
        _period != 'batch'
        OR batch_month IS NULL
        OR date_trunc('month', p.created_at)::date = batch_month
      )
      AND (_city IS NULL OR p.city = _city)
      AND (
        _course_id IS NULL
        OR EXISTS (
          SELECT 1 FROM enrollments e
          WHERE e.seeker_id = p.id AND e.course_id = _course_id
        )
      )
  ),
  ws AS (
    SELECT
      dw.seeker_id,
      COUNT(*) FILTER (WHERE dw.is_submitted = true AND dw.worksheet_date >= period_start) AS ws_count,
      COUNT(*) FILTER (WHERE dw.is_submitted = true AND dw.completion_rate_percent >= 100 AND dw.worksheet_date >= period_start) AS full_count
    FROM daily_worksheets dw
    JOIN seekers s ON s.pid = dw.seeker_id
    GROUP BY dw.seeker_id
  ),
  streaks AS (
    SELECT
      dw2.seeker_id,
      -- Calculate current streak
      (
        SELECT COUNT(*)::bigint FROM (
          SELECT worksheet_date,
                 worksheet_date - (ROW_NUMBER() OVER (ORDER BY worksheet_date DESC))::int AS grp
          FROM daily_worksheets dw3
          WHERE dw3.seeker_id = dw2.seeker_id AND dw3.is_submitted = true
        ) sub
        WHERE grp = (
          SELECT MIN(worksheet_date - (ROW_NUMBER() OVER (ORDER BY worksheet_date DESC))::int)
          FROM (
            SELECT worksheet_date, ROW_NUMBER() OVER (ORDER BY worksheet_date DESC) AS rn
            FROM daily_worksheets dw4
            WHERE dw4.seeker_id = dw2.seeker_id AND dw4.is_submitted = true
          ) sub2
          WHERE worksheet_date - rn::int = (CURRENT_DATE - 1 - (
            SELECT COUNT(*) FROM daily_worksheets dw5
            WHERE dw5.seeker_id = dw2.seeker_id AND dw5.is_submitted = true
            AND dw5.worksheet_date > CURRENT_DATE
          )::int - 1)
        )
      ) AS cur_streak
    FROM (SELECT DISTINCT seeker_id FROM daily_worksheets) dw2
    JOIN seekers s ON s.pid = dw2.seeker_id
  ),
  simple_streaks AS (
    -- Simpler streak: count consecutive days ending at today or yesterday
    SELECT
      s.pid AS seeker_id,
      (
        SELECT COUNT(*)::bigint
        FROM generate_series(0, 999) AS d(n)
        WHERE EXISTS (
          SELECT 1 FROM daily_worksheets dw
          WHERE dw.seeker_id = s.pid
            AND dw.is_submitted = true
            AND dw.worksheet_date = CURRENT_DATE - d.n
        )
        AND (d.n = 0 OR EXISTS (
          SELECT 1 FROM generate_series(0, d.n - 1) AS prev(pn)
          WHERE EXISTS (
            SELECT 1 FROM daily_worksheets dw2
            WHERE dw2.seeker_id = s.pid
              AND dw2.is_submitted = true
              AND dw2.worksheet_date = CURRENT_DATE - prev.pn
          )
          HAVING COUNT(*) = d.n
        ))
      ) AS cur_streak
    FROM seekers s
  ),
  badges AS (
    SELECT sb.seeker_id, COUNT(*) AS b_count
    FROM seeker_badges sb
    JOIN seekers s ON s.pid = sb.seeker_id
    GROUP BY sb.seeker_id
  ),
  sess AS (
    SELECT ses.seeker_id, COUNT(*) AS s_count
    FROM sessions ses
    JOIN seekers s ON s.pid = ses.seeker_id
    WHERE ses.attendance = 'present'
      AND ses.date >= period_start
    GROUP BY ses.seeker_id
  ),
  points AS (
    SELECT
      sk.pid,
      sk.dname,
      sk.av,
      COALESCE(w.ws_count, 0) AS wsc,
      COALESCE(w.full_count, 0) AS fc,
      COALESCE(st.cur_streak, 0) AS stk,
      COALESCE(b.b_count, 0) AS bc,
      COALESCE(se.s_count, 0) AS sc,
      (COALESCE(w.ws_count, 0) * 10 +
       COALESCE(w.full_count, 0) * 5 +
       COALESCE(st.cur_streak, 0) * 2 +
       COALESCE(b.b_count, 0) * 15 +
       COALESCE(se.s_count, 0) * 25)::bigint AS tp
    FROM seekers sk
    LEFT JOIN ws w ON w.seeker_id = sk.pid
    LEFT JOIN simple_streaks st ON st.seeker_id = sk.pid
    LEFT JOIN badges b ON b.seeker_id = sk.pid
    LEFT JOIN sess se ON se.seeker_id = sk.pid
  )
  SELECT
    ROW_NUMBER() OVER (ORDER BY pt.tp DESC, pt.stk DESC)::bigint AS rank,
    pt.pid AS profile_id,
    pt.dname AS display_name,
    pt.av AS avatar_url,
    pt.tp AS total_points,
    pt.stk AS streak_days,
    pt.bc AS badge_count,
    pt.wsc AS worksheet_count,
    pt.sc AS session_count
  FROM points pt
  ORDER BY pt.tp DESC, pt.stk DESC;
END;
$$;
