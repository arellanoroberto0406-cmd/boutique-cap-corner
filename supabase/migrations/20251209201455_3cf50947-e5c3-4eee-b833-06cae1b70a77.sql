-- Enable realtime for brands table
ALTER PUBLICATION supabase_realtime ADD TABLE public.brands;

-- Enable realtime for brand_products table
ALTER PUBLICATION supabase_realtime ADD TABLE public.brand_products;

-- Enable realtime for estuches table
ALTER PUBLICATION supabase_realtime ADD TABLE public.estuches;