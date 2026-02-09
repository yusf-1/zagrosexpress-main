-- Make user 07512357541 an admin
-- Run this in your Supabase SQL Editor or using the Supabase CLI

-- First, find the user_id for the phone number 07512357541
-- The email format is: 07512357541@phone.zagross.app

DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get the user ID from auth.users table
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = '07512357541@phone.zagross.app';

  -- If user exists, add admin role
  IF v_user_id IS NOT NULL THEN
    -- Delete existing role if any to avoid conflicts
    DELETE FROM public.user_roles
    WHERE user_id = v_user_id AND role = 'admin';
    
    -- Insert admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'admin');
    
    RAISE NOTICE 'User % is now an admin', v_user_id;
  ELSE
    RAISE NOTICE 'User with email 07512357541@phone.zagross.app not found. Please sign up first.';
  END IF;
END $$;
