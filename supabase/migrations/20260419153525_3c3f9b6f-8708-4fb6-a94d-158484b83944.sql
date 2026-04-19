-- Assessments
DELETE FROM public.wheel_of_life_assessments WHERE seeker_id IN (SELECT id FROM profiles WHERE role = 'seeker');
DELETE FROM public.personal_swot_assessments WHERE seeker_id IN (SELECT id FROM profiles WHERE role = 'seeker');
DELETE FROM public.lgt_assessments WHERE seeker_id IN (SELECT id FROM profiles WHERE role = 'seeker');
DELETE FROM public.firo_b_assessments WHERE seeker_id IN (SELECT id FROM profiles WHERE role = 'seeker');
DELETE FROM public.mooch_assessments WHERE seeker_id IN (SELECT id FROM profiles WHERE role = 'seeker');
DELETE FROM public.happiness_assessments WHERE seeker_id IN (SELECT id FROM profiles WHERE role = 'seeker');
DELETE FROM public.purusharthas_assessments WHERE seeker_id IN (SELECT id FROM profiles WHERE role = 'seeker');
DELETE FROM public.seeker_assessments WHERE seeker_id IN (SELECT id FROM profiles WHERE role = 'seeker');
DELETE FROM public.assessment_actions WHERE seeker_id IN (SELECT id FROM profiles WHERE role = 'seeker');
DELETE FROM public.coach_assessment_feedback WHERE seeker_id IN (SELECT id FROM profiles WHERE role = 'seeker');

-- Daily worksheets + children
DELETE FROM public.daily_time_slots WHERE worksheet_id IN (SELECT id FROM daily_worksheets WHERE seeker_id IN (SELECT id FROM profiles WHERE role = 'seeker'));
DELETE FROM public.daily_financial_log WHERE worksheet_id IN (SELECT id FROM daily_worksheets WHERE seeker_id IN (SELECT id FROM profiles WHERE role = 'seeker'));
DELETE FROM public.daily_priorities WHERE worksheet_id IN (SELECT id FROM daily_worksheets WHERE seeker_id IN (SELECT id FROM profiles WHERE role = 'seeker'));
DELETE FROM public.daily_non_negotiable_log WHERE worksheet_id IN (SELECT id FROM daily_worksheets WHERE seeker_id IN (SELECT id FROM profiles WHERE role = 'seeker'));
DELETE FROM public.daily_worksheets WHERE seeker_id IN (SELECT id FROM profiles WHERE role = 'seeker');
DELETE FROM public.worksheet_notifications WHERE seeker_id IN (SELECT id FROM profiles WHERE role = 'seeker');

-- Daily tracking
DELETE FROM public.daily_logs WHERE seeker_id IN (SELECT id FROM profiles WHERE role = 'seeker');
DELETE FROM public.daily_lgt_checkins WHERE seeker_id IN (SELECT id FROM profiles WHERE role = 'seeker');
DELETE FROM public.seeker_non_negotiables WHERE seeker_id IN (SELECT id FROM profiles WHERE role = 'seeker');
DELETE FROM public.japa_log WHERE seeker_id IN (SELECT id FROM profiles WHERE role = 'seeker');
DELETE FROM public.time_sheets WHERE seeker_id IN (SELECT id FROM profiles WHERE role = 'seeker');

-- Assignments
DELETE FROM public.assignments WHERE seeker_id IN (SELECT id FROM profiles WHERE role = 'seeker');

-- Badges, points, streaks, challenges
DELETE FROM public.seeker_badge_progress WHERE seeker_id IN (SELECT id FROM profiles WHERE role = 'seeker');
DELETE FROM public.seeker_badges WHERE seeker_id IN (SELECT id FROM profiles WHERE role = 'seeker');
DELETE FROM public.points_ledger WHERE seeker_id IN (SELECT id FROM profiles WHERE role = 'seeker');
DELETE FROM public.streaks WHERE seeker_id IN (SELECT id FROM profiles WHERE role = 'seeker');
DELETE FROM public.weekly_challenge_progress WHERE seeker_id IN (SELECT id FROM profiles WHERE role = 'seeker');
DELETE FROM public.coach_weekly_challenges WHERE seeker_id IN (SELECT id FROM profiles WHERE role = 'seeker');

-- Sessions + children
DELETE FROM public.session_signatures WHERE session_id IN (SELECT id FROM sessions WHERE seeker_id IN (SELECT id FROM profiles WHERE role = 'seeker'));
DELETE FROM public.session_comments WHERE session_id IN (SELECT id FROM sessions WHERE seeker_id IN (SELECT id FROM profiles WHERE role = 'seeker'));
DELETE FROM public.session_notes WHERE session_id IN (SELECT id FROM sessions WHERE seeker_id IN (SELECT id FROM profiles WHERE role = 'seeker'));
DELETE FROM public.session_notifications WHERE session_id IN (SELECT id FROM sessions WHERE seeker_id IN (SELECT id FROM profiles WHERE role = 'seeker'));
DELETE FROM public.session_topics WHERE session_id IN (SELECT id FROM sessions WHERE seeker_id IN (SELECT id FROM profiles WHERE role = 'seeker'));
DELETE FROM public.session_attendees WHERE session_id IN (SELECT id FROM sessions WHERE seeker_id IN (SELECT id FROM profiles WHERE role = 'seeker'));
DELETE FROM public.session_audit_log WHERE session_id IN (SELECT id FROM sessions WHERE seeker_id IN (SELECT id FROM profiles WHERE role = 'seeker'));
DELETE FROM public.sessions WHERE seeker_id IN (SELECT id FROM profiles WHERE role = 'seeker');

-- Communication
DELETE FROM public.messages WHERE sender_id IN (SELECT id FROM profiles WHERE role = 'seeker') OR receiver_id IN (SELECT id FROM profiles WHERE role = 'seeker');
DELETE FROM public.notifications WHERE user_id IN (SELECT id FROM profiles WHERE role = 'seeker');
DELETE FROM public.announcement_reads WHERE user_id IN (SELECT id FROM profiles WHERE role = 'seeker');

-- Calendar
DELETE FROM public.calendar_events WHERE seeker_id IN (SELECT id FROM profiles WHERE role = 'seeker');

-- Bookmarks & content
DELETE FROM public.user_bookmarks WHERE seeker_id IN (SELECT id FROM profiles WHERE role = 'seeker');
DELETE FROM public.favorite_affirmations WHERE user_id IN (SELECT id FROM profiles WHERE role = 'seeker');
DELETE FROM public.user_content_progress WHERE seeker_id IN (SELECT id FROM profiles WHERE role = 'seeker');

-- Artha business data
DELETE FROM public.business_swot_items WHERE business_id IN (SELECT id FROM business_profiles WHERE seeker_id IN (SELECT id FROM profiles WHERE role = 'seeker'));
DELETE FROM public.business_competitors WHERE business_id IN (SELECT id FROM business_profiles WHERE seeker_id IN (SELECT id FROM profiles WHERE role = 'seeker'));
DELETE FROM public.business_values WHERE business_id IN (SELECT id FROM business_profiles WHERE seeker_id IN (SELECT id FROM profiles WHERE role = 'seeker'));
DELETE FROM public.business_mission_vision WHERE business_id IN (SELECT id FROM business_profiles WHERE seeker_id IN (SELECT id FROM profiles WHERE role = 'seeker'));
DELETE FROM public.branding_strategy WHERE business_id IN (SELECT id FROM business_profiles WHERE seeker_id IN (SELECT id FROM profiles WHERE role = 'seeker'));
DELETE FROM public.marketing_strategy WHERE business_id IN (SELECT id FROM business_profiles WHERE seeker_id IN (SELECT id FROM profiles WHERE role = 'seeker'));
DELETE FROM public.sales_strategy WHERE business_id IN (SELECT id FROM business_profiles WHERE seeker_id IN (SELECT id FROM profiles WHERE role = 'seeker'));
DELETE FROM public.rnd_projects WHERE business_id IN (SELECT id FROM business_profiles WHERE seeker_id IN (SELECT id FROM profiles WHERE role = 'seeker'));
DELETE FROM public.team_members WHERE business_id IN (SELECT id FROM business_profiles WHERE seeker_id IN (SELECT id FROM profiles WHERE role = 'seeker'));
DELETE FROM public.accounting_records WHERE business_id IN (SELECT id FROM business_profiles WHERE seeker_id IN (SELECT id FROM profiles WHERE role = 'seeker'));
DELETE FROM public.cashflow_records WHERE business_id IN (SELECT id FROM business_profiles WHERE seeker_id IN (SELECT id FROM profiles WHERE role = 'seeker'));
DELETE FROM public.client_feedback WHERE business_id IN (SELECT id FROM business_profiles WHERE seeker_id IN (SELECT id FROM profiles WHERE role = 'seeker'));
DELETE FROM public.department_health WHERE business_id IN (SELECT id FROM business_profiles WHERE seeker_id IN (SELECT id FROM profiles WHERE role = 'seeker'));
DELETE FROM public.business_profiles WHERE seeker_id IN (SELECT id FROM profiles WHERE role = 'seeker');

-- Enrollments, payments, follow-ups
DELETE FROM public.payments WHERE seeker_id IN (SELECT id FROM profiles WHERE role = 'seeker');
DELETE FROM public.enrollments WHERE seeker_id IN (SELECT id FROM profiles WHERE role = 'seeker');
DELETE FROM public.follow_ups WHERE seeker_id IN (SELECT id FROM profiles WHERE role = 'seeker');

-- User session history for seekers
DELETE FROM public.user_sessions WHERE user_id IN (SELECT user_id FROM profiles WHERE role = 'seeker');