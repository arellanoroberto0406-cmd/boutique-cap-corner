-- Create a table for estuches (cases)
CREATE TABLE public.estuches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  sale_price NUMERIC,
  free_shipping BOOLEAN DEFAULT false,
  shipping_cost NUMERIC DEFAULT 0,
  image_url TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.estuches ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view estuches" 
ON public.estuches 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert estuches" 
ON public.estuches 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update estuches" 
ON public.estuches 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete estuches" 
ON public.estuches 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));