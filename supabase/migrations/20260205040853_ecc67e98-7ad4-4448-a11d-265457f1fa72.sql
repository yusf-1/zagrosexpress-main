-- Create shops table
CREATE TABLE public.shops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.product_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_ar TEXT,
  name_ku TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on shops
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;

-- RLS policies for shops
CREATE POLICY "Admins can manage shops"
ON public.shops
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated wholesale users can view shops"
ON public.shops
FOR SELECT
USING (validate_wholesale_session(COALESCE((current_setting('request.headers'::text, true)::json->>'x-wholesale-session'), '')));

-- Add shop_id to wholesale_products (nullable initially for migration)
ALTER TABLE public.wholesale_products ADD COLUMN shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX idx_shops_category_id ON public.shops(category_id);
CREATE INDEX idx_wholesale_products_shop_id ON public.wholesale_products(shop_id);

-- Add trigger for updated_at on shops
CREATE TRIGGER update_shops_updated_at
BEFORE UPDATE ON public.shops
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();