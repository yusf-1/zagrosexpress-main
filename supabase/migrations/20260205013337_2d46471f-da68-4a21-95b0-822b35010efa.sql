-- Add payment tracking columns to orders table
ALTER TABLE public.orders 
ADD COLUMN amount_paid numeric DEFAULT 0,
ADD COLUMN payment_notes text;