-- Enable REPLICA IDENTITY FULL for orders to capture old values in realtime updates
ALTER TABLE public.orders REPLICA IDENTITY FULL;