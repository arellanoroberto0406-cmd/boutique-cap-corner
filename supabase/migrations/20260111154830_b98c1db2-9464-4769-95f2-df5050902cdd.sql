-- Add promo_image column to brands table for brand-specific promotional images
ALTER TABLE public.brands 
ADD COLUMN IF NOT EXISTS promo_image TEXT;

-- Update all existing brands with the default promotional image
UPDATE public.brands 
SET promo_image = '/images/promo-elite-hats-2026.png'
WHERE promo_image IS NULL;