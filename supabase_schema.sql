-- ==============================================================================
-- FRAMEVERSE - SUPABASE DATABASE & STORAGE SCHEMA
-- ==============================================================================
-- Run this script in your Supabase project's SQL Editor to configure the
-- projects table (with self-uploaded video support), security policies,
-- storage buckets (for thumbnails and videos), and Yashu's super admin account.
-- ==============================================================================

-- 1. Create the `projects` table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'Commercial',
    video_type TEXT NOT NULL DEFAULT 'youtube', -- 'youtube' or 'upload'
    tags TEXT[] DEFAULT '{}',
    technologies TEXT[] DEFAULT '{}',
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    client TEXT,
    role TEXT,
    duration TEXT,
    featured BOOLEAN DEFAULT false,
    views BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure video_type column exists if table was already created
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema='public' AND table_name='projects' AND column_name='video_type'
    ) THEN
        ALTER TABLE public.projects ADD COLUMN video_type TEXT NOT NULL DEFAULT 'youtube';
    END IF;
END $$;

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies:
-- Allow anyone (public and anonymous) to view projects
DROP POLICY IF EXISTS "Public projects are viewable by everyone" ON public.projects;
CREATE POLICY "Public projects are viewable by everyone"
ON public.projects FOR SELECT
USING (true);

-- Allow authenticated users (Super Admin Yashu) to insert projects
DROP POLICY IF EXISTS "Authenticated users can insert projects" ON public.projects;
CREATE POLICY "Authenticated users can insert projects"
ON public.projects FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users (Super Admin Yashu) to update projects
DROP POLICY IF EXISTS "Authenticated users can update projects" ON public.projects;
CREATE POLICY "Authenticated users can update projects"
ON public.projects FOR UPDATE
TO authenticated
USING (true);

-- Allow authenticated users (Super Admin Yashu) to delete projects
DROP POLICY IF EXISTS "Authenticated users can delete projects" ON public.projects;
CREATE POLICY "Authenticated users can delete projects"
ON public.projects FOR DELETE
TO authenticated
USING (true);

-- 4. Create an atomic function to increment project view counts
CREATE OR REPLACE FUNCTION increment_views(project_id UUID)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_views BIGINT;
BEGIN
  UPDATE public.projects
  SET views = COALESCE(views, 0) + 1
  WHERE id = project_id
  RETURNING views INTO new_views;
  
  RETURN new_views;
END;
$$;

-- Allow public to execute increment_views
GRANT EXECUTE ON FUNCTION increment_views(UUID) TO anon, authenticated;

-- 5. Set up Supabase Storage for project thumbnails AND uploaded video files
-- 5a. Thumbnails Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-thumbnails', 'project-thumbnails', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public can view project thumbnails" ON storage.objects;
CREATE POLICY "Public can view project thumbnails"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-thumbnails');

DROP POLICY IF EXISTS "Authenticated users can upload thumbnails" ON storage.objects;
CREATE POLICY "Authenticated users can upload thumbnails"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project-thumbnails');

DROP POLICY IF EXISTS "Authenticated users can update/delete thumbnails" ON storage.objects;
CREATE POLICY "Authenticated users can update/delete thumbnails"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'project-thumbnails');

-- 5b. Videos Bucket (for self-uploaded MP4/WebM video files)
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-videos', 'project-videos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public can view project videos" ON storage.objects;
CREATE POLICY "Public can view project videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-videos');

DROP POLICY IF EXISTS "Authenticated users can upload videos" ON storage.objects;
CREATE POLICY "Authenticated users can upload videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project-videos');

DROP POLICY IF EXISTS "Authenticated users can update/delete videos" ON storage.objects;
CREATE POLICY "Authenticated users can update/delete videos"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'project-videos');

-- ==============================================================================
-- 6. Super Admin Account: Yashu (yv836254@gmail.com / yashu@2369)
-- ==============================================================================
-- To create Yashu's Super Admin user in Supabase Auth:
-- Option A: Go to Supabase Dashboard -> Authentication -> Users -> "Add User" -> Create User:
--   Email: yv836254@gmail.com
--   Password: yashu@2369
--   Auto Confirm: Checked (Yes)
--
-- Option B: Run this SQL block in the SQL Editor:
-- Note: Requires pgcrypto extension (enabled by default in Supabase)
/*
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'yv836254@gmail.com',
  crypt('yashu@2369', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Yashu (Super Admin)"}',
  now(),
  now()
) ON CONFLICT (email) DO NOTHING;
*/
