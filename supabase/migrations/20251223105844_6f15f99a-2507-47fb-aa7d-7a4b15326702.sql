-- Create table for external link categories (products without price)
CREATE TABLE public.external_link_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT,
  name_ku TEXT,
  image_url TEXT,
  external_link TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.external_link_categories ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view external link categories (they are public after password auth)
CREATE POLICY "Anyone can view external link categories"
ON public.external_link_categories
FOR SELECT
USING (true);

-- Only admins can manage external link categories
CREATE POLICY "Admins can insert external link categories"
ON public.external_link_categories
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

CREATE POLICY "Admins can update external link categories"
ON public.external_link_categories
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

CREATE POLICY "Admins can delete external link categories"
ON public.external_link_categories
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_external_link_categories_updated_at
BEFORE UPDATE ON public.external_link_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();