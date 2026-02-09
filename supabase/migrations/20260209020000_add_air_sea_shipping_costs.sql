-- Add separate air/sea shipping costs for both-shipping quotes
alter table public.orders
  add column if not exists shipping_cost_air numeric,
  add column if not exists shipping_cost_sea numeric;
