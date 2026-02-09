-- Add product_price column to orders table
ALTER TABLE public.orders ADD COLUMN product_price numeric NULL;