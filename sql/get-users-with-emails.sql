-- Drop the function if it exists
DROP FUNCTION IF EXISTS get_users_with_emails();

-- Create a new function with the correct table structure
CREATE OR REPLACE FUNCTION get_users_with_emails()
RETURNS TABLE (
  id uuid,
  name text,
  email varchar,
  is_admin boolean,
  created_at timestamptz,
  updated_at timestamptz
)
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    COALESCE(u.email, CONCAT(REPLACE(LOWER(p.name), ' ', '.'), '@example.com')) as email,
    p.is_admin,
    p.created_at,
    p.updated_at
  FROM
    public.profiles p
  LEFT JOIN
    auth.users u ON (p.id = u.id OR p.user_id = u.id)
  ORDER BY
    p.name;

  -- For debugging, if the above doesn't work properly,
  -- try alternative approach checking both id and user_id:
  /*
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    COALESCE(u.email, CONCAT(REPLACE(LOWER(p.name), ' ', '.'), '@example.com')) as email,
    p.is_admin,
    p.created_at,
    p.updated_at
  FROM
    public.profiles p
  LEFT JOIN
    auth.users u ON (p.user_id = u.id OR p.id = u.id)
  ORDER BY
    p.name;
  */
END;
$$ LANGUAGE plpgsql;

-- Grant access to the authenticated users
GRANT EXECUTE ON FUNCTION get_users_with_emails() TO authenticated;
