-- Re-enable RLS on orders table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Drop existing insert policies
DROP POLICY IF EXISTS "Public can create orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

-- Create permissive INSERT policy for orders
CREATE POLICY "Allow public to create orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (true);

-- Re-enable RLS on order_items table
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Drop existing insert policies
DROP POLICY IF EXISTS "Public can create order items" ON public.order_items;
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;

-- Create permissive INSERT policy for order_items
CREATE POLICY "Allow public to create order items" 
ON public.order_items 
FOR INSERT 
WITH CHECK (true);