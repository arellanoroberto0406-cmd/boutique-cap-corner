-- Fix RLS policies for brands table
DROP POLICY IF EXISTS "Admins can insert brands" ON public.brands;
DROP POLICY IF EXISTS "Admins can update brands" ON public.brands;
DROP POLICY IF EXISTS "Admins can delete brands" ON public.brands;

CREATE POLICY "Authenticated users can insert brands"
ON public.brands FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update brands"
ON public.brands FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete brands"
ON public.brands FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Fix RLS policies for brand_products table
DROP POLICY IF EXISTS "Admins can insert brand products" ON public.brand_products;
DROP POLICY IF EXISTS "Admins can update brand products" ON public.brand_products;
DROP POLICY IF EXISTS "Admins can delete brand products" ON public.brand_products;

CREATE POLICY "Authenticated users can insert brand_products"
ON public.brand_products FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update brand_products"
ON public.brand_products FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete brand_products"
ON public.brand_products FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Fix RLS policies for estuches table
DROP POLICY IF EXISTS "Admins can insert estuches" ON public.estuches;
DROP POLICY IF EXISTS "Admins can update estuches" ON public.estuches;
DROP POLICY IF EXISTS "Admins can delete estuches" ON public.estuches;

CREATE POLICY "Authenticated users can insert estuches"
ON public.estuches FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update estuches"
ON public.estuches FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete estuches"
ON public.estuches FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Fix RLS policies for products table
DROP POLICY IF EXISTS "Only admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Only admins can update products" ON public.products;
DROP POLICY IF EXISTS "Only admins can delete products" ON public.products;

CREATE POLICY "Authenticated users can insert products"
ON public.products FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update products"
ON public.products FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete products"
ON public.products FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Fix RLS policies for product_images table
DROP POLICY IF EXISTS "Only admins can insert product images" ON public.product_images;
DROP POLICY IF EXISTS "Only admins can update product images" ON public.product_images;
DROP POLICY IF EXISTS "Only admins can delete product images" ON public.product_images;

CREATE POLICY "Authenticated users can insert product_images"
ON public.product_images FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update product_images"
ON public.product_images FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete product_images"
ON public.product_images FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Fix RLS policies for site_settings table
DROP POLICY IF EXISTS "Admins can insert site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can update site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can delete site settings" ON public.site_settings;

CREATE POLICY "Authenticated users can insert site_settings"
ON public.site_settings FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update site_settings"
ON public.site_settings FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete site_settings"
ON public.site_settings FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Fix RLS policies for theme_presets table
DROP POLICY IF EXISTS "Admins can insert theme presets" ON public.theme_presets;
DROP POLICY IF EXISTS "Admins can update theme presets" ON public.theme_presets;
DROP POLICY IF EXISTS "Admins can delete theme presets" ON public.theme_presets;

CREATE POLICY "Authenticated users can insert theme_presets"
ON public.theme_presets FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update theme_presets"
ON public.theme_presets FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete theme_presets"
ON public.theme_presets FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Fix RLS policies for discount_codes table
DROP POLICY IF EXISTS "Admins can insert discount codes" ON public.discount_codes;
DROP POLICY IF EXISTS "Admins can update discount codes" ON public.discount_codes;
DROP POLICY IF EXISTS "Admins can delete discount codes" ON public.discount_codes;
DROP POLICY IF EXISTS "Admins can read all discount codes" ON public.discount_codes;

CREATE POLICY "Authenticated users can read discount_codes"
ON public.discount_codes FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert discount_codes"
ON public.discount_codes FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update discount_codes"
ON public.discount_codes FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete discount_codes"
ON public.discount_codes FOR DELETE
USING (auth.uid() IS NOT NULL);