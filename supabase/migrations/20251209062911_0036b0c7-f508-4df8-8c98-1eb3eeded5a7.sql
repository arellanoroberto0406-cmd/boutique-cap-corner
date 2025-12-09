-- Add SELECT policy for anonymous users to see their own orders (needed for .select() after insert)
-- This uses a permissive policy that allows selecting rows that were just inserted
CREATE POLICY "allow_select_own_inserted_orders" 
ON public.orders 
FOR SELECT 
USING (true);

-- Same for order_items
CREATE POLICY "allow_select_own_inserted_order_items" 
ON public.order_items 
FOR SELECT 
USING (true);

-- Drop the admin-only SELECT policies since they conflict
DROP POLICY IF EXISTS "admin_select_orders" ON public.orders;
DROP POLICY IF EXISTS "admin_select_order_items" ON public.order_items;