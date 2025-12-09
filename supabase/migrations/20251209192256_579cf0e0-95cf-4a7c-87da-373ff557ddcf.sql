-- Create table for custom theme presets
CREATE TABLE public.theme_presets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  theme_primary TEXT NOT NULL,
  theme_secondary TEXT NOT NULL,
  theme_accent TEXT NOT NULL,
  theme_background TEXT NOT NULL,
  theme_foreground TEXT NOT NULL,
  theme_card TEXT NOT NULL,
  theme_muted TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.theme_presets ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view theme presets
CREATE POLICY "Anyone can view theme presets" 
ON public.theme_presets 
FOR SELECT 
USING (true);

-- Only admins can insert
CREATE POLICY "Admins can insert theme presets" 
ON public.theme_presets 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update
CREATE POLICY "Admins can update theme presets" 
ON public.theme_presets 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete
CREATE POLICY "Admins can delete theme presets" 
ON public.theme_presets 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default theme presets
INSERT INTO public.theme_presets (name, theme_primary, theme_secondary, theme_accent, theme_background, theme_foreground, theme_card, theme_muted, is_default) VALUES
('Naranja (Por defecto)', '12 90% 55%', '0 0% 15%', '12 90% 55%', '0 0% 7%', '0 0% 98%', '0 0% 10%', '0 0% 20%', true),
('Azul Océano', '221 83% 53%', '221 40% 20%', '221 83% 53%', '222 47% 11%', '210 40% 98%', '222 47% 14%', '217 33% 25%', false),
('Verde Esmeralda', '142 70% 45%', '142 30% 20%', '142 70% 45%', '150 30% 8%', '150 20% 98%', '150 30% 12%', '150 20% 22%', false),
('Morado Royal', '270 70% 55%', '270 30% 20%', '270 70% 55%', '270 30% 8%', '270 20% 98%', '270 30% 12%', '270 20% 22%', false),
('Rojo Pasión', '0 84% 60%', '0 40% 20%', '0 84% 60%', '0 30% 8%', '0 20% 98%', '0 30% 12%', '0 20% 22%', false),
('Dorado Elegante', '45 100% 51%', '45 40% 20%', '45 100% 51%', '40 30% 8%', '40 20% 98%', '40 30% 12%', '40 20% 22%', false);