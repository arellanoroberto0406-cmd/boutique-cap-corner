-- Add tracking number column to orders table
ALTER TABLE public.orders 
ADD COLUMN tracking_number text DEFAULT NULL;