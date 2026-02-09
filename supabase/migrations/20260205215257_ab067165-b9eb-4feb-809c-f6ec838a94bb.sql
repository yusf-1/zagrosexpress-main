-- Create OTP verification table
CREATE TABLE public.otp_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_otp_verifications_phone ON public.otp_verifications(phone_number);
CREATE INDEX idx_otp_verifications_expires ON public.otp_verifications(expires_at);

-- Enable RLS
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert (for sign-up flow before authentication)
CREATE POLICY "Anyone can request OTP" 
ON public.otp_verifications 
FOR INSERT 
WITH CHECK (true);

-- Allow anonymous users to select their own OTP by phone number
CREATE POLICY "Anyone can verify OTP by phone" 
ON public.otp_verifications 
FOR SELECT 
USING (true);

-- Allow updates for verification attempts
CREATE POLICY "Anyone can update OTP verification" 
ON public.otp_verifications 
FOR UPDATE 
USING (true);

-- Function to clean up expired OTPs
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM otp_verifications WHERE expires_at < NOW();
$$;