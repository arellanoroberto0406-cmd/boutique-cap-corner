-- Enable RLS on orders table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Enable RLS on order_items table  
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Verify the existing policies are working correctly
-- The policies already exist, we just needed to enable RLS