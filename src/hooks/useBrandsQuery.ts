import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BrandBasic {
  id: string;
  slug: string;
  name: string;
  logo_url: string;
  path: string;
  promo_image?: string | null;
  productCount: number;
}

// Shared React Query hook — all components share the same cached data
export const useBrandsQuery = () => {
  return useQuery({
    queryKey: ['brands-list'],
    queryFn: async (): Promise<BrandBasic[]> => {
      const { data, error } = await supabase
        .from('brands')
        .select('id, slug, name, logo_url, path, promo_image, brand_products(count)')
        .order('created_at', { ascending: true })
        .limit(30);

      if (error) throw error;

      return (data || []).map((brand: any) => ({
        id: brand.id,
        slug: brand.slug,
        name: brand.name,
        logo_url: brand.logo_url,
        path: brand.path,
        promo_image: brand.promo_image,
        productCount: brand.brand_products?.[0]?.count ?? 0,
      }));
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};
