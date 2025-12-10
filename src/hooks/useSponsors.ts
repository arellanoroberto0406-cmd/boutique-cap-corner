import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Sponsor {
  id: string;
  name: string;
  logo_url: string;
  website_url: string | null;
  description: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface SponsorFormData {
  name: string;
  logo_url: string;
  website_url?: string;
  description?: string;
  is_active: boolean;
  display_order: number;
}

export const useSponsors = () => {
  const queryClient = useQueryClient();

  const { data: sponsors, isLoading } = useQuery({
    queryKey: ['sponsors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sponsors')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as Sponsor[];
    },
  });

  const createSponsorMutation = useMutation({
    mutationFn: async (sponsor: SponsorFormData) => {
      const { data, error } = await supabase
        .from('sponsors')
        .insert(sponsor)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
      toast.success('Patrocinador creado correctamente');
    },
    onError: (error) => {
      console.error('Error creating sponsor:', error);
      toast.error('Error al crear el patrocinador');
    },
  });

  const updateSponsorMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Sponsor> & { id: string }) => {
      const { data, error } = await supabase
        .from('sponsors')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
      toast.success('Patrocinador actualizado');
    },
    onError: (error) => {
      console.error('Error updating sponsor:', error);
      toast.error('Error al actualizar el patrocinador');
    },
  });

  const deleteSponsorMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sponsors')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
      toast.success('Patrocinador eliminado');
    },
    onError: (error) => {
      console.error('Error deleting sponsor:', error);
      toast.error('Error al eliminar el patrocinador');
    },
  });

  return {
    sponsors: sponsors || [],
    isLoading,
    createSponsor: createSponsorMutation.mutateAsync,
    updateSponsor: updateSponsorMutation.mutateAsync,
    deleteSponsor: deleteSponsorMutation.mutateAsync,
    isCreating: createSponsorMutation.isPending,
    isUpdating: updateSponsorMutation.isPending,
    isDeleting: deleteSponsorMutation.isPending,
  };
};
