import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface HelpLink {
  label: string;
  url: string;
}

export interface SiteSettings {
  company_name: string;
  about_us: string;
  contact_location: string;
  contact_email: string;
  contact_phone: string;
  contact_whatsapp: string;
  hours_weekdays: string;
  hours_saturday: string;
  help_links: HelpLink[];
  social_instagram: string;
  social_facebook: string;
  social_tiktok: string;
  terms_conditions: string;
  privacy_policy: string;
  cookies_policy: string;
}

const defaultSettings: SiteSettings = {
  company_name: 'Proveedor Boutique AR',
  about_us: 'Distribuidores oficiales de las mejores marcas de gorras. Calidad premium, diseños únicos y servicio excepcional.',
  contact_location: 'Ciudad de México, México',
  contact_email: 'contacto@proveedorboutiquear.com',
  contact_phone: '+52 325 112 0730',
  contact_whatsapp: '523251120730',
  hours_weekdays: 'Lun - Vie: 9:00 AM - 7:00 PM',
  hours_saturday: 'Sáb: 10:00 AM - 6:00 PM',
  help_links: [],
  social_instagram: '',
  social_facebook: '',
  social_tiktok: '',
  terms_conditions: 'Aquí van los términos y condiciones de tu tienda.',
  privacy_policy: 'Aquí va la política de privacidad de tu tienda.',
  cookies_policy: 'Aquí va la política de cookies de tu tienda.',
};

export const useSiteSettings = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');

      if (error) throw error;

      const settingsMap: SiteSettings = { ...defaultSettings };

      data?.forEach((row: { setting_key: string; setting_value: string; setting_type: string }) => {
        const key = row.setting_key as keyof SiteSettings;
        if (row.setting_type === 'json') {
          try {
            settingsMap[key] = JSON.parse(row.setting_value) as any;
          } catch {
            settingsMap[key] = row.setting_value as any;
          }
        } else {
          settingsMap[key] = row.setting_value as any;
        }
      });

      return settingsMap;
    },
  });

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase
        .from('site_settings')
        .update({ setting_value: value })
        .eq('setting_key', key);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
    },
  });

  const updateSetting = (key: string, value: string) => {
    updateSettingMutation.mutate({ key, value });
  };

  const updateHelpLinks = (links: HelpLink[]) => {
    updateSettingMutation.mutate({ key: 'help_links', value: JSON.stringify(links) });
  };

  return {
    settings: settings || defaultSettings,
    isLoading,
    updateSetting,
    updateHelpLinks,
    isUpdating: updateSettingMutation.isPending,
  };
};
