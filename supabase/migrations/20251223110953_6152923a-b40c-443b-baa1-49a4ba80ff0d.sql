-- Create table for customer-specific passwords with device binding
CREATE TABLE public.customer_passwords (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  password TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  device_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customer_passwords ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view passwords (for verification purposes)
CREATE POLICY "Anyone can view passwords for verification"
ON public.customer_passwords
FOR SELECT
USING (true);

-- Anyone can update passwords (for device binding on first use)
CREATE POLICY "Anyone can update passwords for device binding"
ON public.customer_passwords
FOR UPDATE
USING (true);

-- Only admins can insert passwords
CREATE POLICY "Admins can insert passwords"
ON public.customer_passwords
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Only admins can delete passwords
CREATE POLICY "Admins can delete passwords"
ON public.customer_passwords
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_customer_passwords_updated_at
BEFORE UPDATE ON public.customer_passwords
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();