-- Enable realtime for orders table
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- Enable replica identity for proper update tracking
ALTER TABLE public.orders REPLICA IDENTITY FULL;