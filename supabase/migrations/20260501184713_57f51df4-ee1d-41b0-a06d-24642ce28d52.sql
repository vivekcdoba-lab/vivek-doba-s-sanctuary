-- 1. Table
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seeker_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('issue','feature')),
  category text,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved','closed')),
  admin_reply text,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_seeker ON public.support_tickets(seeker_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created ON public.support_tickets(created_at DESC);

-- 2. RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Seekers insert own tickets"
  ON public.support_tickets FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = seeker_id AND p.user_id = auth.uid())
  );

CREATE POLICY "Seekers view own tickets"
  ON public.support_tickets FOR SELECT
  USING (
    public.is_admin(auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = seeker_id AND p.user_id = auth.uid())
  );

CREATE POLICY "Admins update tickets"
  ON public.support_tickets FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins delete tickets"
  ON public.support_tickets FOR DELETE
  USING (public.is_admin(auth.uid()));

-- 3. updated_at trigger
CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Notify all admins when a new ticket is filed
CREATE OR REPLACE FUNCTION public.notify_admins_of_ticket(_ticket_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ticket record;
  v_seeker_name text;
  v_emoji text;
  v_label text;
BEGIN
  SELECT t.*, p.full_name
    INTO v_ticket
    FROM public.support_tickets t
    JOIN public.profiles p ON p.id = t.seeker_id
    WHERE t.id = _ticket_id;
  IF NOT FOUND THEN RETURN; END IF;

  -- Caller must be the seeker (or admin)
  IF NOT (
    public.is_admin(auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = v_ticket.seeker_id AND p.user_id = auth.uid())
  ) THEN
    RETURN;
  END IF;

  v_emoji := CASE WHEN v_ticket.kind = 'issue' THEN '🐛' ELSE '💡' END;
  v_label := CASE WHEN v_ticket.kind = 'issue' THEN 'New Issue Report' ELSE 'New Feature Suggestion' END;
  v_seeker_name := COALESCE(v_ticket.full_name, 'A seeker');

  INSERT INTO public.notifications (user_id, type, title, message, action_url)
  SELECT
    a.user_id,
    'system',
    v_emoji || ' ' || v_label || COALESCE(' — ' || v_ticket.category, ''),
    v_seeker_name || ': ' || left(v_ticket.description, 200),
    '/admin/support'
  FROM public.profiles a
  WHERE a.role = 'admin' AND a.user_id IS NOT NULL;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.notify_admins_of_ticket(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.notify_admins_of_ticket(uuid) TO authenticated;