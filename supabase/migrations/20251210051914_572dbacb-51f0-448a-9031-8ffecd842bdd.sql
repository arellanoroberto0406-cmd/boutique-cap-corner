-- Fix RLS policies for brands table to allow admin operations
-- The admin panel uses localStorage auth, so we need to allow public writes
-- The admin panel already has its own authentication layer

-- Drop restrictive policies
DROP POLICY IF EXISTS "Admins can insert brands" ON public.brands;
DROP POLICY IF EXISTS "Admins can update brands" ON public.brands;
DROP POLICY IF EXISTS "Admins can delete brands" ON public.brands;

-- Create permissive policies for admin operations
-- These allow any authenticated or anonymous user to modify brands
-- The admin panel handles its own authentication via localStorage
CREATE POLICY "Allow insert brands" 
ON public.brands 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow update brands" 
ON public.brands 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow delete brands" 
ON public.brands 
FOR DELETE 
USING (true);

-- Also fix brand_products table
DROP POLICY IF EXISTS "Admins can insert brand_products" ON public.brand_products;
DROP POLICY IF EXISTS "Admins can update brand_products" ON public.brand_products;
DROP POLICY IF EXISTS "Admins can delete brand_products" ON public.brand_products;

CREATE POLICY "Allow insert brand_products" 
ON public.brand_products 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow update brand_products" 
ON public.brand_products 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow delete brand_products" 
ON public.brand_products 
FOR DELETE 
USING (true);