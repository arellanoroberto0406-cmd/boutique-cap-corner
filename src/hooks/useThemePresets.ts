import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ThemePreset {
  id: string;
  name: string;
  theme_primary: string;
  theme_secondary: string;
  theme_accent: string;
  theme_background: string;
  theme_foreground: string;
  theme_card: string;
  theme_muted: string;
  is_default: boolean;
  created_at: string;
}

export const useThemePresets = () => {
  const queryClient = useQueryClient();

  const { data: presets = [], isLoading } = useQuery({
    queryKey: ['theme-presets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('theme_presets')
        .select('*')
        .order('is_default', { ascending: false })
        .order('name');

      if (error) throw error;
      return data as ThemePreset[];
    },
  });

  const createPresetMutation = useMutation({
    mutationFn: async (preset: Omit<ThemePreset, 'id' | 'created_at' | 'is_default'>) => {
      const { data, error } = await supabase
        .from('theme_presets')
        .insert({ ...preset, is_default: false })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['theme-presets'] });
    },
  });

  const deletePresetMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('theme_presets')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['theme-presets'] });
    },
  });

  return {
    presets,
    isLoading,
    createPreset: createPresetMutation.mutateAsync,
    deletePreset: deletePresetMutation.mutateAsync,
    isCreating: createPresetMutation.isPending,
    isDeleting: deletePresetMutation.isPending,
  };
};
