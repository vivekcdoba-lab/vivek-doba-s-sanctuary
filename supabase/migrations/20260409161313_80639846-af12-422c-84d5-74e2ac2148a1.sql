
-- 1. business_profiles
CREATE TABLE public.business_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seeker_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  industry text,
  tagline text,
  founded_year integer,
  team_size integer DEFAULT 0,
  revenue_range text,
  website text,
  logo_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(seeker_id)
);
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Seekers manage own business profile" ON public.business_profiles FOR ALL TO authenticated
  USING (seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  WITH CHECK (seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins manage all business profiles" ON public.business_profiles FOR ALL TO authenticated
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE TRIGGER update_business_profiles_updated_at BEFORE UPDATE ON public.business_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. business_mission_vision
CREATE TABLE public.business_mission_vision (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  mission_statement text,
  vision_statement text,
  purpose_statement text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(business_id)
);
ALTER TABLE public.business_mission_vision ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Seekers manage own mission vision" ON public.business_mission_vision FOR ALL TO authenticated
  USING (business_id IN (SELECT id FROM business_profiles WHERE seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())))
  WITH CHECK (business_id IN (SELECT id FROM business_profiles WHERE seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));
CREATE POLICY "Admins manage all mission vision" ON public.business_mission_vision FOR ALL TO authenticated
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE TRIGGER update_business_mission_vision_updated_at BEFORE UPDATE ON public.business_mission_vision
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. business_values
CREATE TABLE public.business_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  value_name text NOT NULL,
  value_description text,
  priority_order integer NOT NULL DEFAULT 0,
  icon_emoji text DEFAULT '⭐',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.business_values ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Seekers manage own values" ON public.business_values FOR ALL TO authenticated
  USING (business_id IN (SELECT id FROM business_profiles WHERE seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())))
  WITH CHECK (business_id IN (SELECT id FROM business_profiles WHERE seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));
CREATE POLICY "Admins manage all values" ON public.business_values FOR ALL TO authenticated
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- 4. marketing_strategy
CREATE TABLE public.marketing_strategy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  target_audience text,
  unique_selling_proposition text,
  marketing_channels jsonb DEFAULT '[]'::jsonb,
  content_strategy text,
  budget_monthly numeric DEFAULT 0,
  goals_quarterly text,
  metrics_tracked jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(business_id)
);
ALTER TABLE public.marketing_strategy ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Seekers manage own marketing" ON public.marketing_strategy FOR ALL TO authenticated
  USING (business_id IN (SELECT id FROM business_profiles WHERE seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())))
  WITH CHECK (business_id IN (SELECT id FROM business_profiles WHERE seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));
CREATE POLICY "Admins manage all marketing" ON public.marketing_strategy FOR ALL TO authenticated
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE TRIGGER update_marketing_strategy_updated_at BEFORE UPDATE ON public.marketing_strategy
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. branding_strategy
CREATE TABLE public.branding_strategy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  brand_personality text,
  brand_voice text,
  brand_colors jsonb DEFAULT '[]'::jsonb,
  logo_description text,
  brand_story text,
  positioning_statement text,
  tagline text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(business_id)
);
ALTER TABLE public.branding_strategy ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Seekers manage own branding" ON public.branding_strategy FOR ALL TO authenticated
  USING (business_id IN (SELECT id FROM business_profiles WHERE seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())))
  WITH CHECK (business_id IN (SELECT id FROM business_profiles WHERE seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));
CREATE POLICY "Admins manage all branding" ON public.branding_strategy FOR ALL TO authenticated
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE TRIGGER update_branding_strategy_updated_at BEFORE UPDATE ON public.branding_strategy
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. sales_strategy
CREATE TABLE public.sales_strategy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  sales_process jsonb DEFAULT '[]'::jsonb,
  sales_channels text,
  pricing_strategy text,
  sales_targets_monthly numeric DEFAULT 0,
  conversion_goals text,
  key_objections jsonb DEFAULT '[]'::jsonb,
  sales_scripts text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(business_id)
);
ALTER TABLE public.sales_strategy ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Seekers manage own sales" ON public.sales_strategy FOR ALL TO authenticated
  USING (business_id IN (SELECT id FROM business_profiles WHERE seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())))
  WITH CHECK (business_id IN (SELECT id FROM business_profiles WHERE seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));
CREATE POLICY "Admins manage all sales" ON public.sales_strategy FOR ALL TO authenticated
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE TRIGGER update_sales_strategy_updated_at BEFORE UPDATE ON public.sales_strategy
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. accounting_records
CREATE TABLE public.accounting_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  month integer NOT NULL CHECK (month BETWEEN 1 AND 12),
  year integer NOT NULL,
  revenue numeric DEFAULT 0,
  expenses numeric DEFAULT 0,
  profit numeric DEFAULT 0,
  taxes numeric DEFAULT 0,
  receivables numeric DEFAULT 0,
  payables numeric DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(business_id, month, year)
);
ALTER TABLE public.accounting_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Seekers manage own accounting" ON public.accounting_records FOR ALL TO authenticated
  USING (business_id IN (SELECT id FROM business_profiles WHERE seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())))
  WITH CHECK (business_id IN (SELECT id FROM business_profiles WHERE seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));
CREATE POLICY "Admins manage all accounting" ON public.accounting_records FOR ALL TO authenticated
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- 8. cashflow_records
CREATE TABLE public.cashflow_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  type text NOT NULL CHECK (type IN ('inflow', 'outflow')),
  category text,
  amount numeric NOT NULL DEFAULT 0,
  description text,
  balance_after numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cashflow_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Seekers manage own cashflow" ON public.cashflow_records FOR ALL TO authenticated
  USING (business_id IN (SELECT id FROM business_profiles WHERE seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())))
  WITH CHECK (business_id IN (SELECT id FROM business_profiles WHERE seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));
CREATE POLICY "Admins manage all cashflow" ON public.cashflow_records FOR ALL TO authenticated
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- 9. team_members
CREATE TABLE public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text,
  department text,
  hire_date date,
  skills jsonb DEFAULT '[]'::jsonb,
  performance_rating integer CHECK (performance_rating IS NULL OR (performance_rating BETWEEN 1 AND 5)),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Seekers manage own team" ON public.team_members FOR ALL TO authenticated
  USING (business_id IN (SELECT id FROM business_profiles WHERE seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())))
  WITH CHECK (business_id IN (SELECT id FROM business_profiles WHERE seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));
CREATE POLICY "Admins manage all team" ON public.team_members FOR ALL TO authenticated
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- 10. department_health
CREATE TABLE public.department_health (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  department_name text NOT NULL,
  health_score integer NOT NULL DEFAULT 5 CHECK (health_score BETWEEN 1 AND 10),
  key_metrics jsonb DEFAULT '{}'::jsonb,
  challenges text,
  action_plan text,
  month integer NOT NULL CHECK (month BETWEEN 1 AND 12),
  year integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(business_id, department_name, month, year)
);
ALTER TABLE public.department_health ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Seekers manage own dept health" ON public.department_health FOR ALL TO authenticated
  USING (business_id IN (SELECT id FROM business_profiles WHERE seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())))
  WITH CHECK (business_id IN (SELECT id FROM business_profiles WHERE seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));
CREATE POLICY "Admins manage all dept health" ON public.department_health FOR ALL TO authenticated
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- 11. rnd_projects
CREATE TABLE public.rnd_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  project_name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'ideation' CHECK (status IN ('ideation','in_progress','testing','completed','paused')),
  start_date date,
  target_completion date,
  budget numeric DEFAULT 0,
  progress_percent integer DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  outcomes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.rnd_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Seekers manage own rnd" ON public.rnd_projects FOR ALL TO authenticated
  USING (business_id IN (SELECT id FROM business_profiles WHERE seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())))
  WITH CHECK (business_id IN (SELECT id FROM business_profiles WHERE seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));
CREATE POLICY "Admins manage all rnd" ON public.rnd_projects FOR ALL TO authenticated
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- 12. client_feedback
CREATE TABLE public.client_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  client_name text NOT NULL,
  feedback_date date NOT NULL DEFAULT CURRENT_DATE,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  feedback_text text,
  category text DEFAULT 'general',
  response_action text,
  resolved boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.client_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Seekers manage own feedback" ON public.client_feedback FOR ALL TO authenticated
  USING (business_id IN (SELECT id FROM business_profiles WHERE seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())))
  WITH CHECK (business_id IN (SELECT id FROM business_profiles WHERE seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));
CREATE POLICY "Admins manage all feedback" ON public.client_feedback FOR ALL TO authenticated
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- 13. business_swot_items
CREATE TABLE public.business_swot_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('strength','weakness','opportunity','threat')),
  title text NOT NULL,
  description text,
  importance integer DEFAULT 3 CHECK (importance BETWEEN 1 AND 5),
  action_plan text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.business_swot_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Seekers manage own swot" ON public.business_swot_items FOR ALL TO authenticated
  USING (business_id IN (SELECT id FROM business_profiles WHERE seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())))
  WITH CHECK (business_id IN (SELECT id FROM business_profiles WHERE seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));
CREATE POLICY "Admins manage all swot" ON public.business_swot_items FOR ALL TO authenticated
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- 14. business_competitors
CREATE TABLE public.business_competitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  competitor_name text NOT NULL,
  website text,
  strengths text,
  weaknesses text,
  pricing text,
  threat_level text DEFAULT 'medium' CHECK (threat_level IN ('high','medium','low')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.business_competitors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Seekers manage own competitors" ON public.business_competitors FOR ALL TO authenticated
  USING (business_id IN (SELECT id FROM business_profiles WHERE seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())))
  WITH CHECK (business_id IN (SELECT id FROM business_profiles WHERE seeker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));
CREATE POLICY "Admins manage all competitors" ON public.business_competitors FOR ALL TO authenticated
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- Indexes for performance
CREATE INDEX idx_business_profiles_seeker ON public.business_profiles(seeker_id);
CREATE INDEX idx_accounting_records_business ON public.accounting_records(business_id, year, month);
CREATE INDEX idx_cashflow_records_business ON public.cashflow_records(business_id, date);
CREATE INDEX idx_department_health_business ON public.department_health(business_id, year, month);
CREATE INDEX idx_client_feedback_business ON public.client_feedback(business_id, feedback_date);
CREATE INDEX idx_team_members_business ON public.team_members(business_id);
CREATE INDEX idx_rnd_projects_business ON public.rnd_projects(business_id);
CREATE INDEX idx_business_swot_business ON public.business_swot_items(business_id);
CREATE INDEX idx_business_competitors_business ON public.business_competitors(business_id);
