-- Drop the existing restrictive policy for inserting orders
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

-- Create a new permissive policy that allows anyone to insert orders
CREATE POLICY "Anyone can create orders" 
ON public.orders 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Also fix the order_items policy
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;

CREATE POLICY "Anyone can create order items" 
ON public.order_items 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);