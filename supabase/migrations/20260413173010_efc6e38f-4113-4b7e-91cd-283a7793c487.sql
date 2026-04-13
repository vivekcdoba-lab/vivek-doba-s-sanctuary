
-- Assessment system configuration
CREATE TABLE IF NOT EXISTS public.assessment_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_type VARCHAR(50) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System settings
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50) NOT NULL,
  settings JSONB NOT NULL DEFAULT '{}',
  updated_by UUID REFERENCES public.profiles(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.assessment_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- RLS: Admins can do everything on assessment_config
CREATE POLICY "Admins manage assessment config"
ON public.assessment_config FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

-- RLS: Authenticated users can read active configs
CREATE POLICY "Authenticated read active configs"
ON public.assessment_config FOR SELECT
TO authenticated
USING (is_active = true);

-- RLS: Admins manage system settings
CREATE POLICY "Admins manage system settings"
ON public.system_settings FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

-- Triggers for updated_at
CREATE TRIGGER update_assessment_config_updated_at
BEFORE UPDATE ON public.assessment_config
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at
BEFORE UPDATE ON public.system_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default assessment configs
INSERT INTO public.assessment_config (assessment_type, is_active, config) VALUES
('wheel_of_life', true, '{"spokes": 8}'),
('swot', true, '{}'),
('lgt', true, '{}'),
('purusharthas', true, '{}'),
('happiness', true, '{}'),
('mooch', false, '{}'),
('firob', false, '{}');

-- Seed default system settings
INSERT INTO public.system_settings (category, settings) VALUES
('assessments', '{"frequency": "monthly", "autoReminders": true, "coachAlerts": true, "dangerThreshold": 4}');
