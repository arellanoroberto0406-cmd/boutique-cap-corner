-- Drop all INSERT policies on orders
DROP POLICY IF EXISTS "Allow public to create orders" ON public.orders;

-- Create INSERT policy with explicit anon role
CREATE POLICY "Anon can create orders" 
ON public.orders 
FOR INSERT 
TO anon
WITH CHECK (true);

-- Drop all INSERT policies on order_items
DROP POLICY IF EXISTS "Allow public to create order items" ON public.order_items;

-- Create INSERT policy with explicit anon role
CREATE POLICY "Anon can create order items" 
ON public.order_items 
FOR INSERT 
TO anon
WITH CHECK (true);

-- Force PostgREST to reload
NOTIFY pgrst, 'reload schema';