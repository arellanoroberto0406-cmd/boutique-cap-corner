-- First, let's drop all INSERT policies and recreate them properly
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;

-- Create policies that explicitly grant to all roles including anon
CREATE POLICY "Public insert orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public insert order items" 
ON public.order_items 
FOR INSERT 
WITH CHECK (true);

-- Grant explicit permissions to anon role
GRANT INSERT ON public.orders TO anon;
GRANT INSERT ON public.order_items TO anon;
GRANT USAGE ON SCHEMA public TO anon;