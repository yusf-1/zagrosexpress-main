-- Add transfer_fee column for money sending cost (only charged when product_price > 30)
ALTER TABLE public.orders 
ADD COLUMN transfer_fee numeric DEFAULT NULL;