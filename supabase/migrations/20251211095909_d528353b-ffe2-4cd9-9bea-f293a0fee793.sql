-- Create finances table for tracking income and costs
CREATE TABLE public.finances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('income', 'cost')),
  amount NUMERIC NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  order_id UUID REFERENCES public.orders(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL
);

-- Enable RLS
ALTER TABLE public.finances ENABLE ROW LEVEL SECURITY;

-- Only admins can access finances
CREATE POLICY "Admins can view finances"
ON public.finances FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert finances"
ON public.finances FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update finances"
ON public.finances FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete finances"
ON public.finances FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));