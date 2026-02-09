-- Add RMB exchange rate to allowed public settings
CREATE OR REPLACE FUNCTION public.get_public_setting(_key text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _value TEXT;
BEGIN
  -- Only allow specific keys to be read publicly
  IF _key NOT IN ('cbm_price', 'air_price_per_kg', 'exchange_rate', 'rmb_exchange_rate') THEN
    RETURN NULL;
  END IF;
  
  SELECT value INTO _value FROM settings WHERE key = _key;
  RETURN _value;
END;
$function$;

-- Insert default RMB exchange rate if not exists
INSERT INTO settings (key, value) 
VALUES ('rmb_exchange_rate', '7')
ON CONFLICT (key) DO NOTHING;