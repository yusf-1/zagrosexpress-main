-- Add parent_id to product_categories for nested groups
ALTER TABLE public.product_categories 
ADD COLUMN parent_id uuid REFERENCES public.product_categories(id) ON DELETE CASCADE;

-- Create index for faster nested queries
CREATE INDEX idx_product_categories_parent_id ON public.product_categories(parent_id);

-- Drop unused multilingual columns from wholesale_products (keep it simple)
ALTER TABLE public.wholesale_products 
DROP COLUMN IF EXISTS name_ar,
DROP COLUMN IF EXISTS name_ku,
DROP COLUMN IF EXISTS description,
DROP COLUMN IF EXISTS description_ar,
DROP COLUMN IF EXISTS description_ku;