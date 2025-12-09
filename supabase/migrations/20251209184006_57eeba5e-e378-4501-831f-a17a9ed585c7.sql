-- Create site_settings table for footer configuration
CREATE TABLE public.site_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key text NOT NULL UNIQUE,
  setting_value text NOT NULL,
  setting_type text NOT NULL DEFAULT 'text',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings
CREATE POLICY "Anyone can view site settings"
ON public.site_settings
FOR SELECT
USING (true);

-- Only admins can modify settings
CREATE POLICY "Admins can insert site settings"
ON public.site_settings
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update site settings"
ON public.site_settings
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete site settings"
ON public.site_settings
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default settings
INSERT INTO public.site_settings (setting_key, setting_value, setting_type) VALUES
-- Contact info
('contact_location', 'Ciudad de México, México', 'text'),
('contact_email', 'contacto@proveedorboutiquear.com', 'text'),
('contact_phone', '+52 325 112 0730', 'text'),
('contact_whatsapp', '523251120730', 'text'),
-- Business hours
('hours_weekdays', 'Lun - Vie: 9:00 AM - 7:00 PM', 'text'),
('hours_saturday', 'Sáb: 10:00 AM - 6:00 PM', 'text'),
-- Help links (JSON format for flexibility)
('help_links', '[{"label":"Información de Envío","url":"#envios"},{"label":"Devoluciones y Cambios","url":"#devoluciones"},{"label":"Preguntas Frecuentes","url":"#preguntas"},{"label":"Términos y Condiciones","url":"#terminos"},{"label":"Política de Privacidad","url":"#privacidad"}]', 'json'),
-- Social media
('social_instagram', 'https://www.instagram.com/proveedor_de_gorras_oficial', 'text'),
('social_facebook', 'https://www.facebook.com/share/15WSXVXivP/', 'text'),
('social_tiktok', 'https://www.tiktok.com/@proveedores__09', 'text');

-- Create trigger for updated_at
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();