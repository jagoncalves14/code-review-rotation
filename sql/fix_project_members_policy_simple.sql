-- Drop all existing policies on project_members to start clean
DROP POLICY IF EXISTS admin_all ON public.project_members;
DROP POLICY IF EXISTS user_read ON public.project_members;

-- Create simplified policies
-- Admin policy - admins can do everything
CREATE POLICY admin_all ON public.project_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.is_admin = true
    )
  );

-- Simplified read policy - allow all authenticated users to read project_members
CREATE POLICY user_read ON public.project_members
  FOR SELECT
  TO authenticated
  USING (true);

-- Verify the changes
COMMENT ON TABLE public.project_members IS 'Stores relationships between projects and profiles (assignees/reviewers) with simplified RLS';
