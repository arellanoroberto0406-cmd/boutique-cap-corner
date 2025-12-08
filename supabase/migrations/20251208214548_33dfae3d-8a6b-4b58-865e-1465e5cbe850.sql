-- Drop all existing INSERT policies on orders
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

-- Create a simpler permissive policy for public access
CREATE POLICY "Public can create orders" 
ON public.orders 
FOR INSERT 
TO public
WITH CHECK (true);

-- Same for order_items
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;

CREATE POLICY "Public can create order items" 
ON public.order_items 
FOR INSERT 
TO public
WITH CHECK (true);

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';