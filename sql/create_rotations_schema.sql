-- Create tables for rotations and rotation assignments

-- rotations table to store rotation periods
CREATE TABLE IF NOT EXISTS public.rotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  manually_triggered BOOLEAN DEFAULT false,
  is_final BOOLEAN DEFAULT false,
  CONSTRAINT valid_dates CHECK (end_date >= start_date)
);

-- Add comment
COMMENT ON TABLE public.rotations IS 'Stores rotation periods for code review projects';

-- rotation_assignments table to store assignments for each rotation
CREATE TABLE IF NOT EXISTS public.rotation_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rotation_id UUID NOT NULL REFERENCES public.rotations(id) ON DELETE CASCADE,
  assignee_profile_id UUID NOT NULL REFERENCES public.profiles(id),
  reviewer_profile_id UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT different_profiles CHECK (assignee_profile_id != reviewer_profile_id)
);

-- Add comment
COMMENT ON TABLE public.rotation_assignments IS 'Stores reviewer assignments for each rotation period';

-- Set up Row Level Security (RLS) for rotations
ALTER TABLE public.rotations ENABLE ROW LEVEL SECURITY;

-- Set up Row Level Security (RLS) for rotation_assignments
ALTER TABLE public.rotation_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies for rotations
-- Admins can do everything
CREATE POLICY admin_all ON public.rotations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.is_admin = true
    )
  );

-- Users can read rotations for projects they are members of
CREATE POLICY user_read ON public.rotations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm
      JOIN public.profiles p ON pm.profile_id = p.id
      WHERE p.user_id = auth.uid() AND pm.project_id = rotations.project_id
    )
  );

-- Create policies for rotation_assignments
-- Admins can do everything
CREATE POLICY admin_all ON public.rotation_assignments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.is_admin = true
    )
  );

-- Users can read assignments for rotations they are involved in
CREATE POLICY user_read ON public.rotation_assignments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.rotations r ON rotation_assignments.rotation_id = r.id
      JOIN public.project_members pm ON r.project_id = pm.project_id AND pm.profile_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

-- Grant appropriate permissions
GRANT ALL ON public.rotations TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rotations TO authenticated;

GRANT ALL ON public.rotation_assignments TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rotation_assignments TO authenticated;
