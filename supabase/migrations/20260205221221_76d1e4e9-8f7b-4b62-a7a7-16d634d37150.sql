-- 1. FIX CRITICAL: Secure the otp_verifications table
-- OTP verification should only happen through edge functions (service role)
-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Anyone can request OTP" ON public.otp_verifications;
DROP POLICY IF EXISTS "Anyone can verify OTP by phone" ON public.otp_verifications;
DROP POLICY IF EXISTS "Anyone can update OTP verification" ON public.otp_verifications;

-- Create restrictive policies - only service role (edge functions) can access
-- No direct client access allowed
CREATE POLICY "Service role only - insert" 
ON public.otp_verifications 
FOR INSERT 
TO service_role
WITH CHECK (true);

CREATE POLICY "Service role only - select" 
ON public.otp_verifications 
FOR SELECT 
TO service_role
USING (true);

CREATE POLICY "Service role only - update" 
ON public.otp_verifications 
FOR UPDATE 
TO service_role
USING (true);

CREATE POLICY "Service role only - delete" 
ON public.otp_verifications 
FOR DELETE 
TO service_role
USING (true);

-- 2. FIX: Make request-attachments bucket private
UPDATE storage.buckets SET public = false WHERE id = 'request-attachments';

-- Drop the public access policy
DROP POLICY IF EXISTS "Anyone can view attachments" ON storage.objects;

-- Create proper policies for authenticated access only
CREATE POLICY "Users can view own attachments" 
ON storage.objects 
FOR SELECT 
TO authenticated
USING (
  bucket_id = 'request-attachments' AND 
  (auth.uid()::text = (storage.foldername(name))[1] OR has_role(auth.uid(), 'admin'::app_role))
);

-- 3. FIX: Update the finance function to use correct user ID for audit trail
CREATE OR REPLACE FUNCTION public.add_order_benefit_to_finances()
RETURNS TRIGGER AS $$
BEGIN
  -- Only run when status changes to 'accepted' and benefit exists
  IF NEW.status = 'accepted' AND OLD.status != 'accepted' AND NEW.admin_benefit IS NOT NULL AND NEW.admin_benefit > 0 THEN
    -- Verify the update is being made by an admin
    IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
      RAISE EXCEPTION 'Only admins can accept orders';
    END IF;
    
    INSERT INTO public.finances (type, amount, description, category, order_id, created_by)
    VALUES (
      'income',
      NEW.admin_benefit,
      'Benefit from Order #' || LEFT(NEW.id::text, 8),
      'Order Benefit',
      NEW.id,
      auth.uid()  -- Use the admin who accepted the order, not the customer
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;