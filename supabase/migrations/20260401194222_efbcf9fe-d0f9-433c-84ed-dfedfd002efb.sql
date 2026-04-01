
-- Create resources storage bucket (public read for downloads)
INSERT INTO storage.buckets (id, name, public) VALUES ('resources', 'resources', true);

-- Create avatars storage bucket (public read for display)
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- ===== RESOURCES BUCKET POLICIES =====
-- Anyone authenticated can view/download resources
CREATE POLICY "Authenticated users can read resources" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'resources');

-- Only admin can upload resources
CREATE POLICY "Admin can upload resources" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'resources'
    AND public.is_admin(auth.uid())
  );

-- Only admin can update resources
CREATE POLICY "Admin can update resources" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'resources'
    AND public.is_admin(auth.uid())
  );

-- Only admin can delete resources
CREATE POLICY "Admin can delete resources" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'resources'
    AND public.is_admin(auth.uid())
  );

-- ===== AVATARS BUCKET POLICIES =====
-- Anyone authenticated can view avatars
CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'avatars');

-- Users can upload their own avatar (file path must start with their user id)
CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.is_admin(auth.uid())
    )
  );

-- Users can update their own avatar
CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.is_admin(auth.uid())
    )
  );

-- Users can delete their own avatar
CREATE POLICY "Users can delete own avatar" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.is_admin(auth.uid())
    )
  );
