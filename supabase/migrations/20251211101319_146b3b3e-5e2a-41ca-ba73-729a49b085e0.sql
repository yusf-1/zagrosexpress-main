-- Create special_requests table
CREATE TABLE public.special_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_name TEXT NOT NULL,
  details TEXT NOT NULL,
  attachment_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'completed')),
  admin_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.special_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "Users can view own requests"
ON public.special_requests FOR SELECT
USING (auth.uid() = user_id);

-- Users can create requests
CREATE POLICY "Users can create requests"
ON public.special_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all requests
CREATE POLICY "Admins can view all requests"
ON public.special_requests FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update requests
CREATE POLICY "Admins can update requests"
ON public.special_requests FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket for attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('request-attachments', 'request-attachments', true);

-- Storage policies
CREATE POLICY "Users can upload attachments"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'request-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'request-attachments');

-- Trigger for updated_at
CREATE TRIGGER update_special_requests_updated_at
BEFORE UPDATE ON public.special_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();