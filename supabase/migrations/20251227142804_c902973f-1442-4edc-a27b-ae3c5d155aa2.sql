-- Add is_shared column to allow passwords that can be used by multiple people
ALTER TABLE public.customer_passwords ADD COLUMN is_shared boolean NOT NULL DEFAULT false;