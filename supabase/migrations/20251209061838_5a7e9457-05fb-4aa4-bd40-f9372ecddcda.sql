-- Drop and recreate with public role to allow all users
DROP POLICY IF EXISTS "Anon can create orders" ON public.orders;

CREATE POLICY "Anyone can create orders" 
ON public.orders 
FOR INSERT 
TO public
WITH CHECK (true);

-- Same for order_items
DROP POLICY IF EXISTS "Anon can create order items" ON public.order_items;

CREATE POLICY "Anyone can create order items" 
ON public.order_items 
FOR INSERT 
TO public
WITH CHECK (true);