-- Fix RLS policies for orders - must target anon role specifically

-- Drop existing insert policy
DROP POLICY IF EXISTS "Public can create orders" ON public.orders;

-- Create policy that explicitly allows anon and authenticated roles
CREATE POLICY "Anyone can create orders" 
ON public.orders 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Fix order_items as well
DROP POLICY IF EXISTS "Public can create order_items" ON public.order_items;

CREATE POLICY "Anyone can create order_items" 
ON public.order_items 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);