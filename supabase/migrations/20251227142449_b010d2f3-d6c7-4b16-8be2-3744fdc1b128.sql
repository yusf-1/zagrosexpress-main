-- Make price nullable so products can be added without a price
ALTER TABLE public.wholesale_products ALTER COLUMN price DROP NOT NULL;

-- Set default to null for new products
ALTER TABLE public.wholesale_products ALTER COLUMN price SET DEFAULT NULL;