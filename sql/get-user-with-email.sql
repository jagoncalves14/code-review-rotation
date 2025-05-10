-- Drop the function if it exists
DROP FUNCTION IF EXISTS get_user_with_email(user_id uuid);

-- Create function to get a user with their email
CREATE OR REPLACE FUNCTION get_user_with_email(user_id uuid)
RETURNS TABLE (
  id uuid,
  name text,
  email varchar,
  is_admin boolean,
  created_at timestamptz,
  updated_at timestamptz
)
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    u.email,
    p.is_admin,
    p.created_at,
    p.updated_at
  FROM
    public.profiles p
  LEFT JOIN
    auth.users u ON (p.id = u.id OR p.user_id = u.id)
  WHERE
    p.id = user_id;
END;
$$;

-- Grant access to the authenticated users
GRANT EXECUTE ON FUNCTION get_user_with_email(uuid) TO authenticated;
