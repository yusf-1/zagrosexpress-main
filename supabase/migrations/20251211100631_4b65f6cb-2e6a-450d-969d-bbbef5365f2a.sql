-- Add benefit column to orders (only visible to admin)
ALTER TABLE public.orders ADD COLUMN admin_benefit NUMERIC DEFAULT NULL;

-- Create function to auto-add benefit to finances when order is accepted
CREATE OR REPLACE FUNCTION public.add_order_benefit_to_finances()
RETURNS TRIGGER AS $$
BEGIN
  -- Only run when status changes to 'accepted' and benefit exists
  IF NEW.status = 'accepted' AND OLD.status != 'accepted' AND NEW.admin_benefit IS NOT NULL AND NEW.admin_benefit > 0 THEN
    INSERT INTO public.finances (type, amount, description, category, order_id, created_by)
    VALUES (
      'income',
      NEW.admin_benefit,
      'Benefit from Order #' || LEFT(NEW.id::text, 8),
      'Order Benefit',
      NEW.id,
      NEW.user_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger
CREATE TRIGGER order_accepted_add_benefit
AFTER UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.add_order_benefit_to_finances();