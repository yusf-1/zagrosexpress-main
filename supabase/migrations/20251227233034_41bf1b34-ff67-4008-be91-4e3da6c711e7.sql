-- Remove the overly permissive UPDATE policy on customer_passwords
DROP POLICY IF EXISTS "Anyone can update passwords for device binding" ON public.customer_passwords;

-- Admins can update passwords
CREATE POLICY "Admins can update passwords"
ON public.customer_passwords
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Also drop the duplicate view policy that was just created (we already have admin view)
DROP POLICY IF EXISTS "Anyone can view passwords for verification" ON public.customer_passwords;