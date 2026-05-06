-- Per-seeker module access control
CREATE TABLE public.seeker_module_access (
  id uuid primary key default gen_random_uuid(),
  seeker_id uuid not null references public.profiles(id) on delete cascade,
  module_key text not null,
  is_enabled boolean not null default false,
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (seeker_id, module_key)
);

CREATE INDEX idx_seeker_module_access_seeker ON public.seeker_module_access(seeker_id);

ALTER TABLE public.seeker_module_access ENABLE ROW LEVEL SECURITY;

-- Admins: full access
CREATE POLICY "Admins manage seeker module access"
  ON public.seeker_module_access
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Coaches: read-only on assigned seekers
CREATE POLICY "Coaches read assigned seeker module access"
  ON public.seeker_module_access
  FOR SELECT
  TO authenticated
  USING (public.is_assigned_coach(auth.uid(), seeker_id));

-- Seekers: read own
CREATE POLICY "Seekers read own module access"
  ON public.seeker_module_access
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = seeker_module_access.seeker_id AND p.user_id = auth.uid()
    )
  );

CREATE TRIGGER trg_seeker_module_access_updated_at
BEFORE UPDATE ON public.seeker_module_access
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();