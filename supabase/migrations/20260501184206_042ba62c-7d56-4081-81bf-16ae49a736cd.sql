CREATE OR REPLACE FUNCTION public.get_linked_seekers_basic(_seeker_id uuid)
RETURNS TABLE (
  link_id uuid,
  group_id uuid,
  partner_id uuid,
  full_name text,
  email text,
  relationship text,
  relationship_label text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow only: admin, OR the seeker themselves (matched via profiles.user_id)
  IF NOT (
    public.is_admin(auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = _seeker_id AND p.user_id = auth.uid())
  ) THEN
    RETURN;
  END IF;

  RETURN QUERY
  WITH grp AS (
    SELECT sl.group_id FROM public.seeker_links sl WHERE sl.seeker_id = _seeker_id LIMIT 1
  )
  SELECT
    sl.id           AS link_id,
    sl.group_id     AS group_id,
    p.id            AS partner_id,
    p.full_name     AS full_name,
    p.email         AS email,
    sl.relationship::text AS relationship,
    sl.relationship_label
  FROM public.seeker_links sl
  JOIN public.profiles p ON p.id = sl.seeker_id
  WHERE sl.group_id = (SELECT group_id FROM grp)
    AND sl.seeker_id <> _seeker_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_linked_seekers_basic(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_linked_seekers_basic(uuid) TO authenticated;