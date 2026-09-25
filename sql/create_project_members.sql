-- Create the project_members table to store relationships between projects and profiles
CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('assignee', 'reviewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  -- Add a unique constraint to prevent duplicate roles for the same profile in a project
  CONSTRAINT unique_project_profile_role UNIQUE (project_id, profile_id, role)
);

-- Add comment
COMMENT ON TABLE public.project_members IS 'Stores relationships between projects and profiles (assignees/reviewers)';

-- Set up Row Level Security (RLS) for the project_members table
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- Create policies for project_members
-- Admins can do everything
CREATE POLICY admin_all ON public.project_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.is_admin = true
    )
  );

-- Users can read project members for projects they are members of
CREATE POLICY user_read ON public.project_members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm
      JOIN public.profiles p ON pm.profile_id = p.id
      WHERE p.user_id = auth.uid() AND pm.project_id = project_id
    )
  );

-- Grant appropriate permissions
GRANT ALL ON public.project_members TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_members TO authenticated;
