-- Temporarily disable RLS, drop all policies, then re-enable with correct policies
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on orders
DROP POLICY IF EXISTS "Public insert orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;

-- Drop all existing policies on order_items  
DROP POLICY IF EXISTS "Public insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can view order items" ON public.order_items;

-- Re-enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Create INSERT policy for orders - using default role (no TO clause means all roles)
CREATE POLICY "allow_insert_orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (true);

-- Create SELECT policy for orders (admin only)
CREATE POLICY "admin_select_orders" 
ON public.orders 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create UPDATE policy for orders (admin only)
CREATE POLICY "admin_update_orders" 
ON public.orders 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create INSERT policy for order_items
CREATE POLICY "allow_insert_order_items" 
ON public.order_items 
FOR INSERT 
WITH CHECK (true);

-- Create SELECT policy for order_items (admin only)
CREATE POLICY "admin_select_order_items" 
ON public.order_items 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));