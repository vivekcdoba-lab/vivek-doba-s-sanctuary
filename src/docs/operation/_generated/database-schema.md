# Database Schema

_Generated: 2026-05-01T19:05:59.940Z_

Tables: **104** • Functions: **49**

> Schema is reconstructed from migration files in `supabase/migrations/`. Source of truth is the running database; migrations are the authoritative change log.

## Identity & Access

### `profiles`

**Columns** (36): `id`, `user_id`, `full_name`, `email`, `phone`, `whatsapp`, `dob`, `gender`, `city`, `state`, `pincode`, `hometown`, `occupation`, `designation`, `company`, `industry`, `experience_years`, `revenue_range`, `team_size`, `linkedin_url`, `blood_group`, `role`, `avatar_url`, `created_at`, `updated_at`, `marriage_anniversary`, `leaderboard_visible`, `access_end_date`, `admin_level`, `must_change_password`, `is_also_coach`, `dob_enc`, `password_changed_at`, `country`, `daily_progress_email_enabled`, `timezone`

**RLS policies** (12): _Admins can view all profiles_; _Admins can insert profiles_; _Admins can update all, seekers own_; _Users can view own profile, admins all_; _Users can insert own profile_; _Users can update own profile, admins all_; _Service role can insert profiles_; _Users can update own profile (role locked by trigger)_; _Restrict role changes to admins_; _Admins update any profile_; _Users update own non-role fields_; _Coaches view assigned seeker profiles_

### `user_sessions`

**Columns** (12): `id`, `user_id`, `profile_id`, `role`, `status`, `login_at`, `last_activity_at`, `logout_at`, `logout_reason`, `ip_address`, `user_agent`, `duration_seconds`

**RLS policies** (4): _Admins manage all sessions_; _Users insert own sessions_; _Users view own sessions_; _Users update own sessions_

### `otp_codes`

**Columns** (8): `id`, `identifier`, `otp_code`, `expires_at`, `attempts`, `is_used`, `created_at`, `code_enc`

**RLS policies** (3): _Service role manages OTP codes_; _Block authenticated reads on otp_codes_; _Block authenticated writes on otp_codes_

### `app_settings`

**Columns** (4): `key`, `value`, `updated_at`, `updated_by`

**RLS policies** (5): _Authenticated can read app_settings_; _Admins can insert app_settings_; _Admins can update app_settings_; _Admins can delete app_settings_; _Admins can read app_settings_

### `system_settings`

**Columns** (5): `id`, `category`, `settings`, `updated_by`, `updated_at`

**RLS policies** (1): _Admins manage system settings_

### `encryption_keys`

**Columns** (6): `id`, `version`, `dek`, `is_current`, `created_at`, `rotated_at`

**RLS policies** (2): _encryption_keys_super_admin_read_; _encryption_keys_super_admin_write_

### `key_rotation_log`

**Columns** (7): `id`, `rotated_at`, `from_version`, `to_version`, `rotated_by`, `trigger_source`, `notes`

**RLS policies** (1): _key_rotation_log_admin_read_

### `seeker_links`

**Columns** (7): `id`, `group_id`, `seeker_id`, `relationship`, `relationship_label`, `linked_by`, `created_at`

**RLS policies** (2): _Admins manage seeker links_; _Seekers see own group links_

## Programs & Enrollment

### `courses`

**Columns** (17): `id`, `name`, `tagline`, `description`, `duration`, `format`, `tier`, `price`, `max_participants`, `gradient_colors`, `is_active`, `created_at`, `updated_at`, `event_date`, `location`, `location_type`, `lifecycle_status`

**RLS policies** (2): _Anyone can view active courses_; _Admins can manage courses_

### `program_trainers`

**Columns** (6): `id`, `program_id`, `trainer_id`, `role`, `display_order`, `created_at`

**RLS policies** (6): _Anyone can view trainers_; _Admins manage trainers_; _Admins manage program_trainers_; _Coaches view their own program assignments_; _Anyone can view program trainers_; _Authenticated users can view program trainers_

### `enrollments`

**Columns** (11): `id`, `seeker_id`, `course_id`, `tier`, `start_date`, `end_date`, `status`, `payment_status`, `created_at`, `updated_at`, `notes`

**RLS policies** (2): _Admins can manage enrollments_; _Seekers can view own enrollments_

### `batches`

**Columns** (8): `id`, `name`, `course_id`, `start_date`, `capacity`, `status`, `created_at`, `updated_at`

**RLS policies** (2): _Admins manage batches_; _Anyone can view active batches_

### `coach_seekers`

**Columns** (6): `id`, `coach_id`, `seeker_id`, `assigned_by`, `assigned_at`, `is_primary`

**RLS policies** (2): _Admins manage coach_seekers_; _Coaches view own coach_seekers_

### `course_session_rules`

**Columns** (11): `id`, `course_id`, `trigger_enrollment_course_id`, `free_sessions`, `discounted_sessions`, `discounted_rate_inr`, `paid_after`, `notes`, `is_active`, `created_at`, `updated_at`

**RLS policies** (2): _All can read course session rules_; _Admins manage course session rules_

## Sessions

### `sessions`

**Columns** (31): `id`, `seeker_id`, `course_id`, `session_number`, `date`, `start_time`, `end_time`, `duration_minutes`, `location_type`, `meeting_link`, `status`, `attendance`, `topics_covered`, `key_insights`, `seeker_mood`, `engagement_score`, `session_notes`, `breakthroughs`, `coach_private_notes`, `post_session_feedback`, `reschedule_reason`, `missed_reason`, `created_at`, `updated_at`, `revision_note`, `session_name`, `seeker_feedback_json`, `coach_id`, `session_type`, `start_at`, `recurrence_group_id`

**RLS policies** (9): _Admins can manage sessions_; _Seekers can view own sessions_; _Seekers can update own session reflections_; _Coaches view their sessions_; _Coaches update their sessions_; _Coaches view sessions of assigned seekers_; _Coaches insert sessions for assigned seekers_; _Coaches update sessions of assigned seekers_; _Coaches delete their sessions_

### `session_topics`

**Columns** (2): `session_id`, `topic_id`

**RLS policies** (3): _Admins manage session topics_; _Seekers view own session topics_; _Coaches view session topics for their seekers_

### `session_notes`

**Columns** (10): `id`, `session_id`, `author_id`, `author_role`, `note_type`, `content`, `is_private`, `attachments_json`, `created_at`, `updated_at`

**RLS policies** (3): _Authors manage own notes_; _Admins manage all notes_; _Non-private notes visible to session participants_

### `session_audit_log`

**Columns** (6): `id`, `session_id`, `actor_id`, `action`, `diff`, `created_at`

**RLS policies** (3): _Admins view all audit logs_; _Authenticated users insert audit logs_; _Insert audit for own session or admin_

### `session_signatures`

**Columns** (10): `id`, `session_id`, `signer_id`, `signer_role`, `storage_path`, `typed_name`, `ip_address`, `user_agent`, `content_hash`, `signed_at`

**RLS policies** (7): _Admins manage all signatures_; _Seekers can sign own sessions_; _Participants can view session signatures_; _Admins read full signatures_; _Seekers read signatures of own sessions_; _Signers read own signature row_; _Seekers read own signatures_

### `session_attendees`

**Columns** (7): `id`, `session_id`, `seeker_id`, `attendance_status`, `feedback_rating`, `feedback_text`, `created_at`

**RLS policies** (3): _Admins manage all attendees_; _Seekers view own attendance_; _Seekers update own feedback_

### `session_participants`

**Columns** (6): `id`, `session_id`, `seeker_id`, `role`, `attendance`, `added_at`

**RLS policies** (5): _Admins manage session participants_; _Coaches manage session participants_; _Seekers view own participation_; _Coaches manage assigned session participants_; _Coaches delete session participants_

### `session_private_notes`

**Columns** (5): `session_id`, `notes`, `updated_by`, `created_at`, `updated_at`

**RLS policies** (4): _Admins manage session private notes_; _Coaches read assigned session private notes_; _Coaches insert assigned session private notes_; _Coaches update assigned session private notes_

### `session_comments`

**Columns** (7): `id`, `session_id`, `section_name`, `author_id`, `content`, `is_read`, `created_at`

**RLS policies** (4): _Admins manage all comments_; _Seekers view own session comments_; _Seekers insert own session comments_; _Seekers update own comment read status_

### `session_notifications`

**Columns** (8): `id`, `recipient_id`, `type`, `title`, `body`, `session_id`, `is_read`, `created_at`

**RLS policies** (6): _Users view own notifications_; _Users update own notifications_; _Admins manage all notifications_; _Authenticated insert notifications_; _Admins and session participants insert notifications_; _Only admins insert session notifications_

### `session_templates`

**Columns** (7): `id`, `coach_id`, `name`, `default_topic_ids`, `default_assignments`, `created_at`, `updated_at`

**RLS policies** (2): _Admins manage all templates_; _Coaches manage own templates_

### `topics`

**Columns** (6): `id`, `name`, `category`, `icon_emoji`, `created_by`, `created_at`

**RLS policies** (3): _Anyone can view topics_; _Admins manage all topics_; _Authenticated users can create topics_

## Assessments

### `assessments`

**Columns** (8): `id`, `client_id`, `coach_id`, `scores_json`, `analysis_text`, `language`, `taken_at`, `created_at`

**RLS policies** (4): _Coaches can view their own assessments_; _Coaches can insert their own assessments_; _Coaches can update their own assessments_; _Coaches can delete their own assessments_

### `assessment_actions`

**Columns** (11): `id`, `seeker_id`, `assessment_type`, `assessment_id`, `action_text`, `category`, `priority`, `status`, `due_date`, `completed_at`, `created_at`

**RLS policies** (2): _Seekers manage own assessment actions_; _Admins manage all assessment actions_

### `assessment_config`

**Columns** (6): `id`, `assessment_type`, `is_active`, `config`, `created_at`, `updated_at`

**RLS policies** (2): _Admins manage assessment config_; _Authenticated read active configs_

### `lgt_assessments`

**Columns** (9): `id`, `seeker_id`, `dharma_score`, `artha_score`, `kama_score`, `moksha_score`, `average_score`, `notes`, `created_at`

**RLS policies** (2): _Seekers manage own lgt assessments_; _Admins manage all lgt assessments_

### `wheel_of_life_assessments`

**Columns** (13): `id`, `seeker_id`, `career_score`, `finance_score`, `health_score`, `family_score`, `romance_score`, `growth_score`, `fun_score`, `environment_score`, `average_score`, `notes`, `created_at`

**RLS policies** (2): _Seekers manage own wol assessments_; _Admins manage all wol assessments_

### `firo_b_assessments`

**Columns** (12): `id`, `seeker_id`, `expressed_inclusion`, `wanted_inclusion`, `expressed_control`, `wanted_control`, `expressed_affection`, `wanted_affection`, `total_expressed`, `total_wanted`, `notes`, `created_at`

**RLS policies** (2): _Seekers manage own firo_b_; _Admins manage all firo_b_

### `happiness_assessments`

**Columns** (13): `id`, `seeker_id`, `life_satisfaction_score`, `positive_emotions_score`, `engagement_score`, `relationships_score`, `meaning_score`, `accomplishment_score`, `health_score`, `gratitude_score`, `average_score`, `notes`, `created_at`

**RLS policies** (2): _Seekers manage own happiness_; _Admins manage all happiness_

### `mooch_assessments`

**Columns** (11): `id`, `seeker_id`, `overthinking_score`, `negativity_score`, `comparison_score`, `fear_score`, `attachment_score`, `resistance_score`, `average_score`, `notes`, `created_at`

**RLS policies** (2): _Seekers manage own mooch_; _Admins manage all mooch_

### `purusharthas_assessments`

**Columns** (10): `id`, `seeker_id`, `dharma_score`, `artha_score`, `kama_score`, `moksha_score`, `sub_dimensions`, `average_score`, `notes`, `created_at`

**RLS policies** (2): _Seekers manage own purusharthas_; _Admins manage all purusharthas_

### `personal_swot_assessments`

**Columns** (13): `id`, `seeker_id`, `strengths`, `weaknesses`, `opportunities`, `threats`, `overall_notes`, `strength_count`, `weakness_count`, `opportunity_count`, `threat_count`, `balance_score`, `created_at`

**RLS policies** (7): _Seekers can view own SWOT assessments_; _Seekers can create own SWOT assessments_; _Seekers can delete own SWOT assessments_; _Users view own SWOT or admin_; _Users insert own SWOT_; _Users update own SWOT or admin_; _Users delete own SWOT or admin_

### `seeker_assessments`

**Columns** (9): `id`, `seeker_id`, `type`, `period`, `scores_json`, `analysis_text`, `notes`, `created_at`, `updated_at`

**RLS policies** (2): _Admins can manage seeker assessments_; _Seekers can view own assessments_

### `lgt_applications`

**Columns** (14): `id`, `seeker_id`, `status`, `form_data`, `invite_token`, `invite_token_expires_at`, `invited_by`, `invited_at`, `invite_email_sent_at`, `filled_by_role`, `submitted_at`, `created_at`, `updated_at`, `version`

**RLS policies** (3): _Admins manage all lgt applications_; _Seekers view own lgt application_; _Seekers update own pending lgt application_

## Daily Practice

### `daily_worksheets`

**Columns** (54): `id`, `seeker_id`, `worksheet_date`, `morning_intention`, `morning_mood`, `morning_clarity_score`, `morning_energy_score`, `morning_peace_score`, `morning_readiness_score`, `evening_mood`, `evening_mental_peace`, `evening_emotional_satisfaction`, `evening_fulfillment`, `evening_fulfillment_score`, `what_went_well`, `what_i_learned`, `do_differently`, `gratitude_1`, `gratitude_2`, `gratitude_3`, `gratitude_4`, `gratitude_5`, `todays_win_1`, `todays_win_2`, `todays_win_3`, `aha_moment`, `dharma_score`, `artha_score`, `kama_score`, `moksha_score`, `lgt_balance_score`, `sampoorna_din_score`, `tomorrow_sankalp`, `tomorrow_prep_score`, `share_with_buddy`, `water_intake_glasses`, `steps_taken`, `sleep_hours`, `sleep_quality`, `body_weight_kg`, `supplements_taken`, `screen_time_hours`, `end_energy_level`, `workout_done`, `workout_type`, `workout_duration_minutes`, `non_negotiables_completed`, `non_negotiables_total`, `coach_weekly_challenge_done`, `completion_rate_percent`, `is_submitted`, `is_draft`, `created_at`, `updated_at`

**RLS policies** (2): _Seekers can manage own worksheets_; _Admins can manage all worksheets_

### `daily_lgt_checkins`

**Columns** (9): `id`, `seeker_id`, `dharma_score`, `artha_score`, `kama_score`, `moksha_score`, `overall_balance`, `focus_recommendation`, `created_at`

**RLS policies** (2): _Seekers manage own checkins_; _Admins manage all checkins_

### `daily_logs`

**Columns** (15): `id`, `seeker_id`, `log_date`, `mood`, `energy_level`, `meditation_done`, `meditation_minutes`, `journaling_done`, `exercise_done`, `gratitude_entries`, `wins`, `challenges`, `affirmation`, `notes`, `created_at`

**RLS policies** (2): _Admins can view all logs_; _Seekers can manage own logs_

### `daily_priorities`

**Columns** (7): `id`, `worksheet_id`, `priority_number`, `task_description`, `lgt_pillar`, `time_estimate_minutes`, `is_completed`

**RLS policies** (2): _Users manage own priorities_; _Admins manage all priorities_

### `daily_time_slots`

**Columns** (15): `id`, `worksheet_id`, `slot_start_time`, `slot_end_time`, `activity_name`, `activity_category`, `lgt_pillar`, `energy_level`, `notes`, `is_planned`, `is_completed`, `actual_status`, `skip_reason`, `modified_activity_name`, `created_at`

**RLS policies** (2): _Users manage own time slots_; _Admins manage all time slots_

### `daily_non_negotiable_log`

**Columns** (5): `id`, `worksheet_id`, `non_negotiable_id`, `is_completed`, `logged_at`

**RLS policies** (2): _Users manage own nn log_; _Admins manage all nn logs_

### `seeker_non_negotiables`

**Columns** (7): `id`, `seeker_id`, `habit_name`, `lgt_pillar`, `is_active`, `added_by`, `created_at`

**RLS policies** (2): _Seekers can view own non-negotiables_; _Admins manage all non-negotiables_

### `time_sheets`

**Columns** (19): `id`, `seeker_id`, `date`, `wake_up_time`, `sleep_time`, `meditation_minutes`, `exercise_minutes`, `reading_minutes`, `work_hours`, `family_hours`, `learning_hours`, `spiritual_practice_minutes`, `screen_time_hours`, `water_glasses`, `meals_count`, `productivity_score`, `energy_level`, `notes`, `created_at`

**RLS policies** (2): _Seekers manage own time sheets_; _Admins manage all time sheets_

### `japa_log`

**Columns** (8): `id`, `seeker_id`, `log_date`, `mantra_text`, `mala_count`, `total_count`, `created_at`, `updated_at`

**RLS policies** (2): _Seekers manage own japa logs_; _Admins manage all japa logs_

### `streaks`

**Columns** (6): `id`, `seeker_id`, `current_streak`, `longest_streak`, `last_completed_date`, `updated_at`

**RLS policies** (4): _Admins manage all streaks_; _Seekers view own streak_; _Seekers manage own streak_; _Seekers insert own streak_

## Assignments & Submissions

### `assignments`

**Columns** (14): `id`, `seeker_id`, `course_id`, `title`, `description`, `category`, `type`, `due_date`, `priority`, `status`, `score`, `feedback`, `created_at`, `updated_at`

**RLS policies** (6): _Admins can manage assignments_; _Seekers can view and update own assignments_; _Seekers can update own assignment status_; _Coaches view assignments of assigned seekers_; _Coaches insert assignments for assigned seekers_; _Coaches update assignments of assigned seekers_

### `submissions`

**Columns** (10): `id`, `form_type`, `full_name`, `email`, `mobile`, `country_code`, `form_data`, `admin_notes`, `created_at`, `updated_at`

**RLS policies** (7): _Anyone can submit forms_; _Authenticated users can view submissions_; _Authenticated users can update submissions_; _Admin can update submissions_; _Admins can view submissions_; _Admins can delete submissions_; _Validated public submissions_

### `weekly_reviews`

**Columns** (15): `id`, `seeker_id`, `session_id`, `week_start`, `week_end`, `rating`, `wins`, `challenge`, `learning`, `wheel_scores`, `next_goals`, `need_from_coach`, `gratitude`, `submitted_at`, `updated_at`

**RLS policies** (5): _Seekers view own weekly reviews_; _Seekers insert own weekly reviews_; _Seekers update own weekly reviews_; _Admins manage all weekly reviews_; _Assigned coaches view seeker weekly reviews_

### `weekly_challenges`

**Columns** (13): `id`, `title`, `description`, `dimension`, `challenge_type`, `start_date`, `end_date`, `tasks_json`, `points_reward`, `badge_id`, `program_id`, `is_active`, `created_at`

**RLS policies** (2): _Anyone can view active challenges_; _Admins manage challenges_

### `weekly_challenge_progress`

**Columns** (8): `id`, `challenge_id`, `seeker_id`, `day_number`, `task_completed`, `notes`, `completed_at`, `created_at`

**RLS policies** (2): _Seekers manage own progress_; _Admins manage all progress_

### `coach_weekly_challenges`

**Columns** (10): `id`, `coach_id`, `seeker_id`, `challenge_text`, `challenge_description`, `lgt_pillar`, `week_start_date`, `week_end_date`, `is_active`, `created_at`

**RLS policies** (2): _Seekers view own challenges_; _Admins manage challenges_

## Gamification

### `badge_definitions`

**Columns** (13): `id`, `badge_key`, `emoji`, `name`, `description`, `category`, `condition_type`, `condition_field`, `condition_threshold`, `condition_streak_days`, `is_active`, `sort_order`, `created_at`

**RLS policies** (2): _Anyone can view badge definitions_; _Admins manage badge definitions_

### `seeker_badges`

**Columns** (6): `id`, `seeker_id`, `badge_id`, `earned_at`, `awarded_by`, `notes`

**RLS policies** (3): _Seekers view own badges_; _Admins manage all badges_; _Seekers manage own progress_

### `seeker_badge_progress`

**Columns** (7): `id`, `seeker_id`, `badge_id`, `current_streak`, `best_streak`, `last_qualifying_date`, `updated_at`

**RLS policies** (3): _Seekers view own progress_; _Seekers update own progress_; _Admins manage all progress_

### `points_ledger`

**Columns** (6): `id`, `seeker_id`, `points`, `activity_type`, `description`, `created_at`

**RLS policies** (3): _Admins manage all points_; _Seekers view own points_; _Seekers earn points_

### `daily_affirmations`

**Columns** (10): `id`, `affirmation_text`, `affirmation_hindi`, `category`, `source`, `author`, `image_url`, `display_date`, `is_active`, `created_at`

**RLS policies** (2): _Anyone can view active affirmations_; _Admins manage affirmations_

### `favorite_affirmations`

**Columns** (4): `id`, `user_id`, `affirmation_id`, `saved_at`

**RLS policies** (4): _Users can view own favorites_; _Users can save favorites_; _Users can remove favorites_; _Admins manage all favorites_

## Financial

### `payments`

**Columns** (15): `id`, `seeker_id`, `invoice_number`, `amount`, `gst_amount`, `total_amount`, `payment_date`, `due_date`, `method`, `transaction_id`, `status`, `notes`, `created_at`, `amount_enc`, `is_joint`

**RLS policies** (11): _Authenticated users can view payments_; _Authenticated users can insert payments_; _Authenticated users can update payments_; _Anyone can view payments_; _Anyone can insert payments_; _Anyone can update payments_; _Admin can view payments_; _Admin can insert payments_; _Admin can update payments_; _Seekers can view own payments_; _Seekers view joint group payments_

### `accounting_records`

**Columns** (13): `id`, `business_id`, `month`, `year`, `revenue`, `expenses`, `profit`, `taxes`, `receivables`, `payables`, `notes`, `created_at`, `revenue_enc`

**RLS policies** (2): _Seekers manage own accounting_; _Admins manage all accounting_

### `cashflow_records`

**Columns** (10): `id`, `business_id`, `date`, `type`, `category`, `amount`, `description`, `balance_after`, `created_at`, `amount_enc`

**RLS policies** (2): _Seekers manage own cashflow_; _Admins manage all cashflow_

### `daily_financial_log`

**Columns** (7): `id`, `worksheet_id`, `entry_type`, `source_description`, `amount_inr`, `category`, `created_at`

**RLS policies** (2): _Users manage own financial log_; _Admins manage all financial logs_

## Artha (Business)

### `business_profiles`

**Columns** (13): `id`, `seeker_id`, `business_name`, `industry`, `tagline`, `founded_year`, `team_size`, `revenue_range`, `website`, `logo_url`, `created_at`, `updated_at`, `gst_number_enc`

**RLS policies** (2): _Seekers manage own business profile_; _Admins manage all business profiles_

### `business_competitors`

**Columns** (10): `id`, `business_id`, `competitor_name`, `website`, `strengths`, `weaknesses`, `pricing`, `threat_level`, `notes`, `created_at`

**RLS policies** (2): _Seekers manage own competitors_; _Admins manage all competitors_

### `business_mission_vision`

**Columns** (7): `id`, `business_id`, `mission_statement`, `vision_statement`, `purpose_statement`, `created_at`, `updated_at`

**RLS policies** (2): _Seekers manage own mission vision_; _Admins manage all mission vision_

### `business_swot_items`

**Columns** (8): `id`, `business_id`, `type`, `title`, `description`, `importance`, `action_plan`, `created_at`

**RLS policies** (2): _Seekers manage own swot_; _Admins manage all swot_

### `business_values`

**Columns** (7): `id`, `business_id`, `value_name`, `value_description`, `priority_order`, `icon_emoji`, `created_at`

**RLS policies** (2): _Seekers manage own values_; _Admins manage all values_

### `branding_strategy`

**Columns** (11): `id`, `business_id`, `brand_personality`, `brand_voice`, `brand_colors`, `logo_description`, `brand_story`, `positioning_statement`, `tagline`, `created_at`, `updated_at`

**RLS policies** (2): _Seekers manage own branding_; _Admins manage all branding_

### `marketing_strategy`

**Columns** (10): `id`, `business_id`, `target_audience`, `marketing_channels`, `content_strategy`, `budget_monthly`, `goals_quarterly`, `metrics_tracked`, `created_at`, `updated_at`

**RLS policies** (2): _Seekers manage own marketing_; _Admins manage all marketing_

### `sales_strategy`

**Columns** (11): `id`, `business_id`, `sales_process`, `sales_channels`, `pricing_strategy`, `sales_targets_monthly`, `conversion_goals`, `key_objections`, `sales_scripts`, `created_at`, `updated_at`

**RLS policies** (2): _Seekers manage own sales_; _Admins manage all sales_

### `department_health`

**Columns** (10): `id`, `business_id`, `department_name`, `health_score`, `key_metrics`, `challenges`, `action_plan`, `month`, `year`, `created_at`

**RLS policies** (2): _Seekers manage own dept health_; _Admins manage all dept health_

### `rnd_projects`

**Columns** (11): `id`, `business_id`, `project_name`, `description`, `status`, `start_date`, `target_completion`, `budget`, `progress_percent`, `outcomes`, `created_at`

**RLS policies** (2): _Seekers manage own rnd_; _Admins manage all rnd_

### `team_members`

**Columns** (10): `id`, `business_id`, `name`, `role`, `department`, `hire_date`, `skills`, `performance_rating`, `notes`, `created_at`

**RLS policies** (2): _Seekers manage own team_; _Admins manage all team_

### `swot_competitors`

**Columns** (10): `id`, `name`, `description`, `strengths`, `weaknesses`, `opportunity_for_vdts`, `threat_level`, `sort_order`, `created_at`, `updated_at`

**RLS policies** (1): _Admins manage swot_competitors_

### `swot_entries`

**Columns** (6): `id`, `category`, `text`, `sort_order`, `created_at`, `updated_at`

**RLS policies** (2): _Admins manage swot_entries_; _Block non-admin reads on swot_entries_

## Communication

### `messages`

**Columns** (7): `id`, `sender_id`, `receiver_id`, `content`, `is_read`, `created_at`, `content_enc`

**RLS policies** (3): _Users can view own messages_; _Users can send messages_; _Users can mark own messages as read_

### `notifications`

**Columns** (8): `id`, `user_id`, `type`, `title`, `message`, `action_url`, `is_read`, `created_at`

**RLS policies** (7): _Users view own notifications_; _Users update own notifications_; _Users delete own notifications_; _Admins manage all notifications_; _System can insert notifications_; _Users or admins insert notifications_; _Only admins insert notifications_

### `announcements`

**Columns** (12): `id`, `title`, `content`, `type`, `priority`, `audience`, `course_id`, `starts_at`, `expires_at`, `created_by`, `created_at`, `is_pinned`

**RLS policies** (2): _Anyone can view announcements_; _Admins manage announcements_

### `announcement_reads`

**Columns** (4): `id`, `announcement_id`, `user_id`, `read_at`

**RLS policies** (3): _Users view own reads_; _Users mark as read_; _Admins view all reads_

### `support_tickets`

**Columns** (10): `id`, `seeker_id`, `kind`, `category`, `description`, `status`, `admin_reply`, `resolved_at`, `created_at`, `updated_at`

**RLS policies** (4): _Seekers insert own tickets_; _Seekers view own tickets_; _Admins update tickets_; _Admins delete tickets_

### `email_log`

**Columns** (8): `id`, `seed_run_id`, `recipients`, `subject`, `status`, `resend_message_id`, `error_message`, `sent_at`

**RLS policies** (5): _Admins read email log_; _No client INSERT to email_log_; _No client UPDATE to email_log_; _No client DELETE from email_log_; _Super admins read email log_

### `email_send_log`

**Columns** (8): `id`, `message_id`, `template_name`, `recipient_email`, `status`, `error_message`, `metadata`, `created_at`

**RLS policies** (4): _Service role can read send log_; _Service role can insert send log_; _Service role can update send log_; _Admins can view email send log_

### `email_send_state`

**Columns** (7): `id`, `retry_after_until`, `batch_size`, `send_delay_ms`, `auth_email_ttl_minutes`, `transactional_email_ttl_minutes`, `updated_at`

**RLS policies** (1): _Service role can manage send state_

### `email_unsubscribe_tokens`

**Columns** (5): `id`, `token`, `email`, `created_at`, `used_at`

**RLS policies** (3): _Service role can read tokens_; _Service role can insert tokens_; _Service role can mark tokens as used_

### `suppressed_emails`

**Columns** (5): `id`, `email`, `reason`, `metadata`, `created_at`

**RLS policies** (3): _Service role can read suppressed emails_; _Service role can insert suppressed emails_; _Admins can read suppressed emails_

### `worksheet_notifications`

**Columns** (7): `id`, `seeker_id`, `notification_type`, `message`, `is_read`, `triggered_by`, `created_at`

**RLS policies** (3): _Seekers view own notifications_; _Seekers mark own notifications read_; _Admins manage all notifications_

### `daily_progress_email_log`

**Columns** (7): `id`, `seeker_id`, `sent_date`, `status`, `summary`, `error`, `created_at`

**RLS policies** (1): _Admins read email log_

### `daily_report_settings`

**Columns** (6): `id`, `enabled`, `send_hour`, `updated_by`, `updated_at`, `singleton`

**RLS policies** (3): _Anyone authed can read daily report settings_; _Admins can update daily report settings_; _Admins can insert daily report settings_

## Documents & Agreements

### `documents`

**Columns** (10): `id`, `title`, `description`, `category`, `storage_path`, `version`, `is_active`, `uploaded_by`, `created_at`, `updated_at`

**RLS policies** (3): _Admins manage documents_; _Coaches read active documents_; _Seekers can read documents sent to them for signature_

### `document_signatures`

**Columns** (13): `id`, `request_id`, `seeker_id`, `document_id`, `signed_pdf_path`, `typed_full_name`, `place`, `signature_date`, `ip_address`, `user_agent`, `verification_id`, `file_size_bytes`, `signed_at`

**RLS policies** (3): _Admins read document signatures_; _Coaches read document signatures_; _Seekers read own document signatures_

### `agreements`

**Columns** (9): `id`, `client_id`, `coach_id`, `type`, `fields_json`, `signed_at`, `pdf_url`, `created_at`, `updated_at`

**RLS policies** (9): _Coaches can view their own agreements_; _Coaches can insert their own agreements_; _Coaches can update their own agreements_; _Coaches can delete their own agreements_; _Admins can view all agreements_; _Admins can insert agreements_; _Admins can update agreements_; _Admins can delete agreements_; _Seekers can view their own agreements_

### `agreement_signatures`

**Columns** (11): `id`, `agreement_id`, `signer_id`, `signer_role`, `storage_path`, `typed_name`, `content_hash`, `ip_address`, `user_agent`, `signed_at`, `created_at`

**RLS policies** (5): _Admins manage all agreement signatures_; _Seekers view own agreement signatures_; _Seekers insert own agreement signatures_; _Coaches view assigned seekers agreement signatures_; _Coaches insert agreement signatures for assigned seekers_

### `signature_requests`

**Columns** (17): `id`, `seeker_id`, `document_id`, `session_id`, `signer_email_encrypted`, `signer_name`, `token_hash`, `status`, `expires_at`, `sent_at`, `signed_at`, `cancelled_at`, `custom_message`, `created_by`, `created_at`, `updated_at`, `sign_method`

**RLS policies** (3): _Admins manage signature requests_; _Coaches view their seekers' requests_; _Seekers view their own requests_

## CRM (Leads & Clients)

### `leads`

**Columns** (15): `id`, `name`, `phone`, `email`, `source`, `interested_course_id`, `priority`, `stage`, `current_challenge`, `notes`, `next_followup_date`, `days_in_pipeline`, `created_at`, `updated_at`, `country`

**RLS policies** (1): _Admins can manage leads_

### `clients`

**Columns** (16): `id`, `coach_id`, `name`, `mobile`, `email`, `dob`, `gender`, `income`, `education`, `course`, `sessions_committed`, `personal_history_json`, `signature_data`, `created_at`, `updated_at`, `personal_history_enc`

**RLS policies** (4): _Coaches can view their own clients_; _Coaches can insert their own clients_; _Coaches can update their own clients_; _Coaches can delete their own clients_

### `client_feedback`

**Columns** (10): `id`, `business_id`, `client_name`, `feedback_date`, `rating`, `feedback_text`, `category`, `response_action`, `resolved`, `created_at`

**RLS policies** (2): _Seekers manage own feedback_; _Admins manage all feedback_

### `follow_ups`

**Columns** (10): `id`, `seeker_id`, `type`, `due_date`, `priority`, `notes`, `status`, `completion_notes`, `created_at`, `updated_at`

**RLS policies** (1): _Admins can manage follow_ups_

## Learning Center

### `learning_content`

**Columns** (17): `id`, `title`, `description`, `type`, `category`, `url`, `thumbnail_url`, `duration_minutes`, `course_id`, `tier`, `language`, `tags`, `view_count`, `is_active`, `created_at`, `updated_at`, `visibility`

**RLS policies** (4): _Anyone can view active learning content_; _Admins manage all learning content_; _Coaches view admin_coach and all content_; _Seekers view all-visibility content_

### `resources`

**Columns** (13): `id`, `title`, `description`, `type`, `category`, `course_id`, `language`, `tags`, `file_url`, `view_count`, `download_count`, `created_at`, `updated_at`

**RLS policies** (2): _Authenticated users can view resources_; _Admins can manage resources_

### `user_content_progress`

**Columns** (10): `id`, `content_id`, `seeker_id`, `progress_percent`, `last_position_seconds`, `is_completed`, `is_bookmarked`, `last_watched_at`, `created_at`, `updated_at`

**RLS policies** (2): _Seekers manage own progress_; _Admins view all progress_

### `user_bookmarks`

**Columns** (9): `id`, `seeker_id`, `content_type`, `content_id`, `content_title`, `content_url`, `notes`, `tags`, `created_at`

**RLS policies** (2): _Seekers manage own bookmarks_; _Admins manage all bookmarks_

## Calendar

### `calendar_events`

**Columns** (12): `id`, `title`, `type`, `seeker_id`, `date`, `start_time`, `end_time`, `color`, `notes`, `created_at`, `updated_at`, `start_at`

**RLS policies** (2): _Admins can manage calendar_; _Seekers can view own events_

