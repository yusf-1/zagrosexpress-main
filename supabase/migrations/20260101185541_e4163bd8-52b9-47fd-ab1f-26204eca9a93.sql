-- Add whatsapp_number column to special_requests table
ALTER TABLE public.special_requests 
ADD COLUMN whatsapp_number text;

-- Make product_name nullable since we're replacing it with whatsapp_number
ALTER TABLE public.special_requests 
ALTER COLUMN product_name DROP NOT NULL;