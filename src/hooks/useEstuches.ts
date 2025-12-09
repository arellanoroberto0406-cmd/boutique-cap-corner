import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Estuche {
  id: string;
  name: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  free_shipping: boolean;
  shipping_cost: number;
  image_url: string;
  images: string[];
  stock: number;
  created_at: string;
  updated_at: string;
}

export const useEstuches = () => {
  const [estuches, setEstuches] = useState<Estuche[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEstuches = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('estuches')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEstuches(data || []);
    } catch (error) {
      console.error('Error fetching estuches:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstuches();

    // Subscribe to realtime changes for estuches
    const estuchesChannel = supabase
      .channel('estuches-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'estuches' },
        () => {
          fetchEstuches();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(estuchesChannel);
    };
  }, []);

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `estuches/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const createEstuche = async (estuche: {
    name: string;
    description?: string;
    price: number;
    sale_price?: number;
    free_shipping: boolean;
    shipping_cost: number;
    image_url: string;
    images?: string[];
    stock?: number;
  }) => {
    const { data, error } = await supabase
      .from('estuches')
      .insert({
        name: estuche.name,
        description: estuche.description || null,
        price: estuche.price,
        sale_price: estuche.sale_price || null,
        free_shipping: estuche.free_shipping,
        shipping_cost: estuche.shipping_cost,
        image_url: estuche.image_url,
        images: estuche.images || [],
        stock: estuche.stock || 0
      })
      .select()
      .single();

    if (error) throw error;
    await fetchEstuches();
    return data;
  };

  const updateEstuche = async (id: string, updates: Partial<Estuche>) => {
    const { error } = await supabase
      .from('estuches')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    await fetchEstuches();
  };

  const deleteEstuche = async (id: string) => {
    const { error } = await supabase
      .from('estuches')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchEstuches();
  };

  return {
    estuches,
    loading,
    fetchEstuches,
    createEstuche,
    updateEstuche,
    deleteEstuche,
    uploadImage
  };
};
