import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  collection: string;
  image_url: string;
}

interface SuggestedProductsProps {
  excludeIds?: string[];
  maxItems?: number;
}

export const SuggestedProducts = ({ excludeIds = [], maxItems = 4 }: SuggestedProductsProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    fetchSuggestedProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSuggestedProducts = async () => {
    try {
      // Fetch random products that are on sale or new
      const { data: productsData, error } = await supabase
        .from("products")
        .select(`
          id,
          name,
          price,
          original_price,
          collection,
          product_images!inner (image_url, is_primary)
        `)
        .or("is_on_sale.eq.true,is_new.eq.true")
        .limit(20);

      if (error) throw error;

      // Filter out excluded products and get random selection
      const filtered = (productsData || [])
        .filter(p => !excludeIds.includes(p.id))
        .map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
          original_price: p.original_price,
          collection: p.collection,
          image_url: (p.product_images as any[])?.find((img: any) => img.is_primary)?.image_url || 
                     (p.product_images as any[])?.[0]?.image_url || ""
        }))
        .sort(() => Math.random() - 0.5)
        .slice(0, maxItems);

      setProducts(filtered);
    } catch (error) {
      console.error("Error fetching suggested products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url,
      images: [product.image_url],
      colors: [],
      collection: product.collection,
      stock: 99,
      description: product.name,
    });
    toast.success(`${product.name} agregado al carrito`);
  };

  if (loading || products.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Sparkles className="h-4 w-4 text-primary" />
        <span>También te puede interesar</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {products.map((product) => (
          <Card 
            key={product.id} 
            className="p-2 flex gap-2 hover:border-primary/30 transition-all duration-300 group"
          >
            <img
              src={product.image_url}
              alt={product.name}
              className="w-14 h-14 object-cover rounded transition-transform duration-300 group-hover:scale-105"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium line-clamp-2 leading-tight">{product.name}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs font-bold text-primary">
                  ${product.price.toLocaleString()}
                </span>
                {product.original_price && product.original_price > product.price && (
                  <span className="text-[10px] text-muted-foreground line-through">
                    ${product.original_price.toLocaleString()}
                  </span>
                )}
              </div>
              <Button 
                size="sm" 
                variant="ghost"
                className="h-6 px-2 text-xs mt-1 hover:bg-primary/10"
                onClick={() => handleAddToCart(product)}
              >
                <Plus className="h-3 w-3 mr-1" />
                Agregar
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
