-- Add indexes to improve query performance on brand_products
CREATE INDEX IF NOT EXISTS idx_brand_products_brand_id ON public.brand_products(brand_id);
CREATE INDEX IF NOT EXISTS idx_brand_products_created_at ON public.brand_products(created_at);

-- Add index on brands table
CREATE INDEX IF NOT EXISTS idx_brands_created_at ON public.brands(created_at);

-- Add index on pines table
CREATE INDEX IF NOT EXISTS idx_pines_created_at ON public.pines(created_at);