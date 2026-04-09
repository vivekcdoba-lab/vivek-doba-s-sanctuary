
-- Create user_sessions table
CREATE TABLE public.user_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text,
  status text NOT NULL DEFAULT 'active',
  login_at timestamptz NOT NULL DEFAULT now(),
  last_activity_at timestamptz NOT NULL DEFAULT now(),
  logout_at timestamptz,
  logout_reason text,
  ip_address text,
  user_agent text,
  duration_seconds integer
);

-- Indexes
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_status ON public.user_sessions(status);
CREATE INDEX idx_user_sessions_login_at ON public.user_sessions(login_at DESC);

-- Enable RLS
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admins manage all sessions"
ON public.user_sessions FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Users can insert own sessions
CREATE POLICY "Users insert own sessions"
ON public.user_sessions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can view own sessions
CREATE POLICY "Users view own sessions"
ON public.user_sessions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can update own sessions
CREATE POLICY "Users update own sessions"
ON public.user_sessions FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Function to close inactive sessions (60 min timeout)
CREATE OR REPLACE FUNCTION public.close_inactive_sessions()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  closed_count integer;
BEGIN
  UPDATE public.user_sessions
  SET status = 'closed',
      logout_reason = 'auto',
      logout_at = now(),
      duration_seconds = EXTRACT(EPOCH FROM (now() - login_at))::integer
  WHERE status = 'active'
    AND last_activity_at < now() - interval '60 minutes';
  
  GET DIAGNOSTICS closed_count = ROW_COUNT;
  RETURN closed_count;
END;
$$;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_sessions;
