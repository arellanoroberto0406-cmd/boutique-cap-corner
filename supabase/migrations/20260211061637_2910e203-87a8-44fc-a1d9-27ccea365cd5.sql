
-- Add auto-incrementing order number
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START WITH 1001;

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_number INTEGER UNIQUE DEFAULT nextval('public.order_number_seq');

-- Update existing orders that don't have an order number
UPDATE public.orders SET order_number = nextval('public.order_number_seq') WHERE order_number IS NULL;
