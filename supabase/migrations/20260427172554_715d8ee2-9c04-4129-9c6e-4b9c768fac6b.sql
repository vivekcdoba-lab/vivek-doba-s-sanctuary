
DO $$
DECLARE
  seeker_pid uuid := '0c0ada4d-3d42-496a-b136-e77fdb270efa';
  coach_pid  uuid := 'd1bbd4c2-73d8-41d7-8dde-1c0c723bdcb1';
  admin_pid  uuid := '5bce8fee-5355-463d-ad19-4fe011b56c10';
  seeker_uid uuid := '88ad868a-7471-4ab1-ad85-6ca584989560';
  coach_uid  uuid := '8abd1692-550a-4f9b-95b1-c434ef395187';
  admin_uid  uuid := '0f0e8aab-c36e-451d-92b8-5c0eeaf6b2ab';
  d_from date := '2026-01-01';
  d_to   date := '2026-05-31';
BEGIN
  -- 1. Session children
  DELETE FROM session_signatures WHERE session_id IN (
    SELECT id FROM sessions WHERE created_at::date BETWEEN d_from AND d_to
      AND (seeker_id = seeker_pid OR coach_id IN (coach_pid, admin_pid))
  );
  DELETE FROM session_attendees WHERE session_id IN (
    SELECT id FROM sessions WHERE created_at::date BETWEEN d_from AND d_to
      AND (seeker_id = seeker_pid OR coach_id IN (coach_pid, admin_pid))
  );
  DELETE FROM session_notifications WHERE session_id IN (
    SELECT id FROM sessions WHERE created_at::date BETWEEN d_from AND d_to
      AND (seeker_id = seeker_pid OR coach_id IN (coach_pid, admin_pid))
  );

  -- 2. Assessment action plans (uses assessment_type + assessment_id)
  DELETE FROM assessment_actions WHERE seeker_id = seeker_pid AND created_at::date BETWEEN d_from AND d_to;

  -- 3. Artha child rows (use business_id, not business_profile_id)
  DELETE FROM accounting_records WHERE business_id IN (
    SELECT id FROM business_profiles WHERE seeker_id = seeker_pid AND created_at::date BETWEEN d_from AND d_to
  );
  DELETE FROM cashflow_records WHERE business_id IN (
    SELECT id FROM business_profiles WHERE seeker_id = seeker_pid AND created_at::date BETWEEN d_from AND d_to
  );
  DELETE FROM team_members WHERE business_id IN (
    SELECT id FROM business_profiles WHERE seeker_id = seeker_pid AND created_at::date BETWEEN d_from AND d_to
  );
  DELETE FROM department_health WHERE business_id IN (
    SELECT id FROM business_profiles WHERE seeker_id = seeker_pid AND created_at::date BETWEEN d_from AND d_to
  );
  -- daily_financial_log links to worksheet_id (cleaned via worksheet delete below)

  -- 4. Badges, points, notifications
  DELETE FROM seeker_badges WHERE seeker_id = seeker_pid AND earned_at::date BETWEEN d_from AND d_to;
  DELETE FROM points_ledger WHERE seeker_id = seeker_pid AND created_at::date BETWEEN d_from AND d_to;
  DELETE FROM notifications WHERE user_id IN (seeker_uid, coach_uid, admin_uid) AND created_at::date BETWEEN d_from AND d_to;

  -- 5. Daily financial log children of worksheets in scope
  DELETE FROM daily_financial_log WHERE worksheet_id IN (
    SELECT id FROM daily_worksheets WHERE seeker_id = seeker_pid AND created_at::date BETWEEN d_from AND d_to
  );

  -- 6. Assignments & worksheets
  DELETE FROM assignments WHERE seeker_id = seeker_pid AND created_at::date BETWEEN d_from AND d_to;
  DELETE FROM daily_worksheets WHERE seeker_id = seeker_pid AND created_at::date BETWEEN d_from AND d_to;

  -- 7. Assessments
  DELETE FROM lgt_assessments          WHERE seeker_id = seeker_pid AND created_at::date BETWEEN d_from AND d_to;
  DELETE FROM wheel_of_life_assessments WHERE seeker_id = seeker_pid AND created_at::date BETWEEN d_from AND d_to;
  DELETE FROM firo_b_assessments       WHERE seeker_id = seeker_pid AND created_at::date BETWEEN d_from AND d_to;
  DELETE FROM mooch_assessments        WHERE seeker_id = seeker_pid AND created_at::date BETWEEN d_from AND d_to;
  DELETE FROM happiness_assessments    WHERE seeker_id = seeker_pid AND created_at::date BETWEEN d_from AND d_to;
  DELETE FROM purusharthas_assessments WHERE seeker_id = seeker_pid AND created_at::date BETWEEN d_from AND d_to;

  -- 8. Coach assessment feedback
  DELETE FROM coach_assessment_feedback
    WHERE created_at::date BETWEEN d_from AND d_to
      AND (seeker_id = seeker_pid OR coach_id IN (coach_pid, admin_pid));

  -- 9. Sessions
  DELETE FROM sessions
    WHERE created_at::date BETWEEN d_from AND d_to
      AND (seeker_id = seeker_pid OR coach_id IN (coach_pid, admin_pid));

  -- 10. Payments
  DELETE FROM payments WHERE seeker_id = seeker_pid AND created_at::date BETWEEN d_from AND d_to;

  -- 11. Submissions — ONLY seeker's own + QA test entries (preserve real prospects)
  DELETE FROM submissions
    WHERE created_at::date BETWEEN d_from AND d_to
      AND (lower(email) = 'crwanare@gmail.com' OR lower(email) LIKE 'qa-test-%@example.com');

  -- 12. Business profile
  DELETE FROM business_profiles WHERE seeker_id = seeker_pid AND created_at::date BETWEEN d_from AND d_to;

  -- 13. Coach links & enrollments
  DELETE FROM coach_seekers
    WHERE assigned_at::date BETWEEN d_from AND d_to
      AND (seeker_id = seeker_pid OR coach_id IN (coach_pid, admin_pid));
  DELETE FROM enrollments WHERE seeker_id = seeker_pid AND created_at::date BETWEEN d_from AND d_to;

  -- 14. Login history
  DELETE FROM user_sessions
    WHERE login_at::date BETWEEN d_from AND d_to
      AND user_id IN (seeker_uid, coach_uid, admin_uid);
END $$;
