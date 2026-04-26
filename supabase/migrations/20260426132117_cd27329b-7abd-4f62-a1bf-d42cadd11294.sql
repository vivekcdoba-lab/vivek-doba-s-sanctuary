-- Create table FIRST, then the helper function that references it.

CREATE TABLE IF NOT EXISTS public.seeker_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL,
  seeker_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  relationship text NOT NULL CHECK (relationship IN ('spouse','parent','child','sibling','custom')),
  relationship_label text,
  linked_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT seeker_links_seeker_unique UNIQUE (seeker_id)
);

CREATE INDEX IF NOT EXISTS idx_seeker_links_group ON public.seeker_links(group_id);

ALTER TABLE public.seeker_links ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.get_seeker_link_group(_seeker_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT group_id FROM public.seeker_links WHERE seeker_id = _seeker_id LIMIT 1;
$$;

-- Admins: full access
CREATE POLICY "Admins manage seeker links"
  ON public.seeker_links FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Seekers: see their own row OR rows from the same group
CREATE POLICY "Seekers see own group links"
  ON public.seeker_links FOR SELECT
  USING (
    seeker_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    OR group_id = public.get_seeker_link_group(
        (SELECT id FROM public.profiles WHERE user_id = auth.uid())
      )
  );

-- payments — joint flags
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS is_joint boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS joint_group_id uuid;

CREATE INDEX IF NOT EXISTS idx_payments_joint_group ON public.payments(joint_group_id) WHERE is_joint = true;

-- Extra permissive SELECT policy for seekers viewing joint payments in their group
CREATE POLICY "Seekers view joint group payments"
  ON public.payments FOR SELECT
  USING (
    is_joint = true
    AND joint_group_id IS NOT NULL
    AND joint_group_id = public.get_seeker_link_group(
      (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
  );
