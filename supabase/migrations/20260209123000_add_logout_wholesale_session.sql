-- Function to logout and unbind device from password
CREATE OR REPLACE FUNCTION public.logout_wholesale_session(_session_token TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  session_record RECORD;
BEGIN
  SELECT * INTO session_record
  FROM wholesale_sessions
  WHERE session_token = _session_token
    AND expires_at > NOW();

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  UPDATE customer_passwords
  SET device_id = NULL,
      used_at = NULL
  WHERE id = session_record.password_id
    AND is_shared = false;

  DELETE FROM wholesale_sessions
  WHERE session_token = _session_token;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.logout_wholesale_session(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.logout_wholesale_session(TEXT) TO anon;
