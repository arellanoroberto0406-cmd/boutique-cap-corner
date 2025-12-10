-- Insert background_music setting if not exists
INSERT INTO public.site_settings (setting_key, setting_value, setting_type)
VALUES ('background_music', '', 'text')
ON CONFLICT (setting_key) DO NOTHING;