import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Pin {
  id: string;
  name: string;
  price: number;
  sale_price: number | null;
  image_url: string;
  stock: number | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export const usePines = () => {
  const [pines, setPines] = useState<Pin[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPines = async () => {
    try {
      const { data, error } = await supabase
        .from('pines')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPines(data || []);
    } catch (error) {
      console.error('Error fetching pines:', error);
      toast.error('Error al cargar los pines');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPines();

    const channel = supabase
      .channel('pines-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pines' },
        () => {
          fetchPines();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `pines/${fileName}`;

    // Convert file to base64 for upload
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const createPin = async (pin: { 
    name: string; 
    price: number; 
    sale_price?: number | null;
    image_url: string;
    stock?: number;
    description?: string;
  }) => {
    const { data, error } = await supabase
      .from('pines')
      .insert([pin])
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updatePin = async (id: string, updates: Partial<Pin>) => {
    const { error } = await supabase
      .from('pines')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  };

  const deletePin = async (id: string) => {
    const { error } = await supabase
      .from('pines')
      .delete()
      .eq('id', id);

    if (error) throw error;
  };

  return {
    pines,
    loading,
    uploadImage,
    createPin,
    updatePin,
    deletePin,
    refetch: fetchPines
  };
};
