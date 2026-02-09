-- Update the get_public_setting function to include exchange_rate
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
  IF _key NOT IN ('cbm_price', 'air_price_per_kg', 'exchange_rate') THEN
    RETURN NULL;
  END IF;
  
  SELECT value INTO _value FROM settings WHERE key = _key;
  RETURN _value;
END;
$function$;