-- Recreate the policy for anonymous order creation
-- First drop if exists to avoid conflicts
DROP POLICY IF EXISTS "Anon can create orders" ON public.orders;

-- Create the policy that allows anyone to insert orders (for checkout)
CREATE POLICY "Anon can create orders" 
ON public.orders 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Also ensure order_items can be inserted
DROP POLICY IF EXISTS "Anon can create order items" ON public.order_items;

CREATE POLICY "Anon can create order items" 
ON public.order_items 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);