-- ============================================
-- FIX 1: Secure customer_passwords table
-- ============================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view passwords for verification" ON public.customer_passwords;

-- Create secure password verification function (no table exposure)
CREATE OR REPLACE FUNCTION public.verify_wholesale_password(
  _password TEXT,
  _device_id TEXT
)
RETURNS TABLE(
  access_granted BOOLEAN,
  is_shared BOOLEAN,
  needs_binding BOOLEAN,
  password_id UUID,
  customer_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pwd_record RECORD;
BEGIN
  SELECT * INTO pwd_record
  FROM customer_passwords
  WHERE password = _password
    AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, false, false, NULL::UUID, NULL::TEXT;
    RETURN;
  END IF;
  
  -- Shared password - always grant access
  IF pwd_record.is_shared THEN
    -- Update used_at timestamp
    UPDATE customer_passwords SET used_at = NOW() WHERE id = pwd_record.id;
    RETURN QUERY SELECT true, true, false, pwd_record.id, pwd_record.customer_name;
    RETURN;
  END IF;
  
  -- First use - needs binding
  IF pwd_record.device_id IS NULL THEN
    RETURN QUERY SELECT true, false, true, pwd_record.id, pwd_record.customer_name;
    RETURN;
  END IF;
  
  -- Check device match
  IF pwd_record.device_id = _device_id THEN
    UPDATE customer_passwords SET used_at = NOW() WHERE id = pwd_record.id;
    RETURN QUERY SELECT true, false, false, pwd_record.id, pwd_record.customer_name;
  ELSE
    RETURN QUERY SELECT false, false, false, NULL::UUID, NULL::TEXT;
  END IF;
END;
$$;

-- Function to bind device to password
CREATE OR REPLACE FUNCTION public.bind_device_to_password(
  _password_id UUID,
  _device_id TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE customer_passwords 
  SET device_id = _device_id, used_at = NOW()
  WHERE id = _password_id 
    AND device_id IS NULL 
    AND is_active = true;
  
  RETURN FOUND;
END;
$$;

-- Only admins can view passwords directly
CREATE POLICY "Admins can view passwords"
ON public.customer_passwords
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- FIX 2: Secure settings table
-- ============================================

-- Drop existing permissive policy
DROP POLICY IF EXISTS "Settings are publicly readable" ON public.settings;
DROP POLICY IF EXISTS "Anyone can view settings" ON public.settings;

-- Create function to get specific public settings (like cbm_price)
CREATE OR REPLACE FUNCTION public.get_public_setting(_key TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _value TEXT;
BEGIN
  -- Only allow specific keys to be read publicly
  IF _key NOT IN ('cbm_price', 'air_price_per_kg') THEN
    RETURN NULL;
  END IF;
  
  SELECT value INTO _value FROM settings WHERE key = _key;
  RETURN _value;
END;
$$;

-- Only admins can view settings table directly
CREATE POLICY "Admins can view settings"
ON public.settings
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- FIX 3: Create wholesale sessions table
-- ============================================

CREATE TABLE IF NOT EXISTS public.wholesale_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token TEXT UNIQUE NOT NULL,
  device_id TEXT NOT NULL,
  password_id UUID REFERENCES customer_passwords(id) ON DELETE CASCADE,
  customer_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

ALTER TABLE public.wholesale_sessions ENABLE ROW LEVEL SECURITY;

-- Sessions can be read by token (for validation)
CREATE POLICY "Sessions can be validated by token"
ON public.wholesale_sessions
FOR SELECT
USING (session_token = current_setting('request.headers', true)::json->>'x-wholesale-session' 
       OR has_role(auth.uid(), 'admin'::app_role));

-- Function to create a wholesale session
CREATE OR REPLACE FUNCTION public.create_wholesale_session(
  _password TEXT,
  _device_id TEXT
)
RETURNS TABLE(
  success BOOLEAN,
  session_token TEXT,
  customer_name TEXT,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  new_token := encode(gen_random_bytes(32), 'hex');
  
  -- Create session (expires in 24 hours)
  INSERT INTO wholesale_sessions (session_token, device_id, password_id, customer_name, expires_at)
  VALUES (new_token, _device_id, verification.password_id, verification.customer_name, NOW() + INTERVAL '24 hours');
  
  RETURN QUERY SELECT true, new_token, verification.customer_name, NULL::TEXT;
END;
$$;

-- Function to validate session
CREATE OR REPLACE FUNCTION public.validate_wholesale_session(_session_token TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM wholesale_sessions
    WHERE session_token = _session_token
      AND expires_at > NOW()
  )
$$;

-- ============================================
-- FIX 4: Secure wholesale tables with session check
-- ============================================

-- Drop overly permissive policies
DROP POLICY IF EXISTS "Anyone can view products" ON public.wholesale_products;
DROP POLICY IF EXISTS "Anyone can view product categories" ON public.product_categories;
DROP POLICY IF EXISTS "Anyone can view external link categories" ON public.external_link_categories;

-- Create secure policies for wholesale_products
CREATE POLICY "Admins can manage products"
ON public.wholesale_products
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated wholesale users can view products"
ON public.wholesale_products
FOR SELECT
USING (
  validate_wholesale_session(
    COALESCE(
      current_setting('request.headers', true)::json->>'x-wholesale-session',
      ''
    )
  )
);

-- Create secure policies for product_categories
CREATE POLICY "Admins can manage categories"
ON public.product_categories
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated wholesale users can view categories"
ON public.product_categories
FOR SELECT
USING (
  validate_wholesale_session(
    COALESCE(
      current_setting('request.headers', true)::json->>'x-wholesale-session',
      ''
    )
  )
);

-- Create secure policies for external_link_categories  
CREATE POLICY "Admins can manage external links"
ON public.external_link_categories
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated wholesale users can view external links"
ON public.external_link_categories
FOR SELECT
USING (
  validate_wholesale_session(
    COALESCE(
      current_setting('request.headers', true)::json->>'x-wholesale-session',
      ''
    )
  )
);

-- Create secure policies for product_images
DROP POLICY IF EXISTS "Anyone can view product images" ON public.product_images;

CREATE POLICY "Admins can manage product images"
ON public.product_images
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated wholesale users can view product images"
ON public.product_images
FOR SELECT
USING (
  validate_wholesale_session(
    COALESCE(
      current_setting('request.headers', true)::json->>'x-wholesale-session',
      ''
    )
  )
);

-- Cleanup old sessions periodically (optional trigger)
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM wholesale_sessions WHERE expires_at < NOW();
$$;