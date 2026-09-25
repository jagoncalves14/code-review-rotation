-- Drop the problematic policy first
DROP POLICY IF EXISTS user_read ON public.project_members;

-- Create a fixed policy for project_members
-- Users can read project members for projects they are members of
CREATE POLICY user_read ON public.project_members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND
      EXISTS (
        SELECT 1 FROM public.project_members pm
        WHERE pm.profile_id = p.id AND pm.project_id = project_members.project_id
      )
    )
  );

-- Alternative policy - users can read any project_members records
-- If the above policy still causes issues, run this simpler policy instead:
/*
DROP POLICY IF EXISTS user_read ON public.project_members;
CREATE POLICY user_read ON public.project_members
  FOR SELECT
  TO authenticated
  USING (true);
*/
