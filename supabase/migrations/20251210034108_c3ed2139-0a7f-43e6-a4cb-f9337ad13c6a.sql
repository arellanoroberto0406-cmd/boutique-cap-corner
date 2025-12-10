-- Fix orders table: Remove public SELECT policy
DROP POLICY IF EXISTS "orders_select_policy" ON public.orders;

-- Fix order_items table: Remove public SELECT and add admin-only
DROP POLICY IF EXISTS "order_items_select_policy" ON public.order_items;

-- Only admins can view order items
CREATE POLICY "Admins can view order items" 
ON public.order_items 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);