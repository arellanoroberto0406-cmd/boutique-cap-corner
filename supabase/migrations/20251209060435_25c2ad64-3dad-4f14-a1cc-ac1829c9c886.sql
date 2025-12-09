-- Fix profiles table: Ensure only users can see their own profile
-- First check existing policies and update if needed
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Fix orders table: Ensure proper access control
-- The current policy should only allow admins to view
DROP POLICY IF EXISTS "Anyone can view orders" ON public.orders;
DROP POLICY IF EXISTS "Public can view orders" ON public.orders;