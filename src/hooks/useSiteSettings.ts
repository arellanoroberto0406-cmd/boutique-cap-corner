import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface HelpLink {
  label: string;
  url: string;
}

export interface SiteSettings {
  company_name: string;
  company_logo: string;
  background_music: string;
  startup_sound: string;
  hero_video: string;
  promo_video: string;
  about_us: string;
  contact_location: string;
  contact_email: string;
  contact_phone: string;
  contact_phone_2: string;
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
  theme_primary: string;
  theme_secondary: string;
  theme_accent: string;
  theme_background: string;
  theme_foreground: string;
  theme_card: string;
  theme_muted: string;
  map_address: string;
  map_embed_url: string;
}

const defaultSettings: SiteSettings = {
  company_name: 'Proveedor Boutique AR',
  company_logo: '',
  background_music: '',
  startup_sound: '',
  hero_video: '',
  promo_video: '',
  about_us: 'Distribuidores oficiales de las mejores marcas de gorras. Calidad premium, diseños únicos y servicio excepcional.',
  contact_location: 'Ciudad de México, México',
  contact_email: 'contacto@proveedorboutiquear.com',
  contact_phone: '+52 325 112 0730',
  contact_phone_2: '',
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
  theme_primary: '12 90% 55%',
  theme_secondary: '0 0% 15%',
  theme_accent: '12 90% 55%',
  theme_background: '0 0% 7%',
  theme_foreground: '0 0% 98%',
  theme_card: '0 0% 10%',
  theme_muted: '0 0% 20%',
  map_address: 'C. Puebla 41, Centro, 63000 Tepic, Nay., México',
  map_embed_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3714.8461656432694!2d-104.8952!3d21.5078!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x842736e4c1e8e8e7%3A0x8c8c8c8c8c8c8c8c!2sC.%20Puebla%2041%2C%20Centro%2C%2063000%20Tepic%2C%20Nay.%2C%20M%C3%A9xico!5e0!3m2!1ses!2smx!4v1710000000000!5m2!1ses!2smx',
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
    staleTime: 0, // Always consider data stale to get fresh updates
    gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes
  });

  // Subscribe to realtime changes for immediate updates
  useEffect(() => {
    const channel = supabase
      .channel('site-settings-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_settings' },
        () => {
          // Immediately invalidate and refetch when any setting changes
          queryClient.invalidateQueries({ queryKey: ['site-settings'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      // First check if the setting exists
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('setting_key', key)
        .maybeSingle();

      if (existing) {
        // Update existing setting
        const { error } = await supabase
          .from('site_settings')
          .update({ setting_value: value, updated_at: new Date().toISOString() })
          .eq('setting_key', key);
        
        if (error) throw error;
      } else {
        // Insert new setting
        const { error } = await supabase
          .from('site_settings')
          .insert({ setting_key: key, setting_value: value, setting_type: 'text' });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      // Force immediate refetch
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
