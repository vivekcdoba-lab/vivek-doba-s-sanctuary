DO $$
DECLARE
  v_seeker_pid uuid := (SELECT id FROM profiles WHERE email='crwanare@gmail.com');
  v_coach_pid  uuid := (SELECT id FROM profiles WHERE email='coachviveklgt@gmail.com');
  v_admin_uid  uuid := (SELECT user_id FROM profiles WHERE email='Vivekcdoba@gmail.com');
  v_biz_id     uuid := (SELECT id FROM business_profiles WHERE seeker_id=(SELECT id FROM profiles WHERE email='crwanare@gmail.com'));
BEGIN

INSERT INTO topics (id, name, category, icon_emoji, created_by)
SELECT gen_random_uuid(), n, c, e, v_admin_uid FROM (VALUES
 ('Dharma — Purpose & Mission', 'pillar', '🕉️'),
 ('Artha — Business & Wealth', 'pillar', '💼'),
 ('Kama — Relationships & Joy', 'pillar', '❤️'),
 ('Moksha — Liberation & Inner Peace', 'pillar', '🧘'),
 ('Vishnu Protocol — Fortune 500 Roadmap', 'protocol', '👑')
) AS t(n,c,e)
WHERE NOT EXISTS (SELECT 1 FROM topics WHERE name = t.n);

WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY date) - 1 AS rn FROM sessions WHERE seeker_id = v_seeker_pid
), tl AS (
  SELECT
    (SELECT id FROM topics WHERE name='Dharma — Purpose & Mission') AS t_d,
    (SELECT id FROM topics WHERE name='Artha — Business & Wealth') AS t_a,
    (SELECT id FROM topics WHERE name='Kama — Relationships & Joy') AS t_k,
    (SELECT id FROM topics WHERE name='Moksha — Liberation & Inner Peace') AS t_m,
    (SELECT id FROM topics WHERE name='Vishnu Protocol — Fortune 500 Roadmap') AS t_v
)
INSERT INTO session_topics (session_id, topic_id)
SELECT o.id, CASE o.rn % 5 WHEN 0 THEN tl.t_d WHEN 1 THEN tl.t_a WHEN 2 THEN tl.t_k WHEN 3 THEN tl.t_m ELSE tl.t_v END
FROM ordered o CROSS JOIN tl ON CONFLICT DO NOTHING;

INSERT INTO daily_worksheets (seeker_id, worksheet_date, is_submitted, is_draft, completion_rate_percent, morning_intention, dharma_score, artha_score, kama_score, moksha_score) VALUES
 (v_seeker_pid, '2026-03-08', false, true, 20, 'Skipped — energy crash', 4,5,3,4),
 (v_seeker_pid, '2026-03-15', false, true, 15, 'Travel + investor stress', 3,4,3,3),
 (v_seeker_pid, '2026-03-25', false, true, 25, 'Recovering — partial entry', 5,5,4,4)
ON CONFLICT DO NOTHING;

UPDATE sessions SET attendance='missed', engagement_score=4, status='missed',
  missed_reason='Founder dealing with investor pushback — reschedule requested'
WHERE id = '4ec8d018-86c6-46a1-8b12-606cb6b4fa66';
UPDATE sessions SET engagement_score=5
WHERE id IN ('bf0c8514-2a41-4a0e-969c-e920c28f3bb3', '6cfa245a-124f-4e4e-a9b4-00a21ce0686f');

INSERT INTO lgt_assessments (seeker_id, dharma_score, artha_score, kama_score, moksha_score, average_score, created_at) VALUES
 (v_seeker_pid, 8, 8, 6, 7, 7.25, '2026-04-15 09:00+00'),
 (v_seeker_pid, 9, 9, 7, 8, 8.25, '2026-05-15 09:00+00');

INSERT INTO wheel_of_life_assessments (seeker_id, career_score, finance_score, health_score, family_score, romance_score, growth_score, fun_score, environment_score, average_score, created_at) VALUES
 (v_seeker_pid, 8,8,7,6,6,9,6,7, 7.13, '2026-04-15 09:30+00'),
 (v_seeker_pid, 9,9,8,7,7,9,7,8, 8.0,  '2026-05-15 09:30+00');

INSERT INTO mooch_assessments (seeker_id, overthinking_score, negativity_score, comparison_score, fear_score, attachment_score, resistance_score, average_score, created_at)
VALUES (v_seeker_pid, 4,3,4,3,5,3, 3.67, '2026-05-20 10:00+00');

INSERT INTO happiness_assessments (seeker_id, life_satisfaction_score, positive_emotions_score, engagement_score, relationships_score, meaning_score, accomplishment_score, health_score, gratitude_score, average_score, created_at)
VALUES (v_seeker_pid, 9,8,9,7,9,9,8,9, 8.5, '2026-05-25 10:00+00');

INSERT INTO coach_assessment_feedback (coach_id, seeker_id, assessment_id, assessment_type, general_notes, shared_with_seeker, action_items)
SELECT v_coach_pid, v_seeker_pid, a.id, 'lgt', 'Strong Artha rebound post-dip.', true, '[]'::jsonb
FROM lgt_assessments a WHERE a.seeker_id = v_seeker_pid AND a.created_at >= '2026-04-01'
  AND NOT EXISTS (SELECT 1 FROM coach_assessment_feedback f WHERE f.assessment_id = a.id);

INSERT INTO coach_assessment_feedback (coach_id, seeker_id, assessment_id, assessment_type, general_notes, shared_with_seeker, action_items)
SELECT v_coach_pid, v_seeker_pid, a.id, 'wheel_of_life', 'Career & Growth excellent. Romance/Fun lagging.', true, '[]'::jsonb
FROM wheel_of_life_assessments a WHERE a.seeker_id = v_seeker_pid AND a.created_at >= '2026-04-01'
  AND NOT EXISTS (SELECT 1 FROM coach_assessment_feedback f WHERE f.assessment_id = a.id);

INSERT INTO coach_assessment_feedback (coach_id, seeker_id, assessment_id, assessment_type, general_notes, shared_with_seeker, action_items)
SELECT v_coach_pid, v_seeker_pid, a.id, 'mooch', 'Mooch scores down across the board.', true, '[]'::jsonb
FROM mooch_assessments a WHERE a.seeker_id = v_seeker_pid AND a.created_at >= '2026-05-01'
  AND NOT EXISTS (SELECT 1 FROM coach_assessment_feedback f WHERE f.assessment_id = a.id);

INSERT INTO coach_assessment_feedback (coach_id, seeker_id, assessment_id, assessment_type, general_notes, shared_with_seeker, action_items)
SELECT v_coach_pid, v_seeker_pid, a.id, 'happiness', 'PERMA balanced and high.', true, '[]'::jsonb
FROM happiness_assessments a WHERE a.seeker_id = v_seeker_pid AND a.created_at >= '2026-05-01'
  AND NOT EXISTS (SELECT 1 FROM coach_assessment_feedback f WHERE f.assessment_id = a.id);

INSERT INTO team_members (business_id, name, role, department, hire_date, performance_rating, skills, notes) VALUES
 (v_biz_id,'Aditi Rao','Co-Founder & CTO','Engineering','2026-01-01',5,'["AI","Distributed systems","Leadership"]'::jsonb,'Technical north star'),
 (v_biz_id,'Rohan Mehta','VP Sales','Sales','2026-01-15',4,'["Enterprise sales","Negotiation"]'::jsonb,'Closes >$1M deals'),
 (v_biz_id,'Priya Iyer','VP Marketing','Marketing','2026-01-20',4,'["Brand","PR","Growth"]'::jsonb,'Building brand authority'),
 (v_biz_id,'Vikram Shah','VP Engineering','Engineering','2026-02-01',5,'["Architecture","Hiring"]'::jsonb,'Scaled team 8->40'),
 (v_biz_id,'Neha Kulkarni','VP People','HR','2026-02-10',4,'["Culture","L&D"]'::jsonb,'Defining cultural OS'),
 (v_biz_id,'Arjun Desai','VP Finance','Finance','2026-02-15',5,'["FP&A","Fundraising"]'::jsonb,'Series B prep'),
 (v_biz_id,'Sanya Patel','Head of Product','Product','2026-03-01',4,'["Product strategy","Discovery"]'::jsonb,'Roadmap owner'),
 (v_biz_id,'Karan Verma','Head of Customer Success','CX','2026-03-05',4,'["Onboarding","NPS"]'::jsonb,'Pushed NPS 38->62'),
 (v_biz_id,'Meera Joshi','Head of R&D','R&D','2026-03-15',5,'["IP","Research"]'::jsonb,'Filed 4 patents'),
 (v_biz_id,'Aditya Singh','Head of Operations','Operations','2026-04-01',3,'["Process","SLA"]'::jsonb,'Building ops backbone'),
 (v_biz_id,'Tara Nair','Head of Design','Design','2026-04-10',4,'["DesignOps","Brand"]'::jsonb,'Owning design system'),
 (v_biz_id,'Devansh Kapoor','Chief of Staff','Executive','2026-04-20',5,'["Strategy","Coordination"]'::jsonb,'CEO leverage');

INSERT INTO rnd_projects (business_id, project_name, description, status, start_date, target_completion, budget, progress_percent, outcomes) VALUES
 (v_biz_id,'Sovereign AI Moat','On-prem inference stack for Fortune-500','in_progress','2026-01-15','2026-09-30',12500000,40,'2 patents, 1 design partner'),
 (v_biz_id,'Edge Inference Engine','Sub-100ms latency for IoT','testing','2026-02-01','2026-08-31',8000000,55,'POC with 2 mfg leads'),
 (v_biz_id,'IP Filing Sprint','12 core patents','in_progress','2026-01-10','2026-12-31',3000000,33,'4/12 filed'),
 (v_biz_id,'Infra Cost Optimization','GPU pooling + spot orchestration','in_progress','2026-03-01','2026-07-31',2000000,60,'Burn down 28%');

INSERT INTO department_health (business_id, department_name, health_score, month, year, key_metrics, challenges, action_plan)
SELECT v_biz_id, d.name,
  GREATEST(5, LEAST(10, d.base + (m.m - 1) - CASE WHEN m.m = 3 THEN 2 ELSE 0 END))::int,
  m.m, 2026,
  jsonb_build_object('headcount', d.base*2 + m.m, 'velocity', d.base + m.m),
  CASE WHEN m.m = 3 THEN 'Mid-quarter dip' ELSE 'On track' END,
  'Coach action: weekly 1-1 with ' || d.lead
FROM (VALUES ('Engineering',8,'Vikram'),('Sales',7,'Rohan'),('Marketing',7,'Priya'),('Operations',6,'Aditya'),('Finance',8,'Arjun'),('HR',7,'Neha'),('R&D',8,'Meera'),('CX',7,'Karan')) AS d(name,base,lead)
CROSS JOIN (VALUES (1),(2),(3),(4),(5)) AS m(m);

INSERT INTO cashflow_records (business_id, date, type, category, amount, description, balance_after)
SELECT v_biz_id,
  ('2026-01-01'::date + (g.w * interval '7 days'))::date,
  CASE WHEN g.w % 2 = 0 THEN 'inflow' ELSE 'outflow' END,
  CASE WHEN g.w % 2 = 0 THEN 'revenue' ELSE 'opex' END,
  CASE WHEN g.w % 2 = 0 THEN 1500000 + (g.w * 50000) ELSE 800000 + (g.w * 20000) END,
  'Week ' || (g.w+1) || ' — CEO cashflow log',
  25000000 + (g.w * 200000)
FROM generate_series(0, 21) AS g(w);

UPDATE assignments SET category = 'daily_practice'
WHERE seeker_id = v_seeker_pid AND category IS NULL;

UPDATE sessions SET
  major_win = COALESCE(major_win, 'Locked Q' || ((EXTRACT(MONTH FROM date)::int - 1) / 3 + 1) || ' OKR clarity — clearer path to Fortune-500.'),
  next_week_assignments = COALESCE(next_week_assignments, 'Refine 5-year financial model; Run 1 investor practice pitch; Schedule weekly family Sankalp'),
  stories_used = COALESCE(stories_used, '["Hanuman crossing the ocean — leap of faith for Series B","Krishna counsel to Arjuna — duty over doubt"]'::jsonb),
  client_good_things = COALESCE(client_good_things, '"Energetic, prepared with data, clear on north star."'::jsonb),
  targets = COALESCE(targets, 'Hit ARR run-rate of Rs 50Cr by Q2 close'),
  therapy_given = COALESCE(therapy_given, 'Vishnu Protocol — Fortune 500 visualization + breath anchor')
WHERE seeker_id = v_seeker_pid;

END $$;