-- Create pines table
CREATE TABLE public.pines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  sale_price NUMERIC,
  image_url TEXT NOT NULL,
  stock INTEGER DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pines ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view pines" 
ON public.pines 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert pines" 
ON public.pines 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update pines" 
ON public.pines 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete pines" 
ON public.pines 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_pines_updated_at
BEFORE UPDATE ON public.pines
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();