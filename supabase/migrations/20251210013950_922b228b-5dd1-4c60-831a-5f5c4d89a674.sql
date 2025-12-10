-- Agregar columna de tallas a brand_products
ALTER TABLE public.brand_products
ADD COLUMN sizes text[] NULL DEFAULT '{}'::text[];