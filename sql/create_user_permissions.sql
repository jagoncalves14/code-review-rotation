-- Create user_permissions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_level text NOT NULL CHECK (permission_level IN ('view', 'edit')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_permission UNIQUE (user_id)
);

-- Add RLS policies to the user_permissions table
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- Policy to allow administrators to read all user permissions
CREATE POLICY "Admins can read all user permissions"
  ON public.user_permissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  );

-- Policy to allow administrators to insert/update user permissions
CREATE POLICY "Admins can insert/update user permissions"
  ON public.user_permissions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update user permissions"
  ON public.user_permissions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  );

-- Policy to allow users to read their own permissions
CREATE POLICY "Users can read own permissions"
  ON public.user_permissions
  FOR SELECT
  USING (user_id = auth.uid());

-- Comments for better documentation
COMMENT ON TABLE public.user_permissions IS 'Stores permission levels for users (view or edit)';
COMMENT ON COLUMN public.user_permissions.user_id IS 'The user ID this permission applies to';
COMMENT ON COLUMN public.user_permissions.permission_level IS 'Permission level: view (read-only) or edit (read-write)';
