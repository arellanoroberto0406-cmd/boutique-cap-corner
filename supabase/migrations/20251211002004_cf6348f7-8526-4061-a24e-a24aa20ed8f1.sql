-- Fix RLS policies for orders table - make INSERT truly permissive

-- Drop ALL existing INSERT policies on orders
DROP POLICY IF EXISTS "Allow insert orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

-- Create a truly PERMISSIVE policy for INSERT (PERMISSIVE is the default)
CREATE POLICY "Public can create orders" 
ON public.orders 
FOR INSERT 
TO public
WITH CHECK (true);

-- Also fix order_items INSERT policies
DROP POLICY IF EXISTS "Allow insert order_items" ON public.order_items;
DROP POLICY IF EXISTS "order_items_insert_policy" ON public.order_items;

CREATE POLICY "Public can create order_items" 
ON public.order_items 
FOR INSERT 
TO public
WITH CHECK (true);