-- Fix product_images: Only admins can modify
DROP POLICY IF EXISTS "Anyone can insert product_images" ON public.product_images;
DROP POLICY IF EXISTS "Anyone can update product_images" ON public.product_images;
DROP POLICY IF EXISTS "Anyone can delete product_images" ON public.product_images;

CREATE POLICY "Admins can insert product_images" ON public.product_images 
FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update product_images" ON public.product_images 
FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete product_images" ON public.product_images 
FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix discount_codes: Remove public write policies
DROP POLICY IF EXISTS "Anyone can insert discount_codes" ON public.discount_codes;
DROP POLICY IF EXISTS "Anyone can update discount_codes" ON public.discount_codes;
DROP POLICY IF EXISTS "Anyone can delete discount_codes" ON public.discount_codes;
DROP POLICY IF EXISTS "Anyone can read discount_codes" ON public.discount_codes;

-- Fix brands: Only admins can modify
DROP POLICY IF EXISTS "Allow authenticated users to insert brands" ON public.brands;
DROP POLICY IF EXISTS "Allow authenticated users to update brands" ON public.brands;
DROP POLICY IF EXISTS "Allow authenticated users to delete brands" ON public.brands;

CREATE POLICY "Admins can insert brands" ON public.brands 
FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update brands" ON public.brands 
FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete brands" ON public.brands 
FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix site_settings: Only admins can modify
DROP POLICY IF EXISTS "Anyone can insert site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Anyone can update site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Anyone can delete site_settings" ON public.site_settings;

CREATE POLICY "Admins can insert site_settings" ON public.site_settings 
FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update site_settings" ON public.site_settings 
FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete site_settings" ON public.site_settings 
FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix estuches: Only admins can modify
DROP POLICY IF EXISTS "Anyone can insert estuches" ON public.estuches;
DROP POLICY IF EXISTS "Anyone can update estuches" ON public.estuches;
DROP POLICY IF EXISTS "Anyone can delete estuches" ON public.estuches;

CREATE POLICY "Admins can insert estuches" ON public.estuches 
FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update estuches" ON public.estuches 
FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete estuches" ON public.estuches 
FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix pines: Only admins can modify
DROP POLICY IF EXISTS "Anyone can insert pines" ON public.pines;
DROP POLICY IF EXISTS "Anyone can update pines" ON public.pines;
DROP POLICY IF EXISTS "Anyone can delete pines" ON public.pines;

CREATE POLICY "Admins can insert pines" ON public.pines 
FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update pines" ON public.pines 
FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete pines" ON public.pines 
FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix brand_products: Only admins can modify
DROP POLICY IF EXISTS "Anyone can insert brand_products" ON public.brand_products;
DROP POLICY IF EXISTS "Anyone can update brand_products" ON public.brand_products;
DROP POLICY IF EXISTS "Anyone can delete brand_products" ON public.brand_products;

CREATE POLICY "Admins can insert brand_products" ON public.brand_products 
FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update brand_products" ON public.brand_products 
FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete brand_products" ON public.brand_products 
FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix theme_presets: Only admins can modify
DROP POLICY IF EXISTS "Anyone can insert theme_presets" ON public.theme_presets;
DROP POLICY IF EXISTS "Anyone can update theme_presets" ON public.theme_presets;
DROP POLICY IF EXISTS "Anyone can delete theme_presets" ON public.theme_presets;

CREATE POLICY "Admins can insert theme_presets" ON public.theme_presets 
FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update theme_presets" ON public.theme_presets 
FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete theme_presets" ON public.theme_presets 
FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));