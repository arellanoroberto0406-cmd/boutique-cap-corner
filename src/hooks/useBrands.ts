import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BrandProduct {
  id: string;
  brand_id: string;
  name: string;
  image_url: string;
  price: number;
  sale_price?: number;
  free_shipping?: boolean;
  shipping_cost?: number;
  images?: string[];
  description?: string;
  has_full_set?: boolean;
  only_cap?: boolean;
  only_cap_price?: number;
  stock?: number;
}

export interface Brand {
  id: string;
  slug: string;
  name: string;
  logo_url: string;
  path: string;
  products: BrandProduct[];
}

export const useBrands = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBrands = useCallback(async () => {
    try {
      const { data: brandsData, error: brandsError } = await supabase
        .from('brands')
        .select('*')
        .order('created_at', { ascending: true });

      if (brandsError) throw brandsError;

      const { data: productsData, error: productsError } = await supabase
        .from('brand_products')
        .select('*')
        .order('created_at', { ascending: true });

      if (productsError) throw productsError;

      const brandsWithProducts: Brand[] = (brandsData || []).map(brand => ({
        ...brand,
        products: (productsData || [])
          .filter(p => p.brand_id === brand.id)
          .map(p => ({
            ...p,
            images: p.images || []
          }))
      }));

      setBrands(brandsWithProducts);
    } catch (error) {
      console.error('Error fetching brands:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrands();

    // Subscribe to realtime changes for brands
    const brandsChannel = supabase
      .channel('brands-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'brands' },
        (payload) => {
          fetchBrands();
          const action = payload.eventType === 'INSERT' ? 'agregada' : 
                        payload.eventType === 'UPDATE' ? 'actualizada' : 'eliminada';
          toast.info(`Marca ${action}`, {
            description: 'Los cambios se han sincronizado automáticamente',
            duration: 3000
          });
        }
      )
      .subscribe();

    // Subscribe to realtime changes for brand_products
    const productsChannel = supabase
      .channel('brand-products-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'brand_products' },
        (payload) => {
          fetchBrands();
          const action = payload.eventType === 'INSERT' ? 'agregada' : 
                        payload.eventType === 'UPDATE' ? 'actualizada' : 'eliminada';
          toast.info(`Gorra ${action}`, {
            description: 'Los cambios se han sincronizado automáticamente',
            duration: 3000
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(brandsChannel);
      supabase.removeChannel(productsChannel);
    };
  }, [fetchBrands]);

  const createBrand = async (name: string, logoFile: File): Promise<Brand | null> => {
    try {
      const slug = name.trim().toLowerCase().replace(/\s+/g, '-');
      const path = `/${slug}`;

      // Check if brand already exists
      const existingBrand = brands.find(b => b.slug === slug);
      if (existingBrand) {
        toast.error('Ya existe una marca con ese nombre');
        return null;
      }

      // Upload logo to storage
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `${slug}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('brand-logos')
        .upload(fileName, logoFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('brand-logos')
        .getPublicUrl(fileName);

      // Insert brand into database
      const { data, error } = await supabase
        .from('brands')
        .insert({
          slug,
          name: name.trim(),
          logo_url: publicUrl,
          path
        })
        .select()
        .single();

      if (error) throw error;

      const newBrand: Brand = { ...data, products: [] };
      setBrands(prev => [...prev, newBrand]);
      
      return newBrand;
    } catch (error: any) {
      console.error('Error creating brand:', error);
      throw error;
    }
  };

  const deleteBrand = async (brandId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('brands')
        .delete()
        .eq('id', brandId);

      if (error) throw error;

      setBrands(prev => prev.filter(b => b.id !== brandId));
    } catch (error: any) {
      console.error('Error deleting brand:', error);
      throw error;
    }
  };

  const addProduct = async (
    brandId: string, 
    product: Omit<BrandProduct, 'id' | 'brand_id'>
  ): Promise<BrandProduct | null> => {
    try {
      const { data, error } = await supabase
        .from('brand_products')
        .insert({
          brand_id: brandId,
          name: product.name,
          price: product.price,
          sale_price: product.sale_price,
          image_url: product.image_url,
          images: product.images || [],
          description: product.description,
          free_shipping: product.free_shipping,
          shipping_cost: product.shipping_cost,
          has_full_set: product.has_full_set,
          only_cap: product.only_cap,
          only_cap_price: product.only_cap_price,
          stock: product.stock
        })
        .select()
        .single();

      if (error) throw error;

      const newProduct: BrandProduct = { ...data, images: data.images || [] };
      
      setBrands(prev => prev.map(brand => {
        if (brand.id === brandId) {
          return { ...brand, products: [...brand.products, newProduct] };
        }
        return brand;
      }));

      return newProduct;
    } catch (error: any) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  const updateProduct = async (
    brandId: string,
    productId: string,
    updates: Partial<Omit<BrandProduct, 'id' | 'brand_id'>>
  ): Promise<void> => {
    try {
      const { error } = await supabase
        .from('brand_products')
        .update(updates)
        .eq('id', productId);

      if (error) throw error;

      setBrands(prev => prev.map(brand => {
        if (brand.id === brandId) {
          return {
            ...brand,
            products: brand.products.map(p => 
              p.id === productId ? { ...p, ...updates } : p
            )
          };
        }
        return brand;
      }));
    } catch (error: any) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (brandId: string, productId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('brand_products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      setBrands(prev => prev.map(brand => {
        if (brand.id === brandId) {
          return { 
            ...brand, 
            products: brand.products.filter(p => p.id !== productId) 
          };
        }
        return brand;
      }));
    } catch (error: any) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  const uploadProductImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `product-${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const updateBrandLogo = async (brandId: string, logoFile: File): Promise<string> => {
    try {
      const brand = brands.find(b => b.id === brandId);
      if (!brand) throw new Error('Marca no encontrada');

      // Upload new logo to storage
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `${brand.slug}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('brand-logos')
        .upload(fileName, logoFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('brand-logos')
        .getPublicUrl(fileName);

      // Update brand in database
      const { error } = await supabase
        .from('brands')
        .update({ logo_url: publicUrl })
        .eq('id', brandId);

      if (error) throw error;

      // Update local state
      setBrands(prev => prev.map(b => 
        b.id === brandId ? { ...b, logo_url: publicUrl } : b
      ));

      return publicUrl;
    } catch (error: any) {
      console.error('Error updating brand logo:', error);
      throw error;
    }
  };

  const updateBrand = async (brandId: string, updates: { name?: string; path?: string }): Promise<void> => {
    try {
      const updateData: any = {};
      
      if (updates.name) {
        updateData.name = updates.name.trim();
        updateData.slug = updates.name.trim().toLowerCase().replace(/\s+/g, '-');
      }
      
      if (updates.path) {
        // Ensure path starts with /
        updateData.path = updates.path.startsWith('/') ? updates.path : `/${updates.path}`;
      }

      const { error } = await supabase
        .from('brands')
        .update(updateData)
        .eq('id', brandId);

      if (error) throw error;

      // Update local state
      setBrands(prev => prev.map(b => 
        b.id === brandId ? { ...b, ...updateData } : b
      ));
    } catch (error: any) {
      console.error('Error updating brand:', error);
      throw error;
    }
  };

  return {
    brands,
    loading,
    fetchBrands,
    createBrand,
    deleteBrand,
    addProduct,
    updateProduct,
    deleteProduct,
    uploadProductImage,
    updateBrandLogo,
    updateBrand
  };
};

// Legacy functions for backward compatibility with existing code
export const getBrandByPath = (brands: Brand[], path: string): Brand | undefined => {
  return brands.find(b => b.path === path);
};
