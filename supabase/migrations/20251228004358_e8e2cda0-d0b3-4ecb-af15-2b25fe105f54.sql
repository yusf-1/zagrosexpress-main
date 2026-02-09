CREATE OR REPLACE FUNCTION public.create_wholesale_session(_password text, _device_id text)
 RETURNS TABLE(success boolean, session_token text, customer_name text, error_message text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, extensions
AS $function$
DECLARE
  verification RECORD;
  new_token TEXT;
BEGIN
  -- Verify password first
  SELECT * INTO verification 
  FROM verify_wholesale_password(_password, _device_id);
  
  IF NOT verification.access_granted THEN
    RETURN QUERY SELECT false, NULL::TEXT, NULL::TEXT, 'Invalid password or device'::TEXT;
    RETURN;
  END IF;
  
  -- Bind device if needed
  IF verification.needs_binding THEN
    PERFORM bind_device_to_password(verification.password_id, _device_id);
  END IF;
  
  -- Generate session token
  new_token := encode(extensions.gen_random_bytes(32), 'hex');
  
  -- Create session (expires in 24 hours)
  INSERT INTO wholesale_sessions (session_token, device_id, password_id, customer_name, expires_at)
  VALUES (new_token, _device_id, verification.password_id, verification.customer_name, NOW() + INTERVAL '24 hours');
  
  RETURN QUERY SELECT true, new_token, verification.customer_name, NULL::TEXT;
END;
$function$;