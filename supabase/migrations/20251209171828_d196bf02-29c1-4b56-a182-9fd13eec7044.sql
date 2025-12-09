-- Create brands table to store brands in database instead of localStorage
CREATE TABLE public.brands (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  logo_url text NOT NULL,
  path text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create brand_products table to store products for each brand
CREATE TABLE public.brand_products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  name text NOT NULL,
  price numeric NOT NULL,
  sale_price numeric,
  image_url text NOT NULL,
  images text[] DEFAULT '{}',
  description text,
  free_shipping boolean DEFAULT false,
  shipping_cost numeric DEFAULT 0,
  has_full_set boolean DEFAULT false,
  only_cap boolean DEFAULT true,
  only_cap_price numeric,
  stock integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_products ENABLE ROW LEVEL SECURITY;

-- Public can view brands
CREATE POLICY "Anyone can view brands" 
ON public.brands 
FOR SELECT 
USING (true);

-- Only admins can manage brands
CREATE POLICY "Admins can insert brands" 
ON public.brands 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update brands" 
ON public.brands 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete brands" 
ON public.brands 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Public can view brand products
CREATE POLICY "Anyone can view brand products" 
ON public.brand_products 
FOR SELECT 
USING (true);

-- Only admins can manage brand products
CREATE POLICY "Admins can insert brand products" 
ON public.brand_products 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update brand products" 
ON public.brand_products 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete brand products" 
ON public.brand_products 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket for brand logos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('brand-logos', 'brand-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for brand logos
CREATE POLICY "Brand logos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'brand-logos');

CREATE POLICY "Admins can upload brand logos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'brand-logos');

CREATE POLICY "Admins can update brand logos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'brand-logos');

CREATE POLICY "Admins can delete brand logos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'brand-logos');

-- Trigger for updated_at
CREATE TRIGGER update_brands_updated_at
BEFORE UPDATE ON public.brands
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_brand_products_updated_at
BEFORE UPDATE ON public.brand_products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();