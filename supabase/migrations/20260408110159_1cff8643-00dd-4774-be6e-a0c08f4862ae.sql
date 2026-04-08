
CREATE TABLE public.session_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid NOT NULL REFERENCES public.profiles(id),
  type text NOT NULL CHECK (type IN ('session_assigned','session_submitted','session_approved','revision_requested','assignment_due','comment_added')),
  title text NOT NULL,
  body text,
  session_id uuid REFERENCES public.sessions(id) ON DELETE CASCADE,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.session_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications" ON public.session_notifications
  FOR SELECT TO authenticated
  USING (recipient_id IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid()));

CREATE POLICY "Users update own notifications" ON public.session_notifications
  FOR UPDATE TO authenticated
  USING (recipient_id IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid()));

CREATE POLICY "Admins manage all notifications" ON public.session_notifications
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Authenticated insert notifications" ON public.session_notifications
  FOR INSERT TO authenticated
  WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.session_notifications;
