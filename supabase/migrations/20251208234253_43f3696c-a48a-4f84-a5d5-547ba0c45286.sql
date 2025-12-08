-- Create order status history table
CREATE TABLE public.order_status_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status_type text NOT NULL, -- 'payment' or 'order'
  old_status text,
  new_status text NOT NULL,
  changed_by text DEFAULT 'admin',
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- RLS policies - only admins can view and insert
CREATE POLICY "Admins can view order history" 
ON public.order_status_history 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert order history" 
ON public.order_status_history 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Also allow anon inserts for when order is created
CREATE POLICY "System can insert order history" 
ON public.order_status_history 
FOR INSERT 
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_order_status_history_order_id ON public.order_status_history(order_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_status_history;