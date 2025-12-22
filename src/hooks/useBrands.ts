import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

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
  sizes?: string[];
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
  const queryClient = useQueryClient();

  // Función para invalidar las queries relacionadas con productos de marcas
  const invalidateBrandProductQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['featured-brand-products'] });
    queryClient.invalidateQueries({ queryKey: ['featured-sale-brand-products'] });
    queryClient.invalidateQueries({ queryKey: ['featured-new-products'] });
    queryClient.invalidateQueries({ queryKey: ['featured-recent-products'] });
    queryClient.invalidateQueries({ queryKey: ['featured-sale-products'] });
  }, [queryClient]);

  const fetchBrands = useCallback(async () => {
    try {
      // Fetch brands first for quick display
      const { data: brandsData, error: brandsError } = await supabase
        .from('brands')
        .select('id, slug, name, logo_url, path')
        .order('created_at', { ascending: true })
        .limit(30);

      if (brandsError) throw brandsError;

      // Set brands first with empty products for quick menu display
      const brandsWithEmptyProducts: Brand[] = (brandsData || []).map(brand => ({
        ...brand,
        products: []
      }));
      setBrands(brandsWithEmptyProducts);
      setLoading(false);

      // Fetch products in smaller batches to avoid timeouts
      const brandIds = brandsData?.map(b => b.id) || [];
      if (brandIds.length === 0) return;

      // Fetch products only for existing brands, with minimal fields first
      const { data: productsData, error: productsError } = await supabase
        .from('brand_products')
        .select('id, brand_id, name, image_url, price, sale_price, free_shipping, shipping_cost, description, has_full_set, only_cap, only_cap_price, stock, sizes, images')
        .in('brand_id', brandIds)
        .order('created_at', { ascending: false })
        .limit(200);

      if (productsError) {
        console.error('Error fetching products:', productsError);
        return;
      }

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

      // Convert logo to base64 to avoid storage RLS issues
      const logoUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(logoFile);
      });

      // Insert brand into database
      const { data, error } = await supabase
        .from('brands')
        .insert({
          slug,
          name: name.trim(),
          logo_url: logoUrl,
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
          stock: product.stock,
          sizes: product.sizes || []
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

      // Invalidar queries para actualizar la página principal
      invalidateBrandProductQueries();

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

      // Invalidar queries para actualizar la página principal
      invalidateBrandProductQueries();
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

      // Invalidar queries para actualizar la página principal
      invalidateBrandProductQueries();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  const uploadProductImage = async (file: File): Promise<string> => {
    // Convert to base64 to avoid storage RLS issues
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const updateBrandLogo = async (brandId: string, logoFile: File): Promise<string> => {
    try {
      const brand = brands.find(b => b.id === brandId);
      if (!brand) throw new Error('Marca no encontrada');

      // Convert logo to base64 to avoid storage RLS issues
      const publicUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(logoFile);
      });

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
